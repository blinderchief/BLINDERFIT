import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Target, CheckCircle, Clock, ArrowRight, 
  Calendar, Award, TrendingUp, AlertCircle 
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link } from 'react-router-dom';

const AssessmentGoals = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [assessmentDate, setAssessmentDate] = useState(null);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setGoals(userData.assessmentGoals || []);
          setAssessmentDate(userData.lastAssessmentDate?.toDate() || new Date());
        }
      } catch (error) {
        console.error("Error fetching assessment goals:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoals();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-black">
        <div className="animate-pulse text-gold text-xl">Loading your assessment goals...</div>
      </div>
    );
  }

  // If no goals are found
  if (goals.length === 0) {
    return (
      <div className="min-h-[calc(100vh-96px)] py-12 bg-black">
        <div className="gofit-container">
          <Card className="bg-black border-white/10 max-w-2xl mx-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-light flex items-center">
                <AlertCircle className="mr-2 h-6 w-6 text-gold" />
                No Assessment Goals Found
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-gray-300 mb-6">
                  You haven't completed a fitness assessment yet. Complete an assessment to get personalized goals.
                </p>
                <Link to="/health-form" className="gofit-button">
                  Complete Assessment
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-96px)] py-12 bg-black">
      <div className="gofit-container">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light tracking-wider text-white mb-2">
            Your <span className="text-gold">Assessment Goals</span>
          </h1>
          {assessmentDate && (
            <p className="text-gray-400">
              Based on assessment completed on {assessmentDate.toLocaleDateString('en-US', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => (
            <Card key={index} className="bg-black border-white/10 hover:border-gold/30 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-light flex items-center">
                  <Target className="mr-2 h-5 w-5 text-gold" />
                  {goal.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{goal.description}</p>
                
                <div className="space-y-4">
                  {goal.metrics && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-gold">{goal.currentValue || 0} / {goal.targetValue}</span>
                      </div>
                      <Progress 
                        value={((goal.currentValue || 0) / goal.targetValue) * 100} 
                        className="h-2 bg-white/10" 
                        indicatorClassName="bg-gold" 
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span>Target: {goal.timeframe || "4 weeks"}</span>
                  </div>
                  
                  {goal.priority && (
                    <div className="flex items-center text-sm text-gold">
                      <Award className="h-4 w-4 mr-1.5" />
                      <span>{goal.priority} Priority</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link 
                  to={`/goal-detail/${index}`} 
                  className="text-sm text-gold hover:underline flex items-center"
                >
                  View Details <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/pulsehub" className="gofit-button-outline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssessmentGoals;