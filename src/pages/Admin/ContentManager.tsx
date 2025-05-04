import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { PageContent, HeroImage, VisionFeature } from '@/lib/content';

// Define type for page content 
interface ContentState {
  id?: number;
  page: string;
  heroImages: HeroImage[];
  visionText: {
    heading: string;
    quote: string;
    description: string;
  };
  visionFeatures: VisionFeature[];
  created_at?: string;
  updated_at?: string;
}

const ContentManager = () => {
  const { user } = useAuth();
  const [pageContent, setPageContent] = useState<ContentState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('hero');
  
  useEffect(() => {
    // Check if user has admin role
    if (!user) {
      return;
    }
    
    const loadContent = async () => {
      try {
        const { data, error } = await supabase
          .from('page_content' as any)
          .select('*')
          .eq('page', 'home')
          .single();
          
        if (error) throw error;
        if (data) {
          setPageContent(data as unknown as ContentState);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive"
        });
        
        // Initialize with empty data if not found
        setPageContent({
          page: 'home',
          heroImages: [],
          visionText: {
            heading: '',
            quote: '',
            description: ''
          },
          visionFeatures: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [user]);
  
  const handleSave = async () => {
    if (!pageContent) return;
    
    setIsSaving(true);
    try {
      // Check if content exists
      const { data: existingData, error: checkError } = await supabase
        .from('page_content' as any)
        .select('id')
        .eq('page', 'home')
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }
      
      const updatedContent = {
        ...pageContent,
        updated_at: new Date().toISOString()
      };
      
      if (existingData && 'id' in existingData) {
        // Update existing record
        const { error } = await supabase
          .from('page_content' as any)
          .update(updatedContent)
          .eq('id', existingData.id);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('page_content' as any)
          .insert({
            ...updatedContent,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: `Failed to update content: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle hero image updates
  const updateHeroImage = (index: number, field: keyof HeroImage, value: string) => {
    if (!pageContent) return;
    
    const newHeroImages = [...pageContent.heroImages];
    newHeroImages[index] = {
      ...newHeroImages[index],
      [field]: value
    };
    
    setPageContent({
      ...pageContent,
      heroImages: newHeroImages
    });
  };
  
  // Add new hero image
  const addHeroImage = () => {
    if (!pageContent) return;
    
    setPageContent({
      ...pageContent,
      heroImages: [
        ...pageContent.heroImages,
        { url: '', message: '', description: '' }
      ]
    });
  };
  
  // Remove hero image
  const removeHeroImage = (index: number) => {
    if (!pageContent) return;
    
    const newHeroImages = [...pageContent.heroImages];
    newHeroImages.splice(index, 1);
    
    setPageContent({
      ...pageContent,
      heroImages: newHeroImages
    });
  };
  
  // Update vision text
  const updateVisionText = (field: keyof typeof pageContent.visionText, value: string) => {
    if (!pageContent) return;
    
    setPageContent({
      ...pageContent,
      visionText: {
        ...pageContent.visionText,
        [field]: value
      }
    });
  };
  
  // Handle vision feature updates
  const updateVisionFeature = (index: number, field: keyof VisionFeature, value: string) => {
    if (!pageContent) return;
    
    const newFeatures = [...pageContent.visionFeatures];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value
    };
    
    setPageContent({
      ...pageContent,
      visionFeatures: newFeatures
    });
  };
  
  // Add new vision feature
  const addVisionFeature = () => {
    if (!pageContent) return;
    
    setPageContent({
      ...pageContent,
      visionFeatures: [
        ...pageContent.visionFeatures,
        { icon: 'Leaf', title: '', description: '' }
      ]
    });
  };
  
  // Remove vision feature
  const removeVisionFeature = (index: number) => {
    if (!pageContent) return;
    
    const newFeatures = [...pageContent.visionFeatures];
    newFeatures.splice(index, 1);
    
    setPageContent({
      ...pageContent,
      visionFeatures: newFeatures
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
        <span className="ml-2 text-gold">Loading content manager...</span>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="mt-2 text-gray-400">You must be logged in as an admin to access this page.</p>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gold">Content Manager</h1>
        <p className="text-gray-400">Update the website content from here</p>
      </header>
      
      <div className="bg-black/60 border border-gold/30 rounded-lg p-6 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="vision">Vision Section</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hero">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium text-white">Hero Images</h2>
                <Button 
                  onClick={addHeroImage}
                  variant="outline"
                  className="flex items-center gap-1 border-gold/50 text-gold"
                >
                  <Plus className="h-4 w-4" />
                  Add Image
                </Button>
              </div>
              
              <Accordion type="single" collapsible className="space-y-4">
                {pageContent?.heroImages.map((image, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border border-gold/20 rounded-md overflow-hidden">
                    <AccordionTrigger className="px-4 py-2 hover:bg-black/40">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">Image {index + 1}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHeroImage(index);
                          }}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                          <Input 
                            value={image.url} 
                            onChange={(e) => updateHeroImage(index, 'url', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="bg-black/30 border-gold/30 focus:border-gold"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                          <Input 
                            value={image.message} 
                            onChange={(e) => updateHeroImage(index, 'message', e.target.value)}
                            placeholder="Main heading for this slide"
                            className="bg-black/30 border-gold/30 focus:border-gold"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                          <Textarea 
                            value={image.description} 
                            onChange={(e) => updateHeroImage(index, 'description', e.target.value)}
                            placeholder="Brief description for this slide"
                            className="bg-black/30 border-gold/30 focus:border-gold min-h-[100px]"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="vision">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-medium text-white mb-4">Vision Text</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Heading</label>
                    <Input 
                      value={pageContent?.visionText.heading || ''} 
                      onChange={(e) => updateVisionText('heading', e.target.value)}
                      placeholder="Section heading"
                      className="bg-black/30 border-gold/30 focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quote</label>
                    <Input 
                      value={pageContent?.visionText.quote || ''} 
                      onChange={(e) => updateVisionText('quote', e.target.value)}
                      placeholder="Featured quote"
                      className="bg-black/30 border-gold/30 focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <Textarea 
                      value={pageContent?.visionText.description || ''} 
                      onChange={(e) => updateVisionText('description', e.target.value)}
                      placeholder="Section description"
                      className="bg-black/30 border-gold/30 focus:border-gold min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium text-white">Vision Features</h2>
                  <Button 
                    onClick={addVisionFeature}
                    variant="outline"
                    className="flex items-center gap-1 border-gold/50 text-gold"
                  >
                    <Plus className="h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {pageContent?.visionFeatures.map((feature, index) => (
                    <AccordionItem key={index} value={`feature-${index}`} className="border border-gold/20 rounded-md overflow-hidden">
                      <AccordionTrigger className="px-4 py-2 hover:bg-black/40">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm">{feature.title || `Feature ${index + 1}`}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVisionFeature(index);
                            }}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Icon</label>
                            <select
                              value={feature.icon}
                              onChange={(e) => updateVisionFeature(index, 'icon', e.target.value)}
                              className="w-full bg-black/30 border border-gold/30 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-gold"
                            >
                              <option value="Leaf">Leaf</option>
                              <option value="Dumbbell">Dumbbell</option>
                              <option value="CircuitBoard">CircuitBoard</option>
                              <option value="ArrowRight">ArrowRight</option>
                              <option value="MessageCircle">MessageCircle</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                            <Input 
                              value={feature.title} 
                              onChange={(e) => updateVisionFeature(index, 'title', e.target.value)}
                              placeholder="Feature title"
                              className="bg-black/30 border-gold/30 focus:border-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                            <Textarea 
                              value={feature.description} 
                              onChange={(e) => updateVisionFeature(index, 'description', e.target.value)}
                              placeholder="Feature description"
                              className="bg-black/30 border-gold/30 focus:border-gold min-h-[100px]"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gold hover:bg-gold/80 text-black font-medium px-8"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default ContentManager;
