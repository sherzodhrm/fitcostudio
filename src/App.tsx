import { AuthProvider, useAuth } from './components/AuthProvider';
import { useFitnessData } from './hooks/useFitnessData';
import { useState, useEffect } from 'react';
import { LayoutGrid, HeartPulse, Dumbbell, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import FoodLog from './components/FoodLog';
import WeeklyDiet from './components/WeeklyDiet';
import Workout from './components/Workout';
import Coach from './components/Coach';
import AuthScreen from './components/AuthScreen';
import SetupScreen from './components/SetupScreen';
import SplashScreen from './components/SplashScreen';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { UIProvider, useUI } from './components/UIProvider';

const GUEST_PROFILE = {
  displayName: 'Guest User',
  dailyKcalGoal: 2500,
  proteinGoal: 150,
  carbsGoal: 300,
  fatGoal: 80,
  goal: 'recomposition',
  isPremium: false
};

function AppContent() {
  const { user, profile, loading, logOut, isGuest } = useAuth();
  const { t, theme, lang, setTheme, setLang, onSettingsChange } = useUI();
  const fitnessData = useFitnessData();
  const [activeTab, setActiveTab] = useState('log');
  const [showSplash, setShowSplash] = useState(true);

  // Sync profile -> state
  useEffect(() => {
    if (profile) {
      if (profile.theme && profile.theme !== theme) setTheme(profile.theme);
      if (profile.lang && profile.lang !== lang) setLang(profile.lang);
    }
  }, [profile]); // Only run when profile object is loaded/updated

  // Sync state -> profile
  useEffect(() => {
    if (!onSettingsChange || !user) return;
    
    onSettingsChange(async (settings) => {
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            ...settings,
            updatedAt: new Date().toISOString()
          });
        } catch (err) {
          console.error("Failed to sync settings:", err);
        }
      }
    });

    return () => onSettingsChange(() => {});
  }, [user, onSettingsChange]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app-bg">
        <Loader2 className="w-8 h-8 text-app-accent animate-spin" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthScreen />;
  }

  const effectiveProfile = user ? profile : GUEST_PROFILE;

  if (!effectiveProfile && !isGuest) {
    return <SetupScreen />;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-app-bg text-app-text relative overflow-hidden shadow-2xl ring-1 ring-app-border">
      <Header profile={effectiveProfile || GUEST_PROFILE} foodLogs={fitnessData.foodLogs} />

      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'log' && (
            <motion.div
              key="log"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-5"
            >
              <FoodLog fitnessData={fitnessData} />
            </motion.div>
          )}
          {activeTab === 'diet' && (
            <motion.div
              key="diet"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-5"
            >
              <WeeklyDiet fitnessData={fitnessData} />
            </motion.div>
          )}
          {activeTab === 'workout' && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5"
            >
              <Workout fitnessData={fitnessData} />
            </motion.div>
          )}
          {activeTab === 'coach' && (
            <motion.div
              key="coach"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5"
            >
              <Coach fitnessData={fitnessData} logOut={logOut} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="absolute bottom-0 left-0 right-0 h-20 bg-app-bg/80 backdrop-blur-xl border-t border-app-border flex items-center justify-around px-2 z-50 safe-bottom">
        {[
          { id: 'log', icon: LayoutGrid, label: t.log },
          { id: 'diet', icon: HeartPulse, label: t.diet },
          { id: 'workout', icon: Dumbbell, label: t.workout },
          { id: 'coach', icon: Star, label: t.coach },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === tab.id ? 'text-app-accent translate-y-[-2px]' : 'text-app-muted'
            }`}
          >
            <tab.icon className="w-5 h-5" strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-[0.1em]">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute top-0 w-8 h-[2px] bg-app-accent rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
