
import { useState } from 'react';
import { Search, Filter, ArrowRight } from 'lucide-react';

const EducationalContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const articles = [
    {
      id: 1,
      title: "Understanding Macronutrients for Optimal Fitness",
      excerpt: "Learn how to balance proteins, carbohydrates, and fats to maximize your fitness results.",
      category: "Nutrition",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 2,
      title: "The Science of Muscle Growth",
      excerpt: "Discover the physiological processes behind muscle hypertrophy and how to optimize your training.",
      category: "Training",
      readTime: "8 min",
      image: "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 3,
      title: "Recovery Techniques for Athletes",
      excerpt: "Explore advanced recovery methods to reduce soreness and improve performance.",
      category: "Recovery",
      readTime: "5 min",
      image: "https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80"
    },
    {
      id: 4,
      title: "Mindfulness and Exercise: The Mental Aspect of Fitness",
      excerpt: "The connection between mental health and physical performance explained.",
      category: "Mindfulness",
      readTime: "7 min",
      image: "https://images.unsplash.com/photo-1470298701293-0da94584c5e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 5,
      title: "Hydration Strategies for Peak Performance",
      excerpt: "How to properly hydrate before, during, and after exercise for optimal results.",
      category: "Nutrition",
      readTime: "4 min",
      image: "https://images.unsplash.com/photo-1554244933-d876deb6b2ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 6,
      title: "Building a Sustainable Fitness Routine",
      excerpt: "Create a long-term fitness plan that fits your lifestyle and helps you reach your goals.",
      category: "Lifestyle",
      readTime: "6 min",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
  ];
  
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="gofit-container py-12">
      <h1 className="section-heading">Educational Content</h1>
      <p className="section-subheading">Expand your knowledge with our extensive library of fitness and nutrition articles.</p>
      
      {/* Search and Filter */}
      <div className="mb-10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-charcoal border border-white/20 p-4 pl-12 text-white placeholder-gray-400 focus:border-gold focus:outline-none"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button className="flex items-center justify-center px-6 py-4 bg-charcoal border border-white/20 hover:bg-black transition-colors">
          <Filter size={20} className="mr-2" />
          <span>Filter</span>
        </button>
      </div>
      
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredArticles.map(article => (
          <div key={article.id} className="bg-black border border-white/10 group hover:border-gold/30 transition-all duration-500">
            <div className="relative overflow-hidden aspect-video">
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  // Fallback image if the original fails to load
                  e.currentTarget.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";
                  console.log(`Failed to load image for article: ${article.title}`);
                }}
              />
              <div className="absolute top-4 left-4 bg-gold/90 text-black text-xs font-medium px-3 py-1">
                {article.category}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-silver text-sm">{article.readTime} read</span>
              </div>
              <h3 className="text-xl mb-3 font-light">{article.title}</h3>
              <p className="text-silver mb-4 text-sm">{article.excerpt}</p>
              <button className="text-gold flex items-center text-sm group-hover:text-white transition-colors">
                Read Article <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-silver">No articles found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default EducationalContent;


