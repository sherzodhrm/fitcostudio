import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATIC_MEALS = {
  train: {
    breakfast: { food: '3 boiled eggs + 80g oats + 1 banana', note: 'Black tea or Americano - no sugar', p: 38, c: 68, k: 580 },
    lunch: { food: 'Grilled chicken breast 250g + buckwheat + salad', note: 'Canteen: avoid plov, samsa, fried cutlets', p: 50, c: 60, k: 640 },
    snack: { food: '1 banana + 1 toast + honey', note: 'Pre-workout: 60-90 min before gym', p: 6, c: 55, k: 320 },
    shake: { food: '1 scoop ISO-XP protein', note: 'Post-workout: within 30 min of finish', p: 22, c: 2, k: 95 },
    night: { food: '200g tvorog + 15g walnuts', note: 'Casein protein for overnight repair', p: 32, c: 8, k: 280 }
  },
  rest: {
    breakfast: { food: '3 boiled eggs + 60g oats + 1 apple', note: 'Slightly smaller carbs on rest day', p: 35, c: 52, k: 500 },
    lunch: { food: 'Shurpa or Dimlama (extra meat)', note: 'Uzbek food fine. Choose broth-based. No soda.', p: 38, c: 40, k: 520 },
    dinner: { food: '200g chicken/fish + salad + 150g potato', note: 'Lower carbs tonight. Focus on fiber.', p: 45, c: 35, k: 490 },
    night: { food: '200g tvorog + 15g walnuts', note: 'Essential casein every night', p: 32, c: 6, k: 270 }
  }
};

const TRAIN_DAYS = [2, 4, 6]; // Tue, Thu, Sat
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyDiet({ fitnessData }: { fitnessData: any }) {
  const { mealOverrides, saveMealOverride } = fitnessData;
  const [expandedDay, setExpandedDay] = useState(new Date().getDay());

  const getDayOrder = () => {
    const today = new Date().getDay();
    const order = [];
    for (let i = 0; i < 7; i++) {
        order.push((today + i) % 7);
    }
    return order;
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 text-[11px] text-[#999] leading-relaxed">
        <Edit3 className="w-4 h-4 text-[#c8f060] inline mr-2 mb-1" />
        Tap any day to view plans. Tap the meal text to customize it to your preference.
      </div>

      {getDayOrder().map((di) => {
        const isTrain = TRAIN_DAYS.includes(di);
        const isToday = di === new Date().getDay();
        const base = isTrain ? STATIC_MEALS.train : STATIC_MEALS.rest;
        
        return (
          <div key={di} className="bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedDay(expandedDay === di ? -1 : di)}
              className="w-full h-14 px-4 flex items-center justify-between hover:bg-[#1e1e1e] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{DAYS[di]}</span>
                {isToday && <span className="text-[10px] text-[#c8f060] font-mono font-bold tracking-widest bg-[#c8f0601a] px-2 py-0.5 rounded-full">TODAY</span>}
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${isTrain ? 'bg-[#4a9eff1a] text-[#4a9eff]' : 'bg-[#333] text-[#777]'}`}>
                  {isTrain ? 'TRAIN' : 'REST'}
                </span>
                {expandedDay === di ? <ChevronDown className="w-4 h-4 text-[#555]" /> : <ChevronRight className="w-4 h-4 text-[#555]" />}
              </div>
            </button>

            <AnimatePresence>
              {expandedDay === di && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="px-4 pb-4 overflow-hidden border-t border-[#2a2a2a]"
                >
                  <div className="divide-y divide-[#2a2a2a]">
                    {Object.entries(base).map(([key, meal]: any) => (
                      <MealItem
                        key={key}
                        mealKey={key}
                        dayIndex={di}
                        defaultMeal={meal}
                        override={mealOverrides[`${di}_${key}`]}
                        onSave={saveMealOverride}
                      />
                    ))}
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

function MealItem({ mealKey, dayIndex, defaultMeal, override, onSave }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [food, setFood] = useState(override?.food || defaultMeal.food);
  const [note, setNote] = useState(override?.note || defaultMeal.note);

  const handleSave = () => {
    onSave(dayIndex, mealKey, food, note);
    setIsEditing(false);
  };

  const labels: any = {
    breakfast: '7:00 AM · Breakfast',
    lunch: '1:00 PM · Lunch',
    snack: '6:30 PM · Pre-workout',
    shake: '9:15 PM · Post-workout',
    dinner: '7:00 PM · Dinner',
    night: '10:00 PM · Night'
  };

  return (
    <div className="py-4 space-y-1">
      <div className="flex justify-between items-center bg-[#1e1e1e] px-2 py-1 rounded inline-block mb-2">
        <span className="text-[10px] font-mono font-bold text-[#555] uppercase tracking-tighter">{labels[mealKey]}</span>
        <div className="flex gap-2 ml-4">
           <span className="text-[9px] text-[#4a9eff] font-mono">{defaultMeal.p}g P</span>
           <span className="text-[9px] text-[#c8f060] font-mono">{defaultMeal.k} kcal</span>
        </div>
      </div>
      
      {!isEditing ? (
        <div onClick={() => setIsEditing(true)} className="cursor-pointer group">
          <p className="text-sm font-medium text-[#f0ede8] group-hover:text-[#c8f060] transition-colors">{override?.food || defaultMeal.food}</p>
          <p className="text-xs text-[#777] italic leading-relaxed">{override?.note || defaultMeal.note}</p>
        </div>
      ) : (
        <div className="space-y-2 pt-2">
          <textarea
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-sm focus:outline-none focus:border-[#c8f060]"
            rows={2}
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-[#1e1e1e] border border-[#333] rounded-lg p-2 text-xs focus:outline-none focus:border-[#c8f060]"
            placeholder="Add a note..."
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 bg-[#c8f060] text-black text-xs font-bold py-1.5 rounded">Save</button>
            <button onClick={() => setIsEditing(false)} className="flex-1 bg-[#2a2a2a] text-[#777] text-xs py-1.5 rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
