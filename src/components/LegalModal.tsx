import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';
import { useUI } from './UIProvider';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalModal({ isOpen, onClose }: LegalModalProps) {
  const { t } = useUI();

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
            className="bg-app-bg border border-app-border w-full max-w-lg rounded-[2.5rem] overflow-hidden relative shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-app-border flex justify-between items-center bg-app-card/30">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-app-accent w-6 h-6" />
                <h2 className="text-xl font-black tracking-tighter uppercase">{t.terms_privacy}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-app-card rounded-full transition-colors">
                <X className="w-5 h-5 text-app-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-app-accent">
                  <FileText className="w-4 h-4" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Terms of Service</h3>
                </div>
                <div className="text-[11px] leading-relaxed text-app-muted space-y-3 font-medium">
                  <p>By using FITCO STUDIO, you agree to these fundamental principles of our service:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>The app provides AI-generated fitness and nutritional guidance for educational purposes only.</li>
                    <li>Consult a medical professional before starting any high-intensity exercise or strict diet program.</li>
                    <li>You are responsible for the accuracy of measurements (weight, height, age) provided during setup.</li>
                    <li>We reserve the right to modify features or subscription tiers as the platform evolves.</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-app-accent">
                  <Lock className="w-4 h-4" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Privacy Policy</h3>
                </div>
                <div className="text-[11px] leading-relaxed text-app-muted space-y-3 font-medium">
                  <p>Your privacy and data security are our highest priorities:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li><strong>Data Collection:</strong> We collect physical metrics, food logs, and chat history to provide personalized AI coaching.</li>
                    <li><strong>Encryption:</strong> All data is stored in secure Firestore databases with strict authenticated-only access rules.</li>
                    <li><strong>No External Sharing:</strong> We never sell your personal health data to third-party advertisers or insurance companies.</li>
                    <li><strong>AI Processing:</strong> Your data is processed by Gemini AI models to generate insights, but identifyable information is minimized.</li>
                    <li><strong>Data Portability:</strong> You can request your data or account deletion at any time through our support channels.</li>
                  </ul>
                </div>
              </section>

              <section className="p-4 bg-app-accent/5 border border-app-accent/10 rounded-2xl">
                <p className="text-[10px] text-app-accent font-black uppercase tracking-tighter mb-1">Medical Disclaimer</p>
                <p className="text-[10px] text-app-muted font-bold leading-tight">
                  FITCO STUDIO is not a medical device. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </section>
            </div>

            <div className="p-6 border-t border-app-border bg-app-card/30">
              <button
                onClick={onClose}
                className="w-full h-12 bg-app-accent text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[10px]"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
