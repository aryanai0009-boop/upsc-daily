'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const FOUNDER_EMAIL = 'aryanai0009@gmail.com'

export default function SuperAdminVault() {
  const [sessionUser, setSessionUser] = useState(null)
  const [passphrase, setPassphrase] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState([])
  const [actionStatus, setActionStatus] = useState('')
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    paidIntel: 0,
    paidRanker: 0,
    totalRevenue: 0,
    totalReferrals: 0,
    pendingCashRewards: 0
  })

  // 1. Double-Layer Verification: Check Supabase Auth State
  useEffect(() => {
    async function verifyAuth() {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user?.email === FOUNDER_EMAIL) {
        setSessionUser(session.user)
        // Auto-check if local laptop already holds founder pin
        const savedToken = localStorage.getItem('cp_admin_pin')
        if (savedToken === 'CIVILPULSE_FOUNDER_ROOT') {
          setIsAuthenticated(true)
          fetchStudentLedger()
        }
      }
      setLoading(false)
    }
    verifyAuth()
  }, [])

  async function fetchStudentLedger() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProfiles(data)
      const total = data.length
      const intel = data.filter(u => u.plan_type === 'DAILY_INTEL').length
      const ranker = data.filter(u => u.plan_type === '360_RANKER').length
      const rev = (intel * 999) + (ranker * 3499)
      const refCount = data.reduce((acc, curr) => acc + (curr.referral_count || 0), 0)
      const pendingRewards = data.filter(u => (u.referral_count || 0) >= 5).length

      setMetrics({
        totalUsers: total,
        paidIntel: intel,
        paidRanker: ranker,
        totalRevenue: rev,
        totalReferrals: refCount,
        pendingCashRewards: pendingRewards
      })
    }
  }

  // 2. Unlock Cockpit with Secret Laptop PIN
  const handleUnlock = (e) => {
    e.preventDefault()
    if (passphrase === 'civilpulse2026') {
      localStorage.setItem('cp_admin_pin', 'CIVILPULSE_FOUNDER_ROOT')
      setIsAuthenticated(true)
      fetchStudentLedger()
    } else {
      alert('Security Violation: Invalid Founder Credential.')
    }
  }

  // 3. Grant Plan Free Directly to Any Student
  const grantPlanPrivilege = async (targetEmail, targetPlan) => {
    setActionStatus(`Updating ${targetEmail}...`)
    const { error } = await supabase
      .from('profiles')
      .update({ plan_type: targetPlan })
      .eq('email', targetEmail)

    if (!error) {
      setActionStatus(`Success: Granted ${targetPlan} to ${targetEmail}`)
      fetchStudentLedger()
      setTimeout(() => setActionStatus(''), 4000)
    } else {
      setActionStatus(`Error updating database: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070e] flex items-center justify-center font-mono text-xs text-amber-400">
        Authenticating Secure Founder Shield...
      </div>
    )
  }

  // Lockout view for unauthenticated visits
  if (!sessionUser || sessionUser.email !== FOUNDER_EMAIL) {
    return (
      <div className="min-h-screen bg-[#05070e] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#0c101d] border border-red-500/20 p-8 rounded-3xl space-y-4">
          <span className="text-4xl">🔒</span>
          <h1 className="text-xl font-black text-red-400 tracking-wide">404 - Restricted Environment</h1>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            This module is reserved for platform infrastructure root operations. No public routes available.
          </p>
          <a href="/" className="inline-block bg-slate-800 hover:bg-slate-700 text-xs px-5 py-2.5 rounded-xl font-bold text-slate-300">
            ← Return to Feed
          </a>
        </div>
      </div>
    )
  }

  // Second Layer Lock: Founder Secret Passphrase Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05070e] text-white flex items-center justify-center p-6">
        <form onSubmit={handleUnlock} className="max-w-sm w-full bg-[#0c101d] border border-amber-500/30 p-8 rounded-3xl space-y-5">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">Hardware Handshake</span>
            <h2 className="text-lg font-bold text-white">Laptop Founder Passcode</h2>
          </div>
          <input
            type="password"
            placeholder="Enter private master PIN..."
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full bg-[#060812] border border-slate-700 rounded-xl px-4 py-3 text-xs text-amber-300 font-mono outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-black py-3 rounded-xl uppercase tracking-wider transition-all"
          >
            Access Vault Ledger
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070e] text-slate-200 font-sans p-6 sm:p-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-400/20 font-mono">
            CONFIDENTIAL FOUNDER COCKPIT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
            CivilPulse Root Operations & Ledger
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-mono">Root Administrator:</span>
          <span className="text-xs font-bold text-amber-300 font-mono">{sessionUser.email}</span>
        </div>
      </div>

      {actionStatus && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300">
          ⚡ {actionStatus}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#0c101d] border border-slate-800/80 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-mono uppercase">Total Registered</span>
          <div className="text-3xl font-black text-white">{metrics.totalUsers}</div>
          <span className="text-[10px] text-emerald-400 font-mono">Active In Database</span>
        </div>

        <div className="bg-[#0c101d] border border-slate-800/80 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-mono uppercase">Paid Subscribers</span>
          <div className="text-3xl font-black text-amber-400">
            {metrics.paidIntel + metrics.paidRanker}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {metrics.paidIntel} Intel | {metrics.paidRanker} Ranker
          </span>
        </div>

        <div className="bg-[#0c101d] border border-emerald-500/20 bg-emerald-950/10 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-emerald-400 font-mono uppercase">Calculated Revenue</span>
          <div className="text-3xl font-black text-white">
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-300/80 font-mono">Real-Time Sync</span>
        </div>

        <div className="bg-[#0c101d] border border-slate-800/80 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-400 font-mono uppercase">Milestone Referrals</span>
          <div className="text-3xl font-black text-indigo-400">{metrics.totalReferrals}</div>
          <span className="text-[10px] text-amber-300 font-mono">
            {metrics.pendingCashRewards} Eligible For ₹1,000 Cash
          </span>
        </div>

      </div>

      {/* Roster & Grant Privileges Table */}
      <div className="bg-[#0c101d] border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Master Roster & Privilege Manager</h2>
            <p className="text-xs text-slate-400 font-mono">Grant ₹999 or ₹3,499 tiers for free to any test/team email instantly.</p>
          </div>
          <button 
            onClick={fetchStudentLedger}
            className="text-xs font-mono text-amber-400 hover:underline bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
          >
            ↻ Refresh Roster
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-3 px-4">Account Email</th>
                <th className="py-3 px-4">Plan Status</th>
                <th className="py-3 px-4">Referrals</th>
                <th className="py-3 px-4">Reward Due</th>
                <th className="py-3 px-4 text-right">Grant Free Privilege</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                    No student registrations found yet.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => {
                  const hasCashPayout = (p.referral_count || 0) >= 5
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-white">{p.email || 'Anonymous'}</td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.plan_type === '360_RANKER'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : p.plan_type === 'DAILY_INTEL'
                            ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {p.plan_type || 'FREE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{p.referral_count || 0}</td>
                      <td className="py-3.5 px-4">
                        {hasCashPayout ? (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold font-mono">
                            ⚡ Send ₹1,000 UPI
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => grantPlanPrivilege(p.email, 'DAILY_INTEL')}
                          className="px-2.5 py-1 bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-500/30 rounded text-[10px] font-mono transition-all"
                        >
                          + Free ₹999
                        </button>
                        <button
                          onClick={() => grantPlanPrivilege(p.email, '360_RANKER')}
                          className="px-2.5 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono transition-all"
                        >
                          + Free ₹3,499
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
