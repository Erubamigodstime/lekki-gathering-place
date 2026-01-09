interface ChurchLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textClassName?: string;
}

export function ChurchLogo({ size = 'md', showText = true, textClassName = 'text-foreground' }: ChurchLogoProps) {
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
    <div className="flex flex-col md:flex-row items-center gap-3">
      <div className={`${sizeClasses[size]} bg-gray-900 rounded-xl overflow-hidden shadow-md flex items-center justify-center p-1`}>
        <img 
          src="/images/logo.png" 
          alt="Lekki Gathering Place Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col text-center md:text-left">
          <span className={`${textSizeClasses[size]} font-bold ${textClassName} leading-tight tracking-tight`}>
            Lekki Gathering Place
          </span>
          {/* <span className="text-xs text-muted-foreground tracking-wide">
            Learn by prayer and Faith 
          </span> */}
        </div>
      )}
    </div>
  );
}
