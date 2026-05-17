import React, { useState, useRef } from 'react';
import { Camera, Upload, Plus, Trash2, Loader2, Info, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FoodLog({ fitnessData }: { fitnessData: any }) {
  const { foodLogs, addFood, removeFood } = fitnessData;
  const [analyzing, setAnalyzing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!prompt && !preview) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const body: any = { text: prompt };
      if (preview) {
        body.image = {
          data: preview.split(',')[1],
          mimeType: preview.split(';')[0].split(':')[1]
        };
      }

      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const onAdd = async () => {
    if (!result) return;
    await addFood(result);
    setResult(null);
    setPrompt('');
    setPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* TIP / QUOTE */}
      <div className="bg-[#131f0a] border border-[#2a4010] rounded-xl p-4 text-[#8db860] text-xs leading-relaxed">
        <span className="block font-mono text-[10px] text-[#c8f060] uppercase tracking-wider mb-1 font-bold">today</span>
        Great things are done by a series of small things brought together. Focus on your macros today.
      </div>

      {/* INPUT ZONE */}
      <div className="space-y-3">
        {!preview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#161616] border-2 border-dashed border-[#2a2a2a] rounded-xl py-8 flex flex-col items-center gap-2 hover:border-[#c8f060] transition-colors group"
          >
            <div className="bg-[#1e1e1e] p-3 rounded-full group-hover:bg-[#c8f0601a]">
              <Camera className="w-6 h-6 text-[#555] group-hover:text-[#c8f060]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Snap or upload food photo</p>
              <p className="text-[10px] text-[#555]">AI estimates nutrients instantly</p>
            </div>
          </button>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-[#2a2a2a]">
            <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-black/80 transition-colors"
            >
              <Plus className="w-4 h-4 rotate-45" />
            </button>
          </div>
        )}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your meal..."
            className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c8f060] transition-colors"
          />
          <button
            disabled={analyzing || (!prompt && !preview)}
            onClick={analyze}
            className="bg-[#c8f060] text-black px-4 rounded-xl disabled:opacity-50 disabled:grayscale transition-all"
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ANALYSIS RESULT */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#161616] border border-[#2a4010] rounded-xl p-4 overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-lg font-bold text-[#c8f060] leading-none">{result.kcal} kcal</h4>
                <p className="text-[10px] text-[#999] uppercase mt-1 font-mono tracking-wider">Estimated total</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{result.name}</p>
                <p className="text-[10px] text-[#555]">{result.portion}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <MacroCard label="Protein" val={result.protein} color="text-[#4a9eff]" />
              <MacroCard label="Carbs" val={result.carbs} color="text-[#c8f060]" />
              <MacroCard label="Fat" val={result.fat} color="text-[#f5a623]" />
            </div>

            {result.notes && (
              <p className="text-[11px] text-[#777] mb-4 flex gap-2">
                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                {result.notes}
              </p>
            )}

            <button
              onClick={onAdd}
              className="w-full bg-[#c8f060] text-black py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#c8f06022]"
            >
              Add to today's log
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOG LIST */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-3">Today's Log</h3>
        <div className="space-y-2">
          {foodLogs.length === 0 ? (
            <div className="text-center py-12 border border-[#1a1a1a] rounded-xl space-y-2">
              <LayoutGrid className="w-8 h-8 text-[#222] mx-auto" />
              <p className="text-[#333] text-sm font-mono">No entries logged today</p>
            </div>
          ) : (
            foodLogs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-[#161616] border border-[#2a2a2a] rounded-xl group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{log.name}</p>
                  <p className="text-[10px] text-[#555] font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {log.protein}g P · {log.carbs}g C
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-[#c8f060]">{log.kcal}</p>
                </div>
                <button
                  onClick={() => removeFood(log.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#ff5a4a] transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MacroCard({ label, val, color }: any) {
  return (
    <div className="bg-[#1e1e1e] p-2 rounded-lg text-center border border-[#2a2a2a]">
      <div className={`text-sm font-mono font-bold ${color}`}>{val}g</div>
      <div className="text-[9px] text-[#555] uppercase font-bold tracking-tighter">{label}</div>
    </div>
  );
}
