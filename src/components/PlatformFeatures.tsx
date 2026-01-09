"use client"

import { Cards } from "@/components/ui/cards"
import { LayoutDashboard, CheckCircle, Calendar, BarChart3, Users, Shield } from "lucide-react"

const features = [
  {
    icon: <LayoutDashboard className="w-8 h-8" />,
    title: "Role-Based Dashboards",
    description: "Customized interfaces for admins, instructors, and students",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: <CheckCircle className="w-8 h-8" />,
    title: "Attendance Approval",
    description: "Multi-level workflow with instructor and admin oversight",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: <Calendar className="w-8 h-8" />,
    title: "Class Scheduling",
    description: "Smart scheduling system with conflict detection",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Analytics & Reports",
    description: "Comprehensive insights into students and Instructors progress and performance",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Multi-Ward Support",
    description: "Manage all wards from a single platform",
    color: "from-sky-500 to-cyan-600",
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Secure Access",
    description: "Enterprise-grade security with role-based permissions",
    color: "from-slate-700 to-slate-900",
  },
]

export default function PlatformFeatures() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Powerful <span className="text-accent">Features</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to manage and grow your skill development programs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Cards
              key={index}
              className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-8 border-slate-200 relative overflow-hidden animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-bl-full group-hover:scale-150 transition-transform duration-500`}
              />

              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            </Cards>
          ))}
        </div>
      </div>
    </section>
  )
}
