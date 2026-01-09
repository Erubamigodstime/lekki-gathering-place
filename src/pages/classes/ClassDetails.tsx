import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { classes } from '@/data/classesData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Cards } from '@/components/ui/cards';
import { Button } from '@/components/ui/button';
import { Badges } from '@/components/ui/badges';
import { ClassSEO } from '@/components/ClassSEO';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Users, 
  BookOpen, 
  GraduationCap,
  Target,
  Wrench,
  Calendar,
  Award,
  ChevronRight
} from 'lucide-react';

export default function ClassDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const classData = classes.find(cls => cls.id === id);
  const otherClasses = classes.filter(cls => cls.id !== id);

  // Scroll to top when class changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Set page title
  useEffect(() => {
    if (classData) {
      document.title = `${classData.className} | Lekki Gathering Place`;
    }
  }, [classData]);

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Class not found</h2>
          <Button onClick={() => navigate('/')}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ClassSEO classData={classData} />
      
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
        <main id="main-content" tabIndex={-1} aria-label="Class Details">
          {/* Hero Section */}
          <section className="pt-32 pb-16 md:pt-40 md:pb-24" aria-labelledby="class-name">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mb-8 text-primary hover:text-primary/80 group"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column - Class Info Card */}
                <div className="lg:col-span-1">
                  <Cards className="overflow-hidden border-slate-200 sticky top-24">
                    <div className={`relative h-64 bg-gradient-to-br ${classData.color} overflow-hidden`}>
                      {classData.image && (
                        <img
                          src={classData.image}
                          alt={classData.className}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-4 left-4">
                        <Badges className="bg-white/90 text-slate-900 backdrop-blur-sm">
                          {classData.category}
                        </Badges>
                      </div>
                      {classData.available !== undefined && (
                        <div className="absolute top-4 right-4">
                          <Badges className={classData.available > 0 ? "bg-green-500 text-white" : "bg-slate-700 text-white"}>
                            {classData.available > 0 ? `${classData.available} spots left` : "Full"}
                          </Badges>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h1 id="class-name" className="text-2xl font-bold text-primary mb-4">
                        {classData.className}
                      </h1>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Level</p>
                            <p className="font-semibold text-slate-700">{classData.level}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="bg-accent/10 p-2 rounded-lg">
                            <Clock className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Duration</p>
                            <p className="font-semibold text-slate-700">{classData.duration.totalWeeks} weeks</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="bg-blue-500/10 p-2 rounded-lg">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Total Lessons</p>
                            <p className="font-semibold text-slate-700">{classData.duration.totalLessons} lessons</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className="bg-purple-500/10 p-2 rounded-lg">
                            <Users className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs">Instructor</p>
                            <p className="font-semibold text-slate-700">{classData.instructor.name}</p>
                          </div>
                        </div>

                        {classData.scheduleInfo && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="bg-green-500/10 p-2 rounded-lg">
                              <Calendar className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs">Schedule</p>
                              <p className="font-semibold text-slate-700">
                                {classData.scheduleInfo.day} • {classData.scheduleInfo.time}
                              </p>
                            </div>
                          </div>
                        )}

                        {classData.certification.issued && (
                          <div className="flex items-center gap-3 text-sm">
                            <div className="bg-amber-500/10 p-2 rounded-lg">
                              <Award className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs">Certification</p>
                              <p className="font-semibold text-slate-700">Certificate Included</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-lg group"
                        disabled={classData.available === 0}
                        onClick={() => {
                          const params = new URLSearchParams({
                            className: classData.className,
                            instructor: classData.instructor.name,
                            schedule: classData.scheduleInfo 
                              ? `${classData.scheduleInfo.day} • ${classData.scheduleInfo.time}` 
                              : ''
                          });
                          navigate(`/enrollment/${id}?${params.toString()}`);
                        }}
                      >
                        {classData.available && classData.available > 0 ? (
                          <>
                            Enroll Now
                            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        ) : (
                          "Join Waitlist"
                        )}
                      </Button>
                    </div>
                  </Cards>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Overview Section */}
                  <Cards className="p-4 sm:p-6 md:p-8 border-slate-200 animate-fade-in-up">
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-accent flex-shrink-0" />
                      <span className="break-words">Course Overview</span>
                    </h2>
                    <p className="text-slate-700 leading-relaxed text-base sm:text-lg break-words">{classData.overview}</p>
                  </Cards>

                  {/* Learning Outcomes */}
                  <Cards className="p-4 sm:p-6 md:p-8 border-slate-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <Target className="w-6 h-6 sm:w-8 sm:h-8 text-accent flex-shrink-0" />
                      <span className="break-words">What You'll Learn</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {classData.learningOutcomes.map((outcome, index) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors min-w-0"
                        >
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm sm:text-base text-slate-700 break-words">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </Cards>

                  {/* Course Requirements */}
                  <Cards className="p-4 sm:p-6 md:p-8 border-slate-200 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-accent flex-shrink-0" />
                      <span className="break-words">Requirements</span>
                    </h2>
                    <div className="space-y-2 sm:space-y-3">
                      {classData.courseRequirements.map((req, index) => (
                        <div key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg min-w-0">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-sm sm:text-base text-slate-700 break-words">{req}</span>
                        </div>
                      ))}
                    </div>
                  </Cards>

                  {/* Tools and Materials */}
                  <Cards className="p-4 sm:p-6 md:p-8 border-slate-200 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-accent flex-shrink-0" />
                      <span className="break-words">Tools & Materials</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {classData.toolsAndMaterials.map((tool, index) => (
                        <div 
                          key={index} 
                          className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 min-w-0"
                        >
                          <Wrench className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-700 break-words overflow-wrap-anywhere">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </Cards>

                  {/* Course Schedule */}
                  <Cards className="p-4 sm:p-6 md:p-8 border-slate-200 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-accent flex-shrink-0" />
                      <span className="break-words">Course Schedule</span>
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                      {classData.schedule.weeklyLessons.map((lesson, index) => (
                        <div 
                          key={index} 
                          className="border border-slate-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow bg-white overflow-hidden"
                        >
                          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                            <div className="bg-primary text-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 font-bold flex-shrink-0 text-sm sm:text-base">
                              Week {lesson.week}
                            </div>
                            <div className="flex-1 min-w-0 w-full">
                              {lesson.phase && (
                                <Badges className="mb-2 bg-accent/10 text-accent border-accent text-xs sm:text-sm break-words">
                                  {lesson.phase}
                                </Badges>
                              )}
                              <h3 className="font-bold text-base sm:text-lg text-slate-800 mb-2 break-words">{lesson.title}</h3>
                              
                              {lesson.objectives && lesson.objectives.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-1">Objectives:</p>
                                  <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1 pl-1">
                                    {lesson.objectives.map((obj, i) => (
                                      <li key={i} className="break-words">{obj}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {lesson.topics && lesson.topics.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-1">Topics:</p>
                                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {lesson.topics.map((topic, i) => (
                                      <Badges key={i} className="bg-blue-50 text-blue-700 border-blue-200 text-xs break-words max-w-full">
                                        {topic}
                                      </Badges>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {lesson.activities && lesson.activities.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-1">Activities:</p>
                                  <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1 pl-1">
                                    {lesson.activities.map((act, i) => (
                                      <li key={i} className="break-words">{act}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {lesson.miniProject && (
                                <div className="mt-3 p-2.5 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                                  <p className="text-xs sm:text-sm font-semibold text-green-700 break-words">
                                    📁 Mini Project: {lesson.miniProject}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Cards>

                  {/* Certification */}
                  {classData.certification.issued && (
                    <Cards className="p-4 sm:p-6 md:p-8 border-slate-200 animate-fade-in-up bg-gradient-to-br from-amber-50 to-yellow-50" style={{ animationDelay: '500ms' }}>
                      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <Award className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 flex-shrink-0" />
                        <span className="break-words">Certification</span>
                      </h2>
                      <div className="bg-white p-4 sm:p-6 rounded-lg border-2 border-amber-200">
                        {classData.certification.certificateTitle && (
                          <p className="text-lg sm:text-xl font-bold text-slate-800 mb-3 break-words">
                            {classData.certification.certificateTitle}
                          </p>
                        )}
                        <p className="text-sm sm:text-base text-slate-700 mb-4 break-words">
                          <span className="font-semibold">Criteria:</span> {classData.certification.criteria}
                        </p>
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-semibold text-sm sm:text-base">Certificate of Completion Included</span>
                        </div>
                      </div>
                    </Cards>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Other Classes */}
          {otherClasses.length > 0 && (
            <section className="py-16 bg-white/80 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
                  Other <span className="text-accent">Classes</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherClasses.slice(0, 3).map((cls) => (
                    <Cards
                      key={cls.id}
                      className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-slate-200 cursor-pointer"
                      onClick={() => navigate(`/class/${cls.id}`)}
                    >
                      <div className={`relative h-48 bg-gradient-to-br ${cls.color} overflow-hidden`}>
                        {cls.image && (
                          <img
                            src={cls.image}
                            alt={cls.className}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        <div className="absolute top-4 left-4">
                          <Badges className="bg-white/90 text-slate-900 backdrop-blur-sm">
                            {cls.category}
                          </Badges>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-primary mb-3 line-clamp-2">
                          {cls.className}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {cls.duration.totalWeeks}w
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            {cls.level}
                          </div>
                        </div>

                        <Button 
                          size="sm"
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/class/${cls.id}`);
                          }}
                        >
                          View Details
                        </Button>
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
