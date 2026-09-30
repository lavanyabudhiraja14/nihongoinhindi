import { useState } from 'react'

type View = 'login' | 'signup' | 'dashboard'

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = {
  Eye: ({ open }: { open: boolean }) => open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Home: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Book: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  Star: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  Chart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  Logout: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Play: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  Arrow: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
}

// ─── Shared ───────────────────────────────────────────────────────────────────

const JP = { fontFamily: "'Noto Serif JP', serif" }

function Logo({ small }: { small?: boolean }) {
  return (
    <div className={`flex items-center gap-3`}>
      <div className={`${small ? 'w-8 h-8 rounded-xl text-xl' : 'w-12 h-12 rounded-2xl text-[28px]'} bg-jp-red flex items-center justify-center shrink-0`}>
        <span className="text-white leading-none select-none" style={{ ...JP, fontWeight: 700 }}>学</span>
      </div>
      <div>
        <div className={`text-current font-700 ${small ? 'text-sm' : 'text-base'} leading-tight`}>Nihongo Seekho</div>
        <div className={`text-current/40 ${small ? 'text-[10px]' : 'text-xs'} mt-0.5`}>N5 स्तर · हिंदी में</div>
      </div>
    </div>
  )
}

function Field({ label, hint, type = 'text', placeholder, value, onChange, toggle, showPw, onToggle }: {
  label: string; hint?: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; toggle?: boolean; showPw?: boolean; onToggle?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-600 tracking-[0.08em] uppercase text-navy/50">{label}</label>
        {hint && <span className="text-xs text-jp-red/70 hover:text-jp-red cursor-pointer transition-colors">{hint}</span>}
      </div>
      <div className="relative">
        <input
          type={toggle ? (showPw ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-11 px-4 text-sm text-navy bg-white border border-[#E2E2E8] rounded-lg outline-none transition-all placeholder:text-navy/25 focus:border-jp-red focus:ring-3 focus:ring-jp-red/8"
        />
        {toggle && (
          <button type="button" onClick={onToggle}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/25 hover:text-navy/50 transition-colors">
            <Icon.Eye open={!!showPw} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Auth left panel ──────────────────────────────────────────────────────────

function AuthSide({ char, tag, headline, body }: { char: string; tag: string; headline: React.ReactNode; body: string }) {
  return (
    <div className="hidden lg:flex flex-col w-[400px] shrink-0 bg-navy relative overflow-hidden">
      {/* Massive background character */}
      <span className="absolute inset-0 flex items-center justify-center text-white/[0.035] select-none pointer-events-none leading-none"
        style={{ ...JP, fontSize: '400px', fontWeight: 700 }}>{char}</span>

      {/* Red accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-jp-red" />

      <div className="relative flex flex-col h-full px-12 py-12">
        {/* Logo */}
        <div className="text-white"><Logo /></div>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div>
            <span className="inline-flex items-center gap-2 text-saffron text-xs font-600 tracking-[0.1em] uppercase mb-5">
              <span className="w-4 h-px bg-saffron" />{tag}
            </span>
            <h2 className="text-white text-[32px] font-300 leading-[1.25]">{headline}</h2>
            <p className="mt-4 text-white/40 text-sm leading-relaxed">{body}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {['ひらがな', 'カタカナ', '漢字', 'N5 व्याकरण'].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-white/[0.07] text-white/50 text-xs" style={t.match(/[ぁ-ヿ]/) ? JP : {}}>{t}</span>
            ))}
          </div>
        </div>

        {/* Bottom stat strip */}
        <div className="flex gap-8 pt-8 border-t border-white/[0.08]">
          {[['150+', 'पाठ'], ['1,200+', 'शब्द'], ['N5', 'स्तर']].map(([n, l]) => (
            <div key={l}>
              <div className="text-white font-700 text-xl">{n}</div>
              <div className="text-white/35 text-xs mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginPage({ onSwitch, onLogin }: { onSwitch: () => void; onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)

  return (
    <div className="min-h-screen flex bg-white">
      <AuthSide char="日" tag="जापानी भाषा" headline={<>जापानी भाषा की<br /><strong className="font-700">नई शुरुआत करें</strong></>} body="हिंदी में सरल पाठों के साथ जापानी वर्णमाला, शब्द और वाक्य सीखें।" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="lg:hidden mb-10 text-navy"><Logo /></div>

        <div className="w-full max-w-[360px] space-y-8">
          <div>
            <h1 className="text-navy text-[28px] font-700 leading-tight">स्वागत है</h1>
            <p className="text-navy/40 text-sm mt-1.5">खाते में लॉग इन करें और आगे बढ़ें</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); onLogin() }} className="space-y-5">
            <Field label="ईमेल पता" placeholder="aapka@email.com" type="email" value={email} onChange={setEmail} />
            <Field label="पासवर्ड" hint="भूल गए?" placeholder="••••••••" value={pw} onChange={setPw} toggle showPw={show} onToggle={() => setShow(p => !p)} />
            <button type="submit"
              className="w-full h-11 rounded-lg bg-jp-red text-white text-sm font-600 hover:bg-jp-red-dark active:scale-[0.985] transition-all focus:outline-none focus:ring-2 focus:ring-jp-red/30">
              लॉग इन करें
            </button>
          </form>

          <p className="text-center text-sm text-navy/40">
            खाता नहीं है?{' '}
            <button onClick={onSwitch} className="text-jp-red font-600 hover:underline underline-offset-2">अभी बनाएं</button>
          </p>

          {/* Decorative footer */}
          <div className="flex items-center gap-3 justify-center pt-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-saffron/30" />
            <span className="text-navy/15 text-base" style={JP}>日本語</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-leaf/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Signup ───────────────────────────────────────────────────────────────────

function SignupPage({ onSwitch, onLogin }: { onSwitch: () => void; onLogin: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [cf, setCf] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const match = cf.length > 0 && pw === cf

  return (
    <div className="min-h-screen flex bg-white">
      <AuthSide char="新" tag="नया खाता" headline={<>आज से शुरू करें<br /><strong className="font-700">अपनी जापानी यात्रा</strong></>} body="मुफ्त में खाता बनाएं और जापानी भाषा के N5 स्तर तक पहुंचें।" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 overflow-y-auto">
        <div className="lg:hidden mb-10 text-navy"><Logo /></div>

        <div className="w-full max-w-[360px] space-y-7">
          <div>
            <h1 className="text-navy text-[28px] font-700 leading-tight">नया खाता बनाएं</h1>
            <p className="text-navy/40 text-sm mt-1.5">मुफ्त में शुरू करें</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); onLogin() }} className="space-y-4">
            <Field label="पूरा नाम" placeholder="आपका नाम" value={name} onChange={setName} />
            <Field label="ईमेल पता" placeholder="aapka@email.com" type="email" value={email} onChange={setEmail} />
            <Field label="पासवर्ड" placeholder="कम से कम 8 अक्षर" value={pw} onChange={setPw} toggle showPw={showPw} onToggle={() => setShowPw(p => !p)} />

            {/* Confirm password with match indicator */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <label className="text-[11px] font-600 tracking-[0.08em] uppercase text-navy/50">पासवर्ड दोहराएं</label>
                {cf.length > 0 && (
                  <span className={`text-[11px] font-600 ${match ? 'text-leaf' : 'text-jp-red'}`}>
                    {match ? '✓ सही' : '✗ अलग'}
                  </span>
                )}
              </div>
              <div className="relative">
                <input type={showCf ? 'text' : 'password'} placeholder="••••••••" value={cf} onChange={e => setCf(e.target.value)}
                  className={`w-full h-11 px-4 pr-11 text-sm text-navy bg-white border rounded-lg outline-none transition-all placeholder:text-navy/25 focus:ring-3 ${cf.length > 0 ? (match ? 'border-leaf focus:border-leaf focus:ring-leaf/8' : 'border-jp-red/50 focus:border-jp-red focus:ring-jp-red/8') : 'border-[#E2E2E8] focus:border-jp-red focus:ring-jp-red/8'}`} />
                <button type="button" onClick={() => setShowCf(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/25 hover:text-navy/50 transition-colors"><Icon.Eye open={showCf} /></button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-0.5 group">
              <div className="mt-0.5 shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center cursor-pointer"
                style={{ background: agreed ? '#BC2025' : '#fff', borderColor: agreed ? '#BC2025' : '#D1D1DA' }}
                onClick={() => setAgreed(p => !p)}>
                {agreed && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2 2L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span className="text-[12px] text-navy/45 leading-[1.6]">
                मैं <span className="text-jp-red cursor-pointer">सेवा की शर्तें</span> और <span className="text-jp-red cursor-pointer">गोपनीयता नीति</span> से सहमत हूं
              </span>
            </label>

            <button type="submit" disabled={!agreed}
              className="w-full h-11 rounded-lg bg-jp-red text-white text-sm font-600 hover:bg-jp-red-dark active:scale-[0.985] transition-all focus:outline-none focus:ring-2 focus:ring-jp-red/30 disabled:opacity-35 disabled:cursor-not-allowed mt-1">
              खाता बनाएं
            </button>
          </form>

          <p className="text-center text-sm text-navy/40">
            पहले से खाता है?{' '}
            <button onClick={onSwitch} className="text-jp-red font-600 hover:underline underline-offset-2">लॉग इन करें</button>
          </p>

          <div className="flex items-center gap-3 justify-center pt-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-saffron/30" />
            <span className="text-navy/15 text-base" style={JP}>日本語</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-leaf/30" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'home',     label: 'डैशबोर्ड',  Icon: Icon.Home },
  { id: 'hiragana', label: 'हिरागाना',   Icon: Icon.Book },
  { id: 'katakana', label: 'काताकाना',   Icon: Icon.Book },
  { id: 'vocab',    label: 'शब्दावली',   Icon: Icon.Star },
  { id: 'progress', label: 'प्रगति',     Icon: Icon.Chart },
  { id: 'settings', label: 'सेटिंग्स',   Icon: Icon.Settings },
]

const WEEK = [
  { d: 'Mo', n: 'सो', done: true }, { d: 'Tu', n: 'मं', done: true }, { d: 'We', n: 'बु', done: true },
  { d: 'Th', n: 'गु', done: true }, { d: 'Fr', n: 'शु', done: false }, { d: 'Sa', n: 'श', done: false }, { d: 'Su', n: 'र', done: false },
]

const RECENT_CHARS = [
  { c: 'あ', r: 'a', h: 'आ', done: true },
  { c: 'い', r: 'i', h: 'इ', done: true },
  { c: 'う', r: 'u', h: 'उ', done: true },
  { c: 'え', r: 'e', h: 'ए', done: false },
  { c: 'お', r: 'o', h: 'ओ', done: false },
  { c: 'か', r: 'ka', h: 'क', done: false },
]

function Sidebar({ active, onNav, onLogout, open, onClose }: {
  active: string; onNav: (id: string) => void; onLogout: () => void; open: boolean; onClose: () => void
}) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-screen w-[228px] bg-navy flex flex-col z-40 transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Red left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-jp-red" />

        {/* Logo */}
        <div className="px-6 pt-7 pb-6 flex items-center justify-between">
          <div className="text-white"><Logo small /></div>
          <button onClick={onClose} className="text-white/30 hover:text-white lg:hidden transition-colors"><Icon.X /></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
          {NAV_ITEMS.map(({ id, label, Icon: I }) => {
            const isActive = active === id
            return (
              <button key={id} onClick={() => { onNav(id); onClose() }}
                className={`w-full flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left relative ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/4'}`}>
                {isActive && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-saffron" />}
                <I />
                <span className={isActive ? 'font-600' : 'font-400'}>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* XP strip */}
        <div className="mx-4 mb-4 rounded-xl bg-white/[0.06] p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/50 text-[11px]">साप्ताहिक XP</span>
            <span className="text-saffron text-[11px] font-600">840 / 1000</span>
          </div>
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-saffron" style={{ width: '84%' }} />
          </div>
        </div>

        {/* User */}
        <div className="px-4 pb-6 border-t border-white/[0.06] pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron/40 to-jp-red/40 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-700">अ</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-600 truncate">अनुराग शर्मा</div>
              <div className="text-white/35 text-[10px] truncate">N5 · 2,340 XP</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/35 hover:text-white/60 hover:bg-white/5 text-xs transition-all">
            <Icon.Logout /><span>लॉग आउट</span>
          </button>
        </div>
      </aside>
    </>
  )
}

function ProgressArc({ pct }: { pct: number }) {
  const r = 52, circ = 2 * Math.PI * r
  const filled = (pct / 100) * circ
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle cx="60" cy="60" r={r} fill="none" stroke="#BC2025" strokeWidth="8"
        strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,153,51,0.5)" strokeWidth="8"
        strokeDasharray={`${filled * 0.15} ${circ}`} strokeDashoffset={circ / 4 - filled + filled * 0.85} strokeLinecap="round" />
    </svg>
  )
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen" style={{ background: '#F4F4F6' }}>
      <Sidebar active={active} onNav={setActive} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between" style={{ background: 'rgba(244,244,246,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-navy/50 hover:text-navy transition-colors"><Icon.Menu /></button>
            <div>
              <p className="text-navy/50 text-xs mb-0.5">सोमवार, 28 सितंबर 2026</p>
              <h1 className="text-navy font-700 text-lg leading-none">नमस्ते, अनुराग 👋</h1>
            </div>
          </div>

          {/* Streak + XP */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-white rounded-full px-4 py-2 border border-[#E2E2E8]">
              <span className="text-navy font-700 text-sm">2,340</span>
              <span className="text-navy/40 text-xs">XP</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-4 py-2" style={{ background: 'linear-gradient(135deg, #FF9933, #FF7F00)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2c0 0-5 5.5-5 10a5 5 0 0 0 10 0C17 7.5 12 2 12 2z" /></svg>
              <span className="text-white font-700 text-sm">12</span>
              <span className="text-white/70 text-xs">दिन</span>
            </div>
          </div>
        </header>

        <div className="px-5 py-5 space-y-5 max-w-[1100px] mx-auto">

          {/* ── Today's lesson — hero card ─────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1B4B' }}>
            <div className="relative flex flex-col lg:flex-row">
              {/* Left content */}
              <div className="flex-1 px-8 pt-8 pb-8 lg:pb-8 relative z-10">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-saffron" style={{ boxShadow: '0 0 6px #FF9933' }} />
                  <span className="text-saffron text-[11px] font-600 tracking-[0.12em] uppercase">आज का पाठ · पाठ 35</span>
                </div>

                <div className="flex items-end gap-5 mb-4">
                  <span className="text-white leading-none" style={{ ...JP, fontSize: '80px', fontWeight: 700 }}>家族</span>
                  <div className="pb-2 space-y-0.5">
                    <div className="text-white/40 text-sm" style={JP}>かぞく</div>
                    <div className="text-white/60 text-sm">kazoku</div>
                  </div>
                </div>

                <div className="text-white font-700 text-3xl mb-3">परिवार</div>
                <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-7">
                  आज सीखें परिवार के सदस्यों को जापानी में — माँ, पिता, भाई, बहन, दादा-दादी।
                </p>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2.5 bg-jp-red hover:bg-jp-red-dark text-white text-sm font-600 px-5 py-2.5 rounded-xl transition-colors">
                    <Icon.Play /><span>पाठ शुरू करें</span>
                  </button>
                  <span className="text-white/25 text-xs">~15 मिनट · 12 शब्द</span>
                </div>
              </div>

              {/* Right — progress ring */}
              <div className="lg:w-[280px] flex flex-col items-center justify-center px-8 py-8 relative"
                style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Huge faded char */}
                <span className="absolute inset-0 flex items-center justify-center text-white/[0.04] select-none pointer-events-none"
                  style={{ ...JP, fontSize: '240px', fontWeight: 700 }}>家</span>

                <div className="relative flex items-center justify-center mb-4">
                  <ProgressArc pct={23} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white font-700 text-2xl leading-none">23%</span>
                    <span className="text-white/40 text-[10px] mt-1">N5 पूरा</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-white font-600 text-sm">34 / 150 पाठ</div>
                  <div className="text-white/35 text-xs mt-0.5">116 पाठ बाकी हैं</div>
                </div>

                {/* Week strip */}
                <div className="flex gap-1.5 mt-6 pt-5 border-t border-white/[0.07] w-full justify-center">
                  {WEEK.map(({ n, done }) => (
                    <div key={n} className="flex flex-col items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-600 transition-all ${done ? 'bg-jp-red text-white' : 'bg-white/6 text-white/25'}`}>
                        {done ? '✓' : n}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-white/25 text-[10px] mt-1.5">इस हफ्ते 4/7 दिन</div>
              </div>
            </div>
          </div>

          {/* ── Quick access — 3 big tiles ─────────────────────────────── */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-navy font-700 text-base">अभ्यास करें</h2>
              <span className="text-navy/35 text-xs">N5 पाठ्यक्रम</span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { char: 'あ',   title: 'हिरागाना',  sub: '32 / 46 वर्ण',    pct: 70, done: 14, clr: '#BC2025', bg: '#fff',   textClr: '#BC2025', lightBg: 'rgba(188,32,37,0.05)' },
                { char: 'ア',  title: 'काताकाना',  sub: '20 / 46 वर्ण',    pct: 43, done: 26, clr: '#FF9933', bg: '#fff',   textClr: '#CC7A00', lightBg: 'rgba(255,153,51,0.06)' },
                { char: '語',  title: 'शब्दावली',   sub: '128 / 500 शब्द',  pct: 26, done: 372, clr: '#138808', bg: '#fff',  textClr: '#138808', lightBg: 'rgba(19,136,8,0.05)' },
              ].map(({ char, title, sub, pct, done, clr, textClr, lightBg }) => (
                <div key={title}
                  className="group relative overflow-hidden rounded-2xl bg-white cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                  {/* Huge bg character */}
                  <span className="absolute right-0 bottom-0 leading-none select-none pointer-events-none translate-x-4 translate-y-4"
                    style={{ ...JP, fontSize: '160px', fontWeight: 700, color: clr, opacity: 0.06 }}>{char}</span>

                  {/* Colored top strip */}
                  <div className="h-1 w-full" style={{ background: clr }} />

                  <div className="relative px-6 pt-5 pb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: lightBg }}>
                      <span className="text-xl font-700 leading-none" style={{ ...JP, color: textClr }}>{char}</span>
                    </div>

                    <div className="text-navy font-700 text-base mb-0.5">{title}</div>
                    <div className="text-navy/40 text-xs mb-4">{sub}</div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-navy/40">प्रगति</span>
                        <span className="font-600" style={{ color: textClr }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: clr }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-navy/35 text-[11px]">{done} बाकी</span>
                      <div className="flex items-center gap-1 text-xs font-600 transition-all group-hover:gap-2" style={{ color: textClr }}>
                        <span>जारी रखें</span><Icon.Arrow />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom row ─────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-5 gap-3">

            {/* Recently practiced chars */}
            <div className="lg:col-span-3 bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <div className="flex items-baseline justify-between mb-5">
                <div>
                  <h3 className="text-navy font-700 text-sm">हाल में अभ्यास</h3>
                  <p className="text-navy/35 text-xs mt-0.5">हिरागाना · स्वर वर्ण</p>
                </div>
                <button className="text-jp-red text-xs font-600 flex items-center gap-1 hover:gap-1.5 transition-all">
                  सब देखें <Icon.Arrow />
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {RECENT_CHARS.map(({ c, r, h, done }) => (
                  <div key={c}
                    className={`relative flex flex-col items-center justify-center gap-1 py-3 rounded-xl transition-all cursor-pointer hover:scale-105 ${done ? 'bg-leaf/8' : 'bg-black/[0.03] hover:bg-black/[0.05]'}`}>
                    <span className={`text-2xl font-700 leading-none ${done ? 'text-navy' : 'text-navy/35'}`} style={JP}>{c}</span>
                    <span className={`text-[10px] font-500 ${done ? 'text-navy/50' : 'text-navy/25'}`}>{r}</span>
                    <span className={`text-[10px] font-600 ${done ? 'text-leaf' : 'text-navy/20'}`}>{h}</span>
                    {done && (
                      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-leaf flex items-center justify-center">
                        <svg width="7" height="5" viewBox="0 0 7 5" fill="none"><path d="M1 2.5l1.5 1.5L6 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats panel */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 flex flex-col justify-between" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <h3 className="text-navy font-700 text-sm mb-5">आपकी प्रगति</h3>

              <div className="space-y-5 flex-1">
                {[
                  { label: 'N5 स्तर', val: '23%', bar: 23, clr: '#BC2025' },
                  { label: 'शब्दावली', val: '128 शब्द', bar: 26, clr: '#138808' },
                  { label: 'व्याकरण', val: '8 / 25', bar: 32, clr: '#FF9933' },
                ].map(({ label, val, bar, clr }) => (
                  <div key={label}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-navy/50 text-xs">{label}</span>
                      <span className="text-navy font-600 text-xs">{val}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bar}%`, background: clr }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Next milestone */}
              <div className="mt-5 pt-5 border-t border-black/[0.05]">
                <div className="text-[11px] text-navy/35 mb-1">अगला लक्ष्य</div>
                <div className="text-navy font-600 text-sm">पाठ 40 पूरा करें</div>
                <div className="text-navy/35 text-xs mt-0.5">6 पाठ बाकी · +200 XP मिलेगा</div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>('login')
  if (view === 'dashboard') return <Dashboard onLogout={() => setView('login')} />
  if (view === 'signup') return <SignupPage onSwitch={() => setView('login')} onLogin={() => setView('dashboard')} />
  return <LoginPage onSwitch={() => setView('signup')} onLogin={() => setView('dashboard')} />
}
