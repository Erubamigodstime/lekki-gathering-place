"use client"

import { Cards } from "@/components/ui/cards"
import { Button } from "@/components/ui/button"
import { Badges } from "@/components/ui/badges"
import { Award, MapPin } from "lucide-react"
import { instructors } from "@/data/instructors"
import { useNavigate } from "react-router-dom"
import { InstructorImage } from "@/components/OptimizedImage"

export function InstructorSpotlight() {
  const navigate = useNavigate()

  return (
    <section className="py-5 bg-white/85"  aria-labelledby="instructors-heading">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 id="instructors-heading" className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Meet Our <span className="text-accent">Expert Instructors</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Learn from experienced professionals dedicated to your growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
          {instructors.map((instructor, index) => (
            <Cards
              key={instructor.id}
              className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border-slate-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
              role="listitem"
            >
              <div className="relative h-64 bg-gradient-to-br from-primary/10 to-slate-100 overflow-hidden">
                <InstructorImage
                  instructor={instructor}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  priority={index < 3}
                />

              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-primary mb-2">{instructor.name}</h3>
                <p className="text-accent font-semibold mb-4">{instructor.skill}</p>
                
                {/* Divider */}
                <div className="w-full h-px bg-slate-200 mb-4"></div>
                
                {/* T-shape with vertical line */}
                <div className="relative">
                  {/* Vertical line - extends from divider down */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-px -top-4 h-[calc(100%+1rem)] bg-slate-200"></div>
                     
                  {/* Experience   */}
                  <div className="space-y-2 mb-6 text-sm text-slate-600 relative z-10">
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="font-semibold text-slate-900">{instructor.experience}</span>
                    </div>

                    {/* location */}
                    <div className="flex items-center justify-between">
                      <span>Location:</span>
                      <div className="flex items-center gap-1 font-semibold text-slate-900">
                        <MapPin className="w-3 h-3" />
                        {instructor.ward}
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => navigate(`/instructor/${instructor.id}`)}
                >
                  View Profile
                </Button>
              </div>
            </Cards>
          ))}
        </div>
      </div>
    </section>
  )
}
