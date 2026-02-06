"use client"

import { Cards } from "@/components/ui/cards"
import { TrendingUp, Users, Target, BarChart } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

// Dummy data for attendance trends
const attendanceData = [
  { month: 'Jan', attendance: 85, target: 90 },
  { month: 'Feb', attendance: 88, target: 90 },
  { month: 'Mar', attendance: 92, target: 90 },
  { month: 'Apr', attendance: 89, target: 90 },
  { month: 'May', attendance: 94, target: 90 },
  { month: 'Jun', attendance: 96, target: 90 },
  { month: 'Jul', attendance: 93, target: 90 },
  { month: 'Aug', attendance: 95, target: 90 },
]

export function AnalyticsInsights() {
  return (
    <section className="py-16 bg-white/95">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Data-Driven <span className="text-accent">Insights</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Make informed decisions with comprehensive analytics and reporting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <Cards className="lg:col-span-2 p-8 border-slate-200 shadow-lg animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-primary">Attendance Trends</h3>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>

            <div className="relative h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152, 54%, 24%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(152, 54%, 24%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(42, 90%, 55%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(42, 90%, 55%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    domain={[80, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(42, 90%, 55%)" 
                    strokeWidth={2}
                    fill="url(#colorTarget)"
                    animationDuration={1500}
                    animationBegin={0}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="hsl(152, 54%, 24%)" 
                    strokeWidth={3}
                    fill="url(#colorAttendance)"
                    animationDuration={2000}
                    animationBegin={200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-sm text-slate-600">Avg Attendance</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-slate-600">Total Classes</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1,247</div>
                <div className="text-sm text-slate-600">Active Students</div>
              </div>
            </div>
          </Cards>

          {/* Side Stats */}
          <div className="space-y-6">
            <Cards className="p-6 border-slate-200 shadow-lg animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Student Progress</p>
                  <p className="text-2xl font-bold text-primary">87%</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "87%" }} />
              </div>
            </Cards>

            <Cards className="p-6 border-slate-200 shadow-lg animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-primary">78%</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: "78%" }} />
              </div>
            </Cards>

            <Cards className="p-6 border-slate-200 shadow-lg animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Instructor Impact</p>
                  <p className="text-2xl font-bold text-primary">95%</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "95%" }} />
              </div>
            </Cards>
          </div>
        </div>
      </div>
    </section>
  )
}
