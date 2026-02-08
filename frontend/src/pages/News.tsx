
import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, ArrowRight } from 'lucide-react';

const News = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const newsItems = [
    {
      id: 1,
      title: "BlinderFit Launches Revolutionary AI-Powered Fitness Platform",
      excerpt: "Our new platform uses advanced AI to create truly personalized fitness plans for users of all levels.",
      category: "Company",
      date: "2024-05-12",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 2,
      title: "New Research Partnership with National Health Institute",
      excerpt: "BlinderFit teams up with the National Health Institute to study the effectiveness of AI in fitness planning.",
      category: "Research",
      date: "2024-04-28",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 3,
      title: "BlinderFit Wins Prestigious Innovation Award",
      excerpt: "Our platform has been recognized for its innovative approach to personalized fitness technology.",
      category: "Awards",
      date: "2024-04-15",
      image: "https://images.unsplash.com/photo-1560173045-beaf11c65dce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
    },
    {
      id: 4,
      title: "FMGuide Feature Added to Platform",
      excerpt: "Our new nutrition guidance system, FMGuide, is now available to all users to complement their fitness plans.",
      category: "Product",
      date: "2024-03-22",
      image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80"
    },
    {
      id: 5,
      title: "BlinderFit Community Reaches 500,000 Users",
      excerpt: "Our global community continues to grow as more people discover the benefits of personalized fitness.",
      category: "Milestone",
      date: "2024-03-05",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80"
    },
    {
      id: 6,
      title: "Annual Fitness Summit Announced",
      excerpt: "Join us for our annual summit featuring expert speakers, workshops, and networking opportunities.",
      category: "Events",
      date: "2024-02-18",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80"
    },
  ];
  
  const filteredNews = newsItems.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.category.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const categories = ['all', ...new Set(newsItems.map(item => item.category.toLowerCase()))];

  const [featuredNews, setFeaturedNews] = useState(newsItems[0]);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    featured: false,
    news: false
  });

  useEffect(() => {
    // Set initial visibility after a slight delay
    setTimeout(() => {
      setIsVisible({
        hero: true,
        featured: true,
        news: true
      });
    }, 300);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1484&q=80")',
          }}
        ></div>
        <div className="gofit-container relative z-10">
          <div 
            className={`max-w-2xl transition-all duration-1000 ease-out ${
              isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <h1 className="section-heading mb-6">Latest News</h1>
            <p className="text-xl text-silver font-light mb-8">
              Stay updated with the latest developments, announcements, and events from BlinderFit.
            </p>
          </div>
        </div>
      </section>
      
      {/* Featured News */}
      <section className="py-16 bg-charcoal">
        <div className="gofit-container">
          <div 
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000 ease-out ${
              isVisible.featured ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="relative overflow-hidden aspect-video lg:aspect-square">
              <img 
                src={featuredNews.image} 
                alt={featuredNews.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-gold/90 text-black text-xs font-medium px-3 py-1">
                {featuredNews.category}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-4 text-sm text-silver">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2" />
                  <span>{new Date(featuredNews.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              <h2 className="text-3xl font-light mb-4">{featuredNews.title}</h2>
              <p className="text-silver text-lg mb-8">{featuredNews.excerpt}</p>
              <button className="gofit-button flex items-center">
                Read Full Story <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* News Grid */}
      <section className="py-20 bg-black">
        <div className="gofit-container">
          {/* Filter and Search */}
          <div 
            className={`mb-10 transition-all duration-1000 ease-out ${
              isVisible.news ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="flex flex-wrap gap-4 mb-6">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-4 py-2 text-sm capitalize ${
                    activeFilter === category 
                      ? 'bg-gold text-black' 
                      : 'bg-charcoal text-white hover:bg-white/10'
                  } transition-colors`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-charcoal border border-white/20 p-4 text-white placeholder-gray-400 focus:border-gold focus:outline-none"
              />
            </div>
          </div>
          
          {/* News Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item, index) => (
              <div 
                key={item.id}
                className={`bg-charcoal border border-white/10 group hover:border-gold/30 transition-all duration-500 ${
                  isVisible.news ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden aspect-video">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-gold/90 text-black text-xs font-medium px-3 py-1">
                    {item.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-silver mb-3">
                    <Calendar size={14} className="mr-2" />
                    <span>{new Date(item.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <h3 className="text-xl mb-3 font-light">{item.title}</h3>
                  <p className="text-silver mb-4 text-sm">{item.excerpt}</p>
                  <button className="text-gold flex items-center text-sm group-hover:text-white transition-colors">
                    Read More <ChevronRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-silver">No news found matching your search.</p>
            </div>
          )}
          
          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center border border-white/20 bg-charcoal text-white hover:bg-gold hover:text-black hover:border-gold">
                1
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-white/20 bg-black text-white hover:bg-gold hover:text-black hover:border-gold">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-white/20 bg-black text-white hover:bg-gold hover:text-black hover:border-gold">
                3
              </button>
              <span className="text-silver mx-2">...</span>
              <button className="w-10 h-10 flex items-center justify-center border border-white/20 bg-black text-white hover:bg-gold hover:text-black hover:border-gold">
                8
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;
