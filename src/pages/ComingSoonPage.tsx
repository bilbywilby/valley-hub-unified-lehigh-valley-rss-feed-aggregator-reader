import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction } from 'lucide-react';
import { Link } from 'react-router-dom';
interface ComingSoonPageProps {
  title?: string;
}
export function ComingSoonPage({ title = "Coming Soon" }: ComingSoonPageProps) {
  return (
    <AppLayout container={true}>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="w-24 h-24 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-4"
        >
          <Construction className="w-12 h-12" />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We're building something special for the Lehigh Valley. This feature is currently in development.
          </p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="default" className="btn-gradient">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
            </Link>
          </Button>
        </div>
        <div className="pt-8 grid grid-cols-3 gap-8 opacity-20">
          <div className="h-1 bg-brand-orange rounded-full"></div>
          <div className="h-1 bg-brand-orange rounded-full animate-pulse"></div>
          <div className="h-1 bg-brand-orange rounded-full"></div>
        </div>
      </div>
    </AppLayout>
  );
}