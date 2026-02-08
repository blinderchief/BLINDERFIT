import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/api';
import {
  Utensils, Dumbbell, Droplets, Footprints, Moon, Brain,
  Plus, Check, TrendingUp, Zap, Loader2,
  Calendar, Sun, Sunset, Apple, Trophy,
  Smile, Meh, Frown, AlertCircle
} from 'lucide-react';

/* ---------- types ---------- */
interface Meal {
  id: string;
  meal_type: string;
  food_items: string;
  calories?: number;
  time?: string;
}
interface Exercise {
  id: string;
  exercise_type: string;
  duration_minutes: number;
  calories_burned?: number;
  intensity?: string;
}
interface DayData {
  meals: Meal[];
  exercises: Exercise[];
  water_intake_ml: number;
  steps_count: number;
  sleep_hours: number;
  mood_rating: number;
  energy_level: number;
  compliance_score: number;
  notes: string;
  weight_kg?: number;
}

const DEFAULT_DAY: DayData = {
  meals: [], exercises: [],
  water_intake_ml: 0, steps_count: 0, sleep_hours: 0,
  mood_rating: 3, energy_level: 3, compliance_score: 0,
  notes: '',
};

/* ---------- component ---------- */
const Tracking = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [todayData, setTodayData] = useState<DayData>(DEFAULT_DAY);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);

  // Meal form
  const [mealType, setMealType] = useState('Breakfast');
  const [mealItems, setMealItems] = useState('');
  const [mealCals, setMealCals] = useState('');

  // Exercise form
  const [exType, setExType] = useState('Walking');
  const [exDuration, setExDuration] = useState('');
  const [exIntensity, setExIntensity] = useState('moderate');

  const today = new Date().toISOString().split('T')[0];

  /* auth redirect */
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  /* load today's data */
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res: any = await apiService.get(`/tracking/daily/${today}`);
        if (res?.data) {
          setTodayData({ ...DEFAULT_DAY, ...res.data });
        }
      } catch {
        // No data for today yet — that's fine
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [user, today]);

  /* save tracking data */
  const saveAll = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res: any = await apiService.post('/tracking/daily', {
        date: today,
        ...todayData,
      });
      if (res?.data?.compliance_score != null) {
        setTodayData(prev => ({ ...prev, compliance_score: res.data.compliance_score }));
      }
      if (res?.data?.insights?.insights) {
        setInsights(res.data.insights.insights);
      }
    } catch (err) {
      console.error('Save tracking error:', err);
    } finally {
      setSaving(false);
    }
  }, [user, today, todayData]);

  /* add meal */
  const addMeal = async () => {
    if (!mealItems.trim()) return;
    const meal: Meal = {
      id: crypto.randomUUID(),
      meal_type: mealType,
      food_items: mealItems,
      calories: mealCals ? parseInt(mealCals) : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setTodayData(prev => ({ ...prev, meals: [...prev.meals, meal] }));
    setMealItems(''); setMealCals('');
    setActivePanel(null);

    // Also log to backend individually
    try {
      await apiService.logMeal({
        meal_type: meal.meal_type,
        food_items: [meal.food_items],
        estimated_calories: meal.calories || 0,
      });
    } catch { /* will be saved in bulk save too */ }
  };

  /* add exercise */
  const addExercise = async () => {
    if (!exDuration) return;
    const ex: Exercise = {
      id: crypto.randomUUID(),
      exercise_type: exType,
      duration_minutes: parseInt(exDuration),
      intensity: exIntensity,
      calories_burned: Math.round(parseInt(exDuration) * (exIntensity === 'high' ? 10 : exIntensity === 'moderate' ? 7 : 4)),
    };
    setTodayData(prev => ({ ...prev, exercises: [...prev.exercises, ex] }));
    setExDuration('');
    setActivePanel(null);

    try {
      await apiService.logExercise({
        exercise_type: ex.exercise_type,
        duration_minutes: ex.duration_minutes,
        calories_burned: ex.calories_burned || 0,
        intensity: ex.intensity,
      });
    } catch { /* will be saved in bulk too */ }
  };

  /* water increment */
  const addWater = (ml: number) => {
    setTodayData(prev => ({ ...prev, water_intake_ml: Math.max(0, prev.water_intake_ml + ml) }));
  };

  if (authLoading || !loaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  const totalMealCals = todayData.meals.reduce((s, m) => s + (m.calories || 0), 0);
  const totalExMinutes = todayData.exercises.reduce((s, e) => s + e.duration_minutes, 0);
  const waterPct = Math.min(100, (todayData.water_intake_ml / 2500) * 100);
  const stepsPct = Math.min(100, (todayData.steps_count / 8000) * 100);
  const compliancePct = todayData.compliance_score;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Daily Tracking</h1>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-gold/60" />
              <span className="text-sm text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <button
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-black rounded-lg font-medium text-sm hover:bg-gold/90 disabled:opacity-50 transition-all"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Day'}
          </button>
        </div>

        {/* Compliance Score Ring */}
        <div className="mt-6 flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#333" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke={compliancePct >= 70 ? '#D4AF37' : compliancePct >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3" strokeDasharray={`${compliancePct}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{Math.round(compliancePct)}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400">Today's Compliance</p>
            <p className="text-lg font-semibold text-white">{compliancePct >= 70 ? 'On Track!' : compliancePct >= 40 ? 'Getting There' : 'Just Getting Started'}</p>
            <p className="text-xs text-gray-500 mt-1">Log meals, exercise & hydration to increase your score</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="px-4 grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: Utensils, label: 'Calories', value: totalMealCals, unit: 'kcal', color: 'text-orange-400' },
          { icon: Dumbbell, label: 'Exercise', value: totalExMinutes, unit: 'min', color: 'text-blue-400' },
          { icon: Droplets, label: 'Water', value: (todayData.water_intake_ml / 1000).toFixed(1), unit: 'L', color: 'text-cyan-400' },
          { icon: Footprints, label: 'Steps', value: todayData.steps_count.toLocaleString(), unit: '', color: 'text-green-400' },
        ].map(({ icon: Icon, label, value, unit, color }) => (
          <div key={label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <Icon className={`h-5 w-5 mx-auto mb-1 ${color}`} />
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-[10px] text-gray-500">{unit} {label}</p>
          </div>
        ))}
      </div>

      {/* ---- MEALS SECTION ---- */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-400" /> Meals
          </h2>
          <button onClick={() => setActivePanel(activePanel === 'meal' ? null : 'meal')}
            className="flex items-center gap-1 text-sm text-gold hover:text-gold/80">
            <Plus className="h-4 w-4" /> Add Meal
          </button>
        </div>

        {/* Add meal form */}
        {activePanel === 'meal' && (
          <div className="bg-white/5 border border-gold/20 rounded-xl p-4 mb-3 space-y-3">
            <div className="flex gap-2">
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(t => (
                <button key={t} onClick={() => setMealType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${mealType === t ? 'bg-gold text-black' : 'bg-white/10 text-gray-400 hover:bg-white/15'}`}>
                  {t}
                </button>
              ))}
            </div>
            <input value={mealItems} onChange={e => setMealItems(e.target.value)}
              placeholder="What did you eat? (e.g., 2 eggs, toast, avocado)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-gold focus:outline-none" />
            <div className="flex gap-2">
              <input value={mealCals} onChange={e => setMealCals(e.target.value.replace(/\D/g, ''))}
                placeholder="Calories (optional)"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-gold focus:outline-none" />
              <button onClick={addMeal} className="px-4 py-2 bg-gold text-black rounded-lg text-sm font-medium hover:bg-gold/90">
                Add
              </button>
            </div>
          </div>
        )}

        {/* Meal list */}
        {todayData.meals.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-4 text-center border border-dashed border-white/10">
            <Apple className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No meals logged yet. Tap + to add your first meal.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayData.meals.map(m => (
              <div key={m.id} className="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between border border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    {m.meal_type === 'Breakfast' && <Sun className="h-4 w-4 text-yellow-400" />}
                    {m.meal_type === 'Lunch' && <Sun className="h-4 w-4 text-orange-400" />}
                    {m.meal_type === 'Dinner' && <Sunset className="h-4 w-4 text-purple-400" />}
                    {m.meal_type === 'Snack' && <Apple className="h-4 w-4 text-green-400" />}
                    <span className="text-sm font-medium text-white">{m.meal_type}</span>
                    {m.time && <span className="text-xs text-gray-500">{m.time}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 ml-6">{m.food_items}</p>
                </div>
                {m.calories && <span className="text-sm font-mono text-gold">{m.calories} cal</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- EXERCISE SECTION ---- */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-400" /> Exercise
          </h2>
          <button onClick={() => setActivePanel(activePanel === 'exercise' ? null : 'exercise')}
            className="flex items-center gap-1 text-sm text-gold hover:text-gold/80">
            <Plus className="h-4 w-4" /> Add Exercise
          </button>
        </div>

        {activePanel === 'exercise' && (
          <div className="bg-white/5 border border-gold/20 rounded-xl p-4 mb-3 space-y-3">
            <select value={exType} onChange={e => setExType(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-gold focus:outline-none">
              {['Walking', 'Running', 'Cycling', 'Yoga', 'Strength Training', 'HIIT', 'Swimming', 'Stretching', 'Dance', 'Other'].map(t => (
                <option key={t} value={t} className="bg-black">{t}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input value={exDuration} onChange={e => setExDuration(e.target.value.replace(/\D/g, ''))}
                placeholder="Duration (minutes)"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-gold focus:outline-none" />
              <select value={exIntensity} onChange={e => setExIntensity(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-gold focus:outline-none">
                <option value="low" className="bg-black">Low</option>
                <option value="moderate" className="bg-black">Moderate</option>
                <option value="high" className="bg-black">High</option>
              </select>
            </div>
            <button onClick={addExercise} className="w-full px-4 py-2 bg-gold text-black rounded-lg text-sm font-medium hover:bg-gold/90">
              Add Exercise
            </button>
          </div>
        )}

        {todayData.exercises.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-4 text-center border border-dashed border-white/10">
            <Dumbbell className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No exercises logged yet today.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayData.exercises.map(e => (
              <div key={e.id} className="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between border border-white/5">
                <div>
                  <span className="text-sm font-medium text-white">{e.exercise_type}</span>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">{e.duration_minutes} min</span>
                    <span className="text-xs text-gray-400 capitalize">{e.intensity}</span>
                  </div>
                </div>
                {e.calories_burned && <span className="text-sm font-mono text-blue-400">-{e.calories_burned} cal</span>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- WATER TRACKER ---- */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Droplets className="h-5 w-5 text-cyan-400" /> Hydration
        </h2>
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">{todayData.water_intake_ml} ml / 2500 ml</span>
            <span className="text-sm font-medium text-cyan-400">{Math.round(waterPct)}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${waterPct}%` }} />
          </div>
          <div className="flex gap-2">
            {[250, 500, 750].map(ml => (
              <button key={ml} onClick={() => addWater(ml)}
                className="flex-1 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/20 transition-colors">
                +{ml}ml
              </button>
            ))}
            <button onClick={() => addWater(-250)}
              className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
              -250
            </button>
          </div>
        </div>
      </section>

      {/* ---- STEPS & SLEEP ---- */}
      <section className="px-4 mb-6 grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-1.5 mb-2">
            <Footprints className="h-4 w-4 text-green-400" /> Steps
          </h3>
          <input
            type="number"
            value={todayData.steps_count || ''}
            onChange={e => setTodayData(prev => ({ ...prev, steps_count: parseInt(e.target.value) || 0 }))}
            placeholder="0"
            className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none"
          />
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${stepsPct}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Goal: 8,000</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-1.5 mb-2">
            <Moon className="h-4 w-4 text-indigo-400" /> Sleep
          </h3>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              step="0.5"
              value={todayData.sleep_hours || ''}
              onChange={e => setTodayData(prev => ({ ...prev, sleep_hours: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
              className="w-16 bg-transparent text-2xl font-bold text-white focus:outline-none"
            />
            <span className="text-sm text-gray-500">hours</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${Math.min(100, ((todayData.sleep_hours || 0) / 8) * 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Goal: 8h</p>
        </div>
      </section>

      {/* ---- MOOD & ENERGY ---- */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-purple-400" /> How are you feeling?
        </h2>
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-4">
          {/* Mood */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Mood</label>
            <div className="flex gap-2">
              {[
                { val: 1, icon: Frown, label: 'Bad', color: 'text-red-400' },
                { val: 2, icon: Meh, label: 'Low', color: 'text-orange-400' },
                { val: 3, icon: Meh, label: 'Okay', color: 'text-yellow-400' },
                { val: 4, icon: Smile, label: 'Good', color: 'text-green-400' },
                { val: 5, icon: Smile, label: 'Great', color: 'text-emerald-400' },
              ].map(({ val, icon: Icon, label, color }) => (
                <button key={val}
                  onClick={() => setTodayData(prev => ({ ...prev, mood_rating: val }))}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                    todayData.mood_rating === val ? 'bg-white/10 ring-1 ring-gold' : 'hover:bg-white/5'
                  }`}>
                  <Icon className={`h-5 w-5 ${todayData.mood_rating === val ? color : 'text-gray-600'}`} />
                  <span className={`text-[10px] ${todayData.mood_rating === val ? 'text-white' : 'text-gray-600'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Energy */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Energy Level</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(val => (
                <button key={val}
                  onClick={() => setTodayData(prev => ({ ...prev, energy_level: val }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    todayData.energy_level >= val
                      ? 'bg-gold/20 text-gold'
                      : 'bg-white/5 text-gray-600 hover:bg-white/10'
                  }`}>
                  <Zap className="h-4 w-4 mx-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- WEIGHT ---- */}
      <section className="px-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-4 w-4 text-gold" /> Weight (optional)
          </h3>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              step="0.1"
              value={todayData.weight_kg || ''}
              onChange={e => setTodayData(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) || undefined }))}
              placeholder="--"
              className="w-24 bg-transparent text-2xl font-bold text-white focus:outline-none"
            />
            <span className="text-sm text-gray-500">kg</span>
          </div>
        </div>
      </section>

      {/* ---- NOTES ---- */}
      <section className="px-4 mb-6">
        <textarea
          value={todayData.notes}
          onChange={e => setTodayData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any notes about today? (optional)"
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-gold focus:outline-none resize-none"
        />
      </section>

      {/* ---- AI INSIGHTS ---- */}
      {insights && (
        <section className="px-4 mb-6">
          <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gold flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4" /> FitMentor Insights
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{insights}</p>
          </div>
        </section>
      )}

      {/* ---- BOTTOM SAVE ---- */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-black/90 backdrop-blur border-t border-white/10">
        <button
          onClick={saveAll}
          disabled={saving}
          className="w-full py-3 bg-gold text-black rounded-xl font-semibold text-sm hover:bg-gold/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
          {saving ? 'Saving your day...' : 'Save & Get AI Insights'}
        </button>
      </div>
    </div>
  );
};

export default Tracking;
