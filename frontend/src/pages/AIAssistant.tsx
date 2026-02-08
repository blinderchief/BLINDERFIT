import { useState } from 'react';
import { PersonalizedAI } from '@/components/PersonalizedAI';
import { Helmet } from 'react-helmet';

const AIAssistantPage = () => {
  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>AI Assistant | BlinderFit</title>
        <meta name="description" content="Get personalized fitness advice, nutrition guidance, and health insights powered by AI." />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">BlinderFit AI Assistant</h1>
          <p className="mt-2 text-muted-foreground">
            Personalized fitness advice, nutrition guidance, and health insights powered by AI
          </p>
        </div>
        
        <PersonalizedAI />
      </div>
    </div>
  );
};

export default AIAssistantPage;
