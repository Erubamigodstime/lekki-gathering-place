import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, GraduationCap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChurchLogo } from '@/components/ChurchLogo';
import { useState, useEffect } from 'react';

const heroImages = [
  '/images/hero-1.jpg',
  '/images/hero-2.jpg',
  '/images/hero-3.jpg',
  '/images/hero-4.jpg',
  '/images/hero-5.jpg',
];

const features = [
  {
    icon: BookOpen,
    title: 'Skill-Based Learning',
    description: 'Access a variety of skill training classes tailored for church members.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Learn alongside fellow church members in a supportive environment.',
  },
  {
    icon: GraduationCap,
    title: 'Expert Instructors',
    description: 'Train under experienced instructors dedicated to your growth.',
  },
];

const stats = [
  { value: '500+', label: 'Active Students' },
  { value: '50+', label: 'Skilled Instructors' },
  { value: '30+', label: 'Training Courses' },
  { value: '15', label: 'Wards Served' },
];

export default function Index() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <ChurchLogo size="sm" />
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="church">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated Background Images */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{
                opacity: currentImageIndex === index ? 1 : 0,
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Develop Your Skills,{' '}
              <span className="text-church-gold">Serve With Purpose</span>
            </h1>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join our church's skill acquisition center and discover your God-given talents. Learn practical skills that empower you to serve and contribute to your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="gold" size="xl" className="w-full sm:w-auto">
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-church-gold-light mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              Why Choose SkillGather?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed specifically for church communities to nurture and develop talents.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Sign up today and discover a wide range of skill training classes available at your church.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button variant="church" size="lg">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Already a Member? Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <ChurchLogo size="sm" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SkillGather Church Training Center. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
