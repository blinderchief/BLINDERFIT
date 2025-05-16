import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from 'axios';
import { auth } from '@/integrations/firebase/client';
import { storage } from '@/integrations/firebase/client';
import { db, functions } from '@/integrations/firebase/client';
import { httpsCallable } from "firebase/functions";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/AuthContext"; // Using the primary AuthContext
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Menu, X, Send, Mic, MicOff, ImageIcon, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const FitMentor = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [sessionId, setSessionId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const [userSessions, setUserSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m FitMentor, your AI fitness coach. How can I help you today with your fitness journey?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fitnessPlan, setFitnessPlan] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

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

  const form = useForm({
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

  const loadUserSessions = async () => {
    if (!user) return;
    
    setIsLoadingSessions(true);
    
    try {
      const sessionsQuery = query(
        collection(db, 'chat_sessions'),
        where('userId', '==', user.uid),
        orderBy('lastUpdatedAt', 'desc'),
        limit(20)
      );
      
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = [];
      
      for (const sessionDoc of sessionsSnapshot.docs) {
        const sessionData = sessionDoc.data();
        
        const firstMessageQuery = query(
          collection(db, 'chat_sessions', sessionDoc.id, 'messages'),
          orderBy('timestamp', 'asc'),
          limit(1)
        );
        
        const firstMessageSnapshot = await getDocs(firstMessageQuery);
        let sessionTitle = 'New Conversation';
        
        if (!firstMessageSnapshot.empty) {
          const firstMessage = firstMessageSnapshot.docs[0].data();
          sessionTitle = firstMessage.content.substring(0, 30) + (firstMessage.content.length > 30 ? '...' : '');
        }
        
        sessions.push({
          id: sessionDoc.id,
          title: sessionTitle,
          messageCount: sessionData.messageCount || 0,
          lastUpdatedAt: sessionData.lastUpdatedAt?.toDate() || new Date(),
          isActive: sessionDoc.id === sessionId
        });
      }
      
      setUserSessions(sessions);
    } catch (error) {
      console.error("Error loading user sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (showSessionDrawer) {
      loadUserSessions();
    }
  }, [showSessionDrawer, user]);

  const switchSession = async (newSessionId) => {
    if (newSessionId === sessionId) return;
    
    setIsLoadingHistory(true);
    
    try {
      setSessionId(newSessionId);
      localStorage.setItem('fitmentor_session_id', newSessionId);
      
      const messagesQuery = query(
        collection(db, 'chat_sessions', newSessionId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const loadedMessages = messagesSnapshot.docs.map(doc => doc.data());
      
      setMessages(loadedMessages);
      
      setShowSessionDrawer(false);
    } catch (error) {
      console.error("Error switching sessions:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const startNewSession = async () => {
    try {
      const newSessionRef = doc(collection(db, 'chat_sessions'));
      const newSessionId = newSessionRef.id;
      
      await setDoc(newSessionRef, {
        userId: user.uid,
        createdAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
        messageCount: 0
      });
      
      setSessionId(newSessionId);
      localStorage.setItem('fitmentor_session_id', newSessionId);
      
      setMessages([]);
      
      setShowSessionDrawer(false);
    } catch (error) {
      console.error("Error creating new chat session:", error);
    }
  };

  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) {
        setIsLoadingHistory(false);
        return;
      }
      
      setIsLoadingHistory(true);
      
      try {
        const storedSessionId = localStorage.getItem('fitmentor_session_id');
        
        if (storedSessionId) {
          const sessionDoc = await getDoc(doc(db, 'chat_sessions', storedSessionId));
          
          if (sessionDoc.exists() && sessionDoc.data().userId === user.uid) {
            setSessionId(storedSessionId);
            
            const messagesQuery = query(
              collection(db, 'chat_sessions', storedSessionId, 'messages'),
              orderBy('timestamp', 'asc')
            );
            
            const messagesSnapshot = await getDocs(messagesQuery);
            const loadedMessages = messagesSnapshot.docs.map(doc => doc.data());
            
            if (loadedMessages.length > 0) {
              setMessages(loadedMessages);
            }
          } else {
            await createNewSession();
          }
        } else {
          await createNewSession();
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        await createNewSession();
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    const createNewSession = async () => {
      try {
        const newSessionRef = doc(collection(db, 'chat_sessions'));
        const newSessionId = newSessionRef.id;
        
        await setDoc(newSessionRef, {
          userId: user.uid,
          createdAt: serverTimestamp(),
          lastUpdatedAt: serverTimestamp(),
          messageCount: 0
        });
        
        setSessionId(newSessionId);
        localStorage.setItem('fitmentor_session_id', newSessionId);
        
        setMessages([]);
      } catch (error) {
        console.error("Error creating new chat session:", error);
      }
    };
    
    loadChatHistory();
  }, [user]);

  const saveMessageToFirestore = async (message, isUserMessage = false) => {
    if (!user || !sessionId) return;
    
    try {
      const messageRef = doc(collection(db, 'chat_sessions', sessionId, 'messages'));
      
      await setDoc(messageRef, {
        ...message,
        id: messageRef.id,
        timestamp: serverTimestamp()
      });
      
      await setDoc(doc(db, 'chat_sessions', sessionId), {
        lastUpdatedAt: serverTimestamp(),
        messageCount: messages.length + 1
      }, { merge: true });
      
      if (isUserMessage) {
        await addDoc(collection(db, 'user_queries'), {
          userId: user.uid,
          sessionId: sessionId,
          query: message.content,
          files: message.files || [],
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error saving message to Firestore:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    const userMessage = { 
      role: 'user', 
      content: input,
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    await saveMessageToFirestore(userMessage, true);
    
    const questionText = input;
    setInput('');
    setIsLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        const errorMessage = { role: 'assistant', content: 'Please log in to use the AI coach.' };
        setMessages(prev => [...prev, errorMessage]);
        await saveMessageToFirestore(errorMessage);
        setIsLoading(false);
        return;
      }
      
      const recentMessages = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // First try a simple test call to verify connection
      try {
        const helloWorld = httpsCallable(functions, 'helloWorld');
        const result = await helloWorld({});
        console.log("Connection test successful:", result);
      } catch (testError) {
        console.error("Connection test failed:", testError);
        // Don't throw, try the main call anyway
      }
      
      // Use Firebase callable functions
      const askAI = httpsCallable(functions, 'askAI');
      
      let payload = { 
        question: questionText + "\n\nContext: " + recentMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join("\n")
      };
      
      if (uploadedFiles.length > 0) {
        payload.question += "\n\nThe user has uploaded these files: " + 
          uploadedFiles.map(file => file.name).join(", ");
      }
      
      console.log("Sending request to AI:", payload);
      const response = await askAI(payload);
      
      console.log("Raw response from AI:", response);
      
      // Access callable function result via response.data
      const answer = response.data;
      console.log("Parsed answer:", answer);
      
      let formattedResponse = '';
      
      if (answer && typeof answer === 'object') {
        // Handle common response formats
        if (answer.text) {
          formattedResponse += answer.text;
        } else if (answer.mainAnswer) {
          formattedResponse += answer.mainAnswer;
        } else if (answer.answer) {
          formattedResponse += answer.answer;
        } else if (Object.keys(answer).length > 0) {
          // Extract any key that might contain text
          for (const key in answer) {
            if (typeof answer[key] === 'string' && answer[key].length > 10) {
              formattedResponse += answer[key] + '\n\n';
            }
          }
        }
      } else if (typeof answer === 'string') {
        formattedResponse = answer;
      } else {
        // Handle unexpected response format
        try {
          const stringified = JSON.stringify(answer, null, 2);
          console.log("Stringified unexpected response:", stringified);
          formattedResponse = "I've processed your question but received an unexpected response format. Please try again with a different question.";
        } catch (err) {
          console.error("Failed to stringify response:", err);
          formattedResponse = "I've processed your question but couldn't parse the response. Please try again or contact support.";
        }
      }
      
      const assistantMessage = { 
        role: 'assistant', 
        content: formattedResponse.trim() || "I'm sorry, I couldn't generate a proper response. Please try asking again."
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      await saveMessageToFirestore(assistantMessage);
      
      setUploadedFiles([]);
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Enhanced error reporting for better troubleshooting
      let errorDetails = "";
      let errorCode = "";
      
      if (error.code) {
        errorCode = error.code;
        errorDetails += `\nError code: ${error.code}`;
      }
      if (error.message) {
        errorDetails += `\nError message: ${error.message}`;
      }
      if (error.details) {
        errorDetails += `\nError details: ${JSON.stringify(error.details)}`;
      }
      if (error.stack) {
        errorDetails += `\nStack trace: ${error.stack}`;
      }
      
      console.log("Detailed error info:", errorDetails);
      
      let userFacingErrorMessage = "I'm sorry, I encountered an error while processing your question. Please try again later.";
      
      // If we're in development, add more details
      if (process.env.NODE_ENV === 'development') {
        userFacingErrorMessage += `\n\nTechnical details: ${errorCode || 'unknown error'}`;
      }
      
      // For specific error codes, provide more helpful messages
      if (errorCode === 'functions/internal') {
        userFacingErrorMessage = "I'm sorry, there's a temporary issue with the AI service. Our team has been notified and is working on a fix.";
      } else if (errorCode === 'functions/unavailable') {
        userFacingErrorMessage = "The AI service is currently unavailable. Please try again in a few minutes.";
      } else if (errorCode === 'functions/unauthenticated' || errorCode === 'functions/permission-denied') {
        userFacingErrorMessage = "You need to be logged in to use this feature. Please log in and try again.";
      } else if (errorCode === 'functions/invalid-argument') {
        userFacingErrorMessage = "There was an issue with your request. Please try asking a simpler question.";
      }
      
      const errorMessage = { 
        role: 'assistant', 
        content: userFacingErrorMessage
      };
      
      setMessages(prev => [...prev, errorMessage]);
      await saveMessageToFirestore(errorMessage);
      
      // Try to call a simpler function to determine if it's a specific issue with the AI function
      try {
        const helloWorld = httpsCallable(functions, 'helloWorld');
        const pingResult = await helloWorld({});
        console.log("Hello world succeeded after AI failure:", pingResult);
      } catch (pingError) {
        console.error("Hello world also failed, likely a connection issue:", pingError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording(!isRecording);
  };

  const startRecording = () => {
    console.log('Starting voice recording...');
  };

  const stopRecording = () => {
    console.log('Stopping voice recording...');
    
    setTimeout(() => {
      const possibleInputs = [
        "How many days per week should I work out?",
        "What's the best diet for building muscle?",
        "Can you suggest a good core workout?"
      ];
      setInput(possibleInputs[Math.floor(Math.random() * possibleInputs.length)]);
    }, 500);
  };

  const handleNext = async () => {
    const fields = [];
    
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

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Not logged in',
          description: 'Please log in to generate your personalized plan.'
        });
        setIsLoading(false);
        return;
      }
      
      // Use Firebase callable function instead of direct HTTP request
      const generatePersonalizedPlan = httpsCallable(functions, 'askAI');
      const result = await generatePersonalizedPlan({
        question: "Generate a 7-day fitness and nutrition plan based on this profile: " + JSON.stringify(data)
      });
      
      // Access the result from the callable function
      const planData = result.data;
      setFitnessPlan(planData.plan || 'No plan generated.');
      setHasSubmitted(true);
      
      toast({
        title: 'FMGuide Plan Generated!',
        description: 'Your personalized 7-day plan is ready.'
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error generating plan',
        description: 'There was a problem creating your plan. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const newFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          console.error("File is not an image:", file.name);
          continue;
        }
        
        const fileId = uuidv4();
        const fileRef = ref(storage, `user-uploads/${auth.currentUser.uid}/images/${fileId}-${file.name}`);
        
        await uploadBytes(fileRef, file);
        
        const downloadURL = await getDownloadURL(fileRef);
        
        newFiles.push({
          id: fileId,
          name: file.name,
          type: 'image',
          url: downloadURL,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });
      }
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const newFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(file.type)) {
          console.error("Invalid document type:", file.name);
          continue;
        }
        
        const fileId = uuidv4();
        const fileRef = ref(storage, `user-uploads/${auth.currentUser.uid}/documents/${fileId}-${file.name}`);
        
        await uploadBytes(fileRef, file);
        
        const downloadURL = await getDownloadURL(fileRef);
        
        newFiles.push({
          id: fileId,
          name: file.name,
          type: 'document',
          url: downloadURL,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });
      }
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      if (documentInputRef.current) {
        documentInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

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

  useEffect(() => {
    return () => {};
  }, []);

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
            <div className="flex h-full">
              <div 
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-black/90 border-r border-white/10 transform ${
                  showSessionDrawer ? 'translate-x-0' : '-translate-x-full'
                } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                  showSessionDrawer ? 'md:block' : 'md:hidden'
                }`}
              >
                <div className="p-4 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Chat History</h2>
                  <button
                    onClick={startNewSession}
                    className="mt-2 w-full py-2 px-4 bg-gold text-black rounded-md hover:bg-gold/80 transition-colors"
                  >
                    New Chat
                  </button>
                </div>
                
                <div className="overflow-y-auto h-[calc(100%-80px)]">
                  {isLoadingSessions ? (
                    <div className="flex justify-center items-center h-20">
                      <Loader2 className="h-6 w-6 animate-spin text-gold" />
                    </div>
                  ) : (
                    <ul className="space-y-1 p-2">
                      {userSessions.map(session => (
                        <li key={session.id}>
                          <button
                            onClick={() => switchSession(session.id)}
                            className={`w-full text-left py-2 px-3 rounded-md hover:bg-white/10 transition-colors ${
                              session.isActive ? 'bg-white/10 border-l-2 border-gold' : ''
                            }`}
                          >
                            <div className="text-sm font-medium truncate">{session.title}</div>
                            <div className="text-xs text-gray-400 flex justify-between">
                              <span>{session.messageCount} messages</span>
                              <span>{formatDate(session.lastUpdatedAt)}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                      
                      {userSessions.length === 0 && (
                        <li className="text-center py-4 text-gray-400 text-sm">
                          No previous conversations
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col h-full">
                <button
                  onClick={() => setShowSessionDrawer(!showSessionDrawer)}
                  className="md:hidden absolute top-4 left-4 z-50 p-2 rounded-md bg-black/50 text-white"
                >
                  {showSessionDrawer ? <X size={20} /> : <Menu size={20} />}
                </button>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                  
                  <div className="col-span-1 lg:col-span-3">
                    <div className="bg-[#111] border border-white/10 rounded-sm flex flex-col h-[600px]">
                      <div className="flex-grow p-6 overflow-y-auto space-y-6">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.role === "assistant" ? "justify-start" : "justify-end"
                            } mb-4`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-4 ${
                                message.role === "assistant"
                                  ? "bg-black/30 text-white"
                                  : "bg-gold/10 text-white"
                              }`}
                            >
                              <div className="whitespace-pre-line">
                                {message.content}
                              </div>
                              
                              {message.files && message.files.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <div className="text-xs text-gray-400 mb-2">
                                    Uploaded files:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {message.files.map(file => (
                                      <a
                                        key={file.id}
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center bg-black/30 rounded px-2 py-1 text-xs hover:bg-black/50 transition-colors"
                                      >
                                        {file.type === 'image' ? (
                                          <ImageIcon size={12} className="mr-1 text-gold" />
                                        ) : (
                                          <FileText size={12} className="mr-1 text-gold" />
                                        )}
                                        <span className="truncate max-w-[100px]">{file.name}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
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
                          
                          <div className="flex items-center space-x-2 mr-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="p-2 rounded-full text-gray-400 hover:text-gold hover:bg-black/20 transition-colors"
                              title="Upload image"
                            >
                              <ImageIcon size={20} />
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                              accept="image/*"
                              multiple
                              className="hidden"
                            />
                            
                            <button
                              type="button"
                              onClick={() => documentInputRef.current?.click()}
                              className="p-2 rounded-full text-gray-400 hover:text-gold hover:bg-black/20 transition-colors"
                              title="Upload document"
                            >
                              <FileText size={20} />
                            </button>
                            <input
                              type="file"
                              ref={documentInputRef}
                              onChange={handleDocumentUpload}
                              accept=".pdf,.docx,.txt"
                              multiple
                              className="hidden"
                            />
                          </div>

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

const formatDate = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default FitMentor;












