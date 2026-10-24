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
  
  // Suggestion Box State
  const [suggestionText, setSuggestionText] = useState('')
  const [suggestionStatus, setSuggestionStatus] = useState('')

  // User Profile & Authentication State
  const [userProfile, setUserProfile] = useState({
    isLoggedIn: false,
    email: '',
    planType: 'FREE', // 'FREE' | 'DAILY_INTEL' | '360_RANKER'
    referralCode: '',
    referralCount: 0
  })
  const [referralCopied, setReferralCopied] = useState(false)

  // Pure Bilingual Static Dictionary
  const t = {
    en: {
      subTitle: "Zero-Fluff Daily Examination Intelligence",
      examinerCalibrated: "EXAMINER CALIBRATED",
      activeTopperFrameworks: "1,000+ Topper Copy Answer Frameworks Active",
      sourceAuditTag: "The Hindu Editorial & Indian Express Explained Filtered",
      dailyExecution: "Daily Execution: 15 Mins",
      delayCost: "₹9.5/Day vs ₹12.3 Lakh Delay Cost",
      allUpdates: "All Updates",
      sourceLabel: "Verified Source:",
      originalLead: "Original Lead Headline:",
      proVaultLocked: "PRO ACADEMIC VAULT LOCKED",
      unlockTitle: "Unlock Full 365-Day Issues & All 10 Pro-Ranker Assets",
      unlockDesc: "First 2 daily cards are free with full Mains Body. Serious rankers unlock remaining daily issues, 500+ Diagrams, and Mains Fodder.",
      claim360: "⭐ Claim 360° Ranker Pass @ ₹3,499",
      claim999: "Enroll in Daily Intel @ ₹999",
      contextBreakdown: "⚡ 3-POINT CONTEXT & ISSUE BREAKDOWN",
      statuteAnchor: "⚖️ STATUTE / COMMITTEE / ARTICLE",
      dataAnchor: "📊 KEY DATA POINT / STATISTIC",
      stateValueAdd: "🏛️ STATE PSC EXCLUSIVE VALUE-ADD",
      mainsOpening: "✍️ 30-WORD READY-TO-USE MAINS OPENING",
      mainsBody: "🏛️ EXAM-ORIENTED MAINS BODY (HEADINGS + REAL EXAMPLES)",
      significance: "1. Strategic / Constitutional Significance:",
      challenges: "2. Critical Bottlenecks & Challenges:",
      wayForward: "3. Actionable Way Forward:",
      conclusion: "🎯 BALANCED MAINS CONCLUSION",
      crossExamPyq: "📍 CROSS-EXAM PYQ LINKAGE (UPSC + STATE PSC)",
      solveDrill: "🎯 Solve Prelims Trap Drill (Multi-Statement UPSC Format)",
      closeDrill: "Close Drill",
      attemptDrill: "Attempt Drill",
      correct: "✅ Correct! Official standard logic verified.",
      incorrect: "❌ Incorrect",
      proEcosystem: "⭐ 360° RANKER PASS EXCLUSIVE ECOSYSTEM",
      proVaultsTitle: "All 10 Pro-Ranker Academic Vaults",
      suggestionBoxTitle: "🗳️ Ranker Crowdsource Suggestion Box",
      suggestionDesc: "Suggest topics, schemes, or case studies. AI evaluates all suggestions weekly and prioritizes majority demands.",
      submitSuggestion: "Submit to AI Queue",
      ambassadorTitle: "VIRAL AMBASSADOR LOOP (PRO-MEMBERS ONLY)",
      ambassadorDesc: "Share CivilPulse With Serious Peers & Unlock Lifetime Access + ₹1,000 Cash",
      friendGets: "Your Friend Gets:",
      friendDiscount: "Flat ₹300 OFF on 360° Pass (or ₹100 OFF on Daily Intel).",
      sales1to4: "Sales 1, 2, 3, 4:",
      sales1to4Desc: "You get +15 Days Free Validity per verified friend.",
      milestone5: "5th Milestone Sale:",
      milestone5Desc: "Direct ₹1,000 Cash UPI Transfer to your account.",
      copyInvite: "Copy Referral Invite Link",
      linkCopied: "✔ Referral Link Copied!",
      pricingHeader: "Choose Your Strategic Advantage",
      pricingSub: "Examiner-calibrated features mapped strictly to official evaluation rubrics",
      oppCostHeader: "THE HARD ECONOMIC REALITY OF AN ATTEMPT",
      oppCostTitle: "A 1-Year Prep Delay Costs You ₹12,30,000+ Minimum.",
      oppCostDesc: "Living rent in Mukherjee Nagar/Prayagraj (~₹1.8 Lakh) + 12 months of delayed Group-A Officer Basic Salary (~₹10.5 Lakh). The 360° Ranker Pass costs ₹3,499/yr (₹9.5/day — less than a cup of tea).",
      intelTier: "ESSENTIAL TIER",
      intelTitle: "Daily Intel Pass",
      intelDesc: "Ideal for working aspirants needing pure 15-minute daily newspaper execution, verified facts, and daily trap MCQs.",
      rankerTier: "ALL-INCLUSIVE GRAND SLAM",
      rankerTitle: "360° Ranker Pass",
      rankerDesc: "Everything CivilPulse creates: Daily Intel + All 10 Pro Assets (500 Diagrams, 2,500 Trap Bank, Sunday Tests, Hit-List, Sprint Sheet).",
      footerLegal: "CivilPulse Legal, Statutory & Compliance Framework",
      footerFairDealing: "Fair Dealing & Pedagogical Citation Notice: CivilPulse publishes independent pedagogical evaluation frameworks, administrative syntheses, and syllabus mappings under Section 52 of the Indian Copyright Act, 1957. Newspapers are cited strictly for academic attribution.",
      footerDisclaimer: "Statutory Non-Affiliation Disclaimer: CivilPulse is an independent educational platform and is not affiliated with UPSC, UPPSC, BPSC, RPSC, or any publishing houses.",
      footerRefund: "Digital Access & Non-Refund Policy: Subscriptions activate instant access to proprietary intellectual assets. All sales are final and strictly non-refundable."
    },
    hi: {
      subTitle: "शून्य-अनावश्यक दैनिक परीक्षा विश्लेषण और उत्तर ढांचा",
      examinerCalibrated: "परीक्षक मानक द्वारा सत्यापित",
      activeTopperFrameworks: "1,000+ टॉपर उत्तर पुस्तिका फ्रेमवर्क सक्रिय",
      sourceAuditTag: "द हिंदू संपादकीय एवं इंडियन एक्सप्रेस एक्सप्लेंड से सत्यापित",
      dailyExecution: "दैनिक अध्ययन समय: मात्र 15 मिनट",
      delayCost: "₹9.5/दिन बनाम ₹12.3 लाख एक वर्ष की विफलता लागत",
      allUpdates: "सभी विषय",
      sourceLabel: "प्रमाणित स्रोत:",
      originalLead: "मूल समाचार शीर्षक:",
      proVaultLocked: "प्रो रैंकर्स वॉल्ट सुरक्षित लॉक है",
      unlockTitle: "संपूर्ण 365 दिन का विश्लेषण और सभी 10 प्रो-रैंकर संपत्तियां अनलॉक करें",
      unlockDesc: "शुरुआती 2 कार्ड्स संपूर्ण मुख्य परीक्षा बॉडी के साथ निःशुल्क हैं। शेष दैनिक कार्ड, 500+ आरेख और मेन्स फॉडर अनलॉक करने हेतु अपग्रेड करें।",
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
      friendDiscount: "360° पास पर ₹300 की सीधी छूट (या डेली इंटेल पर ₹100 की छूट)।",
      sales1to4: "सफल रेफरल 1, 2, 3, 4:",
      sales1to4Desc: "प्रत्येक सफल नामांकन पर आपको मिलेगी +15 दिन की निःशुल्क वैधता।",
      milestone5: "5वां सफल रेफरल माइलस्टोन:",
      milestone5Desc: "आपके UPI खाते में सीधे ₹1,000 का नकद पुरस्कार।",
      copyInvite: "रेफरल आमंत्रण लिंक कॉपी करें",
      linkCopied: "✔ रेफरल लिंक कॉपी हो गया!",
      pricingHeader: "अपनी परीक्षा रणनीति और प्लान का चयन करें",
      pricingSub: "UPSC CSE और राज्य PSC के आधिकारिक मूल्यांकन मानकों के अनुसार तैयार",
      oppCostHeader: "एक वर्ष व्यर्थ होने की वास्तविक आर्थिक लागत",
      oppCostTitle: "1 वर्ष का विलंब = ₹12,30,000+ का सीधा वित्तीय नुकसान।",
      oppCostDesc: "मुखर्जी नगर/प्रयागराज में रहने का खर्च (~₹1.8 लाख) + ग्रुप-ए अधिकारी के 1 वर्ष के वेतन का नुकसान (~₹10.5 लाख)। 360° रैंकर पास की लागत मात्र ₹3,499/वर्ष (₹9.5/दिन — एक चाय से भी कम) है।",
      intelTier: "अनिवार्य दैनिक टियर",
      intelTitle: "डेली इंटेल पास",
      intelDesc: "15 मिनट में दैनिक समाचार पत्र, प्रामाणिक आंकड़े और प्रीलिम्स ट्रैप प्रश्नों के लिए सर्वश्रेष्ठ।",
      rankerTier: "सर्वसमावेशी ग्रैंड स्लैम",
      rankerTitle: "360° रैंकर पास",
      rankerDesc: "सिविलपल्स की सभी 10 संपत्तियां: डेली इंटेल + 500 आरेख + 2,500 ट्रैप बैंक + संडे टेस्ट + टॉप 25 संभावित प्रश्न + 45-मिनट स्प्रिंट शीट।",
      footerLegal: "सिविलपल्स विधिक, वैधानिक एवं अनुपालन ढांचा",
      footerFairDealing: "फेयर डीलिंग एवं शैक्षणिक उद्धरण सूचना: सिविलपल्स भारतीय कॉपीराइट अधिनियम, 1957 की धारा 52 के तहत स्वतंत्र शैक्षणिक ढांचे और विश्लेषण प्रकाशित करता है। समाचार पत्रों का संदर्भ केवल शोध व सत्यापन हेतु है।",
      footerDisclaimer: "वैधानिक गैर-संबद्धता अस्वीकरण: सिविलपल्स एक स्वतंत्र शैक्षणिक मंच है और UPSC, UPPSC, BPSC या किसी प्रकाशन संस्थान से संबद्ध नहीं है।",
      footerRefund: "डिजिटल अभिगम्यता एवं नो-रिफंड नीति: सदस्यता सक्रिय होते ही संपूर्ण डेटाबेस का तत्काल एक्सेस प्रदान किया जाता है। अतः सभी डिजिटल भुगतान अंतिम और गैर-वापसी योग्य हैं।"
    }
  }[medium]

  useEffect(() => {
    async function loadData() {
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

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault()
    if (!suggestionText.trim()) return
    setSuggestionStatus('Submitting...')
    const { error } = await supabase.from('user_suggestions').insert({
      topic_suggested: suggestionText,
      exam_target: 'UPSC / State PSC'
    })
    if (!error) {
      setSuggestionStatus(medium === 'en' ? '✔ Suggestion added to AI Sweep Queue!' : '✔ सुझाव AI समीक्षा कतार में सफलतापूर्वक जुड़ गया!')
      setSuggestionText('')
      setTimeout(() => setSuggestionStatus(''), 4000)
    } else {
      setSuggestionStatus('Failed to submit. Please try again.')
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
              <span className="hidden sm:inline-block text-[11px] font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-amber-400 font-bold">
                {userProfile.planType}
              </span>
            ) : (
              <a
                href="#pricing-matrix"
                className="text-xs bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
              >
                {medium === 'en' ? 'Get Access' : 'प्लान चुनें'}
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
                {medium === 'en' ? 'Verified Today' : 'आज का सत्यापित विश्लेषण'}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="py-28 text-center space-y-3">
              <div className="w-9 h-9 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-mono tracking-wide">
                {medium === 'en' ? 'Screening daily newspaper intelligence against UPSC & State PSC syllabus...' : 'दैनिक परीक्षा सामग्री लोड हो रही है...'}
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
                  {/* News Source, Exact Page & Original Lead */}
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
                          )) || card.crux_points?.map((pt, i) => (
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
                            {card.value_additions?.[2]?.content || (typeof card.state_value_add === 'string' ? card.state_value_add : 'Direct state governance linkage included')}
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
                            
                            {Array.isArray(card.ready_to_use_body.significance) ? (
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
                            ) : (
                              <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                                <div><strong className="text-amber-400">{t.significance} </strong>{card.ready_to_use_body.significance}</div>
                                <div><strong className="text-rose-400">{t.challenges} </strong>{card.ready_to_use_body.challenges}</div>
                                <div><strong className="text-emerald-400">{t.wayForward} </strong>{card.ready_to_use_body.way_forward}</div>
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
                          {card.pyq_reference || 'UPSC Mains GS-2 [2023] Q4 & UPPSC GS-5 [2024] Q12 Parallel'}
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

          {/* Pro Sub-Navigation: All 10 Features */}
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

          {/* Interactive Vault Content Area */}
          <div className="bg-[#0A0D1B] border border-slate-800 rounded-2xl p-6 min-h-[300px] relative overflow-hidden">
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

            {/* Feature 1: Mains Fodder */}
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
                    <p className="text-slate-300">2nd ARC (Civil Services), Punchhi (Inter-State Relations), Kasturirangan</p>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-indigo-400 font-bold block">📊 Official Metrics & Ledgers:</span>
                    <p className="text-slate-300">NITI Aayog MPI, PLFS Labour Metrics, RBI Currency & Finance, NFHS-5 Nutrition</p>
                  </div>
                </div>
              </div>
            )}

            {/* Feature 2: 500+ Micro-Diagrams */}
            {activeProTab === 'DIAGRAMS' && (
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-white">500+ Micro-Diagram & Schematic Visual Engine</h4>
                <p className="text-slate-400 text-[11px]">Exam-hall reproducible in under 45 seconds to secure an extra 1.5 marks per question.</p>
                <div className="bg-black/60 p-4 rounded-xl border border-slate-800 font-mono text-emerald-400 text
