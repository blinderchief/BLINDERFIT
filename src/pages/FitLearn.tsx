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
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    category: "training",
    readTime: 8,
    publishedAt: "2025-04-10T09:00:00Z",
    isBookmarked: false,
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredArticles().length > 0 ? (
                  getFilteredArticles().map(article => (
                    <Card key={article.id} className="bg-[#111] border-white/10 overflow-hidden hover:border-gold/30 transition-all">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform hover:scale-105" 
                        />
                        <div className="absolute top-2 right-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(article.id);
                            }}
                            className="h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-gold/80 hover:text-black transition-colors"
                          >
                            {article.isBookmarked ? (
                              <BookmarkCheck className="h-4 w-4" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className="bg-black/50 text-white text-xs px-2 py-1 rounded capitalize">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg font-medium line-clamp-2 hover:text-gold cursor-pointer" onClick={() => setSelectedArticle(article)}>
                          {article.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {article.excerpt}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="h-4 w-4 mr-1" /> 
                          {formatReadTime(article.readTime)}
                        </div>
                        
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-gold flex items-center"
                          onClick={() => setSelectedArticle(article)}
                        >
                          Read more <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <p className="text-gray-400">No articles found in this category.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-white">Latest Fitness News</h2>
              <Button 
                variant="outline" 
                className="flex items-center"
                onClick={refreshNews}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh News'}
              </Button>
            </div>
            
            <div className="space-y-4">
              {news.map((newsItem) => (
                <div 
                  key={newsItem.id} 
                  className="bg-[#111] border border-white/10 p-4 rounded-sm hover:border-gold/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-400">{newsItem.source}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-400">{formatDate(newsItem.publishedAt)}</span>
                        {newsItem.isNew && (
                          <span className="bg-gold text-black text-xs px-2 py-0.5 rounded-full">New</span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">{newsItem.title}</h3>
                      <p className="text-gray-300">{newsItem.excerpt}</p>
                    </div>
                    <span className="bg-black/50 text-white text-xs px-2 py-1 rounded capitalize self-start ml-2">
                      {newsItem.category}
                    </span>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button variant="link" className="p-0 h-auto text-gold">
                      Read full story <ArrowRight className="ml-1 h-4 w-4" />
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
