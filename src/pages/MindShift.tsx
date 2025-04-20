
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';

const Awareness = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: "Virtual Fitness Awareness Workshop",
      date: "2024-06-15",
      time: "10:00 AM - 12:00 PM",
      location: "Online Zoom Session",
      image: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      participants: 42,
      description: "Join us for an interactive workshop on health and fitness awareness. Learn about sustainable fitness practices and maintaining long-term health."
    },
    {
      id: 2,
      title: "Mental Health and Fitness",
      date: "2024-06-22",
      time: "2:00 PM - 4:00 PM",
      location: "Community Center, New York",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      participants: 28,
      description: "Explore the connection between mental well-being and physical fitness in this enlightening seminar led by experts in both fields."
    },
    {
      id: 3,
      title: "Nutrition Awareness Campaign",
      date: "2024-07-05",
      time: "9:00 AM - 3:00 PM",
      location: "Central Park, New York",
      image: "https://images.unsplash.com/photo-1505576633757-0ac1084af824?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80",
      participants: 120,
      description: "Join us for a day of nutrition education, healthy food demonstrations, and expert talks on maintaining a balanced diet for optimal health."
    }
  ]);
  
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      title: "30-Day Fitness Challenge",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Join our community-wide fitness challenge to establish daily exercise habits.",
      participants: 2584,
      progress: 68
    },
    {
      id: 2,
      title: "Hydration Awareness",
      image: "https://images.unsplash.com/photo-1564419320461-6870880221ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Promoting proper hydration habits for better health and fitness performance.",
      participants: 1842,
      progress: 45
    },
    {
      id: 3,
      title: "Mental Health & Fitness",
      image: "https://images.unsplash.com/photo-1598386651573-9232cc0c2d6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Raising awareness about the connection between mental wellbeing and physical health.",
      participants: 3105,
      progress: 75
    }
  ]);
  
  const [isVisible, setIsVisible] = useState({
    hero: false,
    events: false,
    campaigns: false
  });

  useEffect(() => {
    // Set initial visibility after a slight delay
    setTimeout(() => {
      setIsVisible({
        hero: true,
        events: true,
        campaigns: true
      });
    }, 300);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1579758629938-03607ccdbaba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80")',
          }}
        ></div>
        <div className="gofit-container relative z-10">
          <div 
            className={`max-w-2xl transition-all duration-1000 ease-out ${
              isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <h1 className="section-heading mb-6">Fitness Awareness</h1>
            <p className="text-xl text-silver font-light mb-8">
              Join our mission to promote fitness awareness and education to communities worldwide. 
              Together we can create a healthier, more active world.
            </p>
            <button className="gofit-button">
              Join Our Movement
            </button>
          </div>
        </div>
      </section>
      
      {/* Upcoming Events Section */}
      <section className="py-20 bg-charcoal">
        <div className="gofit-container">
          <div 
            className={`text-center mb-12 transition-all duration-1000 ease-out ${
              isVisible.events ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <h2 className="section-heading">Upcoming Events</h2>
            <p className="section-subheading max-w-3xl mx-auto">
              Participate in our awareness events to learn, connect, and grow with like-minded individuals 
              who share your passion for fitness and wellbeing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event, index) => (
              <div 
                key={event.id}
                className={`bg-black border border-white/10 group hover:border-gold/30 overflow-hidden transition-all duration-500 ${
                  isVisible.events ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-light mb-4">{event.title}</h3>
                  <p className="text-silver text-sm mb-6">{event.description}</p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <Calendar size={16} className="text-gold mr-3" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock size={16} className="text-gold mr-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin size={16} className="text-gold mr-3" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users size={16} className="text-gold mr-3" />
                      <span>{event.participants} participants</span>
                    </div>
                  </div>
                  <button className="w-full py-3 border border-gold text-gold hover:bg-gold hover:text-black transition-colors group-hover:bg-gold group-hover:text-black">
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="gofit-button-outline">
              View All Events <ChevronRight className="ml-2 inline-block" size={18} />
            </button>
          </div>
        </div>
      </section>
      
      {/* Awareness Campaigns */}
      <section className="py-20 bg-black">
        <div className="gofit-container">
          <div 
            className={`text-center mb-12 transition-all duration-1000 ease-out ${
              isVisible.campaigns ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <h2 className="section-heading">Ongoing Campaigns</h2>
            <p className="section-subheading max-w-3xl mx-auto">
              Our awareness campaigns are designed to educate and inspire communities to embrace healthier lifestyles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign, index) => (
              <div 
                key={campaign.id}
                className={`bg-charcoal border border-white/10 group hover:border-gold/30 overflow-hidden transition-all duration-500 ${
                  isVisible.campaigns ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={campaign.image} 
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-6 py-3 bg-gold text-black">
                      Join Campaign
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-light mb-3">{campaign.title}</h3>
                  <p className="text-silver text-sm mb-4">{campaign.description}</p>
                  
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Campaign Progress</span>
                    <span className="text-gold">{campaign.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/50 mb-4">
                    <div 
                      className="h-full bg-gold transition-all duration-700"
                      style={{ width: `${campaign.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Users size={16} className="text-gold mr-2" />
                    <span>{campaign.participants.toLocaleString()} participants</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Awareness;
