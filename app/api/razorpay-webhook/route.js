import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with Service Role Key (Bypasses RLS safely on backend)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    // =========================================================================
    // SECURITY LAYER 1: Cryptographic Signature Verification (Anti-Spoofing)
    // =========================================================================
    if (!signature || !secret) {
      return NextResponse.json({ error: 'Missing security headers' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('[SECURITY ALERT] Unauthorized forged webhook attempt detected.')
      return NextResponse.json({ error: 'Forged signature detected' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    // Process only verified payment captures
    if (event.event !== 'payment.captured') {
      return NextResponse.json({ status: 'ignored_event' }, { status: 200 })
    }

    const payment = event.payload.payment.entity
    const paymentId = payment.id
    const amountInRupees = payment.amount / 100
    const userEmail = payment.notes?.user_email
    const purchasedPlan = payment.notes?.plan_type // 'DAILY_INTEL' or '360_RANKER'
    const referralUsed = payment.notes?.referral_code_used?.trim()?.toUpperCase()

    if (!userEmail || !purchasedPlan) {
      return NextResponse.json({ error: 'Invalid payload metadata' }, { status: 400 })
    }

    // =========================================================================
    // SECURITY LAYER 2: Idempotency & Replay Attack Defense
    // =========================================================================
    const { data: existingPayment } = await supabase
      .from('processed_payments')
      .select('payment_id')
      .eq('payment_id', paymentId)
      .single()

    if (existingPayment) {
      // Payment already logged; acknowledge Razorpay to stop retry loops
      return NextResponse.json({ status: 'duplicate_acknowledged' }, { status: 200 })
    }

    // =========================================================================
    // SECURITY LAYER 3: Strict Price-Floor Validation
    // =========================================================================
    // Ensures user didn't tamper client-side parameters to pay less than authorized minimums
    const minRequiredAmount = purchasedPlan === '360_RANKER' ? 3199 : 899
    if (amountInRupees < minRequiredAmount) {
      console.error(`[FRAUD ALERT] Underpaid amount: ${amountInRupees} for ${purchasedPlan}`)
      return NextResponse.json({ error: 'Fraudulent transaction amount' }, { status: 400 })
    }

    // Log payment permanently in deduplication ledger
    await supabase.from('processed_payments').insert({
      payment_id: paymentId,
      user_email: userEmail,
      amount: amountInRupees,
      plan_type: purchasedPlan
    })

    // =========================================================================
    // STEP 4: Activate 1-Year Access for the Purchasing Student
    // =========================================================================
    const now = new Date()
    const expiryDate = new Date()
    expiryDate.setDate(now.getDate() + 365) // 365 Days Base Validity

    // Generate unique referral code for this student if not present
    const cleanReferralCode = userEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '') + '-RANK'

    const { data: updatedBuyer, error: buyerError } = await supabase
      .from('profiles')
      .upsert({
        email: userEmail,
        plan_type: purchasedPlan,
        plan_start_date: now.toISOString(),
        expires_at: expiryDate.toISOString(),
        referral_code: cleanReferralCode
      }, { onConflict: 'email' })
      .select('id, email, referral_code')
      .single()

    if (buyerError || !updatedBuyer) {
      console.error('[DATABASE ERROR] Failed to update buyer:', buyerError)
      return NextResponse.json({ error: 'Database sync failure' }, { status: 500 })
    }

    // =========================================================================
    // STEP 5: Anti-Hack Referral & 5-Sale Milestone Engine
    // =========================================================================
    if (referralUsed) {
      // Fetch Referrer
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id, email, expires_at, referral_count')
        .eq('referral_code', referralUsed)
        .single()

      // SECURITY LAYER 4: Self-Referral Prevention
      if (referrer && referrer.id !== updatedBuyer.id && referrer.email !== updatedBuyer.email) {
        const nextMilestone = (referrer.referral_count || 0) + 1
        const isFifthSale = nextMilestone % 5 === 0

        if (!isFifthSale) {
          // -------------------------------------------------------------------
          // MILESTONES 1, 2, 3, 4: Strict ONLY 15 Days Free Validity (Zero Cash)
          // -------------------------------------------------------------------
          const currentExpiry = new Date(referrer.expires_at || new Date())
          // If expired in past, extend from now; otherwise extend from existing expiry
          const baseExpiryDate = currentExpiry > now ? currentExpiry : now
          baseExpiryDate.setDate(baseExpiryDate.getDate() + 15)

          await supabase
            .from('profiles')
            .update({
              referral_count: nextMilestone,
              expires_at: baseExpiryDate.toISOString()
            })
            .eq('id', referrer.id)

          await supabase.from('referral_logs').insert({
            referrer_id: referrer.id,
            referred_user_id: updatedBuyer.id,
            payment_id: paymentId,
            plan_purchased: purchasedPlan,
            amount_paid: amountInRupees,
            milestone_number: nextMilestone,
            reward_type: 'VALIDITY_15_DAYS',
            cash_amount: 0,
            payout_status: 'NOT_APPLICABLE'
          })
        } else {
          // -------------------------------------------------------------------
          // MILESTONE 5, 10, 15...: Strict ONLY Cash Reward (Zero Free Days)
          // -------------------------------------------------------------------
          const cashRewardAmount = purchasedPlan === '360_RANKER' ? 1000 : 300

          await supabase
            .from('profiles')
            .update({
              referral_count: nextMilestone
              // NOTE: expires_at is NOT extended (Zero days added)
            })
            .eq('id', referrer.id)

          await supabase.from('referral_logs').insert({
            referrer_id: referrer.id,
            referred_user_id: updatedBuyer.id,
            payment_id: paymentId,
            plan_purchased: purchasedPlan,
            amount_paid: amountInRupees,
            milestone_number: nextMilestone,
            reward_type: 'CASH_PAYOUT',
            cash_amount: cashRewardAmount,
            payout_status: 'PENDING' // Flags admin to release UPI payment
          })
        }
      } else {
        console.warn(`[FRAUD SUSPICION] Self-referral or invalid code attempted by: ${userEmail}`)
      }
    }

    return NextResponse.json({ status: 'payment_processed_and_secured' }, { status: 200 })

  } catch (err) {
    console.error('[CRITICAL WEBHOOK ERROR]:', err)
    return NextResponse.json({ error: 'Internal processing error' }, { status: 500 })
  }
}
