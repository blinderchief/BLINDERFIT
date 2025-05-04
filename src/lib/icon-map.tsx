import { Leaf, Dumbbell, CircuitBoard, ChevronRight, ArrowRight, Mail, MessageCircle } from 'lucide-react';
import React from 'react';

export const IconMap: Record<string, React.ReactNode> = {
  "Leaf": <Leaf className="h-8 w-8 text-gold" />,
  "Dumbbell": <Dumbbell className="h-8 w-8 text-gold" />,
  "CircuitBoard": <CircuitBoard className="h-8 w-8 text-gold" />,
  "ChevronRight": <ChevronRight className="h-8 w-8 text-gold" />,
  "ArrowRight": <ArrowRight className="h-8 w-8 text-gold" />,
  "Mail": <Mail className="h-8 w-8 text-gold" />,
  "MessageCircle": <MessageCircle className="h-8 w-8 text-gold" />
  // Add more icon mappings as needed
};