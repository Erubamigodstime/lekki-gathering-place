import HeroSection from '@/components/HeroSection';
import Header from '@/components/Header';
import { ClassesShowcase } from '@/components/classes-showcase';
import { InstructorSpotlight } from '@/components/InstructorsSpotlight-new';
import Footer from '@/components/Footer';
import PlatformFeatures from '@/components/PlatformFeatures';
import { AttendanceSystem } from '@/components/AttendanceSystem';
import { AwardsAndCertificates } from '@/components/AwardsAndCertificates';
import { ProblemSolution } from '@/components/ProblemSolution';
import { WhyThisMatters } from '@/components/WhyThisMatters';
import { AnalyticsInsights } from '@/components/AnalyticsInsights';
import { ManagementToolIntro } from '@/components/ManagementToolIntro';
import ScrollToTop from '@/components/ScrollToTop';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';





export default function Index() {
  const location = useLocation();

  useEffect(() => {
    // Handle hash-based navigation
    if (location.hash) {
      const sectionId = location.hash.substring(1); // Remove the #
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen relative bg-white">
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded"
      >
        Skip to main content
      </a>
      
      {/* 3D Animated Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-slate-300 via-green-200/70 to-amber-200/70">
        
        {/* Large visible gradient orbs - darker */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            top: '10%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(27, 94, 61, 0.25) 0%, rgba(27, 94, 61, 0.12) 50%, transparent 100%)',
            animation: 'floatSlow 15s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            bottom: '10%',
            right: '-5%',
            background: 'radial-gradient(circle, rgba(245, 176, 65, 0.3) 0%, rgba(245, 176, 65, 0.15) 50%, transparent 100%)',
            animation: 'floatSlow 18s ease-in-out infinite',
            animationDelay: '3s'
          }}
        />
        <div 
          className="absolute w-[450px] h-[450px] rounded-full blur-3xl"
          style={{
            top: '40%',
            left: '30%',
            background: 'radial-gradient(circle, rgba(27, 94, 61, 0.22) 0%, rgba(27, 94, 61, 0.1) 50%, transparent 100%)',
            animation: 'floatSlow 20s ease-in-out infinite',
            animationDelay: '6s'
          }}
        />
        
        {/* Visible floating particles - more */}
        {[...Array(40)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 
                ? 'rgba(27, 94, 61, 0.7)' 
                : i % 3 === 1 
                ? 'rgba(245, 176, 65, 0.7)' 
                : 'rgba(148, 163, 184, 0.6)',
              boxShadow: i % 3 === 0 
                ? '0 0 25px rgba(27, 94, 61, 0.8)' 
                : i % 3 === 1 
                ? '0 0 25px rgba(245, 176, 65, 0.8)' 
                : '0 0 18px rgba(148, 163, 184, 0.7)',
              animation: `float3d ${Math.random() * 12 + 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
        
        {/* Floating geometric shapes - more */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`shape-${i}`}
            className="absolute"
            style={{
              width: `${Math.random() * 80 + 40}px`,
              height: `${Math.random() * 80 + 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 
                ? 'linear-gradient(135deg, rgba(27, 94, 61, 0.18), rgba(27, 94, 61, 0.1))' 
                : 'linear-gradient(135deg, rgba(245, 176, 65, 0.18), rgba(245, 176, 65, 0.1))',
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '30%' : '15px',
              border: i % 2 === 0 
                ? '2px solid rgba(27, 94, 61, 0.35)' 
                : '2px solid rgba(245, 176, 65, 0.35)',
              animation: `floatRotate ${Math.random() * 20 + 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
        
        {/* Education/Skill Icons - floating */}
        {['📚', '✏️', '🎓', '📖', '🏆', '⭐', '💡', '🎯', '📝', '🔧', '🎨', '💻', '🔨', '✨', '🌟'].map((icon, i) => (
          <div
            key={`icon-${i}`}
            className="absolute text-2xl opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: i % 2 === 0 ? 'hue-rotate(130deg)' : 'hue-rotate(40deg)',
              animation: `float3d ${Math.random() * 15 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>
      
      {/* Content Layer */}
      <div className="relative z-10">
      <Header />
      <main id="main-content" tabIndex={-1}>
      <section id="hero">
        <HeroSection />
      </section>
      <section id="classes">
        <ClassesShowcase />
      </section>
      <section id="instructors">
        <InstructorSpotlight/>
      </section>
      <section id="intro">
        <ManagementToolIntro/>
      </section>
      <section id="features">
        <PlatformFeatures/>
      </section>
      <section id="attendance">
        <AttendanceSystem/>
      </section>
      <section id="analytics">
        <AnalyticsInsights/>
      </section>
      <section id="problem-solution">
        <ProblemSolution/>
      </section>
      <section id="awards">
        <AwardsAndCertificates/>
      </section>
      <section id="why-matters">
        <WhyThisMatters/>
      </section> 
      </main>

      {/* Footer */}
      <Footer/>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
      </div>

    </div>
  );
}
