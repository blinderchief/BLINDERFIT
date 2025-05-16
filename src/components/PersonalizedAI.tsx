import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Brain, Activity, Apple, Goal, LineChart, Send, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAI } from '@/hooks/use-ai';

export const PersonalizedAI = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [insightType, setInsightType] = useState('general');
  const [insightTopic, setInsightTopic] = useState('');
  const [aiResponse, setAIResponse] = useState(null);
  const [selectedTab, setSelectedTab] = useState('ask');
  const [personalizedPlan, setPersonalizedPlan] = useState(null);
  const [planPreferences, setPlanPreferences] = useState({
    focusArea: 'general',
    duration: '4 weeks',
    daysPerWeek: 3
  });

  // Use our new AI hook
  const { askAI, generatePlan, isLoading, error } = useAI({
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  });
  // Handle asking a health question
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question to ask BlinderFit AI.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await askAI(question);
      if (result) {
        setAIResponse(result.answer);
      }
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  // Handle getting personalized insights
  const handleGetInsights = async () => {
    if (!insightType) {
      toast({
        title: "Insight Type Required",
        description: "Please select an insight type.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await askAI({
        type: 'insights',
        payload: {
          insightType,
          topic: insightTopic || getDefaultTopic(insightType)
        }
      });
      setAIResponse(result);
    } catch (error) {
      console.error("Error getting insights:", error);
    }
  };
  // Handle generating a personalized plan
  const handleGeneratePlan = async () => {
    try {
      const userProfile = {
        preferences: {
          focusArea: planPreferences.focusArea,
          duration: planPreferences.duration,
          daysPerWeek: parseInt(planPreferences.daysPerWeek.toString())
        },
        userId: user?.uid
      };
      
      const result = await generatePlan(userProfile);
      if (result) {
        setPersonalizedPlan(result);

        toast({
          title: "Plan Generated",
          description: "Your personalized fitness plan has been created!",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error generating plan:", error);
    }
  };

  // Helper to get default topic based on insight type
  const getDefaultTopic = (type) => {
    switch (type) {
      case 'workout_progress': return 'workout performance';
      case 'nutrition_analysis': return 'eating habits';
      case 'goal_tracking': return 'progress toward goals';
      case 'health_trends': return 'health metrics';
      default: return 'fitness progress';
    }
  };

  // Format the AI response for better display
  const formatResponse = (response) => {
    if (!response) return null;

    if (response.answer) {
      // Format for answerHealthQuestion response
      return (
        <div className="space-y-4">
          {response.answer.mainAnswer && (
            <div>
              <h3 className="text-lg font-semibold">Main Answer</h3>
              <p className="mt-1">{response.answer.mainAnswer}</p>
            </div>
          )}

          {response.answer.additionalInfo && (
            <div>
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <p className="mt-1">{response.answer.additionalInfo}</p>
            </div>
          )}

          {response.answer.personalizedTips && (
            <div>
              <h3 className="text-lg font-semibold">Personalized Tips</h3>
              <p className="mt-1">{response.answer.personalizedTips}</p>
            </div>
          )}

          {response.personalized && (
            <div className="text-sm text-muted-foreground">
              <p>This response was personalized based on your profile data.</p>
            </div>
          )}
        </div>
      );
    } else if (response.insights) {
      // Format for getPersonalizedInsights response
      return (
        <div className="space-y-4">
          {response.insights.mainInsight && (
            <div>
              <h3 className="text-lg font-semibold">Key Insight</h3>
              <p className="mt-1">{response.insights.mainInsight}</p>
            </div>
          )}

          {response.insights.additionalInfo && (
            <div>
              <h3 className="text-lg font-semibold">Supporting Information</h3>
              <p className="mt-1">{response.insights.additionalInfo}</p>
            </div>
          )}

          {response.insights.actionableTips && (
            <div>
              <h3 className="text-lg font-semibold">Action Steps</h3>
              <p className="mt-1">{response.insights.actionableTips}</p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Insight generated for: {response.topicArea || 'General fitness'}</p>
          </div>
        </div>
      );
    }

    return <p>{JSON.stringify(response)}</p>;
  };

  // Format the personalized plan for display
  const formatPlan = () => {
    if (!personalizedPlan || !personalizedPlan.plan) return null;

    // Simple formatting for plan display
    // Could be enhanced with a markdown parser for better formatting
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Your Personalized Plan</h3>
          <p className="text-sm text-muted-foreground">
            Created {new Date(personalizedPlan.metadata.generatedAt).toLocaleDateString()} • 
            {personalizedPlan.metadata.difficulty} difficulty • 
            Focus: {personalizedPlan.metadata.focusAreas.join(', ')}
          </p>
        </div>

        <div className="whitespace-pre-wrap">
          {personalizedPlan.plan}
        </div>

        <div>
          <Button 
            variant="outline"
            onClick={() => {
              // Download plan as text file
              const element = document.createElement("a");
              const file = new Blob([personalizedPlan.plan], {type: 'text/plain'});
              element.href = URL.createObjectURL(file);
              element.download = "BlinderFit-Personalized-Plan.txt";
              document.body.appendChild(element);
              element.click();
            }}
          >
            Download Plan
          </Button>
        </div>
      </div>
    );
  };

  // Reset the response when changing tabs
  useEffect(() => {
    setAIResponse(null);
    setPersonalizedPlan(null);
  }, [selectedTab]);

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>BlinderFit AI</CardTitle>
          <CardDescription>Sign in to access personalized AI features</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please sign in to use the BlinderFit AI personalization features.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" /> BlinderFit AI
        </CardTitle>
        <CardDescription>
          Your personalized fitness and health assistant
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="ask">Ask a Question</TabsTrigger>
            <TabsTrigger value="insights">Get Insights</TabsTrigger>
            <TabsTrigger value="plan">Fitness Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="ask" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Ask BlinderFit AI about fitness, nutrition, or health..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button 
              onClick={handleAskQuestion}
              disabled={isLoading || !question.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Answer...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get Answer
                </>
              )}
            </Button>

            {aiResponse && (
              <div className="mt-6">
                <Separator className="my-4" />
                {formatResponse(aiResponse)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Insight Type</label>
                <Select 
                  value={insightType} 
                  onValueChange={setInsightType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insight type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workout_progress">
                      <div className="flex items-center">
                        <Activity className="mr-2 h-4 w-4" />
                        Workout Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="nutrition_analysis">
                      <div className="flex items-center">
                        <Apple className="mr-2 h-4 w-4" />
                        Nutrition Analysis
                      </div>
                    </SelectItem>
                    <SelectItem value="goal_tracking">
                      <div className="flex items-center">
                        <Goal className="mr-2 h-4 w-4" />
                        Goal Tracking
                      </div>
                    </SelectItem>
                    <SelectItem value="health_trends">
                      <div className="flex items-center">
                        <LineChart className="mr-2 h-4 w-4" />
                        Health Trends
                      </div>
                    </SelectItem>
                    <SelectItem value="general">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        General Insights
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Specific Topic (Optional)</label>
                <Input
                  placeholder={`Topic: ${getDefaultTopic(insightType)}`}
                  value={insightTopic}
                  onChange={e => setInsightTopic(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleGetInsights}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Your Data...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Get Personalized Insights
                </>
              )}
            </Button>

            {aiResponse && (
              <div className="mt-6">
                <Separator className="my-4" />
                {formatResponse(aiResponse)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="plan" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Focus Area</label>
                <Select 
                  value={planPreferences.focusArea} 
                  onValueChange={val => setPlanPreferences({...planPreferences, focusArea: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Fitness</SelectItem>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="muscle_building">Muscle Building</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Select 
                  value={planPreferences.duration} 
                  onValueChange={val => setPlanPreferences({...planPreferences, duration: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2 weeks">2 Weeks</SelectItem>
                    <SelectItem value="4 weeks">4 Weeks</SelectItem>
                    <SelectItem value="8 weeks">8 Weeks</SelectItem>
                    <SelectItem value="12 weeks">12 Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Days per Week</label>
                <Select 
                  value={planPreferences.daysPerWeek.toString()} 
                  onValueChange={val => setPlanPreferences({...planPreferences, daysPerWeek: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select days per week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="4">4 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="6">6 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGeneratePlan}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Your Plan...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Generate Personalized Plan
                </>
              )}
            </Button>

            {personalizedPlan && (
              <div className="mt-6">
                <Separator className="my-4" />
                {formatPlan()}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>Powered by Genkit + Firebase</span>
        <span>All responses are personalized to your data</span>
      </CardFooter>
    </Card>
  );
};
