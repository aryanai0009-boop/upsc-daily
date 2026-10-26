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

export default function DashboardLayout() {
  // Navigation State
  const [activeRoute, setActiveRoute] = useState('news') // 'news', 'fodder', 'tests', 'saved', 'account'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Auth & User State
  const [userProfile, setUserProfile] = useState({ isLoggedIn: false, email: '', planCode: 'FREE' })
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMessage, setAuthMessage] = useState('')

  // Content States (News Feed)
  const [cards, setCards] = useState([])
  const [medium, setMedium] = useState('en')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [revealedMCQ, setRevealedMCQ] = useState({})
  const [selectedAnswers, setSelectedAnswers] = useState({})

  // 1. Initialize Auth
  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) syncUserProfile(session.user)

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_, currentSession) => {
        if (currentSession?.user) syncUserProfile(currentSession.user)
        else setUserProfile({ isLoggedIn: false, email: '', planCode: 'FREE' })
      })
      return () => authListener?.subscription?.unsubscribe()
    }

    async function syncUserProfile(user) {
      if (user.email === 'aryanai0009@gmail.com') {
        setUserProfile({ isLoggedIn: true, email: user.email, planCode: 'PRO_999' })
        return
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setUserProfile({
        isLoggedIn: true,
        email: user.email,
        planCode: profile?.plan_code || 'FREE'
      })
    }
    initAuth()
  }, [])

  // 2. Fetch Daily News
  useEffect(() => {
    async function fetchCards() {
      if (activeRoute !== 'news') return
      setLoading(true)
      const { data, error } = await supabase
        .from('daily_cards')
        .select('*')
        .eq('medium', medium)
        .order('publish_date', { ascending: false })
        .limit(30)

      if (!error && data) setCards(data)
      setLoading(false)
    }
    fetchCards()
  }, [medium, activeRoute])

  // 3. Auth Handlers
  const handlePasswordAuth = async (e) => {
    e.preventDefault()
    setAuthMessage('Authenticating...')
    const { error } = isSignUpMode 
      ? await supabase.auth.signUp({ email: authEmail, password: authPassword })
      : await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
    
    if (error) setAuthMessage(error.message)
    else {
      setShowAuthModal(false)
      window.location.reload()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const isCardPaywalled = (idx) => {
    if (userProfile.planCode === 'PRO_999') return false
    return idx >= 2
  }

  // --- UI COMPONENTS --- //

  const SidebarLinks = () => (
    <div className="space-y-1 mt-6">
      {[
        { id: 'news', icon: '📰', label: 'News Analysis' },
        { id: 'fodder', icon: '🏛️', label: 'Mains Fodder' },
        { id: 'tests', icon: '🎯', label: 'Weekly Tests' },
        { id: 'saved', icon: '🔖', label: 'Saved Articles' },
        { id: 'account', icon: '⚙️', label: 'Account & Plan' }
      ].map(link => (
        <button
          key={link.id}
          onClick={() => { setActiveRoute(link.id); setIsMobileMenuOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
            activeRoute === link.id
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
              : 'text-slate-400 hover:bg-[#0A0D1B] hover:text-slate-200'
          }`}
        >
          <span className="text-lg">{link.icon}</span>
          {link.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#04060C] text-[#E2E8F0] font-sans flex selection:bg-amber-500 selection:text-black">
      
      {/* 🔒 Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#070913] border-r border-slate-800/80 fixed h-full z-40 p-5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-black font-black text-lg tracking-tighter">CP</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">CivilPulse</h1>
            <span className="text-[9px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-400/30 uppercase tracking-widest">
              Top 1% Intel
            </span>
          </div>
        </div>

        <SidebarLinks />

        <div className="mt-auto pt-6 border-t border-slate-800/80">
          {userProfile.isLoggedIn ? (
            <div className="bg-[#0A0D1A] p-4 rounded-xl border border-slate-800 space-y-2">
              <p className="text-[10px] text-slate-500 font-mono truncate">{userProfile.email}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${
                  userProfile.planCode === 'PRO_999' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {userProfile.planCode === 'PRO_999' ? 'PRO VIP ACCESS' : 'FREE TIER'}
                </span>
                <button onClick={handleLogout} className="text-xs text-rose-400 hover:text-rose-300 font-bold">Logout</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs py-3 rounded-xl shadow-md transition-all">
              🔑 Sign In to Access
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header & Drawer */}
      <header className="lg:hidden fixed top-0 w-full bg-[#070913]/95 backdrop-blur-md border-b border-slate-800/80 z-50 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <span className="text-black font-black text-sm">CP</span>
          </div>
          <h1 className="text-lg font-black text-white">CivilPulse</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-2xl text-slate-300">
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#070913] pt-20 px-5 flex flex-col">
          <SidebarLinks />
          <div className="mt-8">
            {userProfile.isLoggedIn ? (
              <button onClick={handleLogout} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl">Logout</button>
            ) : (
              <button onClick={() => {setShowAuthModal(true); setIsMobileMenuOpen(false);}} className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl">🔑 Sign In</button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 pt-20 lg:pt-8 px-4 sm:px-8 pb-24 max-w-5xl">
        
        {/* Anti-Leak Watermark */}
        <div className="fixed inset-0 pointer-events-none z-[-1] select-none overflow-hidden opacity-[0.02] flex flex-wrap gap-24 p-8 transform -rotate-12">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="text-xs font-mono text-white tracking-widest uppercase">
              {userProfile.email || 'CIVILPULSE AUDIT'} • {userProfile.planCode} • RESTRICTED
            </span>
          ))}
        </div>

        {/* --- VIEW: NEWS ANALYSIS --- */}
        {activeRoute === 'news' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Daily News Analysis</h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">10-Point Examiner Calibrated Rubric</p>
              </div>
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button onClick={() => setMedium('en')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${medium === 'en' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}>EN</button>
                <button onClick={() => setMedium('hi')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition ${medium === 'hi' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}>हिन्दी</button>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto"></div></div>
            ) : (
              <div className="space-y-6">
                {cards.map((card, idx) => {
                  const paywalled = isCardPaywalled(idx)
                  return (
                    <article key={card.id} className="bg-[#0A0D1A] border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-[11px] font-mono">
