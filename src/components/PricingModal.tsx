import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Zap, Star, ShieldCheck } from 'lucide-react';
import { useUI } from './UIProvider';
import { useAuth } from './AuthProvider';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { t, lang } = useUI();

  const plans = [
    {
      id: 'monthly',
      name: lang === 'ru' ? 'Месячный' : (lang === 'uz' ? 'Oylik' : 'Monthly'),
      price: '$9.99',
      period: lang === 'ru' ? '/мес' : (lang === 'uz' ? '/oy' : '/mo'),
      features: ['AI Fitness Coach', 'Smart Meal Scanning', 'Custom Workouts'],
      accent: 'bg-app-card'
    },
    {
      id: 'yearly',
      name: lang === 'ru' ? 'Годовой' : (lang === 'uz' ? 'Yillik' : 'Yearly'),
      price: '$59.99',
      period: lang === 'ru' ? '/год' : (lang === 'uz' ? '/yil' : '/yr'),
      features: ['All Features', 'Priority AI Support', 'Offline Access', '50% Savings'],
      accent: 'bg-app-accent text-black',
      popular: true
    },
    {
      id: 'lifetime',
      name: lang === 'ru' ? 'Пожизненный' : (lang === 'uz' ? 'Umrbod' : 'Lifetime'),
      price: '$149.99',
      period: '',
      features: ['Pay Once, Own Forever', 'All Future Updates', 'Elite Badge'],
      accent: 'bg-app-card'
    }
  ];

  const [loading, setLoading] = React.useState(false);
  const { user, refreshProfile } = useAuth();

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isPremium: true,
        updatedAt: new Date().toISOString()
      });
      await refreshProfile();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative w-full max-w-sm bg-app-bg border border-app-border rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 overflow-hidden"
          >
            <div className="absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-app-accent opacity-[0.05] blur-[100px] rounded-full" />
            
            <div className="flex justify-between items-center mb-8 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black border-2 border-app-accent rounded-full flex items-center justify-center shadow-lg shadow-app-accent/20">
                  <Zap className="text-app-accent w-6 h-6 fill-current" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter">PREMIUM</h2>
                  <p className="text-app-muted text-[10px] font-bold uppercase tracking-widest">{t.tagline}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 bg-app-card border border-app-border rounded-full text-app-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 relative">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  className={`w-full p-5 rounded-3xl border border-app-border text-left relative overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] ${plan.accent}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-black text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
                      Best Value
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black uppercase tracking-widest opacity-60">{plan.name}</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-bold">{plan.price}</span>
                      <span className="text-[10px] opacity-60">{plan.period}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 opacity-80">
                        <Check className="w-3 h-3" />
                        <span className="text-[10px] font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-3 relative">
              <p className="text-[10px] font-black text-app-muted uppercase tracking-widest text-center mb-4">Select Payment Method</p>
              <div className="grid grid-cols-3 gap-3">
                <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-app-card border-2 border-app-accent shadow-lg">
                  <div className="w-8 h-8 flex items-center justify-center font-black text-app-accent mb-1">Stripe</div>
                  <span className="text-[8px] font-bold opacity-60">Global</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-app-card border border-app-border hover:border-app-accent transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center font-black text-[#00BAFC] mb-1 italic">Payme</div>
                  <span className="text-[8px] font-bold opacity-60">UZB</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-app-card border border-app-border hover:border-app-accent transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center font-black text-[#0073FF] mb-1 uppercase tracking-tighter">Click</div>
                  <span className="text-[8px] font-bold opacity-60">UZB</span>
                </button>
              </div>
            </div>

            <button 
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full h-16 mt-6 bg-app-accent text-black font-black rounded-2xl shadow-xl shadow-app-accent/20 flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  Upgrade Now
                </>
              )}
            </button>
            
            <p className="text-center text-[9px] text-app-muted mt-4 font-medium opacity-60">
              Secured by Stripe, Payme, and Click. Auto-renews unless cancelled.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
