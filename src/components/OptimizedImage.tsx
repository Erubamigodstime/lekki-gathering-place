import { Instructor } from '@/data/instructors';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({ src, alt, className, priority = false }: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

interface InstructorImageProps {
  instructor: Instructor;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function InstructorImage({ 
  instructor, 
  className, 
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: InstructorImageProps) {
  return (
    <OptimizedImage
      src={instructor.image}
      alt={`${instructor.name} - ${instructor.skill} instructor at Lekki Gathering Place`}
      className={className}
      priority={priority}
    />
  );
}
