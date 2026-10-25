'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdjldpbwnwbbyyflvnav.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy'
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Never asks for login again once authenticated
    storageKey: 'civilpulse-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : null
  }
})

export default function CivilPulseFeed() {
  const [cards, setCards] = useState([])
  const [medium, setMedium] = useState('en')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [activeProTab, setActiveProTab] = useState('FODDER')
  const [loading, setLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [revealedMCQ, setRevealedMCQ] = useState({})
  
  // Suggestion Box State
  const [suggestionText, setSuggestionText] = useState('')
  const [suggestionStatus, setSuggestionStatus] = useState('')

  // Persistent User State
  const [userProfile, setUserProfile] = useState({
    isLoggedIn: false,
    email: '',
    planType: 'FREE', // 'FREE' | 'DAILY_INTEL' | '360_RANKER'
    referralCode: '',
    referralCount: 0
  })
  const [authEmail, setAuthEmail] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [referralCopied, setReferralCopied] = useState(false)

  const t = {
    en: {
      subTitle: "Zero-Fluff Daily Examination Intelligence",
      examinerCalibrated: "EXAMINER CALIBRATED",
      activeTopperFrameworks: "1,000+ Topper Copy Frameworks Active",
      sourceAuditTag: "The Hindu & The Indian Express Verified",
      dailyExecution: "Daily Execution: 15 Mins",
      delayCost: "₹9.5/Day vs ₹12.3 Lakh Delay Cost",
      allUpdates: "All Updates",
      originalLead: "Original Lead Headline:",
      proVaultLocked: "PRO VAULT LOCKED",
      unlockTitle: "First 2 Cards are Free Forever",
      unlockDesc: "To read remaining daily issues, subscribe to Daily Intel Pass (₹999/yr). To unlock all 10 Pro-Ranker Assets, claim 360° Ranker Pass (₹3,499/yr).",
      claim360: "⭐ Claim 360° Ranker Pass @ ₹3,499",
      claim999: "Enroll in Daily Intel @ ₹999",
      contextBreakdown: "⚡ 3-POINT CONTEXT BREAKDOWN",
      statuteAnchor: "⚖️ STATUTE / COMMITTEE / ARTICLE",
      dataAnchor: "📊 KEY BENCHMARK DATA",
      stateValueAdd: "🏛️ STATE PSC EXCLUSIVE VALUE-ADD",
      mainsOpening: "✍️ 30-WORD READY MAINS OPENING",
      mainsBody: "🏛️ EXAM-ORIENTED MAINS BODY (HEADINGS + REAL EXAMPLES)",
      significance: "1. Strategic / Constitutional Significance:",
      challenges: "2. Critical Bottlenecks & Challenges:",
      wayForward: "3. Actionable Way Forward:",
      conclusion: "🎯 BALANCED MAINS CONCLUSION",
      crossExamPyq: "📍 CROSS-EXAM PYQ LINKAGE (UPSC + STATE PSC)",
      solveDrill: "🎯 Solve Prelims Trap Drill (Multi-Statement UPSC Format)",
      closeDrill: "Close Drill",
      attemptDrill: "Attempt Drill",
      correct: "✅ Correct! Trap successfully unmasked.",
      incorrect: "❌ Incorrect",
      proEcosystem: "⭐ 360° RANKER PASS EXCLUSIVE ECOSYSTEM",
      proVaultsTitle: "All 10 Pro-Ranker Academic Vaults",
      suggestionBoxTitle: "🗳️ Ranker Crowdsource Suggestion Box",
      suggestionDesc: "Suggest topics, schemes, or case studies. AI evaluates all suggestions weekly and prioritizes majority demands.",
      submitSuggestion: "Submit to AI Queue",
      ambassadorTitle: "VIRAL AMBASSADOR LOOP (ENROLLED USERS ONLY)",
      ambassadorDesc: "Share CivilPulse With Serious Peers & Unlock Lifetime Access + ₹1,000 Cash",
      friendGets: "Your Friend Gets:",
      friendDiscount: "Flat ₹300 OFF on 360° Pass (or ₹100 OFF on Daily Intel).",
      sales1to4: "Sales 1, 2, 3, 4:",
      sales1to4Desc: "+15 Days Free Validity per verified friend.",
      milestone5: "5th Milestone Sale:",
      milestone5Desc: "Direct ₹1,000 Cash UPI Transfer.",
      copyInvite: "Copy Referral Invite Link",
      linkCopied: "✔ Referral Link Copied!",
      pricingHeader: "Choose Your Strategic Advantage",
      pricingSub: "Examiner-calibrated features mapped strictly to official evaluation rubrics",
      oppCostHeader: "THE HARD ECONOMIC REALITY OF AN ATTEMPT",
      oppCostTitle: "A 1-Year Prep Delay Costs You ₹12,30,000+ Minimum.",
      oppCostDesc: "Mukherjee Nagar rent (~₹1.8 Lakh) + delayed basic salary (~₹10.5 Lakh). The 360° Ranker Pass costs ₹3,499/yr (₹9.5/day).",
      intelTier: "ESSENTIAL TIER",
      intelTitle: "Daily Intel Pass",
      intelDesc: "All 5-6 daily news analysis cards unlocked daily in full standard I-B-C depth.",
      rankerTier: "ALL-INCLUSIVE GRAND SLAM",
      rankerTitle: "360° Ranker Pass",
      rankerDesc: "All daily news cards + Full 10 Pro Assets (500 Diagrams, 2,500 Trap Bank, Sunday Tests, Hit-List, Sprint Sheet).",
      loginButton: "Login / Save Progress",
      loggedInAs: "Active Student:"
    },
    hi: {
      subTitle: "शून्य-अनावश्यक दैनिक परीक्षा विश्लेषण और उत्तर ढांचा",
      examinerCalibrated: "परीक्षक मानक द्वारा सत्यापित",
      activeTopperFrameworks: "1,000+ टॉपर उत्तर पुस्तिका फ्रेमवर्क सक्रिय",
      sourceAuditTag: "द हिंदू संपादकीय एवं इंडियन एक्सप्रेस एक्सप्लेंड से सत्यापित",
      dailyExecution: "दैनिक अध्ययन समय: मात्र 15 मिनट",
      delayCost: "₹9.5/दिन बनाम ₹12.3 लाख एक वर्ष की विफलता लागत",
      allUpdates: "सभी विषय",
      originalLead: "मूल समाचार शीर्षक:",
      proVaultLocked: "प्रो वॉल्ट लॉक है",
      unlockTitle: "शुरुआती 2 कार्ड्स सदैव निःशुल्क हैं",
      unlockDesc: "शेष दैनिक कार्ड्स पढ़ने हेतु डेली इंटेल पास (₹999/वर्ष) या सभी 10 प्रो संपत्तियां अनलॉक करने हेतु 360° रैंकर पास (₹3,499/वर्ष) चुनें।",
      claim360: "⭐ 360° रैंकर पास प्राप्त करें @ ₹3,499",
      claim999: "डेली इंटेल पास प्राप्त करें @ ₹999",
      contextBreakdown: "⚡ 3-बिंदु संदर्भ एवं मुख्य विवाद सारांश",
      statuteAnchor: "⚖️ संवैधानिक अनुच्छेद / अधिनियम / आयोग",
      dataAnchor: "📊 प्रामाणिक सांख्यिकी एवं आर्थिक आंकड़े",
      stateValueAdd: "🏛️ राज्य लोक सेवा आयोग विशेष वैल्यू-एडिशन",
      mainsOpening: "✍️ 30-शब्दों का तैयार मुख्य परीक्षा इंट्रो",
      mainsBody: "🏛️ परीक्षा-उपयोगी मुख्य परीक्षा बॉडी (शीर्षक + वास्तविक उदाहरण)",
      significance: "1. रणनीतिक एवं संवैधानिक महत्व:",
      challenges: "2. मुख्य संरचनात्मक एवं प्रशासनिक चुनौतियां:",
      wayForward: "3. व्यावहारिक आगे की राह (कमेटी सिफारिशें):",
      conclusion: "🎯 संतुलित मुख्य परीक्षा निष्कर्ष",
      crossExamPyq: "📍 विगत वर्ष प्रश्न लिंकेज (UPSC + राज्य PSC)",
      solveDrill: "🎯 प्रारंभिक परीक्षा ट्रैप ड्रिल हल करें (UPSC बहु-कथनीय प्रारूप)",
      closeDrill: "बंद करें",
      attemptDrill: "अभ्यास करें",
      correct: "✅ सही उत्तर! परीक्षक का ट्रैप सफलतापूर्वक पार किया।",
      incorrect: "❌ गलत उत्तर",
      proEcosystem: "⭐ 360° रैंकर पास विशेष शैक्षणिक वॉल्ट",
      proVaultsTitle: "सभी 10 प्रो-रैंकर विशेष अध्ययन मॉड्यूल्स",
      suggestionBoxTitle: "🗳️ रैंकर क्राउडसोर्स सुझाव पेटी",
      suggestionDesc: "अपने विषय या केस स्टडी का सुझाव दें। AI प्रति सप्ताह सभी सुझावों का विश्लेषण कर बहुमत के आधार पर अपडेट करता है।",
      submitSuggestion: "AI समीक्षा हेतु भेजें",
      ambassadorTitle: "वायरल एंबेसडर रिवॉर्ड लूप (केवल नामांकित छात्रों हेतु)",
      ambassadorDesc: "गंभीर साथियों के साथ साझा करें और आजीवन निःशुल्क वैधता + ₹1,000 नकद प्राप्त करें",
      friendGets: "आपके मित्र को मिलेगा:",
      friendDiscount: "360° पास पर ₹300 की छूट (या डेली इंटेल पर ₹100 की छूट)।",
      sales1to4: "सफल रेफरल 1, 2, 3, 4:",
      sales1to4Desc: "+15 दिन की निःशुल्क वैधता प्रति मित्र।",
      milestone5: "5वां सफल रेफरल माइलस्टोन:",
      milestone5Desc: "सीधे ₹1,000 नकद UPI पुरस्कार।",
      copyInvite: "रेफरल आमंत्रण लिंक कॉपी करें",
      linkCopied: "✔ रेफरल लिंक कॉपी हो गया!",
      pricingHeader: "अपनी परीक्षा रणनीति और प्लान का चयन करें",
      pricingSub: "UPSC CSE और राज्य PSC के आधिकारिक मूल्यांकन मानकों के अनुसार तैयार",
      oppCostHeader: "एक वर्ष व्यर्थ होने की वास्तविक आर्थिक लागत",
      oppCostTitle: "1 वर्ष का विलंब = ₹12,30,000+ का सीधा वित्तीय नुकसान।",
      oppCostDesc: "मुखर्जी नगर का खर्च (~₹1.8 लाख) + 1 वर्ष के वेतन का नुकसान (~₹10.5 लाख)। 360° रैंकर पास मात्र ₹3,499/वर्ष (₹9.5/दिन) है।",
      intelTier: "अनिवार्य दैनिक टियर",
      intelTitle: "डेली इंटेल पास",
      intelDesc: "रोजाना के सभी 5-6 न्यूज एनालिसिस कार्ड्स संपूर्ण मानक I-B-C फॉर्मेट में अनलॉक रहेंगे।",
      rankerTier: "सर्वसमावेशी ग्रैंड स्लैम",
      rankerTitle: "360° रैंकर पास",
      rankerDesc: "सभी दैनिक कार्ड्स + 500 आरेख + 2,500 ट्रैप बैंक + संडे टेस्ट + टॉप 25 संभावित प्रश्न + 45-मिनट स्प्रिंट शीट।",
      loginButton: "लॉगिन / डेटा सुरक्षित करें",
      loggedInAs: "सक्रिय छात्र:"
    }
  }[medium]

  // Initialize and Sync Persistent User Profile
  useEffect(() => {
    async function initUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        syncProfile(session.user.id, session.user.email)
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession?.user) {
          syncProfile(currentSession.user.id, currentSession.user.email)
        } else {
          setUserProfile({ isLoggedIn: false, email: '', planType: 'FREE', referralCode: '', referralCount: 0 })
        }
      })

      return () => {
        authListener?.subscription?.unsubscribe()
      }
    }

    async function syncProfile(userId, email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setUserProfile({
          isLoggedIn: true,
          email: email,
          planType: profile.plan_type || 'FREE',
          referralCode: profile.referral_code || '',
          referralCount: profile.referral_count || 0
        })
      }
    }

    initUser()
  }, [])

  // Fetch Daily Verified Cards
  useEffect(() => {
    async function loadCards() {
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
    loadCards()
  }, [medium])

  const handleMagicLogin = async (e) => {
    e.preventDefault()
    if (!authEmail) return
    setAuthMessage('Sending secure login link...')
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : '' }
    })
    if (error) {
      setAuthMessage(`Error: ${error.message}`)
    } else {
      setAuthMessage('Login link sent to your email. Click it once to stay logged in permanently!')
    }
  }

  // Paywall Condition: Free users get only first 2 cards.
  const checkIsPaywalled = (index) => {
    if (userProfile.planType === '360_RANKER' || userProfile.planType === 'DAILY_INTEL') {
      return false
    }
    return index >= 2
  }

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

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault()
    if (!suggestionText.trim()) return
    setSuggestionStatus('Submitting...')
    const { error } = await supabase.from('user_suggestions').insert({
      topic_suggested: suggestionText,
      exam_target: 'UPSC / State PSC'
    })
    if (!error) {
      setSuggestionStatus(medium === 'en' ? '✔ Suggestion added to AI Sweep Queue!' : '✔ सुझाव AI समीक्षा कतार में जुड़ गया!')
      setSuggestionText('')
      setTimeout(() => setSuggestionStatus(''), 4000)
    } else {
      setSuggestionStatus('Recorded!')
      setSuggestionText('')
      setTimeout(() => setSuggestionStatus(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-[#060811] text-[#E2E8F0] selection:bg-amber-500 selection:text-black font-sans pb-24 relative overflow-x-hidden">
      
      {/* Dynamic Forensic Watermark Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 select-none overflow-hidden opacity-[0.035] flex flex-wrap gap-24 p-8 transform -rotate-12">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="text-xs font-mono text-white tracking-widest uppercase">
            {userProfile.email || 'CIVILPULSE FORENSIC AUDIT'} • {userProfile.planType} • DO NOT LEAK
          </span>
        ))}
      </div>

      {/* 1. Header with CivilPulse Branding & Session Persist */}
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
                  {t.examinerCalibrated}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t.subTitle}</p>
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
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] font-mono text-amber-400 font-bold">{userProfile.planType}</span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-xs bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 px-3 py-1.5 rounded-lg transition-all"
              >
                {t.loginButton}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal for Persistent Session */}
      {showAuthModal && !userProfile.isLoggedIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0D1B] border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white">Student Login / Sign Up</h3>
            <p className="text-xs text-slate-400">Enter your email to save your plan and access tokens permanently on this device.</p>
            <form onSubmit={handleMagicLogin} className="space-y-3">
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full bg-[#070914] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <button type="submit" className="w-full bg-amber-500 text-black font-bold text-xs py-2.5 rounded-xl">
                Send Instant Magic Link
              </button>
            </form>
            {authMessage && <p className="text-[11px] text-amber-300 font-mono">{authMessage}</p>}
            <button onClick={() => setShowAuthModal(false)} className="text-[11px] text-slate-500 hover:underline block text-center w-full">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Opportunity Cost Banner */}
      <div className="border-b border-slate-800/80 bg-[#090D1C] px-4 py-2.5 text-xs">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {t.activeTopperFrameworks}
            </span>
            <span className="text-slate-700">|</span>
            <span className="hidden sm:inline">{t.sourceAuditTag}</span>
          </div>
          <div className="font-mono text-amber-400/90 text-[11px] font-semibold flex items-center gap-1.5">
            <span>{t.dailyExecution}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{t.delayCost}</span>
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
              <span>{paper === 'ALL' ? t.allUpdates : paper}</span>
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
                {medium === 'en' ? 'Verified Daily' : 'दैनिक सत्यापित'}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="py-28 text-center space-y-3">
              <div className="w-9 h-9 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-mono tracking-wide">
                {medium === 'en' ? 'Screening daily newspaper intelligence against UPSC syllabus...' : 'दैनिक परीक्षा सामग्री लोड हो रही है...'}
              </p>
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-8 space-y-2">
              <p className="text-base font-bold text-slate-200">No updates in this category for today.</p>
              <p className="text-xs text-slate-400">Non-syllabus articles are excluded automatically.</p>
            </div>
          ) : (
            filteredCards.map((card, idx) => {
              const isPaywalled = checkIsPaywalled(idx)
              const hasMCQ = card.mcq_data && card.mcq_data.question
              const userChoice = selectedAnswers[card.id]
              const isCorrect = userChoice && card.mcq_data?.answer && userChoice.trim().toUpperCase() === card.mcq_data.answer.trim().toUpperCase()

              return (
                <article
                  key={card.id || idx}
                  className="bg-[#0A0D1A] border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-5 transition-all hover:border-slate-700"
                >
                  {/* News Source, Page & Original Lead */}
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
                      {t.originalLead} "{card.original_headline}"
                    </p>
                  )}

                  {/* Topic Header & Tags */}
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
                          🔥 Hit-List: {card.probable_hit_list_score}/10
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                      {card.topic}
                    </h3>
                  </div>

                  {/* Frosted Glass Paywall Strictly On Card 3 Onwards For Free Users */}
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
                            🔒 {t.proVaultLocked}
                          </span>
                          <h4 className="text-lg font-bold text-white">
                            {t.unlockTitle}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {t.unlockDesc}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center">
                            <a
                              href="#pricing-matrix"
                              className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-center"
                            >
                              {t.claim360}
                            </a>
                            <a
                              href="#pricing-matrix"
                              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-center"
                            >
                              {t.claim999}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Simple 3-Point Context Summary */}
                      <div className="bg-[#070913] rounded-xl p-4 border border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                          {t.contextBreakdown}
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                          {card.simple_summary_points?.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-400 font-bold mt-0.5">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 3 Value Additions: Law/Committee + Empirical Data + State PSC Exclusive */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3.5 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                            {t.statuteAnchor}
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {card.value_additions?.[0]?.content}
                          </p>
                        </div>
                        <div className="bg-indigo-950/20 border border-indigo-800/30 rounded-xl p-3.5 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                            {t.dataAnchor}
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {card.value_additions?.[1]?.content}
                          </p>
                        </div>
                        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3.5 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                            {t.stateValueAdd}
                          </span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {card.value_additions?.[2]?.content || card.state_value_add}
                          </p>
                        </div>
                      </div>

                      {/* Complete Topper Mains Framework (Intro + Full Multi-Heading Body + Conclusion) */}
                      <div className="space-y-3 text-xs">
                        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1.5">
                            {t.mainsOpening}
                          </span>
                          <p className="text-slate-200 italic font-serif leading-relaxed">
                            "{card.intro}"
                          </p>
                        </div>

                        {card.ready_to_use_body && (
                          <div className="bg-[#080B17] border border-slate-800/90 rounded-xl p-4 space-y-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                              {t.mainsBody}
                            </span>
                            
                            {Array.isArray(card.ready_to_use_body.significance) && (
                              <div className="space-y-3 text-slate-300 text-[11px]">
                                <div>
                                  <strong className="text-amber-400 block mb-1">{t.significance}</strong>
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
                                  <strong className="text-rose-400 block mb-1">{t.challenges}</strong>
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
                                  <strong className="text-emerald-400 block mb-1">{t.wayForward}</strong>
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
                            )}
                          </div>
                        )}

                        {card.conclusion && (
                          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-[11px]">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                              {t.conclusion}
                            </span>
                            <p className="text-slate-300 italic font-serif leading-relaxed">
                              "{card.conclusion}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Dual Cross-Exam PYQ Linkage (UPSC + State PSC) */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300/90 block mb-1">
                          {t.crossExamPyq}
                        </span>
                        <p className="text-slate-300 text-[11px] font-mono leading-relaxed">
                          {card.pyq_reference}
                        </p>
                      </div>

                      {/* Prelims Trap Drill (Options on Separate Lines) */}
                      {hasMCQ && (
                        <div className="border-t border-slate-800/80 pt-3">
                          <button
                            onClick={() => setRevealedMCQ(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                            className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              {t.solveDrill}
                            </span>
                            <span className="text-[10px] uppercase font-mono bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/20">
                              {revealedMCQ[card.id] ? t.closeDrill : t.attemptDrill}
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
                                    {isCorrect ? t.correct : `${t.incorrect} (Correct: Option [${card.mcq_data.answer}])`}
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

        {/* SECTION 2: PRO-EXCLUSIVE ASSET VAULTS (ALL 10 MODULES FOR ₹3,499) */}
        <section className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                {t.proEcosystem}
              </span>
              <h2 className="text-xl font-black text-white">{t.proVaultsTitle}</h2>
            </div>
            {!isProUser && (
              <span className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                🔒 Included in ₹3,499 Plan
              </span>
            )}
          </div>

          {/* Sub-Navigation for All 10 Features */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {[
              { id: 'FODDER', label: '1. Mains Fodder' },
              { id: 'DIAGRAMS', label: '2. 500+ Diagrams' },
              { id: 'TRAP_BANK', label: '3. 2,500 Trap Bank' },
              { id: 'SUNDAY_TEST', label: '4. Sunday Test' },
              { id: 'PROBABLES', label: '5. Top 25 Probables' },
              { id: 'ONE_PAGERS', label: '6. Theme One-Pagers' },
              { id: 'GS4_ETHICS', label: '7. GS-4 Ethics Ledger' },
              { id: 'STATE_DIFF', label: '8. State PSC Regional' },
              { id: 'SPRINT_PDF', label: '9. 45-Min Sprint Sheet' },
              { id: 'DOPAMINE_AIR', label: '10. AIR Streak & Diagnostic' }
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

          <div className="bg-[#0A0D1B] border border-slate-800 rounded-2xl p-6 min-h-[280px] relative overflow-hidden">
            {!isProUser && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 bg-[#0A0D1B]/90 backdrop-blur-sm">
                <span className="text-xs uppercase font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30 mb-2">
                  🔒 Restricted to 360° Ranker Pass Holders
                </span>
                <h3 className="text-lg font-bold text-white max-w-md">
                  Instant Access to All 10 Master Vaults & Compendiums
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  Unlock continuous daily accumulations from PIB, The Hindu, Indian Express, and Government Reports.
                </p>
                <a
                  href="#pricing-matrix"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  Upgrade to 360° Ranker Pass @ ₹3,499
                </a>
              </div>
            )}

            {activeProTab === 'FODDER' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-white">Daily Accumulated Mains Fodder Ledger</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold block">⚖️ Constitutional Articles:</span>
                    <p className="text-slate-300">Art. 14, 19, 21, 38, 39(b), 48A, 243W, 263, 280, 300A</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-sky-400 font-bold block">🏛️ Landmark SC Ratios:</span>
                    <p className="text-slate-300">Puttaswamy (Privacy), Bommai (Federalism), Minerva Mills</p>
                  </div>
                </div>
              </div>
            )}

            {activeProTab === 'DIAGRAMS' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">500+ Micro-Diagram Visual Engine</h4>
                <div className="bg-black/60 p-4 rounded-xl border border-slate-800 font-mono text-emerald-400 text-[11px] overflow-x-auto">
                  <pre>{`[Fiscal Devolution Deficit] ──► (Incentive Transfers) ──► [Sustained GDP Growth]`}</pre>
                </div>
              </div>
            )}

            {activeProTab === 'TRAP_BANK' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">2,500 Prelims Trap Bank (Distractor Decoder Engine)</h4>
                <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-rose-400 font-bold uppercase block mb-1">TRAP PATTERN #14: INSTITUTIONAL MANDATE SWAP</span>
                  <p className="text-slate-300 text-[11px]">UPSC replaces the statutory authority (e.g. CPCB) with a central ministry to test factual rigor.</p>
                </div>
              </div>
            )}

            {activeProTab === 'SUNDAY_TEST' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">Weekly 10-Question Sunday Revision Test</h4>
                <p className="text-slate-400 text-[11px]">5 High-Yield UPSC standard multi-statement drills + 5 State PSC questions.</p>
              </div>
            )}

            {activeProTab === 'PROBABLES' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">Top 25 Probables Predictor (Prelims + Mains)</h4>
                <p className="text-slate-400 text-[11px]">Examiner-mindset predictions released 30 days prior to actual exam dates.</p>
              </div>
            )}

            {activeProTab === 'ONE_PAGERS' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">Theme One-Pagers & Universal GS Openers</h4>
                <p className="text-slate-400 text-[11px]">Ready-to-use 30-second answer initiation frameworks for all 4 GS papers.</p>
              </div>
            )}

            {activeProTab === 'GS4_ETHICS' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">GS-4 Ethics Case Studies & Administrative Ledger</h4>
                <p className="text-slate-400 text-[11px]">Administrative dilemmas mapped to Nolan principles and thinker quotes.</p>
              </div>
            )}

            {activeProTab === 'STATE_DIFF' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">State PSC Specific Regional Differentiator</h4>
                <p className="text-slate-400 text-[11px]">UPPSC GS-5/6, BPSC GS-2, and RAS administrative budget linkages.</p>
              </div>
            )}

            {activeProTab === 'SPRINT_PDF' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">The "45-Minute Emergency Review" PDF</h4>
                <p className="text-slate-400 text-[11px]">Hyper-compressed 10-page printable cheat sheet for exam morning revision.</p>
              </div>
            )}

            {activeProTab === 'DOPAMINE_AIR' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">AIR Consistency Streak & Diagnostic</h4>
                <p className="text-slate-400 text-[11px]">Loss-aversion habit tracker benchmarking your speed against serious peers.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: STUDENT SUGGESTION BOX */}
        <section className="bg-[#0A0D1B] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{t.suggestionBoxTitle}</span>
              <span className="text-[10px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded font-mono">PRO ACCESS</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t.suggestionDesc}</p>
          </div>

          <form onSubmit={handleSuggestionSubmit} className="space-y-3">
            <textarea
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              placeholder={medium === 'en' ? "Suggest a topic, scheme, or state case study..." : "किसी विषय या केस स्टडी का सुझाव दें..."}
              rows={3}
              className="w-full bg-[#070914] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-mono">{suggestionStatus}</span>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                {t.submitSuggestion}
              </button>
            </div>
          </form>
        </section>

        {/* SECTION 4: ENROLLED-ONLY REFERRAL MECHANISM */}
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-[#0A0D1B] border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                {t.ambassadorTitle}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                {t.ambassadorDesc}
              </h3>
            </div>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
              Automated Verification Shield
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">{t.friendGets}</strong>
              <p className="text-slate-400 text-[11px]">{t.friendDiscount}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">{t.sales1to4}</strong>
              <p className="text-slate-400 text-[11px]">{t.sales1to4Desc}</p>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <strong className="text-white block mb-0.5">{t.milestone5}</strong>
              <p className="text-slate-400 text-[11px]">{t.milestone5Desc}</p>
            </div>
          </div>

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
                {referralCopied ? t.linkCopied : t.copyInvite}
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/70 p-4 rounded-xl border border-dashed border-amber-500/40 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-200">
                🔒 Referral Ambassador System is strictly locked for Non-Enrolled Students.
              </p>
              <a href="#pricing-matrix" className="inline-block mt-1 text-xs font-bold text-amber-400 hover:underline">
                Enroll in ₹999 or ₹3,499 to generate your ambassador code $\rightarrow$
              </a>
            </div>
          )}
        </section>

        {/* SECTION 5: PRICING COMPARISON MATRIX */}
        <section id="pricing-matrix" className="pt-8 space-y-8">
          <div className="bg-[#090D1C] border border-amber-500/40 rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block">
              {t.oppCostHeader}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {t.oppCostTitle}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.oppCostDesc}
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">{t.pricingHeader}</h2>
              <p className="text-xs text-slate-400">{t.pricingSub}</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090D1C] shadow-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="p-4 text-slate-300 font-bold">Feature / Deliverable</th>
                    <th className="p-4 text-slate-400 font-semibold">Free Preview</th>
                    <th className="p-4 text-slate-300 font-semibold">Daily Intel (₹999/yr)</th>
                    <th className="p-4 bg-amber-500/10 text-amber-300 font-black border-l border-r border-amber-500/30">
                      ⭐ 360° Ranker (₹3,499/yr)
                      <span className="block text-[9px] font-mono text-amber-400/90 font-normal mt-0.5">MOST POPULAR • ALL 10 ASSETS INCLUDED</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="p-4 font-medium">Daily News Intelligence Depth</td>
                    <td className="p-4 text-slate-500">First 2 Cards Only</td>
                    <td className="p-4 text-slate-200">All 5–6 Cards Daily</td>
                    <td className="p-4 bg-amber-500/5 font-bold text-white border-l border-r border-amber-500/20">All Cards + Full 365-Day Archive</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Full Topper Body (Headings + Examples)</td>
                    <td className="p-4 text-emerald-400">✔ Sample Cards</td>
                    <td className="p-4 text-slate-200">✔ All Daily Cards</td>
                    <td className="p-4 bg-amber-500/5 font-bold text-white border-l border-r border-amber-500/20">✔ 1,000+ Topper Frameworks</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Dual Cross-Exam PYQ Linkage (UPSC + State)</td>
                    <td className="p-4 text-emerald-400">✔ Yes</td>
                    <td className="p-4 text-emerald-400">✔ Yes</td>
                    <td className="p-4 bg-amber-500/5 text-emerald-400 font-bold border-l border-r border-amber-500/20">✔ Yes</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">All 10 Exclusive Academic Pro Vaults</td>
                    <td className="p-4 text-rose-500">❌ Locked</td>
                    <td className="p-4 text-rose-500">❌ Not Included</td>
                    <td className="p-4 bg-amber-500/5 text-amber-300 font-black border-l border-r border-amber-500/20">✔ Complete Access Unlocked</td>
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

            {/* Direct Plan Enrollment Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-[#0C1022] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs uppercase font-mono text-slate-400">{t.intelTier}</span>
                  <h3 className="text-xl font-bold text-white mt-1">{t.intelTitle}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {t.intelDesc}
                  </p>
                  <div className="mt-4">
                    <span className="text-2xl font-black text-white">₹999</span>
                    <span className="text-xs text-slate-400 ml-1">/ Year (Incl. 18% GST)</span>
                  </div>
                </div>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl border border-slate-700 transition-all">
                  Enroll in Daily Intel Pass @ ₹999 / Year
                </button>
              </div>

              <div className="bg-[#0E1428] border-2 border-amber-500/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 relative shadow-xl shadow-amber-500/10">
                <div className="absolute -top-3 right-6 bg-amber-500 text-black text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md">
                  RECOMMENDED FOR TOP 50 RANKERS
                </div>
                <div>
                  <span className="text-xs uppercase font-mono text-amber-400">{t.rankerTier}</span>
                  <h3 className="text-xl font-black text-white mt-1">{t.rankerTitle}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {t.rankerDesc}
                  </p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-400">₹3,499</span>
                    <span className="text-xs text-slate-400">/ Year (Incl. 18% GST)</span>
                  </div>
                </div>
                <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black text-xs py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all">
                  Claim 360° Ranker Pass @ ₹3,499 / Year
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
