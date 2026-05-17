import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Target, User, Activity, ArrowRight, Loader2, Scale, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useUI } from './UIProvider';

export default function SetupScreen() {
  const { user, refreshProfile, setIsGuest } = useAuth();
  const { t, lang, theme } = useUI();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    weight: 80,
    height: 180,
    age: 28,
    gender: 'male',
    activity: 'moderate', 
    goal: 'recomposition'
  });

  const calculateGoals = () => {
    let bmr = (10 * formData.weight) + (6.25 * formData.height) - (5 * formData.age);
    bmr = formData.gender === 'male' ? bmr + 5 : bmr - 161;
    const activityMult: any = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = bmr * activityMult[formData.activity];
    let kcal = tdee;
    if (formData.goal === 'loss') kcal -= 500;
    if (formData.goal === 'gain') kcal += 300;
    const protein = formData.weight * 2;
    const fat = (kcal * 0.25) / 9;
    const carbs = (kcal - (protein * 4) - (fat * 9)) / 4;
    return { dailyKcalGoal: Math.round(kcal), proteinGoal: Math.round(protein), carbsGoal: Math.round(carbs), fatGoal: Math.round(fat) };
  };

  const handleFinish = async () => {
    setLoading(true);
    const goals = calculateGoals();
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          ...formData,
          ...goals,
          lang,
          theme,
          isPremium: false,
          updatedAt: new Date().toISOString()
        });
        await refreshProfile();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setIsGuest(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text p-6 flex flex-col justify-center max-w-sm mx-auto transition-colors duration-500">
      <div className="mb-10">
        <div className="flex gap-1 mb-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-app-accent' : 'bg-app-card'}`} />
          ))}
        </div>
        <p className="text-[10px] font-mono font-black text-app-muted uppercase tracking-widest">Step {step} of 3</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter">{t.setup_title}</h2>
            <div className="space-y-4">
              <MetricInput label={t.weight + " (kg)"} icon={Scale} value={formData.weight} onChange={(v) => setFormData(p => ({ ...p, weight: v }))} min={30} max={250} />
              <MetricInput label={t.height + " (cm)"} icon={Ruler} value={formData.height} onChange={(v) => setFormData(p => ({ ...p, height: v }))} min={100} max={250} />
              <MetricInput label={t.age} icon={User} value={formData.age} onChange={(v) => setFormData(p => ({ ...p, age: v }))} min={12} max={100} />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter">{t.activity}</h2>
            <div className="space-y-3">
              {[
                { id: 'sedentary', l: t.sedentary, d: 'Office worker, little exercise' },
                { id: 'light', l: t.light, d: '1-3 days/week exercise' },
                { id: 'moderate', l: t.moderate, d: 'Exercise 4-5 days/week' },
                { id: 'active', l: t.active, d: 'Hard exercise 6-7 days/week' },
                { id: 'very_active', l: t.very_active, d: 'Professional athlete or physical job' }
              ].map(a => (
                <button
                  key={a.id}
                  onClick={() => setFormData(p => ({ ...p, activity: a.id }))}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${formData.activity === a.id ? 'bg-app-accent border-app-accent text-black' : 'bg-app-card border-app-border text-app-muted'}`}
                >
                  <p className="font-black text-sm uppercase tracking-tighter">{a.l}</p>
                  <p className="text-[10px] font-bold opacity-70 mt-0.5">{a.d}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter">{t.goal}</h2>
            <div className="space-y-3">
              {[
                { id: 'loss', l: t.loss, d: 'Prioritize calorie deficit' },
                { id: 'recomposition', l: t.recomposition, d: 'Lose fat, gain muscle' },
                { id: 'gain', l: t.gain, d: 'Prioritize strength and mass' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setFormData(p => ({ ...p, goal: g.id }))}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${formData.goal === g.id ? 'bg-app-accent border-app-accent text-black' : 'bg-app-card border-app-border text-app-muted'}`}
                >
                  <p className="font-black text-sm uppercase tracking-tighter">{g.l}</p>
                  <p className="text-[10px] font-bold opacity-70 mt-0.5">{g.d}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex gap-4">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 h-14 bg-app-card text-app-text font-black rounded-2xl uppercase tracking-widest text-[10px]">Back</button>
        )}
        <button
          onClick={() => step < 3 ? setStep(step + 1) : handleFinish()}
          disabled={loading}
          className="flex-[2] h-14 bg-app-accent text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-[10px]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (step === 3 ? t.calculate : 'Next Step')}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function MetricInput({ label, value, onChange, min, max, icon: Icon }: any) {
  return (
    <div className="bg-app-card border border-app-border p-5 rounded-[2rem]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-app-muted">
          <Icon className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        </div>
        <span className="text-xl font-black text-app-accent font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1 bg-app-border rounded-lg appearance-none cursor-pointer accent-app-accent"
      />
    </div>
  );
}
