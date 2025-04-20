
import { useState } from 'react';
import { Users, Share2, ThumbsUp, MessageSquare, ChevronRight, Award } from 'lucide-react';

const TribeVibe = () => {
  const [activeTab, setActiveTab] = useState('feed');
  
  return (
    <div className="min-h-[calc(100vh-96px)] bg-black">
      <div className="gofit-container py-12">
        <div className="mb-10 text-center">
          <h1 className="section-heading mb-4">Welcome to TribeVibe</h1>
          <p className="text-silver max-w-3xl mx-auto">BlinderFit's Beta Community</p>
        </div>
        
        <div className="mb-10 max-w-3xl mx-auto p-8 border border-gold/20 bg-black/80 backdrop-blur-sm text-center">
          <Award className="h-16 w-16 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-light text-white mb-4">As a First 1,000 member, enjoy exclusive recipes</h2>
          <p className="text-gray-300 mb-6">
            Thank you for being one of our early adopters. Access exclusive content like Suyash's Masala Smoothie recipe and connect with other fitness enthusiasts.
          </p>
          <div className="bg-emerald-900/20 p-4 border-l-2 border-emerald-500 text-left mb-6">
            <h3 className="text-white font-medium text-lg mb-2">Suyash's Masala Smoothie</h3>
            <ul className="list-disc pl-5 text-gray-300 space-y-1">
              <li>1 banana</li>
              <li>1 cup spinach</li>
              <li>½ cup Greek yogurt</li>
              <li>1 tbsp almond butter</li>
              <li>¼ tsp turmeric</li>
              <li>¼ tsp cinnamon</li>
              <li>Pinch of cardamom</li>
              <li>1 cup almond milk</li>
              <li>Ice cubes (optional)</li>
            </ul>
            <p className="mt-3 text-sm text-gray-400">
              Blend all ingredients until smooth. Enjoy post-workout for optimal recovery and mental clarity.
            </p>
          </div>
          <button className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm transition-colors flex items-center justify-center mx-auto">
            Join Challenge <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-[#111] border border-white/10 p-6 rounded-sm">
              <div className="flex border-b border-white/10 mb-6">
                <button 
                  onClick={() => setActiveTab('feed')}
                  className={`px-6 py-3 font-light ${activeTab === 'feed' ? 'border-b-2 border-gold text-gold' : 'text-gray-400 hover:text-white'}`}
                >
                  Community Feed
                </button>
                <button 
                  onClick={() => setActiveTab('challenges')}
                  className={`px-6 py-3 font-light ${activeTab === 'challenges' ? 'border-b-2 border-gold text-gold' : 'text-gray-400 hover:text-white'}`}
                >
                  Challenges
                </button>
              </div>
              
              {activeTab === 'feed' && (
                <div className="space-y-6">
                  {/* Post 1 */}
                  <div className="border border-white/10 p-4 rounded-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                        S
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Suyash Kumar Singh</h3>
                        <p className="text-gray-400 text-sm">Founder, BlinderFit • 2 hours ago</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Excited to welcome our first 1,000 members to the BlinderFit community! Our vision is to transform how we perceive fitness — not just as physical activity, but as a journey of clarity and purpose. Share your experiences below!
                    </p>
                    <img 
                      src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
                      alt="Community welcome" 
                      className="w-full h-48 object-cover rounded-sm mb-4"
                    />
                    <div className="flex justify-between text-gray-400 border-t border-white/10 pt-3">
                      <button className="flex items-center gap-1 hover:text-gold">
                        <ThumbsUp className="h-4 w-4" /> <span>32</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-gold">
                        <MessageSquare className="h-4 w-4" /> <span>8</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-gold">
                        <Share2 className="h-4 w-4" /> <span>Share</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Post 2 */}
                  <div className="border border-white/10 p-4 rounded-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                        A
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Alex M.</h3>
                        <p className="text-gray-400 text-sm">Early Adopter • 6 hours ago</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Just tried Suyash's Masala Smoothie recipe - game changer! The cardamom and turmeric make it unique, and I definitely felt more alert during my morning workout. Highly recommend to anyone looking for something different.
                    </p>
                    <div className="flex justify-between text-gray-400 border-t border-white/10 pt-3">
                      <button className="flex items-center gap-1 hover:text-gold">
                        <ThumbsUp className="h-4 w-4" /> <span>17</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-gold">
                        <MessageSquare className="h-4 w-4" /> <span>4</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-gold">
                        <Share2 className="h-4 w-4" /> <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'challenges' && (
                <div className="space-y-6">
                  <div className="border border-white/10 p-4 rounded-sm bg-gradient-to-r from-gold/5 to-transparent">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-white text-lg font-medium">7-Day Vision Quest</h3>
                      <span className="bg-gold/20 text-gold px-2 py-0.5 rounded-sm text-xs">Active</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Complete 7 consecutive days of training to unlock enhanced clarity features and earn exclusive badges.
                    </p>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400 text-sm">Progress: 65%</span>
                      <span className="text-gold text-sm">89 participants</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full mb-4">
                      <div className="bg-gold h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <button className="py-2 px-4 bg-gold hover:bg-gold/90 text-black rounded-sm transition-colors">
                      Join Challenge
                    </button>
                  </div>
                  
                  <div className="border border-white/10 p-4 rounded-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-white text-lg font-medium">30-Day Mental Clarity</h3>
                      <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded-sm text-xs">Coming Soon</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Our upcoming challenge focuses on daily meditation and journaling combined with strategic physical training.
                    </p>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400 text-sm">Launch: Apr 25, 2025</span>
                      <span className="text-gold text-sm">45 pre-registered</span>
                    </div>
                    <button className="py-2 px-4 border border-gold text-gold hover:bg-gold/10 rounded-sm transition-colors">
                      Get Notified
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/10 p-6 rounded-sm">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-gold mr-2" />
                <h3 className="text-lg font-light text-white">Community Stats</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-300">Members</span>
                  <span className="text-gold">973</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-300">Active Challenges</span>
                  <span className="text-gold">3</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-300">Recipes Shared</span>
                  <span className="text-gold">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Exclusive Content</span>
                  <span className="text-gold">15</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#111] border border-white/10 p-6 rounded-sm">
              <h3 className="text-lg font-light text-white mb-4">Top Contributors</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                    S
                  </div>
                  <div>
                    <h4 className="text-white">Suyash Kumar Singh</h4>
                    <p className="text-xs text-gray-400">Founder</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300">
                    M
                  </div>
                  <div>
                    <h4 className="text-white">Maya J.</h4>
                    <p className="text-xs text-gray-400">Nutrition Expert</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-gray-300">
                    R
                  </div>
                  <div>
                    <h4 className="text-white">Raj K.</h4>
                    <p className="text-xs text-gray-400">Mindfulness Coach</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gold/20 to-black p-6 rounded-sm">
              <h3 className="text-lg font-medium text-white mb-2">Join the Conversation</h3>
              <p className="text-gray-300 text-sm mb-4">
                Share your fitness journey, ask questions, and connect with like-minded individuals.
              </p>
              <button className="w-full py-2 bg-gold hover:bg-gold/90 text-black text-sm transition-colors">
                Create Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TribeVibe;
