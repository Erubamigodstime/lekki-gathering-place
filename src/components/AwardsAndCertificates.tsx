"use client"

import { useState, useEffect } from "react"
import { Cards } from "@/components/ui/cards"
import { Award, Medal, Trophy, Star, ChevronLeft, ChevronRight } from "lucide-react"

const achievements = [
  {
    icon: <Award className="w-8 h-8" />,
    title: "Course Completion",
    description: " A hard copy and Digital certificates for finished courses",
    color: "from-blue-600 to-blue-700",
  },
  {
    icon: <Medal className="w-8 h-8" />,
    title: "Excellence Badges",
    description: "Recognition for outstanding performance",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: "Competition Wins",
    description: "Awards for skill competitions",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "Skill Mastery",
    description: "Advanced proficiency recognition",
    color: "from-green-500 to-emerald-500",
  },
]

export function AwardsAndCertificates() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)

  // Auto-slide on mobile - slower transition
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setCurrentIndex((prev) => prev + 1)
    }, 4000) // Change every 4 seconds for smoother feel

    return () => clearInterval(timer)
  }, [])

  // Handle infinite loop - reset to start when reaching the end
  useEffect(() => {
    if (currentIndex === achievements.length) {
      setTimeout(() => {
        setIsTransitioning(false)
        setCurrentIndex(0)
      }, 700) // Match transition duration
    }
  }, [currentIndex])

  const nextSlide = () => {
    if (currentIndex < achievements.length) {
      setIsTransitioning(true)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true)
      setCurrentIndex((prev) => prev - 1)
    } else {
      setIsTransitioning(false)
      setCurrentIndex(achievements.length - 1)
      setTimeout(() => setIsTransitioning(true), 50)
    }
  }

  return (
    <section className="py-24 bg-white/95">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Recognition & <span className="text-accent">Certificates</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Celebrate achievements with digital certificates and badges
          </p>
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden relative mb-12">
          {/* Navigation Arrows - Outside the cards */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-white shadow-lg transition-all"
              aria-label="Previous achievement"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-white shadow-lg transition-all"
              aria-label="Next achievement"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-hidden">
            <div 
              className="flex"
              style={{ 
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: isTransitioning ? 'transform 700ms ease-in-out' : 'none'
              }}
            >
              {achievements.concat(achievements[0]).map((achievement, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Cards className="group hover:shadow-xl transition-all duration-300 p-6 border-slate-200 text-center">
                    <div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                    >
                      {achievement.icon}
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2">{achievement.title}</h3>
                    <p className="text-sm text-slate-600">{achievement.description}</p>
                  </Cards>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {achievements.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true)
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  (currentIndex % achievements.length) === index ? 'bg-primary w-8' : 'bg-slate-300'
                }`}
                aria-label={`Go to achievement ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {achievements.map((achievement, index) => (
            <Cards
              key={index}
              className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 border-slate-200 text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${achievement.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
              >
                {achievement.icon}
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">{achievement.title}</h3>
              <p className="text-sm text-slate-600">{achievement.description}</p>
            </Cards>
          ))}
        </div>

        {/* Certificate Preview */}
        <div className="max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <Cards className="p-8 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white mb-6">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2">Certificate of Completion</h3>
              <p className="text-slate-600 mb-6">This certifies that</p>
              <p className="text-2xl font-bold text-primary mb-2">Student Name</p>
              <p className="text-slate-600 mb-6">has successfully completed</p>
              <p className="text-xl font-semibold text-accent mb-8">Course Title</p>
              <div className="flex justify-center gap-8 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-900">Date</p>
                  <p>January 15, 2026</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Instructor</p>
                  <p>John Smith</p>
                </div>
              </div>
            </div>
          </Cards>
        </div>
      </div>
    </section>
  )
}

