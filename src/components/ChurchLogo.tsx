import { Cross } from 'lucide-react';

interface ChurchLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function ChurchLogo({ size = 'md', showText = true }: ChurchLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} bg-gradient-primary rounded-xl flex items-center justify-center shadow-md`}>
        <Cross className="text-primary-foreground" size={size === 'sm' ? 18 : size === 'md' ? 22 : 28} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-serif font-bold text-foreground leading-tight`}>
            SkillGather
          </span>
          <span className="text-xs text-muted-foreground tracking-wide">
            Church Training Center
          </span>
        </div>
      )}
    </div>
  );
}
