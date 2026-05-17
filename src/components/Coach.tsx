import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, FlaskConical, Droplets, Moon, Zap, Pill, LogOut, ChevronRight, MessageSquare, Send, Sparkles, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { useUI } from './UIProvider';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const SUPPS = [
  { id: 'creatine', name: 'Creatine Monohydrate', detail: '5g · Any time with water', icon: Zap },
  { id: 'd3', name: 'Vitamin D3', detail: '2,000-4,000 IU · With meal', icon: FlaskConical },
  { id: 'mag', name: 'Magnesium Glycinate', detail: '300-400mg · Before bed', icon: Moon },
  { id: 'omega', name: 'Omega-3', detail: '2g · With lunch/dinner', icon: Droplets },
  { id: 'protein', name: 'ISO-XP Protein', detail: '1 scoop · Post-workout', icon: Pill },
];

export default function Coach({ fitnessData, logOut }: { fitnessData: any, logOut: () => void }) {
  const { user, profile } = useAuth();
  const { t } = useUI();
  const { suppLogs, toggleSupp } = fitnessData;
  const [activeTab, setActiveTab] = useState<'stack' | 'chat' | 'guides'>('stack');
  const [activeGuide, setActiveGuide] = useState('blood');
  
  // CHAT STATE
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persistence logic for history
  useEffect(() => {
    if (!user || user.isAnonymous) return;

    const q = query(
      collection(db, 'users', user.uid, 'coachHistory'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        role: doc.data().role as 'user' | 'model',
        parts: [{ text: doc.data().text }]
      }));
      setHistory(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/coachHistory`);
    });

    return () => unsubscribe();
  }, [user]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (activeTab === 'chat') scrollToBottom(); }, [history, activeTab]);

  const sendAction = async () => {
    if (!message.trim() || sending) return;
    const userMsgText = message;
    setMessage('');
    
    // Optimistic update for local UI
    const tempHistory = [...history, { role: 'user', parts: [{ text: userMsgText }] }];
    setHistory(tempHistory);
    setSending(true);

    try {
      // Save user message to Firestore
      if (user && !user.isAnonymous) {
        await addDoc(collection(db, 'users', user.uid, 'coachHistory'), {
          role: 'user',
          text: userMsgText,
          timestamp: serverTimestamp()
        });
      }

      const res = await fetch('/api/chat-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsgText, history: tempHistory, profile })
      });
      const data = await res.json();
      const botMsgText = data.response;

      // Save bot response to Firestore
      if (user && !user.isAnonymous) {
        await addDoc(collection(db, 'users', user.uid, 'coachHistory'), {
          role: 'model',
          text: botMsgText,
          timestamp: serverTimestamp()
        });
      } else {
        // Fallback for guests who don't have Firestore history
        setHistory(prev => [...prev, { role: 'model', parts: [{ text: botMsgText }] }]);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {/* SECTION TABS */}
      <div className="flex bg-[#161616] p-1 rounded-2xl border border-[#2a2a2a]">
        {[
          { id: 'stack', icon: Pill, label: 'Stack' },
          { id: 'chat', icon: MessageSquare, label: 'Coach AI' },
          { id: 'guides', icon: Sparkles, label: 'Guides' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeTab === t.id ? 'bg-[#c8f060] text-black' : 'text-[#555] hover:text-[#777]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stack' && (
          <motion.section
            key="stack"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-4 ml-1">Daily Supplement Stack</h3>
            <div className="grid grid-cols-1 gap-2">
              {SUPPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSupp(s.id)}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                    suppLogs[s.id]
                      ? 'bg-[#131f0a] border-[#2a4010] text-[#8db860]'
                      : 'bg-[#161616] border-[#2a2a2a] text-[#777]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${suppLogs[s.id] ? 'bg-[#c8f0601a]' : 'bg-[#1e1e1e]'}`}>
                    <s.icon className={`w-5 h-5 ${suppLogs[s.id] ? 'text-[#c8f060]' : 'text-[#333]'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{s.name}</p>
                    <p className="text-[10px] opacity-60 font-mono tracking-tight">{s.detail}</p>
                  </div>
                  {suppLogs[s.id] && <CheckCircle2 className="w-5 h-5 text-[#c8f060]" />}
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-[55vh] bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden"
          >
            <div className="bg-[#1e1e1e] p-3 border-b border-[#2a2a2a] flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-[#c8f060]" />
                 <span className="text-[11px] font-bold uppercase tracking-widest text-[#f0ede8]">Coach AI</span>
               </div>
               <div className="w-2 h-2 bg-[#c8f060] rounded-full animate-pulse" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {history.length === 0 && (
                <div className="text-center py-10 px-4">
                   <div className="w-12 h-12 bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-6 h-6 text-[#333]" />
                   </div>
                   <p className="text-sm font-bold text-[#555] mb-2 text-balance">"How do I optimize my bench press form?"</p>
                   <p className="text-xs text-[#333]">Ask about your macros, training splits, or physiological recovery protocols.</p>
                </div>
              )}
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#c8f060] text-black font-medium' 
                      : 'bg-[#1e1e1e] text-[#f0ede8] border border-[#2a2a2a]'
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[#1e1e1e] p-3 rounded-2xl border border-[#2a2a2a]">
                    <Loader2 className="w-4 h-4 text-[#c8f060] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 bg-[#0e0e0e] border-t border-[#2a2a2a]">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendAction()}
                  placeholder="Ask Fitco Coach..."
                  className="flex-1 bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#c8f060]"
                />
                <button
                  disabled={sending || !message.trim()}
                  onClick={sendAction}
                  className="bg-[#c8f060] text-black p-2 rounded-xl disabled:opacity-50 transition-all active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'guides' && (
          <motion.div
            key="guides"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {['blood', 'energy', 'rules'].map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGuide(g)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    activeGuide === g ? 'bg-[#c8f060] text-black border-[#c8f060]' : 'bg-[#1e1e1e] text-[#555] border-[#2a2a2a]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 shadow-2xl">
              {activeGuide === 'blood' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-1 bg-[#ff5a4a] h-12 rounded-full shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#f0ede8]">Liver Recovery Check</p>
                      <p className="text-xs text-[#777] mt-1 leading-relaxed">Book ALT/AST tests this week to confirm liver health after Dec 2023 Hepatitis A.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-[#1e1e1e] rounded-xl space-y-2">
                    <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest font-bold">Priority Panels</p>
                    <ul className="text-xs space-y-1.5 text-[#999]">
                      <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#c8f060]" /> Vitamin D (25-OH)</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#c8f060]" /> Ferritin + Iron</li>
                      <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#c8f060]" /> Lipid Panel (Fasted)</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeGuide === 'energy' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#1e1e1e] rounded-xl border-l-2 border-[#4a9eff]">
                    <p className="text-sm font-bold mb-1">Pre-Gym Strategy</p>
                    <p className="text-xs text-[#777]">Finish CIPD study by 6pm. Eat your banana snack. Arrive at gym by 7:30pm hydrated.</p>
                  </div>
                  <div className="p-4 bg-[#1e1e1e] rounded-xl border-l-2 border-[#f5a623]">
                    <p className="text-sm font-bold mb-1">Sleep Protocol</p>
                    <p className="text-xs text-[#777]">Phone away 30 min before bed. 400mg Magnesium. 7-8 hours essential for recovery.</p>
                  </div>
                </div>
              )}

              {activeGuide === 'rules' && (
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-[#1e1e1e] p-3 rounded-xl">
                     <p className="text-[9px] font-mono text-[#c8f060] uppercase mb-1 font-bold tracking-widest">Eat Freely</p>
                     <p className="text-[11px] text-[#777]">Eggs, chicken, buckwheat, cucumber, water.</p>
                   </div>
                   <div className="bg-[#1e1e1e] p-3 rounded-xl text-center">
                     <p className="text-[9px] font-mono text-[#ff5a4a] uppercase mb-1 font-bold tracking-widest">Avoid</p>
                     <p className="text-[11px] text-[#777]">Sugar drinks, fried samsa, daily plov.</p>
                   </div>
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <div className="pt-4">
        <p className="text-center text-[9px] text-[#222] leading-relaxed uppercase tracking-widest font-bold">
          Fitco Studio v3.3 · Built for Performance
        </p>
      </div>
    </div>
  );
}
