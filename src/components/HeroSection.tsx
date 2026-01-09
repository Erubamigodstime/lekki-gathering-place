import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";



const heroImages = [
  '/images/hero-1.jpg',
  '/images/hero-2.jpg',
  '/images/hero-3.jpg',
  '/images/hero-4.jpg',
  '/images/hero-5.jpg',
];
const stats = [
  { value: '30', label: 'Students' },
  { value: '7', label: 'Skilled Instructors' },
  { value: '8', label: 'Classes' },
  { value: '7', label: 'Wards Served' },
];



const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  const handleDashboardClick = () => {
    if (isAuthenticated && user) {
      // Navigate to dashboard based on user role
      navigate('/dashboard');
    } else {
      // Navigate to login page if not authenticated
      navigate('/login');
    }
  };

  const handleRegisterClick = () => {
    navigate('/signup');
  };
  return (
    <section className="relative bg-primary min-h-screen overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-16 h-16 border border-primary-foreground/10 rounded-lg rotate-12 opacity-30" />
        <div className="absolute top-40 left-32 w-12 h-12 border border-primary-foreground/10 rounded-lg -rotate-6 opacity-20" />
        <div className="absolute bottom-40 left-20 w-14 h-14 border border-primary-foreground/10 rounded-lg rotate-45 opacity-25" />
        <div className="absolute top-32 right-[45%] w-10 h-10 border border-primary-foreground/10 rounded-lg opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="relative z-10 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-4 sm:mb-6">
              Develop Your Skills,{' '}
              <span className="text-church-gold">Serve With Purpose</span>
            </h1>
            <p className="text-primary-foreground/70 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              Join The Lekki Stake Gathering Place and discover your God-given talents. Learn practical skills that empower you to serve, become financially self reliant and contribute to your community
            </p>

            {/* Search Bar */}
            <div className="relative mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              <input
                type="text"
                placeholder="What do you want to learn?"
                className="w-full py-3 sm:py-4 px-4 sm:px-6 pr-12 sm:pr-14 rounded-full bg-primary-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-accent rounded-full flex items-center justify-center hover:bg-gathering-yellow-hover transition-colors">
                <Search className="w-5 h-5 text-accent-foreground" />
              </button>
            </div>

            {/* Desktop Stats */}
            <div className="hidden lg:flex items-center gap-6 mb-8">
              <div className="flex -space-x-3">
                <img
                  src="https://cdn.prod.website-files.com/6877615c9ceac92697b37112/687c785afe4d6ac8715a511e_Avatar%20Image%203.png"
                  alt="Student"
                  className="w-10 h-10 rounded-full border-2 border-primary"
                />
                <img
                  src="https://cdn.prod.website-files.com/6877615c9ceac92697b37112/687c786d2a972f960df9942d_Avatar%20Image%202.png"
                  alt="Student"
                  className="w-10 h-10 rounded-full border-2 border-primary"
                />
                <img
                  src="https://cdn.prod.website-files.com/6877615c9ceac92697b37112/687c786d667aa812a507ac29_Avatar%20Image%201.png"
                  alt="Student"
                  className="w-10 h-10 rounded-full border-2 border-primary"
                />
              </div>
              <div>
                <p className="text-primary-foreground font-semibold">A Goal of 100+ Student</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-primary-foreground/70 text-sm">4.9/5 Avg. Rating</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button 
                onClick={handleRegisterClick}
                className="rounded-full bg-accent text-accent-foreground hover:bg-gathering-yellow-hover px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold w-full sm:w-auto flex items-center justify-around sm:justify-center gap-2"
              >
                Register Now
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary flex-shrink-0">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </Button>
              <Button 
                onClick={handleDashboardClick}
                className="rounded-full bg-primary-foreground text-primary hover:bg-secondary px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold w-full sm:w-auto flex items-center justify-around sm:justify-center gap-2"
              >
                Go to Dashboard
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent flex-shrink-0">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </Button>
         
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative mt-8 lg:mt-0">
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-3xl lg:rounded-full overflow-hidden w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto aspect-square border-8 border-primary-foreground/10">
                {heroImages.map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt={`Hero image ${index + 1}`}
                    width="500"
                    height="500"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    decoding="async"
                  />
                ))}
              </div>

              {/* Floating Card - Instructors */}
              <div className="hidden lg:block absolute top-10 -left-4 lg:left-0 bg-card rounded-2xl shadow-card p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <img 
                    src="/images/Cap.png" 
                    alt="Instructor Icon" 
                    className="w-10 h-10" />

                    
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">8</p>
                    <p className="text-muted-foreground text-sm">Certified Instructors</p>
                  </div>
                </div>
              </div>

              {/* Floating Card - Courses */}
              <div className="hidden lg:block absolute bottom-32 -left-8 lg:left-4 bg-card rounded-2xl shadow-card p-4 animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                      <img 
                      src="/images/bk.png" 
                      alt="Books Icon" 
                      className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">7</p>
                    <p className="text-muted-foreground text-sm">Classes</p>
                  </div>
                </div>
              </div>

              {/* Floating Card - Students */}
              <div className="hidden lg:block absolute bottom-20 -right-4 lg:right-0 bg-card rounded-2xl shadow-card p-4 animate-float-slow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">30</p>
                    <p className="text-muted-foreground text-sm">Students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills to Learn Section */}
      <div className="bg-primary pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <p className="text-primary-foreground/60 text-sm uppercase tracking-widest text-center mb-8">
            Possible Skills you would learn
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll">
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex items-center gap-8 px-4">
                  {["Graphic design",
                   "Web development", 
                   "Content Creation",
                   "Mobile Photography", 
                   "Video editing", 
                    "Wig Making",
                    "Public Speaking",
                   "Barbing"].map((skill) => (
                    <div key={`${setIndex}-${skill}`} className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="h-10 px-6 bg-primary-foreground/20 rounded-lg flex items-center justify-center whitespace-nowrap">
                        <span className="text-primary-foreground/60 text-sm font-medium">{skill}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
       {/* Mobile Stats Section */}
      <section className="lg:hidden py-12 sm:py-16 bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
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
    </section>
  );
};

export default HeroSection;
