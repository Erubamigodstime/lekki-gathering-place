import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLMSOpen, setIsLMSOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    // Close dropdown and mobile menu first
    setIsDropdownOpen(false);
    setIsOpen(false);
    
    // Always scroll to section, don't navigate
    const element = document.getElementById(sectionId);
    if (element) {
      // If element exists, we're already on the right page
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (location.pathname !== '/') {
      // Element doesn't exist, we need to go to home page
      // Use replace to avoid adding to history
      window.location.href = `/#${sectionId}`;
    }
  };

  const lmsMenuItems = [
    { label: 'Platform Introduction', id: 'intro' },
    { label: 'Platform Features', id: 'features' },
    { label: 'Attendance System', id: 'attendance' },
    { label: 'Analytics & Insights', id: 'analytics' },
    { label: 'Problem & Solution', id: 'problem-solution' },
    { label: 'Awards & Certificates', id: 'awards' },
    { label: 'Why This Matters', id: 'why-matters' },
  ];

  return (
    <header className="sticky lg:absolute top-0 left-0 right-0 z-50 bg-primary lg:bg-transparent shadow-md lg:shadow-none">
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between py-5">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img 
              src="/images/logo.png" 
              alt="Lekki Gathering Place Logo" 
              width="550"
              height="100"
              className="h-30 w-20 object-contain"
              fetchPriority="high"
              decoding="async"
            />
            <p className="text-white text-lg font-semibold">Lekki Stake Gathering Place</p>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-10">
            <button 
              onClick={() => scrollToSection('hero')} 
              className="text-accent font-medium hover:text-accent/80 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('classes')} 
              className="text-primary-foreground/80 font-medium hover:text-primary-foreground transition-colors"
            >
              Classes
            </button>
            <button 
              onClick={() => scrollToSection('instructors')} 
              className="text-primary-foreground/80 font-medium hover:text-primary-foreground transition-colors"
            >
              Instructors
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsLMSOpen(!isLMSOpen)}
                className="flex items-center gap-1 text-primary-foreground/80 font-medium hover:text-primary-foreground transition-colors focus:outline-none"
              >
                LMS
                <ChevronDown className="w-4 h-4" />
              </button>
              {isLMSOpen && (
                <div className="absolute top-full left-0 mt-2 py-2 bg-green-50 border border-green-200 rounded-lg shadow-lg min-w-[200px] z-50">
                  {lmsMenuItems.map((item) => (
                    <a
                      key={item.id}
                      href={`/#${item.id}`}
                      onClick={(e) => {
                        if (location.pathname === '/') {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        setIsLMSOpen(false);
                      }}
                      className="block px-4 py-2 text-slate-800 hover:bg-green-100 cursor-pointer"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button 
              variant="outline" 
              className="rounded-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary px-6"
              onClick={() => navigate('/login')}
            >
              Sign In
              <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-accent-foreground bg-accent p-2 rounded-lg hover:bg-gathering-yellow-hover transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Menu Sidebar */}
        <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[hsl(152,54%,18%)] z-[60] lg:hidden transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="p-6 border-b border-primary-foreground/10">
              <a href="/" className="flex items-center gap-3">
                <img 
                  src="/images/logo.png" 
                  alt="Lekki Gathering Place Logo" 
                  width="60"
                  height="60"
                  className="h-16 w-16 object-contain"
                  decoding="async"
                />
                <p className="text-white text-base font-semibold leading-tight">Lekki Stake<br />Gathering Place</p>
              </a>
            </div>

            {/* Mobile Menu Links */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => scrollToSection('hero')} 
                  className="text-accent font-medium py-3 px-4 rounded-lg hover:bg-primary-foreground/5 transition-colors text-left"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('classes')} 
                  className="text-primary-foreground/80 font-medium py-3 px-4 rounded-lg hover:bg-primary-foreground/5 transition-colors text-left"
                >
                  Classes
                </button>
                <button 
                  onClick={() => scrollToSection('instructors')} 
                  className="text-primary-foreground/80 font-medium py-3 px-4 rounded-lg hover:bg-primary-foreground/5 transition-colors text-left"
                >
                  Instructors
                </button>
                
                {/* LMS Accordion */}
                <div>
                  <button 
                    onClick={() => setIsLMSOpen(!isLMSOpen)}
                    className="w-full flex items-center justify-between text-primary-foreground/80 font-medium py-3 px-4 rounded-lg hover:bg-primary-foreground/5 transition-colors"
                  >
                    LMS
                    <ChevronDown className={`w-4 h-4 transition-transform ${isLMSOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isLMSOpen && (
                    <div className="ml-4 mt-1 flex flex-col gap-1">
                      {lmsMenuItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className="text-primary-foreground/60 text-sm font-medium py-2 px-4 rounded-lg hover:bg-primary-foreground/5 transition-colors text-left"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Menu Footer */}
            <div className="p-6 border-t border-primary-foreground/10">
              <Button 
                className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
