'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdjldpbwnwbbyyflvnav.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'civilpulse-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : null
  }
})

export default function CivilPulseFeed() {
  const [cards, setCards] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('ALL')
  const [medium, setMedium] = useState('en')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [revealedMCQ, setRevealedMCQ] = useState({})
  
  const [userProfile, setUserProfile] = useState({
    isLoggedIn: false,
    email: '',
    planType: 'FREE',
    referralCode: '',
    referralCount: 0
  })

  const [authEmail, setAuthEmail] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMessage, setAuthMessage] = useState('')

  // Sync Auth State
  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        syncUserProfile(session.user)
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_, currentSession) => {
        if (currentSession?.user) {
          syncUserProfile(currentSession.user)
        } else {
          setUserProfile({ isLoggedIn: false, email: '', planType: 'FREE', referralCode: '', referralCount: 0 })
        }
      })

      return () => authListener?.subscription?.unsubscribe()
    }

    async function syncUserProfile(user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setUserProfile({
          isLoggedIn: true,
          email: user.email,
          planType: profile.plan_type || 'FREE',
          referralCode: profile.referral_code || '',
          referralCount: profile.referral_count || 0
        })
      }
    }
    initAuth()
  }, [])

  // Fetch Feed & Populate Available Dates (Dual-Table & Dual-Schema Safe)
  useEffect(() => {
    async function fetchCards() {
      setLoading(true)
      
      // Primary table fetch
      let { data, error } = await supabase
        .from('daily_cards')
        .select('*')
        .eq('medium', medium)
        .order('publish_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(40)

      // Fallback table fetch
      if (error || !data || data.length === 0) {
        const { data: fallbackData, error: fbError } = await supabase
          .from('daily_intel_cards')
          .select('*')
          .order('date', { ascending: false })
          .limit(40)
        
        if (!fbError && fallbackData && fallbackData.length > 0) {
          data = fallbackData.map(c => ({
            id: c.id,
            source_newspaper: c.publication,
            newspaper_page: c.page_number,
            publish_date: c.date,
            original_headline: c.title,
            topic: c.title,
            upsc_tags: [c.syllabus_tag || c.category],
            state_psc_tags: [c.state_psc_tag],
            simple_summary_points: c.summary_points,
            intro: c.introduction,
            body_points_raw: c.body_points,
            conclusion: c.conclusion,
            pyq_reference: c.pyq_reference,
            mcq_data: c.prelims_traps ? {
              question: 'Examine the following distractor points regarding this topic:',
              options: {
                A: c.prelims_traps[0] || 'Statement 1 is valid',
                B: c.prelims_traps[1] || 'Statement 2 is valid',
                C: 'Both Statement 1 and 2',
                D: 'Neither 1 nor 2'
              },
              answer: 'A',
              trap_explanation: 'Examiner Mindset Distractor Analysis: Check extreme qualifiers.'
            } : null
          }))
        }
      }

      if (data && data.length > 0) {
        setCards(data)
        const uniqueDates = Array.from(new Set(data.map(c => c.publish_date).filter(Boolean)))
        setAvailableDates(uniqueDates)
      }
      setLoading(false)
    }
    fetchCards()
  }, [medium])

  // Direct Passwordless 1-Click Email Magic Link
  const handleMagicLogin = async (e) => {
    e.preventDefault()
    if (!authEmail || !authEmail.includes('@')) {
      setAuthMessage('Please enter a valid email address.')
      return
    }
    setAuthMessage('Dispatching secure 1-click login link...')
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail,
      options: { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '' }
    })
    setAuthMessage(error ? `Error: ${error.message}` : '⚡ 1-Click login link sent! Check your email inbox or spam.')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserProfile({ isLoggedIn: false, email: '', planType: 'FREE', referralCode: '', referralCount: 0 })
    window.location.reload()
  }

  const isCardPaywalled = (idx) => {
    if (userProfile.planType === '360_RANKER' || userProfile.planType === 'DAILY_INTEL') return false
    return idx >= 2
  }

  // Filter Cards by Date and GS Category
  const dateFiltered = selectedDate === 'ALL' 
    ? cards 
    : cards.filter(c => c.publish_date === selectedDate)

  const finalCards = activeFilter === 'ALL'
    ? dateFiltered
    : dateFiltered.filter(c => c.upsc_tags?.some(t => t.includes(activeFilter)))

  const filterCounts = {
    ALL: dateFiltered.length,
    'GS-1': dateFiltered.filter(c => c.upsc_tags?.some(t => t.includes('GS-1'))).length,
    'GS-2': dateFiltered.filter(c => c.upsc_tags?.some(t => t.includes('GS-2'))).length,
    'GS-3': dateFiltered.filter(c => c.upsc_tags?.some(t => t.includes('GS-3'))).length,
    'GS-4': dateFiltered.filter(c => c.upsc_tags?.some(t => t.includes('GS-4'))).length,
  }

  return (
    <div className="min-h-screen bg-[#070913] text-[#E2E8F0] font-sans pb-24 selection:bg-amber-500 selection:text-black relative">
      
      {/* Forensic Anti-Leak Watermark */}
      <div className="fixed inset-0 pointer-events-none z-50 select-none overflow-hidden opacity-[0.035] flex flex-wrap gap-24 p-8 transform -rotate-12">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="text-xs font-mono text-white tracking-widest uppercase">
            {userProfile.email || 'CIVILPULSE EXAMINER AUDIT'} • {userProfile.planType} • DO NOT REDISTRIBUTE
          </span>
        ))}
      </div>

      {/* Header (Pure Email Flow - No Google Auth) */}
      <header className="sticky top-0 z-40 bg-[#070913]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-black font-black text-lg tracking-tighter">CP</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">CivilPulse</h1>
                <span className="text-[9px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-400/30">
                  TOP 1% EXAMINER CALIBRATED
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Current Affairs Means CivilPulse • Zero-Fluff Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setMedium('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${medium === 'en' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
              >
                EN
              </button>
              <button
                onClick={() => setMedium('hi')}
                className={`px-2.5 py-1 text-xs font-bold rounded ${medium === 'hi' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
              >
                हिन्दी
              </button>
            </div>

            <a
              href="/plans"
              className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              Plans & Perks
            </a>

            {userProfile.isLoggedIn ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] font-mono text-amber-400 font-bold">{userProfile.planType}</span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] text-slate-500 hover:text-rose-400 font-mono ml-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
              >
                <span>✉️ Email Sign-In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Passwordless Email Auth Modal */}
      {showAuthModal && !userProfile.isLoggedIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0D1B] border border-amber-500/30 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Student Sign-In</h3>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <p className="text-xs text-slate-400">Enter your email address to receive an instant, passwordless 1-click login link.</p>
            <form onSubmit={handleMagicLogin} className="space-y-3">
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="aspirant@gmail.com"
                className="w-full bg-[#070914] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
              />
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2.5 rounded-xl transition-all">
                Send 1-Click Magic Link
              </button>
            </form>
            {authMessage && (
              <p className="text-[11px] text-amber-300 font-mono bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                {authMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TRACKER-PRO STYLE DATE ARCHIVE SELECTOR */}
      <div className="bg-[#0B0E1E] border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-400 font-mono text-[11px] uppercase mr-1 flex items-center gap-1">
            📅 Date:
          </span>
          <button
            onClick={() => setSelectedDate('ALL')}
            className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
              selectedDate === 'ALL'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All Dates ({cards.length})
          </button>
          {availableDates.map(dateStr => (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`px-3 py-1 rounded-lg font-mono whitespace-nowrap transition-all border ${
                selectedDate === dateStr
                  ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {dateStr}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-8">
        
        {/* Dynamic Paper Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'GS-1', 'GS-2', 'GS-3', 'GS-4'].map(paper => (
            <button
              key={paper}
              onClick={() => setActiveFilter(paper)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${
                activeFilter === paper
                  ? 'bg-amber-500/10 border-amber-400/80 text-amber-300'
                  : 'bg-slate-900/60 border-slate-800/90 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{paper === 'ALL' ? (medium === 'en' ? 'All Categories' : 'सभी श्रेणियां') : paper}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeFilter === paper ? 'bg-amber-400 text-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {filterCounts[paper]}
              </span>
            </button>
          ))}
        </div>

        {/* FEED SECTION */}
        <section className="space-y-6">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-mono">Loading verified examination cards...</p>
            </div>
          ) : finalCards.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-8 space-y-2">
              <p className="text-base font-bold text-slate-200">No cards found for the selected date or paper.</p>
              <p className="text-xs text-slate-400">Select "All Dates" to browse the full archive.</p>
            </div>
          ) : finalCards.map((card, idx) => {
            const paywalled = isCardPaywalled(idx)
            const hasMCQ = card.mcq_data && card.mcq_data.question
            const userChoice = selectedAnswers[card.id]
            const isCorrect = userChoice && card.mcq_data?.answer && userChoice.trim().toUpperCase() === card.mcq_data.answer.trim().toUpperCase()

            const sig = card.ready_to_use_body?.significance || []
            const ch = card.ready_to_use_body?.challenges || []
            const wf = card.ready_to_use_body?.way_forward || []
            const rawBody = card.body_points_raw || []
            const summaryPoints = card.simple_summary_points || card.crux_points || []

            return (
              <article
                key={card.id || idx}
                className="bg-[#0A0D1A] border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-5"
              >
                {/* 1 & 2. Sourcing, Page, Date & Original Headline */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                      📰 {card.source_newspaper || 'The Hindu / Indian Express'}
                    </span>
                    <span className="text-amber-400/90 font-mono text-[11px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {card.newspaper_page || 'Page 10'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Date: {card.publish_date || 'Current Edition'}
                  </span>
                </div>

                {card.original_headline && (
                  <p className="text-[11px] text-slate-400 italic">
                    Original Lead: "{card.original_headline}"
                  </p>
                )}

                {/* 3. Syllabus Linkage */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md">
                      🎯 UPSC: {card.upsc_tags?.[0] || 'Core GS'}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      🏛️ State PCS: {card.state_psc_tags?.[0] || 'State PSC Alignment'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {card.topic}
                  </h2>
                </div>

                {/* Paywall on Card 3 Onwards for Free Users */}
                {paywalled ? (
                  <div className="relative pt-3">
                    <div className="filter blur-md select-none pointer-events-none opacity-20 space-y-4">
                      <div className="h-16 bg-slate-800 rounded-xl"></div>
                      <div className="h-24 bg-slate-800 rounded-xl"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-[#0A0D1A] via-[#0A0D1A]/95 to-transparent">
                      <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30 mb-2">
                        🔒 PRO EXAM VAULT LOCKED
                      </span>
                      <h4 className="text-lg font-bold text-white max-w-sm">
                        Daily First 2 Cards are Free Forever
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
                        Unlock all remaining daily cards with Daily Intel (₹999/yr) or get all 10 Pro-Vaults with 360° Ranker Pass (₹3,499/yr).
                      </p>
                      <a
                        href="/plans"
                        className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md"
                      >
                        Unlock Instant Access $\rightarrow$
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 4. 3 Points in Simple Summary */}
                    <div className="bg-[#070913] rounded-xl p-4 border border-slate-800/80 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        ⚡ 3 POINTS IN SIMPLE SUMMARY (WHAT IS IN NEWS)
                      </span>
                      {summaryPoints.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                          {summaryPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold mt-0.5">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Core issue synthesized in introduction below.</p>
                      )}
                    </div>

                    {/* 5. Facts / Value Additions */}
                    {card.value_additions && card.value_additions.length > 0 && (
                      <div className="bg-slate-900/50 rounded-xl p-3.5 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                          📊 VERIFIED FACTS & VALUE ADDITION (NEWS EXTRACTED ONLY)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          {card.value_additions.map((va, i) => (
                            <div key={i} className="bg-[#070914] p-2.5 rounded-lg border border-slate-800">
                              <span className="text-[9px] font-mono text-slate-400 uppercase block">{va.type}</span>
                              <p className="text-slate-200 text-[11px] mt-0.5">{va.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 6. Ready-Made Introduction */}
                    {card.intro && (
                      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-1">
                          ✍️ READY-MADE INTRODUCTION ABOUT NEWS (25-30 WORDS)
                        </span>
                        <p className="text-slate-200 italic font-serif leading-relaxed">
                          "{card.intro}"
                        </p>
                      </div>
                    )}

                    {/* 7. Ready-to-Use Body (LOCKED HEADER: MAINS DIMENSIONS & PERSPECTIVES) */}
                    <div className="bg-[#080B17] border border-slate-800/90 rounded-xl p-4 space-y-4 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 block">
                        🏛️ MAINS DIMENSIONS & PERSPECTIVES
                      </span>

                      {/* Fallback if body came as direct array */}
                      {rawBody.length > 0 && (
                        <div className="space-y-2 pl-2 border-l border-amber-500/30">
                          {rawBody.map((item, i) => (
                            <p key={i} className="text-slate-200 text-[11px] leading-relaxed">
                              • {item}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Significance */}
                      {sig.length > 0 && (
                        <div className="space-y-2">
                          <strong className="text-amber-400 text-xs block">1. Significance (Mentioned in News):</strong>
                          <div className="space-y-2 pl-2 border-l border-amber-500/30">
                            {sig.map((item, i) => (
                              <div key={i} className="space-y-0.5">
                                <div className="font-semibold text-slate-100 text-[11px]">• [{item.heading}]</div>
                                <div className="text-slate-300 text-[11px] pl-3">{item.explanation}</div>
                                {item.real_example && (
                                  <div className="text-amber-300/90 italic font-mono text-[10px] pl-3">
                                    Ex ➔ {item.real_example}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Challenges */}
                      {ch.length > 0 && (
                        <div className="space-y-2">
                          <strong className="text-rose-400 text-xs block">2. Challenges & Bottlenecks:</strong>
                          <div className="space-y-2 pl-2 border-l border-rose-500/30">
                            {ch.map((item, i) => (
                              <div key={i} className="space-y-0.5">
                                <div className="font-semibold text-slate-100 text-[11px]">• [{item.heading}]</div>
                                <div className="text-slate-300 text-[11px] pl-3">{item.explanation}</div>
                                {item.real_example && (
                                  <div className="text-rose-300/90 italic font-mono text-[10px] pl-3">
                                    Ex ➔ {item.real_example}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Way Forward */}
                      {wf.length > 0 && (
                        <div className="space-y-2">
                          <strong className="text-emerald-400 text-xs block">3. Way Forward (Actionable Insights):</strong>
                          <div className="space-y-2 pl-2 border-l border-emerald-500/30">
                            {wf.map((item, i) => (
                              <div key={i} className="space-y-0.5">
                                <div className="font-semibold text-slate-100 text-[11px]">• [{item.heading}]</div>
                                <div className="text-slate-300 text-[11px] pl-3">{item.explanation}</div>
                                {item.real_example && (
                                  <div className="text-emerald-300/90 italic font-mono text-[10px] pl-3">
                                    Ex ➔ {item.real_example}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {rawBody.length === 0 && sig.length === 0 && ch.length === 0 && wf.length === 0 && (
                        <p className="text-slate-400 text-[11px] italic">Strategic examination dimensions linked in PYQ matrix below.</p>
                      )}
                    </div>

                    {/* 8. Match PYQ with that News */}
                    {card.pyq_reference && (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/90 block mb-1">
                          📍 MATCH PYQ OF THAT NEWS (UPSC & STATE PCS)
                        </span>
                        <p className="text-slate-300 text-[11px] font-mono leading-relaxed">
                          {card.pyq_reference}
                        </p>
                      </div>
                    )}

                    {/* 9. Short Conclusion */}
                    {card.conclusion && (
                      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-[11px]">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                          🎯 SHORT CONCLUSION (FUTURE-ORIENTED • TOPPER-STYLE)
                        </span>
                        <p className="text-slate-300 italic font-serif leading-relaxed">
                          "{card.conclusion}"
                        </p>
                      </div>
                    )}

                    {/* 10. One Prelims MCQ */}
                    {hasMCQ && (
                      <div className="border-t border-slate-800/80 pt-3">
                        <button
                          onClick={() => setRevealedMCQ(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                          className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
                        >
                          <span className="flex items-center gap-1.5">
                            🎯 Prelims Drill: 3-Statement Trap MCQ
                          </span>
                          <span className="text-[10px] font-mono bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                            {revealedMCQ[card.id] ? 'Close' : 'Attempt Drill'}
                          </span>
                        </button>

                        {revealedMCQ[card.id] && (
                          <div className="mt-3 bg-[#080B14] border border-slate-800 p-4 rounded-xl space-y-3.5 text-xs">
                            <p className="font-semibold text-slate-100 leading-snug whitespace-pre-line">
                              {card.mcq_data.question}
                            </p>

                            <div className="space-y-2">
                              {Object.entries(card.mcq_data.options || {}).map(([key, value]) => {
                                const isThisSelected = userChoice === key
                                return (
                                  <button
                                    key={key}
                                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [card.id]: key }))}
                                    className={`w-full text-left p-3 rounded-lg border text-xs flex items-center gap-3 transition-all ${
                                      isThisSelected
                                        ? 'bg-amber-500/10 border-amber-500/60 text-white'
                                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                                    }`}
                                  >
                                    <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                                      isThisSelected ? 'bg-amber-400 text-black' : 'bg-slate-800 text-slate-400'
                                    }`}>
                                      {key}
                                    </span>
                                    <span>{value}</span>
                                  </button>
                                )
                              })}
                            </div>

                            {userChoice && (
                              <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                isCorrect ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                              }`}>
                                <div className="font-bold mb-1">
                                  {isCorrect ? '✅ Correct! Official standard logic verified.' : `❌ Incorrect (Correct: Option [${card.mcq_data.answer}])`}
                                </div>
                                <p className="text-slate-300 text-[11px]">{card.mcq_data.trap_explanation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </article>
            )
          })}
        </section>

      </main>

      {/* Compliance Footer Shield */}
      <footer className="mt-20 border-t border-slate-800/80 bg-[#04060C] py-10 px-4 text-slate-500 text-[11px] leading-relaxed">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
            <span className="font-bold text-slate-300 text-xs">CivilPulse Legal, Statutory & Compliance Framework</span>
            <span className="font-mono text-[10px]">Section 52 Indian Copyright Act, 1957 Compliant • 18% GST Inclusive</span>
          </div>
          <p>
            <strong>Fair Dealing & Pedagogical Citation Notice:</strong> CivilPulse publishes independent pedagogical evaluation frameworks, administrative syntheses, and syllabus mappings under Section 52(1)(a) of the Indian Copyright Act, 1957. References to newspapers (such as <em>The Hindu</em> or <em>The Indian Express</em>) are strictly for academic source attribution and research reference.
          </p>
          <p>
            <strong>Statutory Non-Affiliation Disclaimer:</strong> CivilPulse is an independent educational platform and is not affiliated, endorsed, or connected with the Union Public Service Commission (UPSC), any State Public Service Commission (UPPSC, BPSC, RPSC, MPPSC), or any publishing houses.
          </p>
          <p>
            <strong>Digital Access & Non-Refund Policy:</strong> CivilPulse provides immediate free access to daily sample cards to verify platform utility. Upon purchase of the Daily Intel Pass or 360° Ranker Pass, full unhindered access to proprietary databases and vaults is activated instantly. Consequently, all digital subscription transactions are final, non-cancellable, and strictly non-refundable.
          </p>
        </div>
      </footer>

    </div>
  )
}
