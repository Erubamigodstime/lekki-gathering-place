"use client"

import { Cards } from "@/components/ui/cards"
import { Badges } from "@/components/ui/badges"
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react"

export function AttendanceSystem() {
  return (
    <section className="py-1">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Smart <span className="text-accent">Attendance</span> System
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Multi-level approval workflow ensures accuracy and accountability
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending */}
          <Cards className="p-8 border-amber-200 bg-amber-100/100 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Pending</h3>
                <p className="text-sm text-slate-600">Awaiting approval</p>
              </div>
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">Student {i}</span>
                    <Badges className="bg-amber-500 text-white">Pending</Badges>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3 h-3" />
                    <span>Jan 15, 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </Cards>

          {/* Approved */}
          <Cards className="p-8 border-green-200 bg-green-100/100 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Approved</h3>
                <p className="text-sm text-slate-600">Confirmed attendance</p>
              </div>
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">Student {i}</span>
                    <Badges className="bg-green-500 text-white">Approved</Badges>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3 h-3" />
                    <span>Jan 15, 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </Cards>

          {/* Rejected */}
          <Cards className="p-8 border-red-200 bg-red-100/100 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Rejected</h3>
                <p className="text-sm text-slate-600">Needs correction</p>
              </div>
            </div>

            <div className="space-y-3">
              {[1].map((i) => (
                <div key={i} className="p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">Student {i}</span>
                    <Badges className="bg-red-500 text-white">Rejected</Badges>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3 h-3" />
                    <span>Jan 15, 2026</span>
                  </div>
                  <p className="text-xs text-red-600 mt-2">Reason: Duplicate entry</p>
                </div>
              ))}
            </div>
          </Cards>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600">
            <span className="font-semibold text-blue-900">Students marks attendance</span> →{" "}
            <span className="font-semibold text-blue-900">Instructors reviews & approves</span> →{" "}
            <span className="font-semibold text-blue-900">Record finalized</span>
          </p>
        </div>
      </div>
    </section>
  )
}
