'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdjldpbwnwbbyyflvnav.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
)

export default function PlansAndReferralPage() {
  const [userProfile, setUserProfile] = useState({
    isLoggedIn: false,
    email: '',
    planType: 'FREE',
    referralCode: '',
    referralCount: 0
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (profile) {
          setUserProfile({
            isLoggedIn: true,
            email: session.user.email,
            planType: profile.plan_type || 'FREE',
            referralCode: profile.referral_code || '',
            referralCount: profile.referral_count || 0
          })
        }
      }
    }
    loadUser()
  }, [])

  const copyReferral = () => {
    if (userProfile.referralCode) {
      navigator.clipboard.writeText(`https://civilpulse.in?ref=${userProfile.referralCode}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const isEnrolled = userProfile.planType === 'DAILY_INTEL' || userProfile.planType === '360_RANKER'

  return (
    <div className="min-h-screen bg-[#060811] text-[#E2E8F0] font-sans pb-24 selection:bg-amber-500 selection:text-black">
      
      {/* Brand Hero Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-[#0C1124] to-[#060811] py-14 px-4 text-center space-y-4">
        <span className="text-xs uppercase font-mono tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
          OFFICIAL EXAMINATION INTELLIGENCE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Current Affairs Means CivilPulse.
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop drowning in 150-page monthly magazines. Get daily examiner-calibrated, ready-to-write I-B-C answers and prelims trap decoders in 15 minutes.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-10 space-y-12">
        
        {/* Opportunity Cost Psychology Box */}
        <div className="bg-[#090D1C] border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-3">
          <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block">
            THE BRUTAL REALITY OF A WASTED ATTEMPT
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            A 1-Year Prep Delay Costs You ₹12,30,000+ Minimum.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Rent & food in Mukherjee Nagar/Prayagraj (~₹1.8 Lakh) + 12 months of delayed Group-A Officer Basic Salary (~₹10.5 Lakh). 
            The <strong className="text-amber-400">360° Ranker Pass costs ₹3,499/year (₹9.5/day — less than a cup of tea)</strong>. 
            Do not gamble a full year of your career to save ₹9 a day on random free Telegram PDFs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Plan 1: ₹999 */}
          <div className="bg-[#0C1022] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase text-slate-400 block">ESSENTIAL TIER</span>
              <h3 className="text-2xl font-black text-white">Daily Intel Pass</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                For serious aspirants who need complete daily news analysis without the overload. All daily cards unlocked with full I-B-C structure.
              </p>
              <div className="pt-2">
                <span className="text-3xl font-black text-white">₹999</span>
                <span className="text-xs text-slate-400 ml-1">/ Year (₹2.7/day)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800/80 pt-4">
                <li>✔ All 5-6 Daily News Cards Unlocked (Full I-B-C)</li>
                <li>✔ Exact Hindu & Express Page Citation</li>
                <li>✔ 1-Click Bilingual Switch (EN / हिन्दी)</li>
                <li>✔ Daily Prelims Trap Drill & Decoder</li>
                <li>✔ Verified Facts & State PSC Linkage</li>
              </ul>
            </div>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3.5 rounded-xl border border-slate-700 transition-all">
              Enroll in Daily Intel @ ₹999 / Year
            </button>
          </div>

          {/* Plan 2: ₹3,499 */}
          <div className="bg-[#0E1428] border-2 border-amber-500 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-amber-500/10">
            <div className="absolute -top-3 right-6 bg-amber-500 text-black text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md">
              MOST POPULAR • 98% CHOOSE THIS
            </div>
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase text-amber-400 block">THE GRAND SLAM ALL-INCLUSIVE</span>
              <h3 className="text-2xl font-black text-white">360° Ranker Pass</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Everything CivilPulse creates: Daily Intel + All 10 Pro-Vault Assets, 500+ Diagrams, 2,500 Prelims Trap Bank, Sunday Tests & 45-Min Sprint Sheet.
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-400">₹3,499</span>
                <span className="text-xs text-slate-400">/ Year (₹9.5/day)</span>
                <span className="text-xs line-through text-slate-500">₹48,000</span>
              </div>
              <ul className="text-xs text-slate-200 space-y-2 border-t border-slate-800/80 pt-4">
                <li className="font-semibold text-amber-300">✔ Everything in Daily Intel Pass Included</li>
                <li>✔ 1. Mains Fodder Ledger (Articles, Judgments, Committees)</li>
                <li>✔ 2. 500+ Micro-Diagram Visual Engine</li>
                <li>✔ 3. 2,500 Prelims Trap Bank (Distractor Decoder)</li>
                <li>✔ 4. Weekly 10-Question Sunday Revision Test</li>
                <li>✔ 5. Top 25 Probables Predictor (Prelims + Mains)</li>
                <li>✔ 6. Syllabus Theme One-Pagers & Universal GS Openers</li>
                <li>✔ 7. GS-4 Ethics Dilemma Ledger</li>
                <li>✔ 8. State PSC Regional Footnotes (UPPSC GS-5/6, BPSC GS-2)</li>
                <li>✔ 9. 45-Minute Emergency Review Sheet (10-Page PDF)</li>
                <li>✔ 10. AIR Consistency Streak & AI Diagnostic</li>
              </ul>
            </div>
            <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all">
              Claim 360° Ranker Pass @ ₹3,499 / Year
            </button>
          </div>

        </div>

        {/* Feature-by-Feature Comparison Table */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-white text-center">Comprehensive Plan Breakdown</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090D1C]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 text-slate-300 font-bold">Feature / Deliverable</th>
                  <th className="p-4 text-slate-400">Free Preview</th>
                  <th className="p-4 text-slate-300">Daily Intel (₹999/yr)</th>
                  <th className="p-4 bg-amber-500/10 text-amber-300 font-black border-l border-r border-amber-500/30">
                    360° Ranker (₹3,499/yr)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 font-medium">Daily News Analysis Quality</td>
                  <td className="p-4 text-slate-400">First 2 Cards Only</td>
                  <td className="p-4 text-slate-200">All 5-6 Cards Daily</td>
                  <td className="p-4 bg-amber-500/5 font-bold text-white border-l border-r border-amber-500/20">All Cards + Full 365-Day Archive</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Topper I-B-C Body (Heading + Example)</td>
                  <td className="p-4 text-emerald-400">✔ Yes (2 Cards)</td>
                  <td className="p-4 text-emerald-400">✔ Yes (All Cards)</td>
                  <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ Yes (All Cards + Frameworks)</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Cross-Exam PYQ Linkage (UPSC + State)</td>
                  <td className="p-4 text-emerald-400">✔ Yes</td>
                  <td className="p-4 text-emerald-400">✔ Yes</td>
                  <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ Yes</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">All 10 Academic Pro-Vaults</td>
                  <td className="p-4 text-rose-500">❌ Locked</td>
                  <td className="p-4 text-rose-500">❌ Not Included</td>
                  <td className="p-4 bg-amber-500/5 text-amber-300 font-black border-l border-r border-amber-500/20">✔ Complete Access Unlocked</td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-white">Daily Effective Cost</td>
                  <td className="p-4 text-slate-500">₹0</td>
                  <td className="p-4 text-slate-200">₹2.7 / day</td>
                  <td className="p-4 bg-amber-500/10 font-mono text-amber-300 font-bold border-l border-r border-amber-500/30">₹9.5 / day (Chai Cost)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Viral Referral Ambassador Section */}
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-[#0A0D1B] border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                VIRAL AMBASSADOR LOOP (ENROLLED MEMBERS ONLY)
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Share CivilPulse With Peers & Unlock Free Validity + ₹1,000 Cash
              </h2>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
              Automated Verification Shield
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">Your Friend Gets:</strong>
              <p className="text-slate-400">Flat <strong className="text-amber-400">₹300 OFF</strong> on 360° Pass (or ₹100 OFF on Daily Intel).</p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">Sales 1, 2, 3, 4:</strong>
              <p className="text-slate-400">You receive <strong className="text-emerald-400">+15 Days Free Validity</strong> per verified friend.</p>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">5th Milestone Sale:</strong>
              <p className="text-slate-400">Direct <strong className="text-amber-400">₹1,000 Cash UPI Transfer</strong> to your account.</p>
            </div>
          </div>

          {isEnrolled ? (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">YOUR ACTIVE AMBASSADOR LINK:</span>
                <span className="text-sm sm:text-base font-mono font-black text-amber-400">{userProfile.referralCode}</span>
                <span className="text-xs text-slate-400 ml-3">({userProfile.referralCount} Verified Referrals)</span>
              </div>
              <button
                onClick={copyReferral}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                {copied ? '✔ Link Copied!' : 'Copy Referral Invite Link'}
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/70 p-4 rounded-xl border border-dashed border-amber-500/40 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-200">
                🔒 Referral Ambassador system is strictly locked for Non-Enrolled Students.
              </p>
              <p className="text-[11px] text-slate-400">
                Enroll in Daily Intel (₹999) or 360° Ranker Pass (₹3,499) to activate your ambassador code and start earning cash rewards.
              </p>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
