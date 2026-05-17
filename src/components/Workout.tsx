import { useState } from 'react';
import { Dumbbell, Save, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const WORKOUTS = {
  2: { 
    name: 'Chest + Biceps', 
    color: 'border-[#4a9eff]', 
    textColor: 'text-[#4a9eff]',
    warmup: ['Bench press (Light) 15 x 4', 'Pull-ups 7-8 x 4', 'Dips 7-8 x 4', 'Rope jumping 3 min'],
    exercises: [
      { name: 'Flat Barbell Bench Press', sets: '4 x 8-10' },
      { name: 'Incline Dumbbell Press', sets: '3 x 10-12' },
      { name: 'Pec Deck / Fly', sets: '3 x 12-15' },
      { name: 'EZ-Bar Bicep Curl', sets: '4 x 10-12' },
      { name: 'Hammer Curl', sets: '3 x 12' }
    ]
  },
  4: { 
    name: 'Triceps + Back', 
    color: 'border-[#a78bfa]', 
    textColor: 'text-[#a78bfa]',
    warmup: ['Bench press (Light) 15 x 4', 'Pull-ups 7-8 x 4', 'Dips 7-8 x 4', 'Rope jumping 3 min'],
    exercises: [
      { name: 'Lat Pulldown', sets: '4 x 8-10' },
      { name: 'Seated Cable Row', sets: '4 x 10-12' },
      { name: 'DB Single Arm Row', sets: '3 x 10 each' },
      { name: 'Tricep Rope Pushdown', sets: '4 x 12-15' },
      { name: 'Overhead DB Extension', sets: '3 x 12' }
    ]
  },
  6: { 
    name: 'Shoulders + Legs', 
    color: 'border-[#f5a623]', 
    textColor: 'text-[#f5a623]',
    warmup: ['Bench press (Light) 15 x 4', 'Pull-ups 7-8 x 4', 'Dips 7-8 x 4', 'Rope jumping 3 min'],
    exercises: [
      { name: 'Seated DB Shoulder Press', sets: '4 x 10-12' },
      { name: 'Lateral Raises', sets: '4 x 15' },
      { name: 'Goblet Squat', sets: '4 x 10-12' },
      { name: 'Romanian Deadlift', sets: '3 x 10-12' },
      { name: 'Leg Press', sets: '3 x 12-15' }
    ]
  }
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Workout({ fitnessData }: { fitnessData: any }) {
  const { workoutLogs, saveWorkout } = fitnessData;
  const today = new Date().getDay();
  const [expandedDay, setExpandedDay] = useState<number>(today);
  const [weights, setWeights] = useState<Record<string, string>>({});

  const isTrainDay = (di: number) => [2, 4, 6].includes(di);

  const handleWeightChange = (exId: string, val: string) => {
    setWeights(prev => ({ ...prev, [exId]: val }));
  };

  const onSave = async (di: number) => {
    await saveWorkout(di, weights);
    alert('Progress saved!');
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#131f0a] border border-[#2a4010] rounded-xl p-4 text-[#8db860] text-xs">
        <span className="block font-mono text-[10px] text-[#c8f060] uppercase mb-1 font-bold">session protocol</span>
        After every set, rest 60-90 seconds. Focus on the mind-muscle connection.
      </div>

      {[2, 4, 6].map((di) => {
        const wo: any = WORKOUTS[di as keyof typeof WORKOUTS];
        const isToday = di === today;
        const log = workoutLogs[di];

        return (
          <div key={di} className={`bg-[#161616] border ${isToday ? 'border-[#c8f06044]' : 'border-[#2a2a2a]'} rounded-xl overflow-hidden shadow-xl`}>
            <button 
              onClick={() => setExpandedDay(expandedDay === di ? -1 : di)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#1e1e1e] transition-colors"
            >
              <div className="flex flex-col items-start translate-y-[-1px]">
                 <span className="text-[9px] font-mono font-bold text-[#555] uppercase tracking-tighter mb-1">{DAYS[di]}</span>
                 <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{wo.name}</h3>
                    {isToday && <span className="w-1.5 h-1.5 bg-[#c8f060] rounded-full animate-pulse" />}
                 </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#555] transition-transform ${expandedDay === di ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {expandedDay === di && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="px-4 pb-5 overflow-hidden"
                >
                  <div className="space-y-6 pt-2">
                    <div className="bg-[#1e1e1e] p-3 rounded-lg border border-[#2a2a2a]">
                       <h4 className="text-[9px] font-mono text-[#777] uppercase mb-2 font-bold tracking-widest">Razminka / Warm-up</h4>
                       <div className="space-y-1">
                          {wo.warmup.map((wu: string) => (
                            <div key={wu} className="flex items-center gap-2 text-[11px] text-[#999]">
                               <div className="w-1 h-1 bg-[#444] rounded-full" />
                               {wu}
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                      {wo.exercises.map((ex: any) => (
                        <div key={ex.name} className="flex items-center justify-between py-1 border-b border-[#2a2a2a] last:border-0 pb-3">
                          <div className="flex-1">
                             <p className="text-sm font-medium">{ex.name}</p>
                             <p className="text-[10px] text-[#555] font-mono uppercase">{ex.sets}</p>
                          </div>
                          <div className="flex items-center gap-2">
                             {log?.weights[ex.name] && (
                               <span className="text-[10px] text-[#555] font-mono">Last: {log.weights[ex.name]}kg</span>
                             )}
                             <input 
                               type="number"
                               placeholder="kg"
                               onChange={(e) => handleWeightChange(ex.name, e.target.value)}
                               className="w-14 bg-[#1e1e1e] border border-[#333] rounded px-2 py-1 text-xs text-center font-mono focus:outline-none focus:border-[#c8f060]" 
                             />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => onSave(di)}
                      className="w-full flex items-center justify-center gap-2 bg-transparent border border-[#c8f060] text-[#c8f060] py-2 rounded-lg text-xs font-bold hover:bg-[#c8f060] hover:text-black transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Weights
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
