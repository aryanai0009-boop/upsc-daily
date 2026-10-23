'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CivilPulseFeed() {
  const [cards, setCards] = useState([])
  const [medium, setMedium] = useState('en')
  const [filterPaper, setFilterPaper] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [revealedMCQ, setRevealedMCQ] = useState({})
  const [suggestion, setSuggestion] = useState('')
  const [suggestSent, setSuggestSent] = useState(false)

  useEffect(() => {
    async function fetchCards() {
      setLoading(true)
      const { data, error } = await supabase
        .from('daily_cards')
        .select('*')
        .eq('medium', medium)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setCards(data)
      }
      setLoading(false)
    }
    fetchCards()
  }, [medium])

  const handleOptionSelect = (cardId, optKey) => {
    setSelectedAnswers(prev => ({ ...prev, [cardId]: optKey }))
  }

  const toggleMCQ = (cardId) => {
    setRevealedMCQ(prev => ({ ...prev, [cardId]: !prev[cardId] }))
  }

  const handleSuggestionSubmit = (e) => {
    e.preventDefault()
    if (!suggestion.trim()) return
    setSuggestSent(true)
    setTimeout(() => {
      setSuggestion('')
      setSuggestSent(false)
    }, 3000)
  }

  const filteredCards = filterPaper === 'ALL' 
    ? cards 
    : cards.filter(c => c.upsc_tags?.some(tag => tag.toLowerCase().includes(filterPaper.toLowerCase())))

  return (
    <div className="min-h-screen bg-[#090D16] text-[#E2E8F0] selection:bg-amber-500 selection:text-black font-sans pb-16">
      <nav className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-black font-black text-sm tracking-tighter">CP</span>
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                CivilPulse <span className="text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.2 rounded font-semibold border border-amber-400/20">DAILY INTEL</span>
              </span>
              <p className="text-[11px] text-slate-400">Zero Fluff • 15-Min UPSC & State PSC</p>
            </div>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
            <button
              onClick={() => setMedium('en')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                medium === 'en'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setMedium('hi')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                medium === 'hi'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {['ALL', 'GS-1', 'GS-2', 'GS-3', 'GS-4'].map(paper => (
            <button
              key={paper}
              onClick={() => setFilterPaper(paper)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all border ${
                filterPaper === paper
                  ? 'bg-slate-800 border-amber-400/60 text-amber-300 font-bold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {paper === 'ALL' ? (medium === 'en' ? 'All Updates' : 'सभी विषय') : paper}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 tracking-wide">
              {medium === 'en' ? 'Fetching exam-calibrated intelligence...' : 'सामग्री लोड हो रही है...'}
            </p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-6">
            <p className="text-sm font-semibold text-slate-300">
              {medium === 'en' ? 'Updating live daily feed.' : 'आज का विश्लेषण जल्द उपलब्ध होगा।'}
            </p>
          </div>
        ) : (
          filteredCards.map((card, idx) => {
            const hasMCQ = card.mcq_data && card.mcq_data.question
            const userChoice = selectedAnswers[card.id]
            const isCorrect = userChoice && card.mcq_data?.answer && userChoice.trim().toUpperCase() === card.mcq_data.answer.trim().toUpperCase()

            return (
              <article
                key={card.id || idx}
                className="bg-[#0F1422] border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold tracking-wide">
                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md">
                      {card.upsc_tags?.[0] || 'UPSC Core'}
                    </span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {card.state_psc_tags?.[0] || 'State PSC'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {card.publish_date || 'Today'}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {card.topic}
                </h2>

                <div className="bg-[#0A0D18] rounded-xl p-3.5 border border-slate-800/80">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                    ⚡ {medium === 'en' ? 'Executive Crux' : 'प्रमुख सार'}
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    {card.crux_points?.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    ✍️ {medium === 'en' ? 'Mains Ready Opening Intro' : 'मुख्य परीक्षा भूमिका'}
                  </span>
                  <p className="text-slate-200 mt-1.5 italic font-serif leading-relaxed">
                    "{card.intro}"
                  </p>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    🏛️ {medium === 'en' ? 'State Administration Value-Add' : 'राज्य विशेष शासन प्रभाव'}
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {card.state_value_add}
                  </p>
                </div>

                <div className="text-[11px] bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-slate-300">Exam Anchor:</span>
                  <span className="font-mono text-amber-300/80">{card.pyq_reference || 'UPSC Standard PYQ'}</span>
                </div>

                {hasMCQ && (
                  <div className="border-t border-slate-800/80 pt-3">
                    <button
                      onClick={() => toggleMCQ(card.id)}
                      className="w-full flex items-center justify-between py-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        🎯 {medium === 'en' ? 'Test Yourself: Prelims Trap Drill' : 'दैनिक प्रीलिम्स अभ्यास'}
                      </span>
                      <span className="text-[10px] uppercase font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {revealedMCQ[card.id] ? 'Hide' : 'Solve'}
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
                                onClick={() => handleOptionSelect(card.id, key)}
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
              </article>
            )
          })
        )}

        <div className="bg-[#0C101C] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">💡</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {medium === 'en' ? 'Aspirant Suggestion Box' : 'सुझाव एवं फीडबैक बॉक्स'}
            </h3>
          </div>
          <form onSubmit={handleSuggestionSubmit} className="space-y-2">
            <textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder={medium === 'en' ? 'Share your idea, request, or issue...' : 'अपना सुझाव यहाँ लिखें...'}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/60"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-emerald-400 font-medium">
                {suggestSent && '✓ Thank you! Suggestion noted.'}
              </span>
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-4 py-2 rounded-xl transition-all border border-slate-700"
              >
                {medium === 'en' ? 'Send Idea' : 'भेजें'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
