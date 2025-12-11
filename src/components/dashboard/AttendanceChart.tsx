import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Mon', present: 45, absent: 5 },
  { name: 'Tue', present: 52, absent: 8 },
  { name: 'Wed', present: 48, absent: 7 },
  { name: 'Thu', present: 55, absent: 3 },
  { name: 'Fri', present: 42, absent: 10 },
  { name: 'Sat', present: 38, absent: 6 },
];

export function AttendanceChart() {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Weekly Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent>
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
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="Present"
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
      </CardContent>
    </Card>
  );
}
