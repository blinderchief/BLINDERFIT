import { useState, useEffect } from 'react';
import { RefreshCw, Clock, ArrowRight, Bookmark, BookmarkCheck, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { ScrollArea } from "@/components/ui/scroll-area";

// Fitness article data with categories
const fitnessArticles = [
  {
    id: 1,
    title: "The Science Behind High-Intensity Interval Training",
    excerpt: "Discover why HIIT workouts are so effective for fat loss and cardiovascular health.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80",
    category: "training",
    readTime: 8,
    publishedAt: "2025-04-10T09:00:00Z",
    isBookmarked: false,
    externalLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6786990/",
    content: `
# The Science Behind High-Intensity Interval Training

High-Intensity Interval Training (HIIT) has become increasingly popular in recent years, and for good reason. This form of exercise alternates between short bursts of intense activity and periods of lower-intensity exercise or rest.

## Why HIIT Works

The effectiveness of HIIT lies in its ability to:

1. **Maximize Calorie Burn** - The intense bursts push your body to use more oxygen, creating an "oxygen debt" that must be repaid post-workout. This is known as Excess Post-exercise Oxygen Consumption (EPOC) or the "afterburn effect."

2. **Improve Metabolic Health** - Studies show HIIT can improve insulin sensitivity and glucose regulation more effectively than moderate-intensity continuous training.

3. **Save Time** - A 20-minute HIIT session can provide benefits comparable to 45-60 minutes of steady-state cardio.

4. **Preserve Muscle Mass** - Unlike traditional cardio, HIIT helps maintain lean muscle while burning fat.

## Sample HIIT Workout

Here's a simple HIIT workout you can try:
- Warm up for 3-5 minutes
- 30 seconds of sprinting or high-intensity exercise
- 30-90 seconds of walking or rest
- Repeat 8-10 times
- Cool down for 3-5 minutes

Remember to start at your own fitness level and gradually increase intensity over time. Always consult with a healthcare provider before beginning any new exercise program, especially high-intensity protocols.
    `
  },
  {
    id: 2,
    title: "Nutrition Timing: When to Eat for Optimal Performance",
    excerpt: "Unlock the secrets of nutrient timing to maximize your workout results and recovery.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    category: "nutrition",
    readTime: 12,
    publishedAt: "2025-04-12T14:30:00Z",
    isBookmarked: false,
    externalLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6628334/",
    content: `
# Nutrition Timing: When to Eat for Optimal Performance

The timing of your meals can be just as important as what you eat, especially for those looking to maximize fitness results. Strategic nutrient timing can enhance performance, support recovery, and help achieve body composition goals.

## Pre-Workout Nutrition

Eating 1-3 hours before exercise provides your body with the fuel it needs to perform:

- **Carbohydrates**: The primary energy source for high-intensity activities
- **Protein**: Helps prevent muscle protein breakdown during exercise
- **Moderate fat and fiber**: Limit these to avoid digestive discomfort

Quick pre-workout snack ideas:
- Greek yogurt with berries
- Apple with almond butter
- Rice cakes with tuna

## During Workout Nutrition

For sessions lasting longer than 60-90 minutes:
- **Carbohydrates**: 30-60g per hour to maintain blood glucose
- **Electrolytes**: Replace what's lost through sweat
- **Fluids**: 16-20 oz per hour of activity

## Post-Workout Nutrition

The 30-60 minute window after exercise is critical for:

- **Protein**: 20-40g to stimulate muscle protein synthesis
- **Carbohydrates**: Replenish glycogen stores (0.5-0.7g per pound of bodyweight)
- **Fluids and Electrolytes**: Restore hydration status

Perfect post-workout meals:
- Protein shake with banana
- Chicken with sweet potatoes and vegetables
- Salmon with quinoa and broccoli

Remember that individual needs vary based on goals, training intensity, and body composition. Experiment to find what works best for you.
    `
  },
  {
    id: 3,
    title: "Mindfulness Meditation for Athletes: Mental Training",
    excerpt: "Learn how elite athletes use meditation to improve focus, reduce anxiety, and enhance performance.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    category: "mindfulness",
    readTime: 6,
    publishedAt: "2025-04-14T11:15:00Z",
    isBookmarked: false,
    externalLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6753170/",
    content: `
# Mindfulness Meditation for Athletes: Mental Training

The mental aspect of athletic performance is often overlooked, yet it can be the difference between good and great. Mindfulness meditation has become a secret weapon for many elite athletes, helping them develop extraordinary focus and mental resilience.

## Benefits for Athletes

Consistent mindfulness practice can:

1. **Improve Focus** - Train your mind to stay in the present moment, ignoring distractions and past mistakes.

2. **Manage Performance Anxiety** - Learn to observe pre-competition nerves without being controlled by them.

3. **Enhance Recovery** - Reduce stress hormones that can impede physical recovery between training sessions.

4. **Increase Body Awareness** - Develop a stronger mind-body connection to improve technique and prevent injuries.

## Simple Meditation Practice for Athletes

Start with this 5-minute daily practice:

1. Sit in a comfortable position with your back straight
2. Focus on your breath, noticing the sensations as you inhale and exhale
3. When your mind wanders (it will), gently bring your attention back to your breath
4. After 5 minutes, slowly open your eyes

As you become more comfortable, gradually increase to 10-15 minutes. The key is consistency rather than duration.

Many professional teams now incorporate mindfulness training into their regular routines. The mental edge it provides can be the difference maker in high-pressure situations.
    `
  },
  {
    id: 4,
    title: "Recovery Methods: The Latest Science on Muscle Repair",
    excerpt: "Explore cutting-edge recovery techniques that can help you bounce back faster between workouts.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    category: "recovery",
    readTime: 10,
    publishedAt: "2025-04-15T08:45:00Z",
    isBookmarked: false,
    externalLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6019475/",
    content: `
# Recovery Methods: The Latest Science on Muscle Repair

Effective recovery is the often-neglected component of fitness that can make or break your progress. As training methods have evolved, so too has our understanding of optimal recovery strategies.

## Science-Backed Recovery Techniques

### 1. Sleep Optimization

Quality sleep is the foundation of recovery:
- Aim for 7-9 hours per night
- Create a consistent sleep schedule
- Make your bedroom cool (65-68°F), dark, and quiet
- Limit screen time 1-2 hours before bed

Research shows that sleep deprivation can reduce muscle protein synthesis by up to 18% and increase stress hormones that promote muscle breakdown.

### 2. Active Recovery

Low-intensity movement on rest days:
- Light swimming or cycling
- Walking
- Gentle yoga
- Mobility work

Studies show that active recovery can clear metabolic waste products and reduce muscle soreness more effectively than complete rest.

### 3. Contrast Therapy

Alternating between hot and cold exposure:
- 3-5 minutes in hot water (100-104°F)
- 30-60 seconds in cold water (50-59°F)
- Repeat 3-5 times

This method has been shown to reduce inflammatory markers and perceived muscle soreness in athletes.

### 4. Nutrition Strategies

Key nutrients that support recovery:
- Protein (1.6-2.2g per kg of bodyweight daily)
- Tart cherry juice (reduces inflammation)
- Omega-3 fatty acids (supports cell membrane repair)
- Magnesium (aids muscle relaxation)

Remember that recovery needs are highly individual. The most effective approach is to experiment with different methods and track your results to develop a personalized recovery protocol.
    `
  },
  {
    id: 5,
    title: "The Future of Fitness: AI and VR Training Technologies",
    excerpt: "A look at how artificial intelligence and virtual reality are revolutionizing workout experiences.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    category: "technology",
    readTime: 7,
    publishedAt: "2025-04-16T10:20:00Z",
    isBookmarked: false,
    externalLink: "https://www.frontiersin.org/articles/10.3389/fpsyg.2019.02788/full",
    content: `
# The Future of Fitness: AI and VR Training Technologies

The fitness industry is experiencing a technological revolution that is changing how we train, track progress, and stay motivated. Artificial intelligence and virtual reality are at the forefront of this transformation.

## AI-Powered Fitness

Artificial intelligence is enhancing workout experiences through:

### Personalized Programming
AI algorithms analyze your performance data, recovery metrics, and goals to create truly customized training plans that adapt in real-time.

### Form Correction
Computer vision technology can now assess your movement patterns during exercises, providing instant feedback to improve technique and prevent injuries.

### Predictive Analytics
Advanced AI can predict plateaus before they happen, allowing for proactive program adjustments to maintain progress.

## Virtual Reality Workouts

VR technology is making fitness more immersive and engaging:

### Gamified Exercise
Turn workouts into adventures or competitions, making high-intensity training feel like play rather than work.

### Virtual Training Environments
Train "alongside" world-class athletes or in exotic locations from the comfort of your home.

### Community Experiences
Connect with friends and training partners globally for shared workout experiences despite physical distance.

## The Research Supports Technology

Studies show that technology-enhanced fitness experiences can:
- Increase adherence rates by up to 35%
- Improve performance outcomes by making precise load management possible
- Reduce injury rates through better form monitoring

While nothing replaces the fundamentals of consistent training and nutrition, these technologies are providing powerful tools to optimize the process and results.
    `
  },
  {
    id: 7,
    title: "Diabetes and Exercise: Managing Blood Glucose Through Movement",
    excerpt: "Learn how physical activity affects insulin sensitivity and blood sugar control for both prevention and management.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80",
    category: "health",
    readTime: 8,
    publishedAt: "2025-04-18T10:30:00Z",
    isBookmarked: false,
    externalLink: "https://www.diabetes.org/fitness/get-and-stay-fit/fitness-tips-to-get-started",
    content: `
# Diabetes and Exercise: Managing Blood Glucose Through Movement

Physical activity plays a crucial role in managing diabetes and preventing complications. Regular exercise improves insulin sensitivity, helps maintain healthy body weight, and reduces cardiovascular risk factors.

## How Exercise Affects Blood Glucose

When you exercise, your muscles use glucose for energy, which can lower your blood sugar levels. Additionally, moderate exercise increases insulin sensitivity, making it easier for cells to use available insulin to take up glucose during and after activity.

### Benefits for Type 1 Diabetes
- Improved cardiovascular health
- Better insulin sensitivity
- Reduced insulin requirements
- Improved blood pressure and cholesterol levels

### Benefits for Type 2 Diabetes
- Enhanced insulin sensitivity
- Potential for reduced medication needs
- Weight management
- Improved glycemic control

## Exercise Guidelines for People with Diabetes

### Before Starting
- Consult with your healthcare provider
- Check your blood glucose before, during, and after exercise
- Have fast-acting carbohydrates available
- Stay hydrated

### Recommended Activities
- Aerobic exercises: walking, swimming, cycling
- Resistance training: weight lifting, resistance bands
- Flexibility and balance: yoga, tai chi

### Timing Considerations
- Exercise 1-3 hours after meals when possible
- Avoid exercise during peak insulin action
- Morning exercise may help reduce post-meal blood glucose spikes

## Managing Blood Glucose During Exercise

### For Type 1 Diabetes
- Monitor glucose before, during, and after exercise
- Adjust insulin dosage as recommended by your healthcare team
- Consider carbohydrate intake based on exercise intensity and duration

### For Type 2 Diabetes
- Be aware of hypoglycemia risk, especially if taking insulin or sulfonylureas
- Adjust medication timing as advised by your healthcare provider
- Monitor for symptoms of low blood sugar

## Special Considerations

### Hyperglycemia
- If blood glucose is above 250 mg/dL and ketones are present, avoid vigorous activity
- Hydrate well and monitor closely

### Hypoglycemia
- If blood glucose is below 100 mg/dL, consume 15-30g of carbohydrates before exercise
- Recheck blood glucose after 15 minutes

## Building a Sustainable Routine

The best exercise program is one you can maintain consistently. Start slowly and gradually increase intensity and duration. Find activities you enjoy and consider exercising with friends or family for added motivation and safety.

Remember that different types of exercise affect blood glucose differently. Keep records of how your body responds to various activities to help you and your healthcare team optimize your diabetes management plan.
    `
  },
  {
    id: 8,
    title: "Cancer Prevention: The Exercise-Oncology Connection",
    excerpt: "Explore the growing research showing how regular physical activity can reduce cancer risk and improve outcomes.",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1780&q=80",
    category: "health",
    readTime: 11,
    publishedAt: "2025-04-19T10:30:00Z",
    isBookmarked: false,
    externalLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6568409/",
    content: `
# Cancer Prevention: The Exercise-Oncology Connection

The field of exercise oncology has grown significantly in recent years, with compelling evidence that physical activity plays a crucial role in cancer prevention and survivorship.

## Cancer Risk Reduction

Research indicates that regular exercise can reduce the risk of several cancers:

- Colon cancer: 20-25% lower risk
- Breast cancer: 20-30% lower risk
- Endometrial cancer: 20-30% lower risk
- Kidney cancer: 10-20% lower risk
- Bladder cancer: 15% lower risk
- Esophageal cancer: 20% lower risk

## Mechanisms of Protection

Exercise helps prevent cancer through multiple pathways:

### Hormone Regulation
Physical activity can reduce levels of estrogen and insulin, which at high levels may promote the growth of certain cancers.

### Inflammation Reduction
Chronic inflammation is linked to cancer development. Regular exercise reduces inflammatory markers in the body.

### Immune Function
Moderate exercise enhances immune surveillance, potentially helping to identify and eliminate cancer cells.

### Weight Management
Maintaining a healthy weight through exercise reduces the risk of obesity-related cancers.

## Exercise Recommendations for Cancer Prevention

The American Cancer Society recommends:

- 150-300 minutes of moderate-intensity activity or 75-150 minutes of vigorous activity weekly
- Strength training at least twice weekly
- Limiting sedentary behavior

For cancer survivors, similar guidelines apply, though programs should be tailored to individual needs and capabilities.

Remember that it's never too late to start. Even previously inactive individuals can gain significant cancer-protective benefits by becoming more physically active.
    `
  },
  {
    id: 9,
    title: "Alzheimer's Disease: Can Exercise Protect Your Brain?",
    excerpt: "The latest research on how physical activity affects cognitive function and may help prevent neurodegenerative diseases.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80",
    category: "health",
    readTime: 9,
    publishedAt: "2025-04-20T14:15:00Z",
    isBookmarked: false,
    externalLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6530042/",
    content: `
# Alzheimer's Disease: Can Exercise Protect Your Brain?

As our population ages, Alzheimer's disease and other forms of dementia are becoming increasingly prevalent. However, growing evidence suggests that regular physical activity may be one of our best defenses against cognitive decline.

## The Brain-Exercise Connection

Exercise benefits the brain through several mechanisms:

### Increased Blood Flow
Physical activity improves cerebral blood flow, delivering more oxygen and nutrients to brain cells.

### Neurogenesis and Plasticity
Exercise stimulates the production of brain-derived neurotrophic factor (BDNF), which promotes the growth of new neurons and strengthens existing neural connections.

### Reduced Inflammation
Chronic neuroinflammation contributes to Alzheimer's pathology. Exercise has anti-inflammatory effects that may protect brain tissue.

### Improved Insulin Sensitivity
Some researchers refer to Alzheimer's as "type 3 diabetes" due to the role of insulin resistance. Exercise improves insulin sensitivity throughout the body, including the brain.

## The Evidence

Multiple longitudinal studies show that physically active individuals have:

- Up to 50% lower risk of developing Alzheimer's disease
- Slower progression of cognitive decline if already diagnosed
- Better preservation of hippocampal volume (a brain region critical for memory)

## Exercise Recommendations for Brain Health

Research suggests the following for optimal cognitive protection:

- Aerobic exercise: 150 minutes weekly at moderate intensity
- Resistance training: 2-3 sessions weekly
- Coordination activities (like dance or tennis) that challenge the brain
- Consistency over decades rather than short-term programs

It's important to note that exercise appears most effective when combined with other brain-healthy habits like proper nutrition, quality sleep, social engagement, and cognitive stimulation.

Remember that it's never too early or too late to start exercising for brain health. Even those with mild cognitive impairment or early Alzheimer's can benefit from appropriate physical activity.
    `
  },
  {
    id: 10,
    title: "Rhabdomyolysis: When Exercise Becomes Dangerous",
    excerpt: "Understanding this potentially life-threatening condition caused by extreme exercise and how to prevent it.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    category: "health-risks",
    readTime: 7,
    publishedAt: "2025-04-21T11:20:00Z",
    isBookmarked: false,
    externalLink: "https://www.ncbi.nlm.nih.gov/books/NBK448168/",
    content: `
# Rhabdomyolysis: When Exercise Becomes Dangerous

While exercise is generally beneficial, excessive or inappropriate training can lead to serious complications. Rhabdomyolysis ("rhabdo") is a potentially life-threatening condition that athletes and fitness enthusiasts should understand.

## What is Rhabdomyolysis?

Rhabdomyolysis occurs when damaged muscle tissue breaks down rapidly, releasing proteins (particularly myoglobin) into the bloodstream. These proteins can cause kidney damage and, in severe cases, kidney failure.

## Warning Signs and Symptoms

Early recognition is crucial. Watch for:

- Extreme muscle pain that's disproportionate to the exercise performed
- Unusual muscle weakness or swelling
- Dark, cola-colored urine
- Reduced urine output
- Nausea or vomiting
- Confusion or dizziness
- Fever

## Risk Factors

Several factors increase the risk of exercise-induced rhabdomyolysis:

- Performing unfamiliar, high-intensity exercises
- Exercising in extreme heat or humidity
- Dehydration
- Certain medications (statins, antipsychotics)
- Recent viral illnesses
- Genetic muscle disorders

## Prevention Strategies

To minimize your risk:

- Progress training intensity gradually
- Stay well-hydrated, especially in hot weather
- Warm up thoroughly before intense exercise
- Cool down and stretch after workouts
- Listen to your body and avoid pushing through severe pain
- Be cautious with new exercises or high-intensity workouts
- Report any unusual muscle symptoms to a healthcare professional
    `
  }
];

// Fitness news data
const fitnessNews = [
  {
    id: 101,
    title: "New Study Shows Resistance Training Improves Brain Health",
    excerpt: "Research published today indicates that regular strength training has significant cognitive benefits beyond physical improvements.",
    source: "Journal of Exercise Science",
    publishedAt: "2025-04-16T08:30:00Z",
    category: "research",
    isNew: true
  },
  {
    id: 102,
    title: "Olympic Committee Announces New Fitness Standards for 2026",
    excerpt: "The International Olympic Committee has revealed updated fitness requirements for qualifying athletes in preparation for the next games.",
    source: "Sports Weekly",
    publishedAt: "2025-04-15T14:45:00Z",
    category: "sports",
    isNew: true
  },
  {
    id: 103,
    title: "Popular Fitness App Adds AI-Powered Form Correction",
    excerpt: "The widely-used fitness application now includes real-time movement analysis to help users perform exercises correctly and safely.",
    source: "Tech Fitness Today",
    publishedAt: "2025-04-15T11:20:00Z",
    category: "technology",
    isNew: true
  },
  {
    id: 104,
    title: "Nutritionists Warn Against New 'Extreme Protein' Diet Trend",
    excerpt: "Health experts express concerns over the rising popularity of diets promoting excessive protein consumption with potential kidney strain.",
    source: "Nutrition Science Magazine",
    publishedAt: "2025-04-14T09:15:00Z",
    category: "nutrition",
    isNew: false
  },
  {
    id: 105,
    title: "Celebrity Trainer Releases Revolutionary Recovery Protocol",
    excerpt: "A-list fitness coach shares innovative techniques for faster recovery between workouts, emphasizing sleep quality over supplements.",
    source: "Fitness Insider",
    publishedAt: "2025-04-13T16:30:00Z",
    category: "recovery",
    isNew: false
  },
  {
    id: 106,
    title: "Mental Health Benefits of Exercise Confirmed in Large-Scale Study",
    excerpt: "A comprehensive 10-year study confirms the significant impact of regular physical activity on reducing anxiety and depression symptoms.",
    source: "Psychological Health Journal",
    publishedAt: "2025-04-12T13:45:00Z",
    category: "mental health",
    isNew: false
  },
  {
    id: 107,
    title: "New 'Micro-Workout' Trend Gaining Popularity Among Busy Professionals",
    excerpt: "Short, high-intensity exercise sessions spread throughout the day show promising results for those with limited time for traditional workouts.",
    source: "Urban Fitness Magazine",
    publishedAt: "2025-04-11T10:15:00Z",
    category: "trends",
    isNew: false
  }
];

// Format date for display
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Calculate read time in minutes format
const formatReadTime = (minutes) => {
  return `${minutes} min read`;
};

// Add a compact date formatter for mobile
const formatCompactDate = (dateString) => {
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const FitLearn = () => {
  const [articles, setArticles] = useState([...fitnessArticles]);
  const [news, setNews] = useState([...fitnessNews]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Function to toggle bookmark status
  const toggleBookmark = (articleId) => {
    setArticles(articles.map(article => 
      article.id === articleId 
        ? { ...article, isBookmarked: !article.isBookmarked }
        : article
    ));
    
    const article = articles.find(a => a.id === articleId);
    if (article) {
      toast(article.isBookmarked ? "Removed from bookmarks" : "Added to bookmarks", {
        description: article.title,
        action: {
          label: "View",
          onClick: () => setSelectedArticle(article),
        },
      });
    }
  };
  
  // Filter articles by category
  const filterArticles = (category) => {
    setActiveCategory(category);
  };
  
  // Get filtered articles based on active category
  const getFilteredArticles = () => {
    if (activeCategory === 'all') return articles;
    if (activeCategory === 'bookmarked') return articles.filter(article => article.isBookmarked);
    return articles.filter(article => article.category === activeCategory);
  };
  
  // Simulated refresh function for news
  const refreshNews = () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate new "breaking" news
      const breakingNews = {
        id: 100 + Math.floor(Math.random() * 900),
        title: "Breaking: New Fitness Research Reveals Surprising Benefits",
        excerpt: "Just-published research uncovers unexpected connections between exercise timing and hormonal optimization.",
        source: "BlinderFit Exclusive",
        publishedAt: new Date().toISOString(),
        category: "research",
        isNew: true
      };
      
      // Update existing news to not be "new" anymore
      const updatedNews = news.map(item => ({
        ...item,
        isNew: false
      }));
      
      // Add breaking news to the top
      setNews([breakingNews, ...updatedNews]);
      setIsRefreshing(false);
      
      toast.success("News feed updated with latest fitness information!");
    }, 1500);
  };
  
  // Share article
  const shareArticle = (article) => {
    // In a real app, this would use the Web Share API
    toast.success("Article shared successfully!", {
      description: article.title,
    });
  };
  
  // Close article view
  const closeArticleView = () => {
    setSelectedArticle(null);
  };

  // Add this useEffect to preload images
  useEffect(() => {
    // Preload article images
    fitnessArticles.forEach(article => {
      if (article.image) {
        const img = new Image();
        img.src = article.image;
      }
    });
  }, []);

  return (
    <div className="min-h-[calc(100vh-96px)] bg-black">
      <div className="gofit-container py-12">
        <div className="mb-10">
          <h1 className="section-heading mb-4">FitLearn</h1>
          <p className="text-silver max-w-3xl">Stay updated with the latest fitness knowledge, research and trends. Expand your understanding of training, nutrition, and recovery with expert content.</p>
        </div>
        
        <Tabs defaultValue="articles" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <TabsList className="mb-4 md:mb-0">
              <TabsTrigger value="articles">Educational Articles</TabsTrigger>
              <TabsTrigger value="news">Latest News</TabsTrigger>
            </TabsList>
            
            <div className="flex overflow-x-auto pb-2 hide-scrollbar">
              <button 
                onClick={() => filterArticles('all')}
                className={`px-4 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === 'all' 
                    ? 'bg-gold text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => filterArticles('training')}
                className={`px-4 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === 'training' 
                    ? 'bg-gold text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Training
              </button>
              <button 
                onClick={() => filterArticles('nutrition')}
                className={`px-4 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === 'nutrition' 
                    ? 'bg-gold text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Nutrition
              </button>
              <button 
                onClick={() => filterArticles('mindfulness')}
                className={`px-4 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === 'mindfulness' 
                    ? 'bg-gold text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Mindfulness
              </button>
              <button 
                onClick={() => filterArticles('recovery')}
                className={`px-4 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === 'recovery' 
                    ? 'bg-gold text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Recovery
              </button>
              <button 
                onClick={() => filterArticles('technology')}
                className={`px-4 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === 'technology' 
                    ? 'bg-gold text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Technology
              </button>
              <button 
                onClick={() => filterArticles('bookmarked')}
                className={`px-4 py-1.5 mr-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === 'bookmarked' 
                    ? 'bg-gold text-black' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Bookmarked
              </button>
            </div>
          </div>
          
          <TabsContent value="articles" className="mt-0">
            {selectedArticle ? (
              <div className="bg-[#111] border border-white/10 rounded-sm p-6 md:p-8">
                <button 
                  onClick={closeArticleView}
                  className="mb-4 text-sm text-gray-400 hover:text-white flex items-center"
                >
                  ← Back to articles
                </button>
                
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-light text-white mb-4">{selectedArticle.title}</h1>
                  <div className="flex flex-wrap items-center text-sm text-gray-400 gap-4">
                    <span className="bg-gold/20 text-gold px-2 py-0.5 rounded capitalize">
                      {selectedArticle.category}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> 
                      {formatReadTime(selectedArticle.readTime)}
                    </span>
                    <span>
                      Published: {formatDate(selectedArticle.publishedAt)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-8 rounded-sm overflow-hidden relative aspect-[21/9]">
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      // Fallback image if the original fails to load
                      e.currentTarget.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
                      console.log(`Failed to load image for article view: ${selectedArticle.title}`);
                    }}
                  />
                </div>
                
                <div className="prose prose-invert max-w-none">
                  {selectedArticle.content.split('\n').map((line, i) => {
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
                
                <div className="flex justify-end mt-8 pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => toggleBookmark(selectedArticle.id)}
                  >
                    {selectedArticle.isBookmarked ? (
                      <BookmarkCheck className="h-5 w-5 mr-2" />
                    ) : (
                      <Bookmark className="h-5 w-5 mr-2" />
                    )}
                    {selectedArticle.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => shareArticle(selectedArticle)}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {getFilteredArticles().length > 0 ? (
                  getFilteredArticles().map(article => (
                    <Card key={article.id} className="bg-[#111] border-white/10 overflow-hidden hover:border-gold/30 transition-all">
                      <div className="relative h-36 sm:h-48 overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105" 
                          onError={(e) => {
                            // Fallback image if the original fails to load
                            e.currentTarget.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
                            console.log(`Failed to load image for article: ${article.title}`);
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(article.id);
                            }}
                            className={`p-1.5 rounded-full ${
                              article.isBookmarked 
                                ? 'bg-gold text-black' 
                                : 'bg-black/50 text-white hover:bg-black/70'
                            }`}
                          >
                            <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" fill={article.isBookmarked ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>
                      
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="bg-gold/20 text-gold text-[10px] sm:text-xs px-1.5 py-0.5 rounded capitalize tracking-tight">
                            {article.category}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400 tracking-tight">
                            {formatCompactDate(article.publishedAt)}
                          </span>
                        </div>
                        
                        <h3 className="text-sm sm:text-base font-medium text-white mb-1 sm:mb-2 line-clamp-2 tracking-tight leading-tight">
                          {article.title}
                        </h3>
                        
                        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 mb-2 tracking-tight leading-snug">
                          {article.excerpt}
                        </p>
                      </CardContent>
                      
                      <CardFooter className="p-3 sm:p-4 pt-0 flex justify-between items-center">
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-400 tracking-tight">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> 
                          {formatReadTime(article.readTime)}
                        </div>
                        
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-gold flex items-center text-xs sm:text-sm tracking-tight"
                          onClick={() => setSelectedArticle(article)}
                        >
                          Read more <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 sm:py-16">
                    <p className="text-sm sm:text-base text-gray-400 tracking-tight">No articles found in this category.</p>
                    <Button 
                      variant="outline" 
                      className="mt-3 sm:mt-4 text-xs sm:text-sm py-1 px-3 sm:py-2 sm:px-4"
                      onClick={() => filterArticles('all')}
                    >
                      View all articles
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="news" className="mt-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg sm:text-xl font-light text-white tracking-normal">Latest Fitness News</h2>
              <Button 
                variant="outline" 
                className="flex items-center text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3"
                onClick={refreshNews}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-1 h-3 w-3 sm:h-4 sm:w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh News'}
              </Button>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              {news.map((newsItem) => (
                <div 
                  key={newsItem.id} 
                  className="bg-[#111] border border-white/10 p-3 sm:p-4 rounded-sm hover:border-gold/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <span className="text-xs text-gray-400 tracking-tight">{newsItem.source}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400 tracking-tight">{formatDate(newsItem.publishedAt)}</span>
                        {newsItem.isNew && (
                          <span className="bg-gold text-black text-xs px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs tracking-tight">New</span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-medium text-white mb-1 sm:mb-2 tracking-tight leading-tight">{newsItem.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-300 tracking-tight leading-snug">{newsItem.excerpt}</p>
                    </div>
                    <span className="bg-black/50 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded capitalize self-start ml-2 tracking-tight">
                      {newsItem.category}
                    </span>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <Button variant="link" className="p-0 h-auto text-gold text-xs sm:text-sm tracking-tight">
                      Read full story <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FitLearn;























