import { Star, Users, PlayCircle } from "lucide-react";

interface CourseCardProps {
  image: string;
  category: string;
  title: string;
  rating: number;
  reviews: number;
  enrolled: string;
  videos: number;
  price: number;
}

const CourseCard = ({ image, category, title, rating, reviews, enrolled, videos, price }: CourseCardProps) => {
  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <span className="text-primary text-sm font-medium">{category}</span>

        {/* Title */}
        <h3 className="font-semibold text-card-foreground mt-2 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-accent fill-accent' : 'text-muted'}`}
              />
            ))}
          </div>
          <span className="text-muted-foreground text-sm">
            {rating} ({reviews})
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{enrolled}</span>
          </div>
          <div className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4" />
            <span>{videos} Videos</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-2xl font-bold text-primary">${price}</span>
          <button className="text-primary font-medium hover:text-primary/80 transition-colors">
            Enroll Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
