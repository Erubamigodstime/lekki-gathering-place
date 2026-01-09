import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  className 
}: StatCardProps) {
  // Map icon colors to corresponding background colors
  const getIconBackground = (color: string) => {
    if (color.includes('primary')) return 'bg-blue-100';
    if (color.includes('accent')) return 'bg-purple-100';
    if (color.includes('amber')) return 'bg-amber-100';
    if (color.includes('green')) return 'bg-green-100';
    if (color.includes('red') || color.includes('destructive')) return 'bg-red-100';
    if (color.includes('indigo')) return 'bg-indigo-100';
    return 'bg-muted/50';
  };

  return (
    <Card className={cn("shadow-card hover:shadow-card-hover transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {change && (
              <p className={cn(
                "text-sm font-medium",
                changeType === 'positive' && "text-green-600",
                changeType === 'negative' && "text-destructive",
                changeType === 'neutral' && "text-muted-foreground"
              )}>
                {change}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", getIconBackground(iconColor))}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
