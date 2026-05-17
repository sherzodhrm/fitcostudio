import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Ruler, Weight, UserCircle, Shield, Award } from 'lucide-react';
import { useUI } from './UIProvider';
import { useAuth } from './AuthProvider';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { t } = useUI();
  const { profile, user, logOut } = useAuth();

  if (!profile && isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-app-bg border border-app-border w-full max-w-sm rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-app-border flex justify-between items-center bg-app-card/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-app-accent flex items-center justify-center text-black">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-tighter uppercase leading-none">{profile?.displayName || 'Elite Member'}</h2>
                  <p className="text-[9px] text-app-muted font-bold mt-1 uppercase tracking-widest">{user?.email}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-app-card rounded-full transition-colors">
                <X className="w-5 h-5 text-app-muted" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-app-card border border-app-border rounded-2xl">
                  <div className="flex items-center gap-2 mb-2 text-app-accent">
                    <Weight className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Weight</span>
                  </div>
                  <p className="text-xl font-black tracking-tighter">{profile?.weight} <span className="text-xs opacity-40">kg</span></p>
                </div>
                <div className="p-4 bg-app-card border border-app-border rounded-2xl">
                  <div className="flex items-center gap-2 mb-2 text-app-accent">
                    <Ruler className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Height</span>
                  </div>
                  <p className="text-xl font-black tracking-tighter">{profile?.height} <span className="text-xs opacity-40">cm</span></p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-app-card/50 rounded-xl border border-app-border/50">
                   <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-app-accent" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Account Status</span>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-tighter text-app-accent">
                     {profile?.isPremium ? 'Premium' : 'Standard'}
                   </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-app-card/50 rounded-xl border border-app-border/50">
                   <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-app-accent" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Goal</span>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-tighter">
                     {profile?.goal?.toUpperCase() || 'MAINTAIN'}
                   </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  logOut();
                }}
                className="w-full h-14 bg-[#ff5a4a]/10 border border-[#ff5a4a]/20 text-[#ff5a4a] font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-[#ff5a4a] hover:text-white transition-all mt-4"
              >
                Log Out
              </button>
            </div>

            <div className="p-4 text-center border-t border-app-border bg-app-card/20">
              <p className="text-[9px] text-app-muted font-bold uppercase tracking-widest opacity-40">FITCO STUDIO v3.3 · Secure Session</p>
              <p className="text-[9px] text-app-muted font-bold uppercase tracking-widest opacity-40 mt-1">ID: {user?.uid.slice(0, 8)}...</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
