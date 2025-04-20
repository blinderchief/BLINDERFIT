
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Create a schema for health assessment form validation
const formSchema = z.object({
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  weight: z.string().min(1, "Weight is required"),
  height: z.string().min(1, "Height is required"),
  activityLevel: z.string().min(1, "Activity level is required"),
  fitnessGoals: z.string().min(1, "Fitness goals are required").max(500, "Fitness goals are too long"),
  medicalConditions: z.string().optional(),
  dietaryPreferences: z.string().min(1, "Dietary preferences are required"),
  sleepHours: z.string().min(1, "Sleep hours are required"),
  stressLevel: z.string().min(1, "Stress level is required")
});

type FormValues = z.infer<typeof formSchema>;

const FitMentor = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m FitMentor, your AI fitness coach. How can I help you today with your fitness journey?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Assessment state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fitnessPlan, setFitnessPlan] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: '',
      gender: '',
      weight: '',
      height: '',
      activityLevel: '',
      fitnessGoals: '',
      medicalConditions: '',
      dietaryPreferences: '',
      sleepHours: '',
      stressLevel: ''
    }
  });

  // Handle chat form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      const responses = [
        "Based on your fitness goals, I recommend a split routine focusing on different muscle groups each day.",
        "That's a great question! For optimal muscle recovery, I suggest 48-72 hours between training the same muscle group.",
        "To improve your cardiovascular health, try incorporating 20-30 minutes of HIIT workouts 2-3 times per week.",
        "For your weight loss goals, focus on creating a sustainable calorie deficit through both diet and exercise.",
        "Looking at your progress, I'm seeing consistent improvement in your strength metrics. Great work!"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      
      // If audio is enabled, speak the response
      if (audioEnabled) {
        speakText(randomResponse);
      }
    }, 1000);
    
    setInput('');
  };

  // Handle voice recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording(!isRecording);
  };

  const startRecording = () => {
    // Simulated voice recording
    console.log('Starting voice recording...');
    // In a real implementation, this would use the Web Speech API
  };

  const stopRecording = () => {
    // Simulated voice recording stop
    console.log('Stopping voice recording...');
    
    // Simulate transcription result
    setTimeout(() => {
      const possibleInputs = [
        "How many days per week should I work out?",
        "What's the best diet for building muscle?",
        "Can you suggest a good core workout?"
      ];
      setInput(possibleInputs[Math.floor(Math.random() * possibleInputs.length)]);
    }, 500);
  };

  // Handle text-to-speech
  const speakText = (text) => {
    setIsSpeaking(true);
    
    // Use the Web Speech API for text-to-speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Assessment form functions
  const handleNext = async () => {
    const fields: (keyof FormValues)[] = [];
    
    // Determine which fields to validate based on current step
    switch (currentStep) {
      case 1:
        fields.push('age', 'gender', 'weight', 'height');
        break;
      case 2:
        fields.push('activityLevel', 'fitnessGoals');
        break;
      case 3:
        fields.push('dietaryPreferences');
        break;
      case 4:
        fields.push('sleepHours', 'stressLevel');
        break;
    }
    
    // Trigger validation only for the fields in the current step
    const result = await form.trigger(fields);
    
    if (result && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else if (!result) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields to continue.",
      });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      // This would typically call an AI API like OpenAI, Anthropic, etc.
      // For now, we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a more personalized response based on the form data
      const response = generatePersonalizedPlan(data);
      
      setFitnessPlan(response);
      setHasSubmitted(true);
      toast({
        title: "FMGuide Plan Generated!",
        description: "Your personalized 7-day plan is ready.",
      });
    } catch (error) {
      console.error("Error generating plan:", error);
      toast({
        variant: "destructive",
        title: "Error generating plan",
        description: "There was a problem creating your plan. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to generate personalized plan based on form data
  const generatePersonalizedPlan = (data: FormValues): string => {
    // Calculate estimated BMR and TDEE
    const weight = parseFloat(data.weight);
    const height = parseFloat(data.height);
    const age = parseInt(data.age);
    const isMale = data.gender === 'male';
    
    // Basic BMR calculation using Mifflin-St Jeor Equation
    let bmr = 0;
    if (isMale) {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // Activity multiplier
    let activityMultiplier = 1.2; // Default to sedentary
    switch (data.activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'very-active':
        activityMultiplier = 1.9;
        break;
    }
    
    const tdee = Math.round(bmr * activityMultiplier);
    
    // Adjust calories based on assumed goals from the fitness goals text
    let goalCalories = tdee;
    let goalDescription = "maintenance";
    const lowerGoals = data.fitnessGoals.toLowerCase();
    
    if (lowerGoals.includes('weight loss') || lowerGoals.includes('lose weight') || lowerGoals.includes('fat loss')) {
      goalCalories = Math.round(tdee * 0.85); // 15% deficit
      goalDescription = "weight loss";
    } else if (lowerGoals.includes('muscle') || lowerGoals.includes('strength') || lowerGoals.includes('gain')) {
      goalCalories = Math.round(tdee * 1.1); // 10% surplus
      goalDescription = "muscle gain";
    }
    
    // Macronutrient distribution
    const proteinGrams = Math.round((goalCalories * 0.3) / 4); // 30% protein
    const carbGrams = Math.round((goalCalories * 0.4) / 4);    // 40% carbs
    const fatGrams = Math.round((goalCalories * 0.3) / 9);     // 30% fat
    
    // Generate workout schedule based on goals
    let workoutFocus = "balanced";
    if (lowerGoals.includes('cardio') || lowerGoals.includes('endurance')) {
      workoutFocus = "cardio-focused";
    } else if (lowerGoals.includes('strength') || lowerGoals.includes('muscle')) {
      workoutFocus = "strength-focused";
    } else if (lowerGoals.includes('flex') || lowerGoals.includes('mobility')) {
      workoutFocus = "flexibility-focused";
    }
    
    // Base template with customized values
    return `
# Your Personalized 7-Day FMGuide Plan

## Health Assessment Summary
Based on your profile (${data.age} years old, ${data.gender}), current weight of ${data.weight} kg, and height of ${data.height} cm, we've created a customized plan considering your ${data.activityLevel} activity level and specific goal to ${data.fitnessGoals}.

## Nutritional Recommendations

### Daily Caloric Target: ${goalCalories} calories (${goalDescription})
- Protein: ${proteinGrams}g (30%)
- Carbohydrates: ${carbGrams}g (40%)
- Healthy Fats: ${fatGrams}g (30%)
- Water: 3-4 liters

## 7-Day Meal Plan

### Day 1
- **Breakfast**: Greek yogurt with berries and honey, 2 boiled eggs
- **Lunch**: Grilled chicken salad with olive oil dressing
- **Dinner**: Baked salmon with steamed vegetables
- **Snacks**: Handful of almonds, apple

### Day 2
- **Breakfast**: Oatmeal with banana and cinnamon
- **Lunch**: Quinoa bowl with roasted vegetables
- **Dinner**: Turkey meatballs with zucchini noodles
- **Snacks**: Protein shake, orange

### Day 3
- **Breakfast**: Veggie omelet with whole grain toast
- **Lunch**: Lentil soup with side salad
- **Dinner**: Grilled fish tacos with avocado
- **Snacks**: Greek yogurt with honey, walnuts

### Day 4
- **Breakfast**: Protein pancakes with berries
- **Lunch**: Chicken and vegetable stir-fry with brown rice
- **Dinner**: Baked chicken with sweet potato and broccoli
- **Snacks**: Hummus with carrot sticks, pear

### Day 5
- **Breakfast**: Smoothie with protein powder, spinach, banana, and almond milk
- **Lunch**: Tuna salad wrap with whole grain tortilla
- **Dinner**: Beef stir-fry with vegetables and quinoa
- **Snacks**: Cottage cheese with pineapple, small handful of mixed nuts

### Day 6
- **Breakfast**: Avocado toast with poached eggs
- **Lunch**: Mediterranean bowl with falafel, hummus, and vegetables
- **Dinner**: Grilled steak with roasted vegetables
- **Snacks**: Apple with almond butter, protein bar

### Day 7
- **Breakfast**: Chia seed pudding with berries
- **Lunch**: Grilled vegetable and chicken sandwich
- **Dinner**: Salmon with asparagus and quinoa
- **Snacks**: Trail mix, banana

## Fitness Recommendations

### Workout Schedule (${workoutFocus})
${workoutFocus === "cardio-focused" ? `
- **Monday**: HIIT cardio (30 min)
- **Tuesday**: Low-intensity steady state cardio (45 min)
- **Wednesday**: Rest/light yoga
- **Thursday**: Interval training (30 min)
- **Friday**: Circuit training with cardio emphasis (40 min)
- **Saturday**: Endurance workout (60 min)
- **Sunday**: Active recovery (walking, swimming)
` : workoutFocus === "strength-focused" ? `
- **Monday**: Upper body strength (45 min)
- **Tuesday**: Lower body strength (45 min)
- **Wednesday**: Rest/light yoga
- **Thursday**: Push exercises (45 min)
- **Friday**: Pull exercises (45 min)
- **Saturday**: Full body strength (60 min)
- **Sunday**: Active recovery (walking, stretching)
` : workoutFocus === "flexibility-focused" ? `
- **Monday**: Dynamic stretching and yoga (45 min)
- **Tuesday**: Light strength training (30 min)
- **Wednesday**: Pilates (45 min)
- **Thursday**: Yoga flow (45 min)
- **Friday**: Mobility work (40 min)
- **Saturday**: Combined flexibility and strength (60 min)
- **Sunday**: Gentle yoga and meditation
` : `
- **Monday**: Upper body strength (45 min)
- **Tuesday**: HIIT cardio (30 min)
- **Wednesday**: Rest/light yoga
- **Thursday**: Lower body strength (45 min)
- **Friday**: Cardio & core (40 min)
- **Saturday**: Full body workout (60 min)
- **Sunday**: Active recovery (walking, swimming)
`}

## Wellness Recommendations
- Aim for ${data.sleepHours} hours of sleep each night
- Practice 10 minutes of meditation daily to manage ${data.stressLevel} stress levels
- Schedule a 15-minute stretching routine before bed

## Weekly Progress Tracking
- Weight check: Once per week
- Measurements: Every two weeks
- Progress photos: Weekly
- Energy levels: Daily (1-10 scale)

## Dietary Considerations
Based on your preferences: ${data.dietaryPreferences}
${data.medicalConditions ? `\nTaking into account your health conditions: ${data.medicalConditions}` : ''}

Remember, this plan is a starting point. Adjust as needed and listen to your body's signals.
    `;
  };

  // Assessment form rendering
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Age <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        placeholder="Enter your age" 
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Gender <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Weight (kg) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        placeholder="Enter your weight in kg" 
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Height (cm) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        placeholder="Enter your height in cm" 
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="activityLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Activity Level <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <select 
                      {...field}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select activity level</option>
                      <option value="sedentary">Sedentary (little to no exercise)</option>
                      <option value="light">Light (1-3 days/week)</option>
                      <option value="moderate">Moderate (3-5 days/week)</option>
                      <option value="active">Active (6-7 days/week)</option>
                      <option value="very-active">Very Active (twice daily)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fitnessGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Fitness Goals <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe your fitness goals (e.g., weight loss, muscle gain, improved endurance)"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="medicalConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Medical Conditions</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="List any medical conditions or injuries we should be aware of"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Dietary Preferences <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any dietary preferences or restrictions (vegetarian, vegan, allergies, etc.)"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="sleepHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Sleep Hours (average per night) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      placeholder="Average hours of sleep per night" 
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stressLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Stress Level <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <select 
                      {...field}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select stress level</option>
                      <option value="low">Low (rarely stressed)</option>
                      <option value="moderate">Moderate (occasionally stressed)</option>
                      <option value="high">High (frequently stressed)</option>
                      <option value="very-high">Very High (constantly stressed)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Please review all your information before submitting. Our AI will generate a personalized plan based on your inputs.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  return (
    <div className="min-h-[calc(100vh-96px)] bg-black">
      <div className="gofit-container py-12">
        <h1 className="section-heading mb-6">FitMentor</h1>
        <p className="text-silver mb-10">Your AI fitness coach with personalized guidance and assessment</p>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mx-auto mb-8 grid w-[400px] max-w-full grid-cols-2">
            <TabsTrigger value="chat" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              AI Coach
            </TabsTrigger>
            <TabsTrigger value="assessment" className="data-[state=active]:bg-gold data-[state=active]:text-black">
              Get Assessment
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar with suggestions */}
              <div className="col-span-1">
                <div className="bg-[#111] border border-white/10 p-6 rounded-sm">
                  <h3 className="text-xl font-light mb-4">Try asking about:</h3>
                  <ul className="space-y-3 text-silver">
                    <li className="p-2 hover:bg-white/5 cursor-pointer transition-colors">Workout routines</li>
                    <li className="p-2 hover:bg-white/5 cursor-pointer transition-colors">Nutrition advice</li>
                    <li className="p-2 hover:bg-white/5 cursor-pointer transition-colors">Recovery techniques</li>
                    <li className="p-2 hover:bg-white/5 cursor-pointer transition-colors">Fitness goals</li>
                    <li className="p-2 hover:bg-white/5 cursor-pointer transition-colors">Supplement guidance</li>
                    <li className="p-2 hover:bg-white/5 cursor-pointer transition-colors">Exercise technique</li>
                  </ul>
                </div>
              </div>
              
              {/* Chat area */}
              <div className="col-span-1 lg:col-span-3">
                <div className="bg-[#111] border border-white/10 rounded-sm flex flex-col h-[600px]">
                  {/* Chat messages */}
                  <div className="flex-grow p-6 overflow-y-auto space-y-6">
                    {messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] p-4 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-gold/20 text-white' 
                              : 'bg-white/5 text-white'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Input area */}
                  <div className="p-4 border-t border-white/10">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={toggleRecording}
                        className={`p-2.5 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}
                      >
                        {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                      </button>
                      
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask FitMentor anything..."
                        className="flex-grow bg-white/5 border-0 p-2.5 rounded-sm focus:ring-gold"
                      />
                      
                      <button 
                        type="button" 
                        onClick={toggleAudio}
                        className="p-2.5 bg-white/10 rounded-full text-white"
                      >
                        {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                      </button>
                      
                      <button 
                        type="submit" 
                        className="p-2.5 bg-gold text-black rounded-full"
                      >
                        <Send size={20} />
                      </button>
                    </form>
                  </div>
                </div>
                
                <div className="mt-6 text-sm text-silver">
                  <p>FitMentor uses AI technology to provide personalized fitness advice. While helpful, always consult with healthcare professionals for medical decisions.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="assessment" className="m-0">
            <div className="max-w-4xl mx-auto">
              {!hasSubmitted ? (
                <Card className="border border-gold/20">
                  <CardHeader>
                    <CardTitle>Personal Health Assessment</CardTitle>
                    <CardDescription>
                      Complete this questionnaire to receive your personalized 7-day fitness and nutrition plan.
                      <span className="text-red-500 mt-1 block text-xs">Fields marked with * are required</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-8">
                      <div className="relative">
                        <div className="flex justify-between mb-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                step <= currentStep
                                  ? 'bg-gold text-black'
                                  : 'bg-gray-700 text-gray-300'
                              }`}
                            >
                              {step}
                            </div>
                          ))}
                        </div>
                        <div className="absolute top-4 left-0 right-0 h-[2px] bg-gray-700 -z-10">
                          <div
                            className="h-full bg-gold transition-all duration-300"
                            style={{ width: `${(currentStep - 1) * 33.33}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        {renderFormStep()}

                        <div className="flex justify-between mt-8">
                          {currentStep > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePrev}
                            >
                              Previous
                            </Button>
                          )}
                          <div className="ml-auto">
                            {currentStep < 4 ? (
                              <Button
                                type="button"
                                onClick={handleNext}
                              >
                                Next
                              </Button>
                            ) : (
                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gold hover:bg-gold/90 text-black"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Plan...
                                  </>
                                ) : (
                                  'Generate My Plan'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-gold/20">
                  <CardHeader>
                    <CardTitle>Your Personalized FMGuide Plan</CardTitle>
                    <CardDescription>
                      Based on your health profile, we've created this 7-day fitness and nutrition plan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="plan" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="plan">Plan Overview</TabsTrigger>
                        <TabsTrigger value="download">Download & Share</TabsTrigger>
                      </TabsList>
                      <TabsContent value="plan">
                        <ScrollArea className="h-[600px] rounded-md border p-4">
                          <div className="prose prose-invert max-w-none">
                            {fitnessPlan.split('\n').map((line, i) => {
                              if (line.startsWith('# ')) {
                                return <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{line.replace('# ', '')}</h1>
                              } else if (line.startsWith('## ')) {
                                return <h2 key={i} className="text-xl font-semibold mt-5 mb-3">{line.replace('## ', '')}</h2>
                              } else if (line.startsWith('### ')) {
                                return <h3 key={i} className="text-lg font-medium mt-4 mb-2">{line.replace('### ', '')}</h3>
                              } else if (line.startsWith('- ')) {
                                return <li key={i} className="ml-4 mb-1">{line.replace('- ', '')}</li>
                              } else if (line.startsWith('*')) {
                                return <p key={i} className="italic text-gray-400 my-2">{line.replace('*', '')}</p>
                              } else if (line.trim() === '') {
                                return <br key={i} />
                              } else {
                                return <p key={i} className="my-2">{line}</p>
                              }
                            })}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="download">
                        <div className="p-6 text-center space-y-6">
                          <p className="text-lg">Your personalized plan is ready to download or share.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="h-20 text-lg">
                              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download PDF
                            </Button>
                            <Button variant="outline" className="h-20 text-lg">
                              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              Share Plan
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-8">
                            Remember, this plan is designed specifically for you based on the information you provided. For best results, follow it consistently for the full 7 days.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setHasSubmitted(false);
                        setCurrentStep(1);
                        form.reset();
                      }}
                    >
                      Start Over
                    </Button>
                    <Button className="bg-gold hover:bg-gold/90 text-black">Schedule Consultation</Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FitMentor;
