"use client"

import { X, Check, ArrowRight } from "lucide-react"

export function ProblemSolution() {
  const problems = [
    "Manual attendance tracking",
    "Disorganized class records",
    "Poor accountability systems",
    "Scattered communication",
    "No progress visibility",
  ]

  const solutions = [
    "Automated digital attendance",
    "Centralized class management",
    "Multi-level approval workflow",
    "Unified communication hub",
    "Real-time analytics dashboard",
  ]

  return (
    <section className="bg-white/95">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold pt-6 text-blue-950 mb-4">
            From <span className="text-red-600">Chaos</span> to <span className="text-green-600">Clarity</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transform how you manage skill development programs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-7 items-center">
          {/* Problems */}
          <div className="space-y-4 animate-fade-in-left">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Old Way</h3>
            {problems.map((problem, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-red-50 border border-red-100 hover:border-red-200 transition-colors"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <X className="w-4 h-4 text-white" />
                </div>
                <p className="text-slate-700">{problem}</p>
              </div>
            ))}
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
            <ArrowRight className="w-12 h-12 text-blue-700 animate-pulse" />
          </div>

          {/* Solutions */}
          <div className="space-y-4 animate-fade-in-right ">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">New Way</h3>
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-green-50 border border-green-100 hover:border-green-200 hover:shadow-lg transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-slate-700 font-medium ">{solution}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
