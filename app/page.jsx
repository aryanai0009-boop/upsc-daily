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
  const [loading, setLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [revealedMCQ, setRevealedMCQ] = useState({})

  useEffect(() => {
    async function fetchCards() {
      setLoading(true)
      const { data, error } = await supabase
        .from('daily_cards')
        .select('*')
        .eq('medium', medium)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setCards(data)
      }
      setLoading(false)
    }
    fetchCards()
  }, [medium])

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

  return (
    <div className="min-h-screen bg-[#070A13] text-[#E2E8F0] selection:bg-amber-500 selection:text-black font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#070A13]/95 backdrop-blur-md border-b border-slate-800/90 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center shadow-xl shadow-amber-500/25 ring-1 ring-amber-400/50">
              <span className="text-black font-black text-2xl tracking-tighter">CP</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">CivilPulse</h1>
                <span className="text-[10px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                  EXAMINER CALIBRATED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Zero-Fluff Daily Examination Intelligence</p>
            </div>
          </div>

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
        </div>
      </header>

      {/* Trust & Proof Bar */}
      <div className="border-b border-slate-800/70 bg-[#0A0E1C] px-4 py-2.5 text-xs">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              1,000+ Topper Copy Answer Framework Active
            </span>
            <span className="text-slate-700">|</span>
            <span className="hidden sm:inline">The Hindu & The Indian Express Filtered</span>
          </div>
          <div className="font-mono text-amber-400/90 text-[11px] font-semibold">
            Execution Target: 15 Mins
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Dynamic Paper Tabs with Live Auto-Updating Counters */}
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

        {/* Content Stream */}
        {loading ? (
          <div className="py-28 text-center space-y-3">
            <div className="w-9 h-9 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-mono tracking-wide">
              {medium === 'en' ? 'Screening daily newspaper intelligence against UPSC syllabus...' : 'दैनिक परीक्षा सामग्री लोड हो रही है...'}
            </p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-8 space-y-2">
            <p className="text-base font-bold text-slate-200">No updates in this paper category today.</p>
            <p className="text-xs text-slate-400">Strict relevance filtering excludes non-syllabus news items.</p>
          </div>
        ) : (
          filteredCards.map((card, idx) => {
            const isPaywalled = idx >= 2
            const hasMCQ = card.mcq_data && card.mcq_data.question
            const userChoice = selectedAnswers[card.id]
            const isCorrect = userChoice && card.mcq_data?.answer && userChoice.trim().toUpperCase() === card.mcq_data.answer.trim().toUpperCase()

            return (
              <article
                key={card.id || idx}
                className="bg-[#0C101F] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-5 transition-all hover:border-slate-700"
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

                {/* Original Newspaper Lead Headline */}
                {card.original_headline && (
                  <p className="text-[11px] text-slate-400 italic">
                    Original Lead: "{card.original_headline}"
                  </p>
                )}

                {/* Topic Header & Syllabus Badges */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md">
                      {card.upsc_tags?.[0] || 'UPSC Core'}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {card.state_psc_tags?.[0] || 'State PSC Alignment'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                    {card.topic}
                  </h2>
                </div>

                {/* Frosted Glass Paywall Overlay */}
                {isPaywalled ? (
                  <div className="relative pt-3">
                    <div className="filter blur-md select-none pointer-events-none opacity-30 space-y-4">
                      <div className="h-20 bg-slate-800 rounded-xl"></div>
                      <div className="h-16 bg-slate-800 rounded-xl"></div>
                      <div className="h-24 bg-slate-800 rounded-xl"></div>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-[#0C101F] via-[#0C101F]/90 to-transparent">
                      <div className="max-w-md space-y-3.5">
                        <span className="text-xs uppercase font-black tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                          🔒 Pro Academic Vault Locked
                        </span>
                        <h3 className="text-lg font-bold text-white">
                          Unlock Complete Daily Mains Blueprints, Prelims Traps & Top 25 Hit-Lists
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Equip your answers with 1,000+ topper copy schematics, 500+ data banks, and distractor decoders.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center">
                          <button className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all">
                            Unlock 360° Ranker Pass @ ₹3,499
                          </button>
                          <button className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition-all">
                            Daily Intel Pass @ ₹999
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Executive Crux */}
                    <div className="bg-[#080B14] rounded-xl p-4 border border-slate-800/80">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2.5">
                        ⚡ EXECUTIVE CRUX (CORE MECHANISMS)
                      </span>
                      <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                        {card.crux_points?.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Dual Filtered Value Additions */}
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

                    {/* Mains Ready Section (I-B-C) */}
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
                        <div className="bg-[#090D18] border border-slate-800/90 rounded-xl p-4 space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                            🏛️ EXAM-ORIENTED MAINS BODY
                          </span>
                          <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                            <div>
                              <strong className="text-amber-400 font-semibold">1. Strategic/Constitutional Significance: </strong>
                              {card.ready_to_use_body.significance}
                            </div>
                            <div>
                              <strong className="text-rose-400 font-semibold">2. Critical Bottlenecks: </strong>
                              {card.ready_to_use_body.challenges}
                            </div>
                            <div>
                              <strong className="text-emerald-400 font-semibold">3. Actionable Way Forward: </strong>
                              {card.ready_to_use_body.way_forward}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Micro-Diagram / Visual Schematic Container */}
                      {card.micro_diagram_schematic && (
                        <div className="bg-[#060912] border border-slate-800 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold uppercase tracking-wider text-amber-400">
                              📐 High-Yield Micro-Diagram (45-Sec Drawing)
                            </span>
                            <span className="text-slate-500 font-mono">
                              {card.micro_diagram_schematic.diagram_type}
                            </span>
                          </div>
                          <pre className="font-mono text-emerald-300 text-[11px] bg-slate-950 p-2.5 rounded-lg overflow-x-auto border border-slate-800/60">
                            {card.micro_diagram_schematic.ascii_representation}
                          </pre>
                          <p className="text-[10px] text-slate-400 italic">
                            *Evaluator Impact: {card.micro_diagram_schematic.evaluator_impact_note}
                          </p>
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

                    {/* State Administration & Cross-Exam PYQ Anchors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-1">
                          🏛️ STATE PSC IMPLICATION
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {card.state_value_add}
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

                    {/* Prelims Trap Drill */}
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
                            <p className="font-semibold text-slate-100 leading-snug">
                              {card.mcq_data.question}
                            </p>

                            <div className="space-y-2">
                              {Object.entries(card.mcq_data.options || {}).map(([key, value]) => {
                                const isThisSelected = userChoice === key
                                return (
                                  <button
                                    key={key}
                                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [card.id]: key }))}
                                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                                      isThisSelected
                                        ? 'bg-amber-500/10 border-amber-500/60 text-white'
                                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                                    }`}
                                  >
                                    <span className={`font-bold font-mono px-1.5 py-0.5 rounded text-[10px] ${
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
                                  {isCorrect ? '✅ Well done! Correct Answer.' : `❌ Incorrect (Correct: Option [${card.mcq_data.answer}])`}
                                </div>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  {card.mcq_data.trap_explanation}
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
      </main>
    </div>
  )
}
