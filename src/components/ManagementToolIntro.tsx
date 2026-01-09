"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function ManagementToolIntro() {
  const navigate = useNavigate()
  const highlights = [
    "Streamlined class management",
    "Real-time attendance tracking",
    "Comprehensive analytics dashboard",
    "Automated grade tracking",
    "Multi-ward coordination",
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1 animate-fade-in-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                All-in-One Platform
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
              Meet Our <span className="text-accent">Gathering Place</span> Management Tool
            </h2>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              A comprehensive digital platform designed specifically for managing skill development programs 
              across multiple wards. From enrollment to certification, everything you need in one place.
            </p>

            {/* Highlights */}
            <div className="space-y-3 mb-8">
              {highlights.map((highlight, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{highlight}</span>
                </div>
              ))}
            </div>

            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 group"
              onClick={() => navigate('/login')}
            >
              Explore Features
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Dashboard Screenshot */}
          <div className="order-1 lg:order-2 animate-fade-in-right">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-gradient-to-br from-green-400/20 to-amber-400/20 rounded-full blur-3xl" />
              
              {/* Dashboard Container */}
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transform hover:scale-[1.02] transition-transform duration-300">
                {/* Browser Chrome */}
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="bg-white rounded-md px-3 py-1 text-xs text-slate-500">
                      dashboard.lekki-gathering-place.com
                    </div>
                  </div>
                </div>

                {/* Dashboard Screenshot Placeholder */}
                <div className="bg-gradient-to-br from-slate-50 to-white p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">Dashboard Overview</h3>
                      <p className="text-sm text-slate-500">Welcome back, Administrator</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold text-sm">
                      AD
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                      <p className="text-sm opacity-90 mb-1">Total Students</p>
                      <p className="text-3xl font-bold">1,247</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                      <p className="text-sm opacity-90 mb-1">Active Classes</p>
                      <p className="text-3xl font-bold">24</p>
                    </div>
                  </div>

                  {/* Chart Representation */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-slate-700">Attendance Trends</p>
                      <div className="flex gap-2">
                        <div className="w-16 h-1 bg-primary rounded-full" />
                        <div className="w-16 h-1 bg-amber-400 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-end gap-2 h-24">
                      {[65, 80, 75, 90, 85, 95, 88, 92].map((height, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-primary to-green-400 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">Pending Approvals</p>
                      <p className="text-lg font-bold text-primary">12</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-600 mb-1">This Week</p>
                      <p className="text-lg font-bold text-primary">89%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl px-4 py-3 border border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-slate-700">Live Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
