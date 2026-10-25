'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdjldpbwnwbbyyflvnav.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
)

export default function CivilPulseFeed() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState('ALL')
  const [emailInput, setEmailInput] = useState('')
  const [authStatus, setAuthStatus] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    async function init() {
      setLoading(true)
      
      // 1. Session Audit
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUserProfile(profile || { plan_type: 'FREE' })
      } else {
        setUser(null)
        setUserProfile(null)
      }

      // 2. Fetch Cards
      const { data, error } = await supabase
        .from('daily_intel_cards')
        .select('*')
        .order('date', { ascending: false })

      if (!error && data) {
        setCards(data)
      }
      setLoading(false)
    }

    init()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setUserProfile(null)
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const handleMagicLogin = async (e) => {
    e.preventDefault()
    if (!emailInput || !emailInput.includes('@')) {
      setAuthStatus('Please enter a valid email address.')
      return
    }

    setAuthStatus('Dispatching 1-Click Secure Link to your Inbox...')
    const { error } = await supabase.auth.signInWithOtp({
      email: emailInput,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (!error) {
      setAuthStatus('⚡ Verification Link Dispatched! Open your email to login instantly.')
    } else {
      setAuthStatus(`Authentication Error: ${error.message}`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    window.location.reload()
  }

  // Filtering
  const availableDates = Array.from(new Set(cards.map(c => c.date))).sort().reverse()
  const filteredCards = cards.filter(card => {
    const catMatch = selectedCategory === 'ALL' || card.category === selectedCategory
    const dateMatch = selectedDate === 'ALL' || card.date === selectedDate
    return catMatch && dateMatch
  })

  const isUserPremium = userProfile?.plan_type === 'DAILY_INTEL' || userProfile?.plan_type === '360_RANKER'

  return (
    <div className="min-h-screen bg-[#060811] text-slate-200 font-sans selection:bg-amber-400 selection:text-black">
      
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#060811]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">CivilPulse</h1>
              <span className="text-[10px] text-amber-400/90 font-mono tracking-wider uppercase block -mt-0.5">
                UPSC CSE / State PSC Automated Intel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 hidden sm:inline">{user.email}</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-bold font-mono">
                  {userProfile?.plan_type || 'FREE ACCESS'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-400/10"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Date & Filter Ribbon */}
        <div className="space-y-3 bg-[#0A0D1B] border border-slate-800/80 p-4 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 mr-1 uppercase">Date Archive:</span>
            <button
              onClick={() => setSelectedDate('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                selectedDate === 'ALL'
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All Dates ({cards.length})
            </button>
            {availableDates.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedDate === d
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60">
            {['ALL', 'GS-1', 'GS-2', 'GS-3', 'GS-4'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-200 text-black font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'All GS Papers' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Cards */}
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-slate-500">
            Synchronizing Topper Pedagogy Intel Records...
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-20 text-center font-mono text-xs text-slate-500 bg-[#0A0D1B] border border-slate-800 rounded-2xl">
            No intelligence records found for this specific filter.
          </div>
        ) : (
          filteredCards.map((card, idx) => {
            // Locking Funnel: Index >= 2 requires paid plan or login
            const isCardLocked = idx >= 2 && !isUserPremium

            return (
              <article
                key={card.id || idx}
                className="bg-[#0A0D1B] border border-slate-800/90 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
              >
                {/* Header Tag Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-md text-slate-300 font-bold">
                      📰 {card.publication || 'The Hindu / Indian Express'}
                    </span>
                    <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 px-2 py-1 rounded-md">
                      {card.page_number || 'National Page'}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                    Date: {card.date}
                  </span>
                </div>

                {/* Syllabus Badges */}
                <div className="space-y-1.5">
                  {card.syllabus_tag && (
                    <div className="text-xs bg-sky-950/30 text-sky-300 border border-sky-500/20 px-3 py-1.5 rounded-lg font-mono">
                      🎯 <strong className="text-sky-200">UPSC CSE:</strong> {card.syllabus_tag}
                    </div>
                  )}
                  {card.state_psc_tag && (
                    <div className="text-xs bg-emerald-950/30 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-mono">
                      🏛️ <strong className="text-emerald-200">State PSC Alignment:</strong> {card.state_psc_tag}
                    </div>
                  )}
                </div>

                {/* Headline */}
                <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {card.title}
                </h2>

                {/* Section 1: Crux Points */}
                {card.summary_points && (
                  <div className="bg-[#060812] border border-slate-800/90 p-4 sm:p-5 rounded-xl space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono block">
                      ⚡ 3-POINT EXECUTIVE SUMMARY (WHAT IS IN NEWS)
                    </span>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed list-disc list-inside">
                      {card.summary_points.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content Blur / Hard Paywall Barrier */}
                {isCardLocked ? (
                  <div className="py-12 bg-gradient-to-b from-transparent to-[#060812] flex flex-col items-center justify-center text-center space-y-4 rounded-xl border border-dashed border-amber-500/30 p-6">
                    <span className="text-3xl">🔒</span>
                    <h3 className="text-lg font-bold text-white">Full Intelligence Analysis Locked</h3>
                    <p className="text-xs text-slate-400 max-w-md font-mono">
                      Mains Model Frameworks, Distractor Trap MCQs, and 10 Pro-Vault components are reserved for active subscribers.
                    </p>
                    <div className="flex gap-3">
                      <a
                        href="/plans"
                        className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all"
                      >
                        Upgrade to Daily Intel (₹999) / 360° Ranker
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Section 2: Introduction */}
                    {card.introduction && (
                      <div className="bg-[#060812] border border-slate-800/90 p-4 sm:p-5 rounded-xl space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono block">
                          ✍️ READY-MADE MAINS INTRODUCTION (25-30 WORDS)
                        </span>
                        <blockquote className="text-xs sm:text-sm text-slate-300 italic border-l-2 border-amber-400 pl-3">
                          "{card.introduction}"
                        </blockquote>
                      </div>
                    )}

                    {/* Section 3: Body Points (CLEANED HEADING - NO EXPLANATION TEXT) */}
                    {card.body_points && (
                      <div className="bg-[#060812] border border-slate-800/90 p-4 sm:p-5 rounded-xl space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono block">
                          🏛️ MAINS BODY POINTS & ARGUMENTS
                        </span>
                        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {Array.isArray(card.body_points) ? (
                            card.body_points.map((bp, i) => (
                              <p key={i} className="border-b border-slate-800/60 pb-2 last:border-b-0 last:pb-0">
                                • {bp}
                              </p>
                            ))
                          ) : (
                            <p>{card.body_points}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Section 4: PYQ Match */}
                    {card.pyq_reference && (
                      <div className="bg-[#060812] border border-slate-800/90 p-4 sm:p-5 rounded-xl space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono block">
                          📍 RELEVANT PREVIOUS YEAR QUESTION (UPSC & STATE PSC)
                        </span>
                        <p className="text-xs text-slate-300 font-mono">
                          {card.pyq_reference}
                        </p>
                      </div>
                    )}

                    {/* Section 5: Conclusion */}
                    {card.conclusion && (
                      <div className="bg-[#060812] border border-slate-800/90 p-4 sm:p-5 rounded-xl space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono block">
                          🎯 SHORT WAY-FORWARD CONCLUSION (TOPPER-STYLE)
                        </span>
                        <blockquote className="text-xs sm:text-sm text-slate-300 italic border-l-2 border-emerald-400 pl-3">
                          "{card.conclusion}"
                        </blockquote>
                      </div>
                    )}

                    {/* Section 6: Prelims Traps */}
                    {card.prelims_traps && (
                      <div className="bg-[#060812] border border-red-500/20 p-4 sm:p-5 rounded-xl space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-red-400 font-mono block">
                          ⚠️ PRELIMS DISTRACTOR TRAPS (EXAMINER MINDSET)
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                          {card.prelims_traps.map((tr, i) => (
                            <li key={i} className="text-red-300/90">• {tr}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </article>
            )
          })
        )}
      </main>

      {/* Mandatory Sign In Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0D1B] border border-amber-500/30 max-w-md w-full p-6 sm:p-8 rounded-3xl space-y-5 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
            <div className="text-center space-y-1">
              <span className="text-2xl">⚡</span>
              <h3 className="text-lg font-bold text-white">Access CivilPulse Intel</h3>
              <p className="text-xs text-slate-400 font-mono">Enter your email to receive a 1-click passwordless sign-in token.</p>
            </div>
            <form onSubmit={handleMagicLogin} className="space-y-3">
              <input
                type="email"
                placeholder="aspirant@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full bg-[#060812] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-400 font-mono"
              />
              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold py-3 rounded-xl transition-all font-mono uppercase"
              >
                Send Secure Magic Link
              </button>
            </form>
            {authStatus && (
              <p className="text-center text-xs font-mono text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                {authStatus}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
