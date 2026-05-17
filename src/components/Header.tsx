import { motion } from 'motion/react';
import { useUI } from './UIProvider';
import { Sun, Moon, Zap, Globe, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import PricingModal from './PricingModal';
import ProfileModal from './ProfileModal';
import { useAuth } from './AuthProvider';

interface HeaderProps {
  profile: any;
  foodLogs: any[];
}

export default function Header({ profile, foodLogs }: HeaderProps) {
  const { theme, setTheme, lang, setLang, t } = useUI();
  const { logOut, isGuest, user } = useAuth();
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const cycleLang = () => {
    const langs: ('en' | 'ru' | 'uz')[] = ['en', 'ru', 'uz'];
    const next = langs[(langs.indexOf(lang) + 1) % langs.length];
    setLang(next);
  };

  const totals = foodLogs.reduce((acc, log) => ({
    kcal: acc.kcal + log.kcal,
    p: acc.p + log.protein,
    c: acc.c + log.carbs,
    f: acc.f + log.fat,
  }), { kcal: 0, p: 0, c: 0, f: 0 });

  const progress = Math.min(totals.kcal / (profile?.dailyKcalGoal || 2050), 1);
  const remaining = Math.max(0, (profile?.dailyKcalGoal || 2050) - totals.kcal);

  const dashArray = 213.6;
  const dashOffset = dashArray * (1 - progress);

  return (
    <header className="p-5 border-b border-app-border bg-app-bg shrink-0 transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-xs text-app-accent tracking-tighter font-black uppercase">FITCO STUDIO</h2>
          {profile?.isPremium && (
            <span className="bg-app-accent text-black text-[8px] font-black px-1.5 py-0.5 rounded italic">PRO</span>
          )}
          {!profile?.isPremium && (
            <button onClick={() => setIsPricingOpen(true)} className="p-1 hover:text-app-accent transition-colors">
               <Zap className="w-3 h-3 fill-current" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isGuest ? (
            <button 
              onClick={logOut}
              className="px-3 py-1 rounded-full bg-app-accent/10 border border-app-accent/30 flex items-center justify-center text-app-accent shadow-sm hover:bg-app-accent/20 transition-colors gap-1.5"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sign In</span>
            </button>
          ) : (
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="w-8 h-8 rounded-full bg-app-card border border-app-border flex items-center justify-center text-app-accent shadow-sm hover:border-app-accent transition-colors"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={cycleLang}
            className="w-8 h-8 rounded-full bg-app-card border border-app-border flex items-center justify-center text-app-muted shadow-sm hover:text-app-accent transition-colors"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'creamy' : 'dark')}
            className="w-8 h-8 rounded-full bg-app-card border border-app-border flex items-center justify-center text-app-accent shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <span className="bg-app-card border border-app-border px-3 py-1 rounded-full text-[10px] font-mono text-app-muted">
            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 82 82">
            <circle cx="41" cy="41" r="34" className="fill-none stroke-app-card stroke-[7]" />
            <motion.circle
              cx="41" cy="41" r="34"
              className={`fill-none stroke-[7] stroke-linecap-round ${totals.kcal > (profile?.dailyKcalGoal || 2050) ? 'stroke-[#ff5a4a]' : 'stroke-app-accent'}`}
              style={{ strokeDasharray: dashArray }}
              initial={{ strokeDashoffset: dashArray }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
            <span className="font-mono text-lg font-black tracking-tighter">{Math.round(totals.kcal)}</span>
            <span className="text-[9px] text-app-muted mt-1 uppercase tracking-tighter font-black">{t.kcal}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <MacroBar label={(t.protein || 'P')[0]} current={totals.p} goal={profile?.proteinGoal || 145} color="text-[#4a9eff]" barColor="bg-[#4a9eff]" />
          <MacroBar label={(t.carbs || 'C')[0]} current={totals.c} goal={profile?.carbsGoal || 235} color="text-app-accent" barColor="bg-app-accent" />
          <MacroBar label={(t.fat || 'F')[0]} current={totals.f} goal={profile?.fatGoal || 56} color="text-[#f5a623]" barColor="bg-[#f5a623]" />
          <p className="text-[9px] text-app-muted pt-1 font-mono font-bold uppercase tracking-widest">{Math.round(remaining)} {t.remaining}</p>
        </div>
      </div>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </header>
  );
}

function MacroBar({ label, current, goal, color, barColor }: any) {
  const { t } = useUI();
  const progress = Math.min(current / goal, 1);
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[10px] font-black w-3 text-center ${color}`}>{label}</span>
      <div className="flex-1 h-1 bg-app-card rounded-full overflow-hidden border border-app-border/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          className={`h-full ${barColor} rounded-full`}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <span className="font-mono text-[9px] text-app-muted w-12 text-right tracking-tighter font-bold">
        {Math.round(current)}/{goal}g
      </span>
    </div>
  );
}
