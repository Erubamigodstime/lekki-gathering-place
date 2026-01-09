import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { instructors } from '@/data/instructors';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Cards } from '@/components/ui/cards';
import { Button } from '@/components/ui/button';
import { Badges } from '@/components/ui/badges';
import { Award, MapPin, Mail, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { InstructorSEO } from '@/components/InstructorSEO';
import { InstructorImage } from '@/components/OptimizedImage';
import { analytics } from '@/utils/monitoring';

export default function InstructorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const instructor = instructors.find(inst => inst.id === id);
  const otherInstructors = instructors.filter(inst => inst.id !== id);

  // Scroll to top when instructor changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Track page view
  useEffect(() => {
    if (instructor) {
      analytics.trackInstructorView(instructor.id, instructor.name);
      // Set page title for analytics
      document.title = `${instructor.name} - ${instructor.skill} | Lekki Gathering Place`;
    }
  }, [instructor]);

  if (!instructor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Instructor not found</h2>
          <Button onClick={() => navigate('/')}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <InstructorSEO instructor={instructor} />
      
      <div className="min-h-screen relative bg-white">
        {/* 3D Animated Background Layer */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-slate-300 via-green-200/70 to-amber-200/70">
        
        {/* Large visible gradient orbs */}
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
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
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
        
        {/* Education/Skill Icons */}
        {['📚', '✏️', '🎓', '📖', '🏆', '⭐', '💡', '🎯'].map((icon, i) => (
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

      {/* Green Header Background */}
      <div className="fixed top-0 left-0 right-0 h-24 bg-primary z-40" />

      {/* Header Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <main id="main-content" tabIndex={-1} aria-label="Instructor Profile">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24" aria-labelledby="instructor-name">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-8 text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column - Image and Quick Info */}
              <div className="lg:col-span-1">
                <Cards className="overflow-hidden border-slate-200 sticky top-24">
                  <div className="relative h-80 bg-gradient-to-br from-primary/10 to-slate-100 overflow-hidden">
                    <InstructorImage
                      instructor={instructor}
                      className="w-full h-full object-cover"
                      priority={true}
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badges className="bg-amber-500 text-white flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {instructor.rating} Rating
                      </Badges>
                      <span className="text-sm text-slate-600">{instructor.students} Students</span>
                    </div>

                    <h1 id="instructor-name" className="text-3xl font-bold text-primary mb-2">{instructor.name}</h1>
                    <p className="text-accent font-semibold mb-4">{instructor.skill}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Award className="w-4 h-4 text-primary" />
                        <span>{instructor.experience} Experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{instructor.ward}</span>
                      </div>
                      {instructor.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4 text-primary" />
                          <span>{instructor.email}</span>
                        </div>
                      )}
                      {instructor.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-primary" />
                          <span>{instructor.phone}</span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Enroll Now
                    </Button>
                  </div>
                </Cards>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <Cards className="p-8 border-slate-200">
                  <h2 className="text-2xl font-bold text-primary mb-4">About</h2>
                  <p className="text-slate-700 leading-relaxed">{instructor.about}</p>
                </Cards>

                {/* Specializations */}
                {instructor.specializations && instructor.specializations.length > 0 && (
                  <Cards className="p-8 border-slate-200">
                    <h2 className="text-2xl font-bold text-primary mb-4">Specializations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {instructor.specializations.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                          <span className="text-slate-700">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </Cards>
                )}

                {/* Achievements */}
                {instructor.achievements && instructor.achievements.length > 0 && (
                  <Cards className="p-8 border-slate-200">
                    <h2 className="text-2xl font-bold text-primary mb-4">Achievements</h2>
                    <div className="space-y-3">
                      {instructor.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </Cards>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Other Instructors */}
        {otherInstructors.length > 0 && (
          <section className="py-16 bg-white/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
                Other <span className="text-accent">Instructors</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {otherInstructors.map((inst) => (
                  <Cards
                    key={inst.id}
                    className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-slate-200 cursor-pointer"
                    onClick={() => navigate(`/instructor/${inst.id}`)}
                  >
                    <div className="flex flex-col sm:flex-row gap-6 p-6">
                      <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-slate-100">
                        <InstructorImage
                          instructor={inst}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary mb-1">{inst.name}</h3>
                        <p className="text-accent font-semibold mb-3">{inst.skill}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {inst.rating}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {inst.ward}
                          </div>
                        </div>

                        <Button 
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/instructor/${inst.id}`);
                          }}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Cards>
                ))}
              </div>
            </div>
          </section>
        )}

        </main>
        <Footer />
      </div>
    </div>
    </>
  );
}
