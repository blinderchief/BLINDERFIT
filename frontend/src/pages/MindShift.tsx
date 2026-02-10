
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';

const MindShift = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: "Morning Clarity: Guided Meditation",
      date: "2026-02-20",
      time: "7:00 AM - 7:30 AM",
      location: "In-App Guided Session",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      participants: 184,
      description: "Start your day with a guided body-scan meditation and focused breathing. Research shows 40% reduction in exercise anxiety with regular mindfulness practice."
    },
    {
      id: 2,
      title: "Stress-Recovery Workshop: Breathwork for Athletes",
      date: "2026-02-25",
      time: "6:00 PM - 7:00 PM",
      location: "Live Virtual Session",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
      participants: 96,
      description: "Learn breathwork techniques (box breathing, 4-7-8 method) that activate your parasympathetic nervous system and reduce cortisol levels by up to 18%."
    },
    {
      id: 3,
      title: "Sleep Optimization Masterclass",
      date: "2026-03-05",
      time: "9:00 PM - 9:45 PM",
      location: "In-App Guided Session",
      image: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
      participants: 238,
      description: "Progressive muscle relaxation and wind-down protocols that adapt based on your training load. Heavier training days trigger deeper recovery sessions."
    }
  ]);
  
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      title: "21-Day Stress Reset Challenge",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Daily breathwork and meditation sessions designed to lower cortisol, improve HRV, and build lasting stress management habits.",
      participants: 1847,
      progress: 68
    },
    {
      id: 2,
      title: "Sleep Quality Optimization",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Progressive wind-down protocols that adapt to your training load. Track sleep stages and see recovery score improvements.",
      participants: 2156,
      progress: 52
    },
    {
      id: 3,
      title: "Mindful Movement: Yoga & Breathwork",
      image: "https://images.unsplash.com/photo-1598386651573-9232cc0c2d6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      description: "Gentle yoga flows combined with breathwork for body-mind connection. Uses motivational coaching instead of shame-inducing streak tracking.",
      participants: 3210,
      progress: 78
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
            <h1 className="section-heading mb-6">MindShift</h1>
            <p className="text-xl text-silver font-light mb-8">
              Your mind and body are one system. Research shows users who integrate mental wellness 
              with fitness see 3× better adherence. MindShift connects stress management, sleep 
              optimization, and mindfulness directly to your training.
            </p>
            <button className="gofit-button">
              Start Your Practice
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
            <h2 className="section-heading">Guided Sessions</h2>
            <p className="section-subheading max-w-3xl mx-auto">
              Science-backed meditation, breathwork, and relaxation sessions designed specifically 
              for people who train. Each session adapts based on your stress and recovery data.
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
                    Start Session
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="gofit-button-outline">
              View All Sessions <ChevronRight className="ml-2 inline-block" size={18} />
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
            <h2 className="section-heading">Wellness Programs</h2>
            <p className="section-subheading max-w-3xl mx-auto">
              Multi-week programs that integrate mental wellness with your fitness routine. 
              Uses empathetic coaching — not shame-inducing streak trackers.
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

export default MindShift;
