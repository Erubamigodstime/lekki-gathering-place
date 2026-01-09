import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

interface AttendanceChartProps {
  data?: any[];
  loading?: boolean;
}

export function AttendanceChart({ data = [], loading = false }: AttendanceChartProps) {
  if (loading) {
    return (
      <div className="h-72 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading attendance data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">No Attendance Data</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Attendance records will appear here once students start marking attendance.
        </p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px hsl(222.2 84% 4.9% / 0.1)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend />
          <Bar 
            dataKey="present" 
            fill="hsl(142 76% 36%)" 
            radius={[4, 4, 0, 0]}
            name="Present"
          />
          <Bar 
            dataKey="pending" 
            fill="hsl(38 92% 50%)" 
            radius={[4, 4, 0, 0]}
            name="Pending"
          />
          <Bar 
            dataKey="absent" 
            fill="hsl(var(--destructive))" 
            radius={[4, 4, 0, 0]}
            name="Absent"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
