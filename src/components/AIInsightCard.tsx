import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface AIInsightCardProps {
  key?: React.Key;
  message: string;
  onDismiss: () => void;
}

export default function AIInsightCard({ message, onDismiss }: AIInsightCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="bg-ai-bg border border-ai-border rounded-xl p-5 relative overflow-hidden"
    >
      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
        <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor" className="text-accent">
          <polygon points="50,10 90,90 10,90" opacity="0.3" />
          <polygon points="50,30 80,90 20,90" opacity="0.6" />
          <polygon points="50,50 70,90 30,90" />
        </svg>
      </div>
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <h4 className="font-bold text-accent text-xs tracking-widest uppercase">AI Coach</h4>
      </div>
      
      <div className="relative z-10">
        <p className="text-primary leading-relaxed mb-5 text-sm">
          "You're <span className="text-accent font-semibold">60%</span> through your morning flow. Focus on the final slides next. You've been most productive in these 20-minute bursts."
        </p>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors">
            Set Timer
          </button>
          <button 
            onClick={onDismiss}
            className="px-4 py-2 bg-button-secondary hover:bg-card-border text-primary text-sm font-medium rounded-lg transition-colors border border-transparent"
          >
            Hide Tip
          </button>
        </div>
      </div>
    </motion.div>
  );
}
