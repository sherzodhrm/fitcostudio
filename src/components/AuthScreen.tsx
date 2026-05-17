import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useUI } from './UIProvider';
import { LogIn, Mail, Lock, User as UserIcon, HeartPulse, Chrome, Loader2, ArrowRight, Globe, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LegalModal from './LegalModal';

export default function AuthScreen() {
  const { signInWithGoogle, signInEmail, signUpEmail, setIsGuest } = useAuth();
  const { t, lang, setLang } = useUI();
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (fn: () => Promise<void>) => {
    if (!agreed) {
      setShowConsentError(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fn();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-app-bg text-app-text p-6 relative overflow-hidden transition-colors duration-500">
      {/* LANGUAGE SELECTOR */}
      <div className="absolute top-6 left-6 z-50 flex gap-2">
        {(['en', 'ru', 'uz'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`w-8 h-8 rounded-lg text-[10px] font-bold uppercase transition-all ${lang === l ? 'bg-app-accent text-black' : 'bg-app-card text-app-muted'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-app-accent opacity-[0.05] blur-[100px] rounded-full" />
      
      <motion.div 
        layout
        className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full z-10"
      >
        <AnimatePresence mode="wait">
          {mode === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center"
            >
              <div className="mb-10 flex justify-center">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 5 }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className="w-24 h-24 bg-black border-4 border-app-accent rounded-full flex items-center justify-center shadow-2xl shadow-app-accent/30"
                >
                  <Zap className="text-app-accent w-12 h-12 fill-current" />
                </motion.div>
              </div>
              <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase">FITCO<span className="text-app-accent"> </span>STUDIO</h1>
              <p className="text-app-muted mb-12 text-sm leading-relaxed max-w-[260px] mx-auto font-medium">
                {t.slogan}
              </p>

              <div className="space-y-3">
                <div className="mb-6 flex flex-col items-center">
                  <div 
                    onClick={() => {
                      setAgreed(!agreed);
                      setShowConsentError(false);
                    }}
                    className={`cursor-pointer flex items-start gap-3 p-3 rounded-2xl border transition-all text-left group ${agreed ? 'bg-app-accent/10 border-app-accent' : (showConsentError ? 'border-red-500 bg-red-500/10' : 'border-app-border hover:border-app-muted')}`}
                  >
                    <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-app-accent border-app-accent' : 'border-app-muted'}`}>
                      {agreed && <CheckCircle2 className="w-3 h-3 text-black fill-current" />}
                    </div>
                    <div className="text-[10px] font-bold leading-tight text-app-muted">
                      {t.agree_to}{' '}
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsLegalOpen(true);
                        }}
                        className="cursor-pointer text-app-accent underline decoration-app-accent/30 underline-offset-2 hover:text-app-accent/80"
                      >
                        {t.terms_privacy}
                      </span>
                    </div>
                  </div>
                  {showConsentError && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] text-red-500 font-black mt-2 uppercase tracking-widest">
                      {t.accept_terms}
                    </motion.p>
                  )}
                </div>

                <button
                  onClick={() => handleAction(signInWithGoogle)}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-app-text text-app-bg font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Chrome className="w-5 h-5" />
                  {t.google_sign_in}
                </button>
                <button
                  onClick={() => setMode('login')}
                  className="w-full h-14 flex items-center justify-center gap-3 bg-app-card border border-app-border text-app-text font-bold rounded-2xl hover:opacity-80 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  {t.email_sign_in}
                </button>
                <button
                  onClick={() => handleAction(() => { setIsGuest(true); return Promise.resolve(); })}
                  className="w-full h-14 flex items-center justify-center gap-3 text-app-accent font-bold rounded-2xl hover:underline transition-all text-sm uppercase tracking-widest"
                >
                  {t.guest_mode}
                </button>
              </div>
              
              <p className="mt-8 text-[11px] text-app-muted uppercase tracking-widest font-black opacity-30">
                {t.tagline}
              </p>
            </motion.div>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setMode('welcome')} className="text-app-muted hover:text-app-accent">
                   <ArrowRight className="w-6 h-6 rotate-180" />
                </button>
                <h2 className="text-3xl font-bold">{mode === 'login' ? (lang === 'ru' ? 'С возвращением' : (lang === 'uz' ? 'Xush kelibsiz' : 'Welcome Back')) : (lang === 'ru' ? 'Регистрация' : (lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Join Now'))}</h2>
              </div>

              {error && (
                <div className="bg-[#ff5a4a1a] border border-[#ff5a4a33] text-[#ff5a4a] p-3 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {mode === 'signup' && (
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-4 w-5 h-5 text-app-muted" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-app-card border border-app-border rounded-2xl pl-12 pr-4 h-14 focus:outline-none focus:border-app-accent transition-colors text-app-text"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-app-muted" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-app-card border border-app-border rounded-2xl pl-12 pr-4 h-14 focus:outline-none focus:border-app-accent transition-colors text-app-text"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-app-muted" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-app-card border border-app-border rounded-2xl pl-12 pr-4 h-14 focus:outline-none focus:border-app-accent transition-colors text-app-text"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center">
                 <div 
                  onClick={() => {
                    setAgreed(!agreed);
                    setShowConsentError(false);
                  }}
                  className={`cursor-pointer flex items-start gap-3 p-3 rounded-2xl border transition-all text-left w-full ${agreed ? 'bg-app-accent/10 border-app-accent' : (showConsentError ? 'border-red-500 bg-red-500/10' : 'border-app-border hover:border-app-muted')}`}
                >
                  <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-app-accent border-app-accent' : 'border-app-muted'}`}>
                    {agreed && <CheckCircle2 className="w-3 h-3 text-black fill-current" />}
                  </div>
                  <span className="text-[10px] font-bold text-app-muted">
                    {t.agree_to}{' '}
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLegalOpen(true);
                      }}
                      className="cursor-pointer text-app-accent underline decoration-app-accent/30 underline-offset-2 hover:text-app-accent/80"
                    >
                      {t.terms_privacy}
                    </span>
                  </span>
                </div>
              </div>

              <button
                disabled={loading}
                onClick={() => handleAction(() => mode === 'login' ? signInEmail(email, password) : signUpEmail(email, password, name))}
                className="w-full h-14 flex items-center justify-center bg-app-accent text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (mode === 'login' ? (lang === 'ru' ? 'Войти' : (lang === 'uz' ? 'Kirish' : 'Sign In')) : (lang === 'ru' ? 'Создать аккаунт' : (lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Create Account')))}
              </button>

              <div className="text-center">
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-xs text-app-muted hover:text-app-accent font-bold uppercase tracking-widest"
                >
                  {mode === 'login' ? (lang === 'ru' ? 'Нет аккаунта? Регистрация' : (lang === 'uz' ? 'Hisobingiz yo\'qmi? Ro\'yxatdan o\'ting' : "Don't have an account? Sign Up")) : (lang === 'ru' ? 'Уже есть аккаунт? Войти' : (lang === 'uz' ? 'Hisobingiz bormi? Kirish' : 'Already have an account? Log In'))}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
    </div>
  );
}
