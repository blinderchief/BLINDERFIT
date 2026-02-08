
import { useState, useEffect } from 'react';
import { Activity, Award, Heart, TrendingUp, Users, Zap } from 'lucide-react';

const About = () => {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    mission: false,
    values: false,
    team: false
  });

  useEffect(() => {
    // Set initial visibility after a slight delay
    setTimeout(() => {
      setIsVisible({
        hero: true,
        mission: true,
        values: true,
        team: true
      });
    }, 300);
  }, []);

  const teamMembers = [
    {
      name: "Allison Parker",
      role: "Founder & CEO",
      bio: "Former Olympic athlete with a passion for technology and fitness innovation.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80"
    },
    {
      name: "Marcus Chen",
      role: "Chief Technology Officer",
      bio: "AI specialist with a background in health sciences and machine learning.",
      image: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1036&q=80"
    },
    {
      name: "Sarah Rodriguez",
      role: "Head of Nutrition",
      bio: "Registered dietitian with expertise in performance nutrition for athletes.",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
    },
    {
      name: "David Walker",
      role: "Chief Fitness Officer",
      bio: "Former professional trainer with 15+ years of experience coaching elite athletes.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
    }
  ];

  const values = [
    {
      icon: <Heart className="h-10 w-10 text-gold" />,
      title: "Health First",
      description: "We believe in placing health and wellbeing above all else. Our approach is holistic, considering both physical and mental aspects of fitness."
    },
    {
      icon: <Users className="h-10 w-10 text-gold" />,
      title: "Community",
      description: "Building supportive communities that celebrate progress and provide encouragement is fundamental to our mission."
    },
    {
      icon: <Award className="h-10 w-10 text-gold" />,
      title: "Excellence",
      description: "We are committed to excellence in everything we do, from the accuracy of our technology to the quality of our content."
    },
    {
      icon: <Activity className="h-10 w-10 text-gold" />,
      title: "Personalization",
      description: "We recognize that every body is unique. Our solutions are tailored to individual needs, goals, and circumstances."
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-gold" />,
      title: "Innovation",
      description: "We continuously push boundaries to create cutting-edge solutions that make fitness more accessible and effective."
    },
    {
      icon: <Zap className="h-10 w-10 text-gold" />,
      title: "Empowerment",
      description: "We aim to empower individuals with knowledge and tools to take control of their fitness journey."
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1626889248429-2f0eafbd5a63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80")',
          }}
        ></div>
        <div className="gofit-container relative z-10 text-center">
          <div 
            className={`max-w-3xl mx-auto transition-all duration-1000 ease-out ${
              isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <h1 className="section-heading mb-6">About BlinderFit</h1>
            <p className="text-xl text-silver font-light mb-4">
              The story behind our mission to transform fitness through technology and personalization.
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Mission Section */}
      <section className="py-20 bg-charcoal">
        <div className="gofit-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div 
              className={`transition-all duration-1000 ease-out ${
                isVisible.mission ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
            >
              <h2 className="text-3xl font-light mb-6">Our Mission</h2>
              <p className="text-silver font-light mb-6 text-lg">
                At BlinderFit, we're on a mission to democratize personalized fitness through the power of artificial intelligence and data science.
              </p>
              <p className="text-silver font-light mb-6">
                We believe that everyone deserves access to fitness guidance that's tailored to their unique body, goals, and circumstances. Traditional one-size-fits-all approaches to fitness often fail because they don't account for individual differences.
              </p>
              <p className="text-silver font-light">
                Through our advanced AI technology, we're able to analyze countless data points to create truly personalized fitness plans that adapt and evolve as you progress. This isn't just about helping you look better – it's about enhancing your overall quality of life through improved physical health.
              </p>
            </div>
            <div 
              className={`relative aspect-square transition-all duration-1000 ease-out ${
                isVisible.mission ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              }`}
            >
              <div className="absolute inset-0 bg-gold/20 translate-x-4 translate-y-4"></div>
              <div 
                className="absolute inset-0 bg-cover bg-center border-4 border-black"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80")'
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values */}
      <section className="py-20 bg-black">
        <div className="gofit-container">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ease-out ${
              isVisible.values ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <h2 className="section-heading">Our Core Values</h2>
            <p className="section-subheading max-w-3xl mx-auto">
              These principles guide everything we do at BlinderFit, from product development to customer service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className={`bg-charcoal border border-white/10 p-8 transition-all duration-500 ease-out ${
                  isVisible.values ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="mb-6">{value.icon}</div>
                <h3 className="text-xl font-light tracking-wide text-white mb-4">{value.title}</h3>
                <p className="text-silver font-light">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Our Team */}
      <section className="py-20 bg-charcoal">
        <div className="gofit-container">
          <div 
            className={`text-center mb-16 transition-all duration-1000 ease-out ${
              isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <h2 className="section-heading">Meet Our Team</h2>
            <p className="section-subheading max-w-3xl mx-auto">
              The passionate individuals behind BlinderFit who are dedicated to revolutionizing the fitness industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className={`bg-black border border-white/10 hover:border-gold/30 overflow-hidden transition-all duration-500 ${
                  isVisible.team ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-light mb-1">{member.name}</h3>
                  <p className="text-gold text-sm mb-3">{member.role}</p>
                  <p className="text-silver text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
