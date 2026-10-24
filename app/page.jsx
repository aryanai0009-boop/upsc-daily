'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdjldpbwnwbbyyflvnav.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function CivilPulseFeed() {
  const [cards, setCards] = useState([])
  const [medium, setMedium] = useState('en')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [activeProTab, setActiveProTab] = useState('FODDER')
  const [loading, setLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [revealedMCQ, setRevealedMCQ] = useState({})
  
  // Real-Time User Subscription & Referral States
  const [userProfile, setUserProfile] = useState({
    isLoggedIn: false,
    email: '',
    planType: 'FREE', // 'FREE' | 'DAILY_INTEL' | '360_RANKER'
    referralCode: '',
    referralCount: 0
  })
  const [referralCopied, setReferralCopied] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      
      // 1. Fetch Daily Calibrated Intelligence Cards
      const { data, error } = await supabase
        .from('daily_cards')
        .select('*')
        .eq('medium', medium)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setCards(data)
      }

      // 2. Fetch Active User Authentication & Plan Profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

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
      setLoading(false)
    }
    loadData()
  }, [medium])

  const isProUser = userProfile.planType === '360_RANKER'
  const isEnrolled = userProfile.planType === 'DAILY_INTEL' || userProfile.planType === '360_RANKER'

  const filterCounts = {
    ALL: cards.length,
    'GS-1': cards.filter(c => c.upsc_tags?.some(t => t.includes('GS-1'))).length,
    'GS-2': cards.filter(c => c.upsc_tags?.some(t => t.includes('GS-2'))).length,
    'GS-3': cards.filter(c => c.upsc_tags?.some(t => t.includes('GS-3'))).length,
    'GS-4': cards.filter(c => c.upsc_tags?.some(t => t.includes('GS-4'))).length,
  }

  const filteredCards = activeFilter === 'ALL'
    ? cards
    : cards.filter(c => c.upsc_tags?.some(t => t.includes(activeFilter)))

  const copyReferral = () => {
    if (userProfile.referralCode) {
      navigator.clipboard.writeText(`https://civilpulse.in?ref=${userProfile.referralCode}`)
      setReferralCopied(true)
      setTimeout(() => setReferralCopied(false), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-[#060811] text-[#E2E8F0] selection:bg-amber-500 selection:text-black font-sans pb-24 relative overflow-x-hidden">
      
      {/* Dynamic Forensic Watermark Overlay (Anti-Piracy & Anti-Leakage Shield) */}
      <div className="fixed inset-0 pointer-events-none z-50 select-none overflow-hidden opacity-[0.035] flex flex-wrap gap-24 p-8 transform -rotate-12">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="text-xs font-mono text-white tracking-widest uppercase">
            {userProfile.email || 'CIVILPULSE VERIFIED EXAMINER AUDIT'} • {userProfile.planType} • DO NOT LEAK
          </span>
        ))}
      </div>

      {/* 1. Header with CivilPulse Branding */}
      <header className="sticky top-0 z-40 bg-[#060811]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/40">
              <span className="text-black font-black text-xl tracking-tighter">CP</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  CivilPulse
                </h1>
                <span className="text-[10px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  TOP 1% EXAMINER CALIBRATED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Zero-Fluff Daily Examination Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
              <button
                onClick={() => setMedium('en')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  medium === 'en' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setMedium('hi')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  medium === 'hi' ? 'bg-amber-500 text-black shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिन्दी
              </button>
            </div>
            {userProfile.isLoggedIn ? (
              <span className="hidden sm:inline-block text-[11px] font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-amber-400 font-bold">
                {userProfile.planType}
              </span>
            ) : (
              <a
                href="#pricing-matrix"
                className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
              >
                Get Pass
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. Psychological Opportunity Cost Banner */}
      <div className="border-b border-slate-800/80 bg-[#090D1C] px-4 py-2.5 text-xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              1,000+ Topper Copy Answer Frameworks Active
            </span>
            <span className="text-slate-700">|</span>
            <span className="hidden sm:inline">The Hindu & The Indian Express Filtered</span>
          </div>
          <div className="font-mono text-amber-400/90 text-[11px] font-semibold flex items-center gap-1.5">
            <span>Daily Execution: 15 Mins</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">₹9.5/Day vs ₹12.3 Lakh Delay Cost</span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-10">
        
        {/* Dynamic Paper Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'GS-1', 'GS-2', 'GS-3', 'GS-4'].map(paper => (
            <button
              key={paper}
              onClick={() => setActiveFilter(paper)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 whitespace-nowrap ${
                activeFilter === paper
                  ? 'bg-amber-500/10 border-amber-400/80 text-amber-300 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800/90 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{paper === 'ALL' ? (medium === 'en' ? 'All Updates' : 'सभी विषय') : paper}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeFilter === paper ? 'bg-amber-400 text-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {filterCounts[paper]}
              </span>
            </button>
          ))}
        </div>

        {/* SECTION 1: Daily Intelligence Feed Stream */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-base font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>📰 5:00 AM Dual-Paper Intelligence Feed</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-normal">
                {medium === 'en' ? 'Verified Today' : 'आज का सत्यापित विश्लेषण'}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="py-28 text-center space-y-3">
              <div className="w-9 h-9 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-mono tracking-wide">
                Screening daily newspaper intelligence against UPSC & State PSC syllabus...
              </p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-8 space-y-2">
              <p className="text-base font-bold text-slate-200">No updates in this category for today.</p>
              <p className="text-xs text-slate-400">Strict relevance filtering excludes non-syllabus news items.</p>
            </div>
          ) : (
            filteredCards.map((card, idx) => {
              const isPaywalled = userProfile.planType === 'FREE' && idx >= 2
              const hasMCQ = card.mcq_data && card.mcq_data.question
              const userChoice = selectedAnswers[card.id]
              const isCorrect = userChoice && card.mcq_data?.answer && userChoice.trim().toUpperCase() === card.mcq_data.answer.trim().toUpperCase()

              return (
                <article
                  key={card.id || idx}
                  className="bg-[#0A0D1A] border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-5 transition-all hover:border-slate-700"
                >
                  {/* News Source, Exact Page & Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                        📰 {card.source_newspaper || 'The Hindu / Indian Express'}
                      </span>
                      <span className="text-amber-400/90 font-mono text-[11px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {card.newspaper_page || 'Page 10'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{card.publish_date || 'Today'}</span>
                  </div>

                  {card.original_headline && (
                    <p className="text-[11px] text-slate-400 italic">
                      Original Lead: "{card.original_headline}"
                    </p>
                  )}

                  {/* Topic Header & Badges */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                      <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md">
                        {card.upsc_tags?.[0] || 'UPSC Core'}
                      </span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        {card.state_psc_tags?.[0] || 'State PSC Alignment'}
                      </span>
                      {card.probable_hit_list_score && (
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono">
                          🔥 Hit-List Index: {card.probable_hit_list_score}/10
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                      {card.topic}
                    </h3>
                  </div>

                  {/* Frosted Glass Paywall on Card 3 Onwards for Free Users */}
                  {isPaywalled ? (
                    <div className="relative pt-3">
                      <div className="filter blur-md select-none pointer-events-none opacity-25 space-y-4">
                        <div className="h-16 bg-slate-800 rounded-xl"></div>
                        <div className="h-24 bg-slate-800 rounded-xl"></div>
                        <div className="h-28 bg-slate-800 rounded-xl"></div>
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-[#0A0D1A] via-[#0A0D1A]/95 to-transparent">
                        <div className="max-w-md space-y-3.5">
                          <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                            🔒 PRO RANKER VAULT LOCKED
                          </span>
                          <h4 className="text-lg font-bold text-white">
                            Unlock Daily Complete Issues & All 10 Pro-Ranker Assets
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            First 2 daily cards are free forever. Unlock complete cards, 500+ Micro-Diagrams, 2,500 Prelims Traps, and Mains Fodder.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center">
                            <a
                              href="#pricing-matrix"
                              className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-center"
                            >
                              ⭐ Get 360° Ranker Pass @ ₹3,499
                            </a>
                            <a
                              href="#pricing-matrix"
                              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-center"
                            >
                              Daily Intel Pass @ ₹999
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Simple 3-Point Summary Breakdown */}
                      <div className="bg-[#070913] rounded-xl p-4 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                          ⚡ 3-POINT CONTEXT & ISSUE BREAKDOWN
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                          {card.simple_summary_points?.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold mt-0.5">•</span>
                              <span>{pt}</span>
                            </li>
                          )) || card.crux_points?.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold mt-0.5">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Filtered Value Additions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3.5 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                            ⚖️ STATUTE / COMMITTEE / ARTICLE
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {card.value_additions?.[0]?.content}
                          </p>
                        </div>
                        <div className="bg-indigo-950/20 border border-indigo-800/30 rounded-xl p-3.5 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                            📊 KEY DATA POINT / STATISTIC
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {card.value_additions?.[1]?.content}
                          </p>
                        </div>
                      </div>

                      {/* Mains Section (I-B-C) */}
                      <div className="space-y-3 text-xs">
                        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1.5">
                            ✍️ 30-WORD READY-TO-USE MAINS OPENING
                          </span>
                          <p className="text-slate-200 italic font-serif leading-relaxed">
                            "{card.intro}"
                          </p>
                        </div>

                        {card.ready_to_use_body && (
                          <div className="bg-[#080B17] border border-slate-800/90 rounded-xl p-4 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                              🏛️ EXAM-ORIENTED MAINS BODY (HEADINGS + REAL EXAMPLES)
                            </span>
                            
                            {Array.isArray(card.ready_to_use_body.significance) ? (
                              <div className="space-y-3 text-slate-300 text-[11px]">
                                <div>
                                  <strong className="text-amber-400 block mb-1">1. Strategic / Constitutional Significance:</strong>
                                  <div className="space-y-1.5 pl-2 border-l border-amber-500/30">
                                    {card.ready_to_use_body.significance.map((item, i) => (
                                      <div key={i}>
                                        <span className="font-semibold text-slate-200">{item.heading}: </span>
                                        <span>{item.explanation} </span>
                                        <span className="text-slate-400 italic font-mono text-[10px]">[Eg: {item.real_example}]</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-rose-400 block mb-1">2. Critical Bottlenecks:</strong>
                                  <div className="space-y-1.5 pl-2 border-l border-rose-500/30">
                                    {card.ready_to_use_body.challenges.map((item, i) => (
                                      <div key={i}>
                                        <span className="font-semibold text-slate-200">{item.heading}: </span>
                                        <span>{item.explanation} </span>
                                        <span className="text-slate-400 italic font-mono text-[10px]">[Eg: {item.real_example}]</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-emerald-400 block mb-1">3. Actionable Way Forward:</strong>
                                  <div className="space-y-1.5 pl-2 border-l border-emerald-500/30">
                                    {card.ready_to_use_body.way_forward.map((item, i) => (
                                      <div key={i}>
                                        <span className="font-semibold text-slate-200">{item.heading}: </span>
                                        <span>{item.explanation} </span>
                                        <span className="text-slate-400 italic font-mono text-[10px]">[Eg: {item.real_example}]</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                                <div><strong className="text-amber-400">1. Significance: </strong>{card.ready_to_use_body.significance}</div>
                                <div><strong className="text-rose-400">2. Bottlenecks: </strong>{card.ready_to_use_body.challenges}</div>
                                <div><strong className="text-emerald-400">3. Way Forward: </strong>{card.ready_to_use_body.way_forward}</div>
                              </div>
                            )}
                          </div>
                        )}

                        {card.conclusion && (
                          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-[11px]">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                              🎯 BALANCED MAINS CONCLUSION
                            </span>
                            <p className="text-slate-300 italic font-serif leading-relaxed">
                              "{card.conclusion}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* State PSC & PYQ Reference */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                            🏛️ STATE PSC IMPLICATION
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {typeof card.state_value_add === 'object' 
                              ? `${card.state_value_add?.up_angle || ''} • ${card.state_value_add?.bihar_angle || ''}`
                              : card.state_value_add}
                          </p>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/90 block mb-1">
                            📍 CROSS-EXAM PYQ ANCHOR
                          </span>
                          <p className="text-slate-300 text-[11px] font-mono leading-relaxed">
                            {card.pyq_reference}
                          </p>
                        </div>
                      </div>

                      {/* Prelims Trap Drill (Options on Separate Lines) */}
                      {hasMCQ && (
                        <div className="border-t border-slate-800/80 pt-3">
                          <button
                            onClick={() => setRevealedMCQ(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                            className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              🎯 Solve Prelims Trap Drill (Multi-Statement UPSC Format)
                            </span>
                            <span className="text-[10px] uppercase font-mono bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
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
                                      <span className="leading-relaxed">{value}</span>
                                    </button>
                                  )
                                })}
                              </div>

                              {userChoice && (
                                <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                  isCorrect 
                                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                                }`}>
                                  <div className="font-bold flex items-center gap-1.5 mb-1">
                                    {isCorrect ? '✅ Correct! Examiner trap dodged successfully.' : `❌ Incorrect (Correct: Option [${card.mcq_data.answer}])`}
                                  </div>
                                  <p className="text-slate-300 text-[11px] leading-relaxed">
                                    <strong>Distractor Decoder: </strong>{card.mcq_data.trap_explanation}
                                  </p>
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
            })
          )}
        </section>

        {/* SECTION 2: PRO-EXCLUSIVE ASSET VAULTS (₹3,499 PASS SECTIONS) */}
        <section className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                ⭐ 360° RANKER PASS EXCLUSIVE ECOSYSTEM
              </span>
              <h2 className="text-xl font-black text-white">Pro Academic Asset Vaults</h2>
            </div>
            {!isProUser && (
              <span className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                🔒 Included in ₹3,499 Plan
              </span>
            )}
          </div>

          {/* Pro Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {[
              { id: 'FODDER', label: '1. Mains Fodder' },
              { id: 'DIAGRAMS', label: '2. 500+ Diagrams' },
              { id: 'TRAP_BANK', label: '3. 2,500 Trap Bank' },
              { id: 'SUNDAY_TEST', label: '4. Sunday Test' },
              { id: 'PROBABLES', label: '5. Top 25 Probables' },
              { id: 'ONE_PAGERS', label: '6. One-Pagers' },
              { id: 'GS4_ETHICS', label: '7. GS-4 Ethics' },
              { id: 'STATE_DIFF', label: '8. State PSC Footnotes' },
              { id: 'SPRINT_PDF', label: '9. 45-Min Sprint Sheet' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveProTab(tab.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  activeProTab === tab.id
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Interactive Vault Content Area */}
          <div className="bg-[#0A0D1B] border border-slate-800 rounded-2xl p-6 min-h-[280px] relative overflow-hidden">
            {!isProUser && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 bg-[#0A0D1B]/90 backdrop-blur-sm">
                <span className="text-xs uppercase font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30 mb-2">
                  🔒 Restricted to 360° Ranker Pass Holders
                </span>
                <h3 className="text-lg font-bold text-white max-w-md">
                  Instant Access to All 9 Master Vaults & Compendiums
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  Unlock continuous daily accumulations from PIB, Hindu, Express, and Government Reports.
                </p>
                <a
                  href="#pricing-matrix"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  Upgrade to 360° Ranker Pass @ ₹3,499
                </a>
              </div>
            )}

            {/* Tab 1: Mains Fodder */}
            {activeProTab === 'FODDER' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white">Daily Accumulated Mains Fodder Ledger</h4>
                  <span className="text-[10px] text-amber-400 font-mono">Real-Time Continuous Accumulation</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold block">⚖️ Constitutional Articles:</span>
                    <p className="text-slate-300">Art. 14, 19, 21, 21A, 38, 39(b), 48A, 243W, 263, 280, 300A</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-sky-400 font-bold block">🏛️ Landmark SC Ratios:</span>
                    <p className="text-slate-300">Puttaswamy (Privacy), Bommai (Federalism), Minerva Mills (Basic Structure)</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold block">📋 Committees & Commissions:</span>
                    <p className="text-slate-300">2nd ARC (Ethics & Civil Services), Punchhi (Inter-State Relations), Kasturirangan</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-indigo-400 font-bold block">📊 Official Metrics & Ledgers:</span>
                    <p className="text-slate-300">NITI Aayog MPI, PLFS Labour Metrics, RBI Currency & Finance, NFHS-5 Nutrition</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Micro-Diagrams */}
            {activeProTab === 'DIAGRAMS' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">500+ Micro-Diagram & Schematic Visual Engine</h4>
                <p className="text-slate-400 text-[11px]">Exam-hall reproducible in under 45 seconds to secure an extra 1.5 marks per question.</p>
                <div className="bg-black/60 p-4 rounded-xl border border-slate-800 font-mono text-emerald-400 text-[11px] overflow-x-auto">
                  <pre>{`[Fiscal Devolution Deficit] 
         │ 
         ▼ 
[State Capex Contraction] ──► (Incentive-Linked Transfers) ──► [Sustained GDP Growth]`}</pre>
                </div>
              </div>
            )}

            {/* Tab 3: Trap Bank */}
            {activeProTab === 'TRAP_BANK' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">2,500 Prelims Trap Bank (Distractor Decoder Engine)</h4>
                <p className="text-slate-400 text-[11px]">Master question-setter trap patterns (Authority Swaps, Extreme Words, Constitutional Drift).</p>
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-rose-400 font-bold uppercase block mb-1">TRAP PATTERN #14: INSTITUTIONAL MANDATE SWAP</span>
                  <p className="text-slate-300 text-[11px]">UPSC replaces the statutory authority (e.g. CPCB) with a central ministry to test factual rigor.</p>
                </div>
              </div>
            )}

            {/* Tab 4: Sunday Test */}
            {activeProTab === 'SUNDAY_TEST' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">Weekly 10-Question Sunday Revision Test</h4>
                <p className="text-slate-400 text-[11px]">5 High-Yield UPSC standard multi-statement drills + 5 State PSC factual/conceptual questions.</p>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-amber-400 font-bold block">Current Active Test: Week 42 Comprehensive</span>
                    <span className="text-slate-400 text-[10px]">10 Questions • Detailed Explanations • Benchmarked with Peers</span>
                  </div>
                  <button className="bg-amber-500 text-black font-bold px-4 py-2 rounded-lg text-xs">
                    Start Sunday Drill
                  </button>
                </div>
              </div>
            )}

            {/* Tab 5: Probables Hit-List */}
            {activeProTab === 'PROBABLES' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">Top 25 Probables Predictor (Prelims + Mains)</h4>
                <p className="text-slate-400 text-[11px]">Predictive examination analysis released 30 days prior to official exam dates.</p>
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold">Predictive Match Rate: 84% PYQ Alignment</span>
                </div>
              </div>
            )}

            {/* Tab 6: One-Pagers */}
            {activeProTab === 'ONE_PAGERS' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">Syllabus Theme One-Pagers & Universal GS Openers</h4>
                <p className="text-slate-400 text-[11px]">50 Universal GS Openers covering GS 1 to 4 for instant 30-second answer initiation.</p>
              </div>
            )}

            {/* Tab 7: GS-4 Ethics */}
            {activeProTab === 'GS4_ETHICS' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">GS-4 Ethics Case Studies & Administrative Ledger</h4>
                <p className="text-slate-400 text-[11px]">Real-world administrative dilemmas extracted from current affairs with Nolan principles mapping.</p>
              </div>
            )}

            {/* Tab 8: State PSC Footnotes */}
            {activeProTab === 'STATE_DIFF' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">State PSC Specific Regional Differentiator</h4>
                <p className="text-slate-400 text-[11px]">Dedicated state-level footnotes: UPPSC GS-5/6, BPSC GS-2, and RAS administrative maps.</p>
              </div>
            )}

            {/* Tab 9: Sprint Sheet */}
            {activeProTab === 'SPRINT_PDF' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">The "45-Minute Emergency Review" PDF</h4>
                <p className="text-slate-400 text-[11px]">Hyper-compressed 10-page printable sprint sheet for outside-the-hall morning revision.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: THE HIGH-DOPAMINE ENROLLED-ONLY REFERRAL ENGINE */}
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-[#0A0D1B] border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                VIRAL AMBASSADOR LOOP (PRO-MEMBERS ONLY)
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Share CivilPulse With Serious Peers & Unlock Lifetime Access + ₹1,000 Cash
              </h3>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
              Automated Verification Shield
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">Your Friend Gets:</strong>
              <p className="text-slate-400 text-[11px]">Flat <strong className="text-amber-400">₹300 OFF</strong> on 360° Pass (or ₹100 OFF on Daily Intel).</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">Sales 1, 2, 3, 4:</strong>
              <p className="text-slate-400 text-[11px]">You get <strong className="text-emerald-400">+15 Days Free Validity</strong> per verified friend.</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">5th Milestone Sale:</strong>
              <p className="text-slate-400 text-[11px]">Direct <strong className="text-amber-400">₹1,000 Cash UPI Transfer</strong> to you.</p>
            </div>
          </div>

          {/* Referral Status Block - STRICT RULE: ONLY ENROLLED USERS GET CODES */}
          {isEnrolled ? (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">YOUR ACTIVE AMBASSADOR CODE:</span>
                <span className="text-base font-mono font-black text-amber-400">{userProfile.referralCode}</span>
                <span className="text-xs text-slate-400 ml-3">({userProfile.referralCount} Verified Referrals)</span>
              </div>
              <button
                onClick={copyReferral}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                {referralCopied ? '✔ Referral Link Copied!' : 'Copy Referral Invite Link'}
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/70 p-4 rounded-xl border border-dashed border-amber-500/40 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-200">
                🔒 Referral Ambassador System is strictly locked for Non-Enrolled Students.
              </p>
              <p className="text-[11px] text-slate-400">
                To prevent fraud and maintain institutional integrity, you must enroll in any active plan (₹999 or ₹3,499) to generate your unique referral code.
              </p>
              <a
                href="#pricing-matrix"
                className="inline-block mt-1 text-xs font-bold text-amber-400 hover:underline"
              >
                Enroll Now to Activate Ambassador Perks $\rightarrow$
              </a>
            </div>
          )}
        </section>

        {/* SECTION 4: THE GRAND SLAM TABULAR PRICING ENGINE */}
        <section id="pricing-matrix" className="pt-8 space-y-8">
          
          {/* Opportunity Cost Psychology Box */}
          <div className="bg-[#090D1C] border border-amber-500/40 rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block">
              THE HARD ECONOMIC REALITY OF AN ATTEMPT
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              A 1-Year Prep Delay Costs You ₹12,30,000+ Minimum.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Living rent in Mukherjee Nagar/Prayagraj (~₹1.8 Lakh) + 12 months of delayed Group-A Officer Basic Salary (~₹10.5 Lakh). 
              The <strong className="text-amber-400">360° Ranker Pass costs ₹3,499/yr (₹9.5/day — less than a cup of tea)</strong>. 
              Do not risk a full year of your career to save ₹9 a day on random free Telegram PDFs.
            </p>
          </div>

          {/* Deep Tabular Comparison: Free vs ₹999 vs ₹3,499 */}
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">Choose Your Strategic Advantage</h2>
              <p className="text-xs text-slate-400">Examiner-calibrated features mapped strictly to official evaluation rubrics</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090D1C] shadow-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="p-4 text-slate-300 font-bold">Feature / Deliverable</th>
                    <th className="p-4 text-slate-400 font-semibold">Free Preview</th>
                    <th className="p-4 text-slate-300 font-semibold">Daily Intel (₹999)</th>
                    <th className="p-4 bg-amber-500/10 text-amber-300 font-black border-l border-r border-amber-500/30">
                      ⭐ 360° Ranker (₹3,499)
                      <span className="block text-[9px] font-mono text-amber-400/90 font-normal mt-0.5">MOST POPULAR • 98% CHOOSE THIS</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="p-4 font-medium">Daily Verified News Intelligence</td>
                    <td className="p-4 text-slate-500">2 Cards / Day Only</td>
                    <td className="p-4 text-slate-200">All 5–6 Cards Daily</td>
                    <td className="p-4 bg-amber-500/5 font-bold text-white border-l border-r border-amber-500/20">All Cards + Full 365-Day Archive</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Sourcing & Exact Edition Page Audit</td>
                    <td className="p-4 text-emerald-400">✔ Yes</td>
                    <td className="p-4 text-emerald-400">✔ Yes</td>
                    <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ Yes</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">3-Point Simple Issue Summary</td>
                    <td className="p-4 text-emerald-400">✔ Yes</td>
                    <td className="p-4 text-emerald-400">✔ Yes</td>
                    <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ Yes</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">1-Click Bilingual Switcher (EN/हिन्दी)</td>
                    <td className="p-4 text-emerald-400">✔ Yes</td>
                    <td className="p-4 text-emerald-400">✔ Yes</td>
                    <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ Yes</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Ready 30-Word Mains Intros</td>
                    <td className="p-4 text-slate-500">2 Cards Only</td>
                    <td className="p-4 text-slate-200">Daily Cards</td>
                    <td className="p-4 bg-amber-500/5 font-bold text-white border-l border-r border-amber-500/20">Daily + 50 Universal Openers</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Mains Body Headings + Real Examples</td>
                    <td className="p-4 text-rose-500">❌ Locked</td>
                    <td className="p-4 text-emerald-400">✔ Daily News Only</td>
                    <td className="p-4 bg-amber-500/5 font-bold text-white border-l border-r border-amber-500/20">✔ 1,000+ Topper Copy Frameworks</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">500+ Micro-Diagram Visual Engine</td>
                    <td className="p-4 text-rose-500">❌ Locked</td>
                    <td className="p-4 text-rose-500">❌ Not Included</td>
                    <td className="p-4 bg-amber-500/5 text-amber-300 font-black border-l border-r border-amber-500/20">✔ Full 500+ Schematics Vault</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">2,500 Prelims Trap Bank (Distractor Decoder)</td>
                    <td className="p-4 text-slate-500">1 MCQ / Day</td>
                    <td className="p-4 text-slate-200">Daily MCQs Only</td>
                    <td className="p-4 bg-amber-500/5 font-bold text-white border-l border-r border-amber-500/20">✔ Full 2,500+ Trap Flashcards</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Sunday 10-Question High-Dopamine Test</td>
                    <td className="p-4 text-rose-500">❌ Locked</td>
                    <td className="p-4 text-rose-500">❌ Not Included</td>
                    <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ Included Every Sunday</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Top 25 Probables Predictor (Pre + Mains)</td>
                    <td className="p-4 text-rose-500">❌ Locked</td>
                    <td className="p-4 text-rose-500">❌ Not Included</td>
                    <td className="p-4 bg-amber-500/5 text-amber-300 font-black border-l border-r border-amber-500/20">✔ Included (30 Days Prior)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Syllabus Theme One-Pagers</td>
                    <td className="p-4 text-rose-500">❌ Locked</td>
                    <td className="p-4 text-rose-500">❌ Not Included</td>
                    <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ All 4 GS Papers Mapped</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">GS-4 Ethics Case Study Ledger</td>
                    <td className="p-4 text-rose-500">❌ Locked</td>
                    <td className="p-4 text-rose-500">❌ Not Included</td>
                    <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ Real-World Dilemmas</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">State PSC Specific Footnotes</td>
                    <td className="p-4 text-rose-500">❌ Locked</td>
                    <td className="p-4 text-slate-400">Generic Linkages</td>
                    <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ Dedicated UPPSC & BPSC</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">45-Minute Emergency Review Sheet</td>
                    <td className="p-4 text-rose-500">❌ Locked</td>
                    <td className="p-4 text-rose-500">❌ Not Included</td>
                    <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ 10-Page Printable PDF</td>
                  </tr>
                  <tr className="bg-slate-900/60">
                    <td className="p-4 font-bold text-white">Daily Effective Investment</td>
                    <td className="p-4 font-mono text-slate-400">₹0</td>
                    <td className="p-4 font-mono text-slate-200">₹2.7 / day</td>
                    <td className="p-4 bg-amber-500/10 font-mono text-amber-300 font-bold border-l border-r border-amber-500/30">
                      ₹9.5 / day (Chai Cost)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Direct Action Plan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-[#0C1022] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs uppercase font-mono text-slate-400">ESSENTIAL TIER</span>
                  <h3 className="text-xl font-bold text-white mt-1">Daily Intel Pass</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Ideal for working aspirants needing pure 15-minute daily newspaper execution, verified facts, and daily trap MCQs.
                  </p>
                  <div className="mt-4">
                    <span className="text-2xl font-black text-white">₹999</span>
                    <span className="text-xs text-slate-400 ml-1">/ Year (Incl. 18% GST)</span>
                  </div>
                </div>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl border border-slate-700 transition-all">
                  Enroll in Daily Intel @ ₹999
                </button>
              </div>

              <div className="bg-[#0E1428] border-2 border-amber-500/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative shadow-xl shadow-amber-500/10">
                <div className="absolute -top-3 right-6 bg-amber-500 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md">
                  RECOMMENDED FOR TOP 50 RANKERS
                </div>
                <div>
                  <span className="text-xs uppercase font-mono text-amber-400">ALL-INCLUSIVE GRAND SLAM</span>
                  <h3 className="text-xl font-black text-white mt-1">360° Ranker Pass</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Everything CivilPulse creates: Daily Intel + 500 Diagrams + 2,500 Trap Bank + Sunday Tests + Top 25 Probables + 45-Min Sprint Sheet.
                  </p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-400">₹3,499</span>
                    <span className="text-xs text-slate-400">/ Year (Incl. 18% GST)</span>
                    <span className="text-xs line-through text-slate-500">₹48,000</span>
                  </div>
                </div>
                <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all">
                  Claim 360° Ranker Pass @ ₹3,499
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 5. Professional Legal, Compliance & No-Refund Shield */}
      <footer className="mt-20 border-t border-slate-800/80 bg-[#04060C] py-10 px-4 text-slate-500 text-[11px] leading-relaxed">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
            <span className="font-bold text-slate-300 text-xs">CivilPulse Legal, Statutory & Compliance Framework</span>
            <span className="font-mono text-[10px]">Sec 52 Fair Dealing Compliant • 18% GST Inclusive</span>
          </div>
          <p>
            <strong>Fair Dealing & Pedagogical Citation Notice:</strong> CivilPulse publishes independent pedagogical evaluation frameworks, administrative syntheses, and syllabus mappings. References to newspapers (such as <em>The Hindu</em> or <em>The Indian Express</em>) are strictly for academic source attribution and research reference under Section 52 of the Indian Copyright Act, 1957.
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
