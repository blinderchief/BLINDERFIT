import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHealthData } from '@/contexts/HealthDataContext';
import { FitnessService } from '@/services/FitnessService';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { 
  Dumbbell, BookOpen, ChevronRight, Brain, Activity, 
  Flame, Heart, Trophy, Target, ArrowUpRight, CalendarDays, Timer,
  Zap, Percent, AlertTriangle, CheckCircle, BarChart2, Info, 
  TrendingUp, User, Users, Clock as ClockIcon, ArrowRight as ArrowRightIcon
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import HealthForm from '@/components/HealthForm';

// Sample data for charts
const activityData = [
  { day: 'Mon', steps: 8245, calories: 2100, active: 75 },
  { day: 'Tue', steps: 7500, calories: 1950, active: 68 },
  { day: 'Wed', steps: 9800, calories: 2300, active: 85 },
  { day: 'Thu', steps: 6500, calories: 1800, active: 60 },
  { day: 'Fri', steps: 10200, calories: 2450, active: 92 },
  { day: 'Sat', steps: 11500, calories: 2600, active: 95 },
  { day: 'Sun', steps: 5600, calories: 1750, active: 52 },
];

const macroData = [
  { name: 'Protein', value: 35 },
  { name: 'Carbs', value: 45 },
  { name: 'Fats', value: 20 },
];

const MACRO_COLORS = ['#D4AF37', '#8884d8', '#82ca9d'];

const sleepData = [
  { day: 'Mon', hours: 7.5, quality: 85 },
  { day: 'Tue', hours: 6.8, quality: 75 },
  { day: 'Wed', hours: 8.2, quality: 90 },
  { day: 'Thu', hours: 7.2, quality: 82 },
  { day: 'Fri', hours: 7.8, quality: 88 },
  { day: 'Sat', hours: 8.5, quality: 92 },
  { day: 'Sun', hours: 7.9, quality: 86 },
];

// Add this function to generate motivational quotes
const getMotivationalQuote = () => {
  const quotes = [
    "Discipline is the bridge between goals and accomplishment.",
    "The only bad workout is the one that didn't happen.",
    "Your vision will become clear only when you look into your heart.",
    "Strength does not come from the body. It comes from the will.",
    "The difference between the impossible and the possible lies in determination.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Discipline is choosing between what you want now and what you want most.",
    "Your body can stand almost anything. It's your mind that you have to convince.",
    "The only limits that exist are the ones in your mind.",
    "Vision without action is merely a dream. Action without vision just passes time."
  ];
  
  // Get a quote based on the day to keep it consistent for the user throughout the day
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return quotes[dayOfYear % quotes.length];
};

const Dashboard = () => {
  const { user } = useAuth();
  const { healthData, hasSubmittedHealthData } = useHealthData();
  const [fitnessPlan, setFitnessPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    workoutCompleted: 0,
    daysStreak: 0,
    focusScore: 0,
    totalPoints: 0,
    weeklyGoalProgress: 0,
    nextSessionTime: "09:30",
    heartRate: { current: 72, resting: 62, max: 165 },
    hydration: 65,
    sleep: { average: 7.4, quality: 82 }
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [nextWorkout, setNextWorkout] = useState({
    title: "Upper Body Strength",
    time: "09:30 AM",
    duration: "45 min",
    intensity: "Moderate",
    focusAreas: ["Chest", "Shoulders", "Triceps"]
  });
  const [recentAchievements, setRecentAchievements] = useState([
    { id: 1, title: "7-Day Streak", icon: Flame, date: "2 days ago" },
    { id: 2, title: "New Personal Record", icon: TrendingUp, date: "1 week ago" },
    { id: 3, title: "5 Workouts Completed", icon: CheckCircle, date: "2 weeks ago" }
  ]);
  const [insights, setInsights] = useState([
    { id: 1, title: "Optimal Recovery", description: "Your recovery score indicates you're ready for an intense workout today.", status: "positive" },
    { id: 2, title: "Hydration Alert", description: "Your hydration levels have been below target for 2 days. Aim for 3 more glasses today.", status: "warning" },
    { id: 3, title: "Sleep Improvement", description: "Your sleep quality has improved by 12% this week, supporting better recovery.", status: "positive" }
  ]);
  const [challengeProgress, setChallengeProgress] = useState(65);
  const [weeklyTarget, setWeeklyTarget] = useState({
    current: 3,
    target: 5,
    percentage: 60
  });
  const [weeklyProgress, setWeeklyProgress] = useState([
    { name: 'Strength', completed: 3, total: 4 },
    { name: 'Cardio', completed: 2, total: 3 },
    { name: 'Flexibility', completed: 1, total: 2 },
    { name: 'Recovery', completed: 3, total: 3 },
  ]);

  // Firestore real-time sync for plan/goals/progress
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const userDocRef = doc(db, 'users', user.id);
    const unsub = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFitnessPlan(data.fitnessPlan || null);
        setStats(data.stats || stats);
        setWeeklyTarget(data.weeklyTarget || weeklyTarget);
        setWeeklyProgress(data.weeklyProgress || weeklyProgress);
        setChallengeProgress(data.challengeProgress || 0);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Save plan/progress to Firestore if changed
  const updateUserData = async (updates: any) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, updates);
  };

  // Tick/check for weekly goals (toggle complete)
  const handleGoalCheck = async (index: number) => {
    const updated = [...weeklyProgress];
    if (updated[index].completed < updated[index].total) {
      updated[index].completed += 1;
      await updateUserData({ weeklyProgress: updated });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-black">
        <div className="animate-pulse text-gold text-xl">Loading your vision dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-96px)] py-8 bg-black">
      <div className="gofit-container">
        {/* Header with personalized greeting - Enhanced luxury version */}
        <div className="bg-gradient-to-r from-black via-[#0c0a00] to-black p-8 mb-8 rounded-sm border-l-4 border-gold relative overflow-hidden">
          {/* Abstract geometric patterns for luxury feel */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#gold-gradient)" />
              <path d="M0,50 L50,0 L100,50 L50,100 Z" fill="url(#gold-gradient)" opacity="0.5" />
              <defs>
                <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#AA8C2C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-light tracking-wider text-white">
                Welcome, <span className="text-gold font-normal">{user?.name}</span>
              </h1>
              <p className="text-gray-400 mt-1 italic">"{getMotivationalQuote()}"</p>
              <div className="flex items-center mt-3 text-sm text-white/70">
                <CalendarDays className="h-4 w-4 mr-2 text-gold" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <div className="flex flex-col items-end mt-4 md:mt-0">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-gold flex items-center bg-black/40 px-3 py-1.5 rounded-sm">
                  <Trophy className="h-5 w-5 mr-1.5" /> {stats.totalPoints} Points
                </span>
                <span className="text-white flex items-center bg-black/40 px-3 py-1.5 rounded-sm">
                  <Flame className="h-5 w-5 mr-1.5 text-gold" /> {stats.daysStreak} Day Streak
                </span>
              </div>
              <Link to="/health-form" className="gofit-button-outline text-sm">
                Update Profile
              </Link>
            </div>
          </div>
        </div>

        {/* User Progress Summary - New section */}
        <div className="mb-8 bg-black border border-gold/20 p-6 rounded-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-light text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-gold" />
              Your Vision Progress
            </h2>
            <div className="flex items-center mt-2 md:mt-0">
              <span className="text-sm text-gray-400 mr-3">Discipline Score</span>
              <div className="flex items-center">
                <div className="w-32 bg-white/10 h-2 rounded-full mr-2">
                  <div className="bg-gold h-full rounded-full" style={{ width: `${stats.focusScore}%` }}></div>
                </div>
                <span className="text-gold font-medium">{stats.focusScore}%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/50 border border-white/10 p-4 rounded-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-sm">Willpower</span>
                <div className="h-8 w-8 rounded-full bg-black/50 border border-gold/20 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-gold" />
                </div>
              </div>
              <div className="flex items-end">
                <span className="text-2xl text-white font-light">{85 + stats.daysStreak}%</span>
                <span className="text-emerald-500 text-xs ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{stats.daysStreak}%
                </span>
              </div>
              <Progress value={85 + stats.daysStreak} max={100} className="h-1 mt-2 bg-white/10" indicatorClassName="bg-gold" />
            </div>
            
            <div className="bg-black/50 border border-white/10 p-4 rounded-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-sm">Consistency</span>
                <div className="h-8 w-8 rounded-full bg-black/50 border border-gold/20 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-gold" />
                </div>
              </div>
              <div className="flex items-end">
                <span className="text-2xl text-white font-light">{Math.min(100, 70 + stats.workoutCompleted * 2)}%</span>
                <span className="text-emerald-500 text-xs ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{stats.workoutCompleted * 2}%
                </span>
              </div>
              <Progress value={Math.min(100, 70 + stats.workoutCompleted * 2)} max={100} className="h-1 mt-2 bg-white/10" indicatorClassName="bg-gold" />
            </div>
            
            <div className="bg-black/50 border border-white/10 p-4 rounded-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-sm">Recovery</span>
                <div className="h-8 w-8 rounded-full bg-black/50 border border-gold/20 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-gold" />
                </div>
              </div>
              <div className="flex items-end">
                <span className="text-2xl text-white font-light">{stats.sleep.quality}%</span>
                <span className="text-emerald-500 text-xs ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +5%
                </span>
              </div>
              <Progress value={stats.sleep.quality} max={100} className="h-1 mt-2 bg-white/10" indicatorClassName="bg-gold" />
            </div>
            
            <div className="bg-black/50 border border-white/10 p-4 rounded-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-sm">Discipline</span>
                <div className="h-8 w-8 rounded-full bg-black/50 border border-gold/20 flex items-center justify-center">
                  <Target className="h-4 w-4 text-gold" />
                </div>
              </div>
              <div className="flex items-end">
                <span className="text-2xl text-white font-light">{Math.min(100, 60 + stats.daysStreak * 3)}%</span>
                <span className="text-emerald-500 text-xs ml-2 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{stats.daysStreak * 3}%
                </span>
              </div>
              <Progress value={Math.min(100, 60 + stats.daysStreak * 3)} max={100} className="h-1 mt-2 bg-white/10" indicatorClassName="bg-gold" />
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-black to-[#0c0a00] border border-gold/20 p-6 rounded-sm hover:border-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Workouts Completed</p>
                <h3 className="text-2xl text-white font-light">{stats.workoutCompleted}</h3>
                <p className="text-xs text-emerald-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{Math.floor(stats.workoutCompleted/5)} this week
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-black/50 border border-gold/20 flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-gold" />
              </div>
            </div>
            <Progress value={stats.workoutCompleted * 5} className="h-1.5 bg-white/10" indicatorClassName="bg-gradient-to-r from-gold/80 to-gold" />
          </div>
          
          <div className="bg-gradient-to-br from-black to-[#0c0a00] border border-gold/20 p-6 rounded-sm hover:border-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Current Streak</p>
                <h3 className="text-2xl text-white font-light">{stats.daysStreak} days</h3>
                <p className="text-xs text-emerald-500 flex items-center mt-1">
                  <Trophy className="h-3 w-3 mr-0.5" /> {stats.daysStreak > 7 ? 'Elite status' : 'Building momentum'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-black/50 border border-gold/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-gold" />
              </div>
            </div>
            <Progress value={stats.daysStreak * 14.28} className="h-1.5 bg-white/10" indicatorClassName="bg-gradient-to-r from-amber-500 to-gold" />
          </div>
          
          <div className="bg-gradient-to-br from-black to-[#0c0a00] border border-gold/20 p-6 rounded-sm hover:border-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Focus Score</p>
                <h3 className="text-2xl text-white font-light">{stats.focusScore}%</h3>
                <p className="text-xs text-emerald-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +{Math.floor(stats.focusScore/10)} points
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-black/50 border border-gold/20 flex items-center justify-center">
                <Brain className="h-6 w-6 text-gold" />
              </div>
            </div>
            <Progress value={stats.focusScore} className="h-1.5 bg-white/10" indicatorClassName="bg-gradient-to-r from-blue-500 to-gold" />
          </div>
          
          <div className="bg-gradient-to-br from-black to-[#0c0a00] border border-gold/20 p-6 rounded-sm hover:border-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Heart Rate (Avg)</p>
                <h3 className="text-2xl text-white font-light">{stats.heartRate.current} bpm</h3>
                <p className="text-xs text-emerald-500 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-0.5" /> Optimal zone
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-black/50 border border-gold/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-gold" />
              </div>
            </div>
            <Progress 
              value={(stats.heartRate.current - 60) / (stats.heartRate.max - 60) * 100} 
              className="h-1.5 bg-white/10" 
              indicatorClassName="bg-gradient-to-r from-emerald-500 to-gold" 
            />
          </div>
        </div>
        
        {/* Predictions and Probability Section - New addition */}
        <div className="mb-8">
          <h2 className="text-xl font-light text-white flex items-center mb-4">
            <Percent className="h-5 w-5 mr-2 text-gold" />
            Vision Predictions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black border border-white/10 p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-light">Goal Achievement</h3>
                <div className="text-gold text-xl font-light">{75 + stats.daysStreak}%</div>
              </div>
              <p className="text-sm text-gray-400 mb-3">Probability of reaching your current fitness goals based on your consistency and performance.</p>
              <div className="w-full bg-white/10 h-2 rounded-full">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-gold h-full rounded-full" 
                  style={{ width: `${75 + stats.daysStreak}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="bg-black border border-white/10 p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-light">Habit Formation</h3>
                <div className="text-gold text-xl font-light">{Math.min(99, stats.daysStreak * 4)}%</div>
              </div>
              <p className="text-sm text-gray-400 mb-3">Likelihood of your current routine becoming a permanent habit based on your streak.</p>
              <div className="w-full bg-white/10 h-2 rounded-full">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-gold h-full rounded-full" 
                  style={{ width: `${Math.min(99, stats.daysStreak * 4)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Forming</span>
                <span>Establishing</span>
                <span>Permanent</span>
              </div>
            </div>
            
            <div className="bg-black border border-white/10 p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-light">Stress Management</h3>
                <div className="text-gold text-xl font-light">{Math.min(100, stats.focusScore * 2)}%</div>
              </div>
              <p className="text-sm text-gray-400 mb-3">Probability of effectively managing stress based on your focus score.</p>
              <div className="w-full bg-white/10 h-2 rounded-full">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-gold h-full rounded-full" 
                  style={{ width: `${Math.min(100, stats.focusScore * 2)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-6 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-6 py-3 font-light text-sm ${activeTab === 'overview' ? 'border-b-2 border-gold text-gold' : 'text-gray-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('training')} 
            className={`px-6 py-3 font-light text-sm ${activeTab === 'training' ? 'border-b-2 border-gold text-gold' : 'text-gray-400 hover:text-white'}`}
          >
            Training
          </button>
          <button 
            onClick={() => setActiveTab('nutrition')} 
            className={`px-6 py-3 font-light text-sm ${activeTab === 'nutrition' ? 'border-b-2 border-gold text-gold' : 'text-gray-400 hover:text-white'}`}
          >
            Nutrition
          </button>
          <button 
            onClick={() => setActiveTab('mindfulness')} 
            className={`px-6 py-3 font-light text-sm ${activeTab === 'mindfulness' ? 'border-b-2 border-gold text-gold' : 'text-gray-400 hover:text-white'}`}
          >
            Mindfulness
          </button>
          <button 
            onClick={() => setActiveTab('progress')} 
            className={`px-6 py-3 font-light text-sm ${activeTab === 'progress' ? 'border-b-2 border-gold text-gold' : 'text-gray-400 hover:text-white'}`}
          >
            Progress
          </button>
        </div>
        
        {/* Main Content */}
        <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <Card className="bg-black border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-light">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    <Link to="/fitmentor" className="flex items-center p-4 border border-white/10 hover:border-gold/30 transition-colors">
                      <Brain className="h-6 w-6 text-gold mr-3" />
                      <span className="text-sm text-white">FitMentor</span>
                    </Link>
                    
                    <Link to="/tribevibe" className="flex items-center p-4 border border-white/10 hover:border-gold/30 transition-colors">
                      <Users className="h-6 w-6 text-gold mr-3" />
                      <span className="text-sm text-white">TribeVibe</span>
                    </Link>
                    
                    <Link to="/fitlearn" className="flex items-center p-4 border border-white/10 hover:border-gold/30 transition-colors">
                      <BookOpen className="h-6 w-6 text-gold mr-3" />
                      <span className="text-sm text-white">FitLearn</span>
                    </Link>
                    
                    <Link to="/myzone" className="flex items-center p-4 border border-white/10 hover:border-gold/30 transition-colors">
                      <Target className="h-6 w-6 text-gold mr-3" />
                      <span className="text-sm text-white">MyZone</span>
                    </Link>
                    
                    <Link to="/assessment-goals" className="flex items-center justify-center p-4 bg-gold/10 border border-gold/30 hover:bg-gold/20 transition-colors mt-4">
                      <Target className="h-6 w-6 text-gold mr-3" />
                      <span className="text-sm text-gold">View Assessment Goals</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              {/* Weekly Progress - Keep this in the left column */}
              <Card className="bg-black border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-light flex items-center">
                    <Target className="mr-2 h-5 w-5 text-gold" />
                    Weekly Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Overall Progress</span>
                      <span className="text-gold">{weeklyTarget.current} of {weeklyTarget.target} workouts</span>
                    </div>
                    <Progress 
                      value={weeklyTarget.percentage} 
                      className="h-2.5 bg-white/10" 
                      indicatorClassName="bg-gold" 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    {weeklyProgress.map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <h4 className="text-white">{item.name}</h4>
                          <p className="text-sm text-gray-400">{item.completed} of {item.total} completed</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(item.completed / item.total) * 100} 
                            className="h-1.5 w-20 bg-white/10" 
                            indicatorClassName="bg-gold" 
                          />
                          <button
                            className={`ml-2 rounded-full border-2 ${item.completed === item.total ? 'border-emerald-500 bg-emerald-900/30' : 'border-gold bg-black/40'} p-1.5 transition-colors`}
                            onClick={() => handleGoalCheck(index)}
                            disabled={item.completed === item.total}
                            aria-label="Mark goal as complete"
                          >
                            {item.completed === item.total ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-gold opacity-70" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Challenge Card - Keep this in the left column */}
              <Card className="bg-black border-white/10 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-gold/30 to-black/20 flex items-center justify-center">
                  <h3 className="text-xl text-white">7-Day Vision Quest Challenge</h3>
                </div>
                <CardContent className="pt-5">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Challenge Progress</span>
                      <span className="text-gold">{challengeProgress}%</span>
                    </div>
                    <Progress 
                      value={challengeProgress} 
                      className="h-2.5 bg-white/10" 
                      indicatorClassName="bg-gold" 
                    />
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">
                    Complete daily vision training sessions to unlock enhanced clarity features and earn bonus points.
                  </p>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <div 
                        key={day} 
                        className={`h-8 rounded flex items-center justify-center text-xs ${
                          day <= Math.ceil(challengeProgress / 100 * 7)
                            ? 'bg-gold text-black'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        D{day}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <button className="w-full py-2.5 text-center border border-gold text-gold text-sm hover:bg-gold/10 transition-colors">
                    View Challenge Details
                  </button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Main Content - Now spans 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Insights Card */}
              <Card className="bg-black border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-light flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-gold" /> 
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.map(insight => (
                      <div 
                        key={insight.id}
                        className={`p-4 rounded-sm flex items-start gap-3 ${
                          insight.status === 'positive' 
                            ? 'bg-emerald-900/20 border-l-2 border-emerald-500' 
                            : insight.status === 'warning'
                              ? 'bg-amber-900/20 border-l-2 border-amber-500'
                              : 'bg-black/20 border-l-2 border-gray-500'
                        }`}
                      >
                        {insight.status === 'positive' ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                        ) : insight.status === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        ) : (
                          <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                        )}
                        <div>
                          <h4 className="text-white font-medium mb-1">{insight.title}</h4>
                          <p className="text-gray-300 text-sm">{insight.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Activity Chart */}
              <Card className="bg-black border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-light flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-gold" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={activityData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="day" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#111', 
                            borderColor: '#333',
                            color: '#fff'
                          }}
                          itemStyle={{ color: '#fff' }}
                          labelStyle={{ color: '#D4AF37' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="steps" 
                          name="Steps" 
                          stroke="#D4AF37" 
                          fillOpacity={1} 
                          fill="url(#colorSteps)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="active" 
                          name="Active Minutes" 
                          stroke="#8884d8" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Next Workout */}
              <Card className="bg-black border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-light flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-gold" />
                    Next Workout Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-gold/5 to-transparent p-5 border-l-2 border-gold">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <h3 className="text-xl font-light text-white mb-2 md:mb-0">{nextWorkout.title}</h3>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center text-gold">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {nextWorkout.time}
                        </span>
                        <span className="flex items-center text-gray-300">
                          <Timer className="h-4 w-4 mr-1" />
                          {nextWorkout.duration}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Intensity</p>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 h-2 rounded-full mr-2">
                            <div className={`h-full rounded-full ${
                              nextWorkout.intensity === 'Light' ? 'w-1/3 bg-emerald-500' : 
                              nextWorkout.intensity === 'Moderate' ? 'w-2/3 bg-amber-500' : 
                              'w-full bg-red-500'
                            }`}></div>
                          </div>
                          <span className="text-white whitespace-nowrap">{nextWorkout.intensity}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Focus Areas</p>
                        <div className="flex flex-wrap gap-2">
                          {nextWorkout.focusAreas.map((area, index) => (
                            <span key={index} className="bg-white/10 text-white px-2 py-0.5 text-sm rounded">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-full py-2.5 text-center bg-gold text-black text-sm hover:bg-gold/90 transition-colors">
                      Begin Workout
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <div className={activeTab === 'nutrition' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-light">Macronutrient Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-light">Hydration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <div className="relative h-52 w-52">
                    <svg className="transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#333"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="10"
                        strokeDasharray={`${stats.hydration * 2.83} ${283 - stats.hydration * 2.83}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-light text-white">{stats.hydration}%</span>
                      <span className="text-gray-400 text-sm">Hydrated</span>
                    </div>
                  </div>
                  <p className="text-center text-gray-300 mt-4">
                    Aim to drink 3-4 more glasses of water today
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className={activeTab === 'mindfulness' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-light">Sleep Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={sleepData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="hours" 
                        name="Sleep Hours" 
                        stroke="#D4AF37" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="quality" 
                        name="Sleep Quality" 
                        stroke="#8884d8" 
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-light">Recovery Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <div className="relative h-52 w-52">
                    <svg className="transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#333"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="10"
                        strokeDasharray={`${stats.focusScore * 2.83} ${283 - stats.focusScore * 2.83}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-light text-white">{stats.focusScore}%</span>
                      <span className="text-gray-400 text-sm">Recovery</span>
                    </div>
                  </div>
                  <p className="text-center text-gray-300 mt-4">
                    Your body is well recovered and ready for intense training
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className={activeTab === 'progress' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-light flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-gold" />
                  Workout Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="calories" 
                        name="Calories Burned" 
                        fill="#D4AF37" 
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-black border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-light flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-gold" />
                  Skill Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300">Mental Clarity</span>
                      <span className="text-gold">Advanced</span>
                    </div>
                    <Progress value={85} className="h-1.5 bg-white/10" indicatorClassName="bg-gold" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300">Physical Strength</span>
                      <span className="text-gold">Intermediate</span>
                    </div>
                    <Progress value={65} className="h-1.5 bg-white/10" indicatorClassName="bg-gold" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300">Endurance</span>
                      <span className="text-gold">Developing</span>
                    </div>
                    <Progress value={45} className="h-1.5 bg-white/10" indicatorClassName="bg-gold" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300">Nutritional Balance</span>
                      <span className="text-gold">Intermediate</span>
                    </div>
                    <Progress value={60} className="h-1.5 bg-white/10" indicatorClassName="bg-gold" />
                  </div>
                </div>
                
                <Link to="/fitness-plan" className="mt-6 block w-full py-2.5 text-center bg-gold text-black text-sm hover:bg-gold/90 transition-colors">
                  View Complete Assessment
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className={activeTab === 'training' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-black border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-light">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex p-3 border-l-2 border-gold/50 bg-black/50">
                    <div className="mr-4 text-right min-w-[60px]">
                      <span className="text-gold">09:00</span>
                      <p className="text-xs text-gray-400">60 min</p>
                    </div>
                    <div>
                      <h4 className="text-white font-light">Morning Vision Workout</h4>
                      <p className="text-sm text-gray-400 mt-1">Focus: Upper body strength + clarity</p>
                    </div>
                  </div>
                  
                  <div className="flex p-3 border-l-2 border-white/20 bg-black/50">
                    <div className="mr-4 text-right min-w-[60px]">
                      <span className="text-gray-300">13:00</span>
                      <p className="text-xs text-gray-400">30 min</p>
                    </div>
                    <div>
                      <h4 className="text-white font-light">Mindful Lunch Break</h4>
                      <p className="text-sm text-gray-400 mt-1">Focused nutrition + meditation</p>
                    </div>
                  </div>
                  
                  <div className="flex p-3 border-l-2 border-white/20 bg-black/50">
                    <div className="mr-4 text-right min-w-[60px]">
                      <span className="text-gray-300">18:30</span>
                      <p className="text-xs text-gray-400">45 min</p>
                    </div>
                    <div>
                      <h4 className="text-white font-light">Evening Clarity Session</h4>
                      <p className="text-sm text-gray-400 mt-1">Focus: Cardio + mental clarity</p>
                    </div>
                  </div>
                </div>
                
                <button className="mt-6 w-full py-2.5 text-center border border-gold text-gold text-sm hover:bg-gold/10 transition-colors">
                  Begin Next Session
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;











