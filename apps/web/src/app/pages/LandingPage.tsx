import { useState } from 'react';
import { Link } from 'react-router';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { AIRecommendationBar } from '../components/AIRecommendationBar';
import { SmartFilters } from '../components/SmartFilters';
import { MixedFeed } from '../components/MixedFeed';
import { SuperAppModules } from '../components/SuperAppModules';
import { ARTryOnSection } from '../components/ARTryOnSection';
import { NearbyCommerceHub } from '../components/NearbyCommerceHub';
import { CreatorHotboard } from '../components/CreatorHotboard';
import { LiveEventsShowcase } from '../components/LiveEventsShowcase';
import { AIDailySummary } from '../components/AIDailySummary';
import { HorizontalCarousels } from '../components/HorizontalCarousels';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';
import { SEO, SEOConfigs, generateStructuredData } from '../components/SEO';

export default function LandingPage() {
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        {...SEOConfigs.home}
        jsonLd={generateStructuredData.website()}
      />
      
      <Navbar onVoiceClick={() => setShowVoiceAssistant(!showVoiceAssistant)} />
      
      {/* Voice Assistant Overlay */}
      {showVoiceAssistant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center">
          <div className="p-12 rounded-3xl text-white text-center max-w-md shadow-2xl" style={{ background: 'var(--brand-gradient)' }}>
            <div className="w-32 h-32 mx-auto mb-6 bg-primary-foreground/20 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-24 h-24 bg-primary-foreground/30 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-primary-foreground/40 rounded-full"></div>
              </div>
            </div>
            <p className="mb-4">AI Voice Assistant Listening...</p>
            <p className="text-sm opacity-80 mb-6">Try: "Show trending fashion" or "Find deals near me"</p>
            <button 
              onClick={() => setShowVoiceAssistant(false)}
              className="px-8 py-3 bg-card text-primary rounded-full hover:bg-muted transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <HeroSection />
      
      <div className="max-w-[1920px] mx-auto">
        <AIRecommendationBar />
        <AIDailySummary />
        <SmartFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <SuperAppModules />
        <LiveEventsShowcase />
        <HorizontalCarousels />
        <MixedFeed filter={activeFilter} />
        <ARTryOnSection />
        <CreatorHotboard />
        <NearbyCommerceHub />
        <Testimonials />
      </div>
      
      <Footer />
    </div>
  );
}