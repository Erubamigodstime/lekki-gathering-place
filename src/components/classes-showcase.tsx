"use client"

import { Cards } from "@/components/ui/cards"
import { Badges } from "@/components/ui/badges"
import { Button } from "@/components/ui/button"
import { Clock, Users, BookOpen, GraduationCap } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { classes } from "@/data/classesData"

export function ClassesShowcase() {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-white/85">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Explore Our <span className="text-accent">Classes</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover diverse skill-building opportunities taught by experienced instructors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {classes.map((cls, index) => (
            <Cards
              key={cls.id}
              className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border-slate-200 animate-fade-in-up cursor-pointer !py-0 !gap-0"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(`/class/${cls.id}`)}
            >
              <div className="h-40 relative overflow-hidden">
                {/* Image Layer - shown by default */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${cls.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
 
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-primary mb-3 line-clamp-2">{cls.className}</h3>

                <div className="space-y-2 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{cls.instructor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{cls.duration.totalWeeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{cls.duration.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span>{cls.level}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                  disabled={cls.available === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/class/${cls.id}`);
                  }}
                >
                  {cls.available && cls.available > 0 ? "View Details" : cls.available === 0 ? "Waitlist" : "Learn More"}
                </Button>
              </div>
            </Cards>
          ))}
        </div>
      </div>
    </section>
  )
}
