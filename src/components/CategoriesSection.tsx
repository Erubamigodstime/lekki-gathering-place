import { Palette, TrendingUp, Database, Code, Shield } from "lucide-react";

const categories = [
  { icon: Palette, name: "UX/UI Design", courses: "30+ Courses", color: "bg-pink-100 text-pink-600" },
  { icon: TrendingUp, name: "Digital Marketing", courses: "25+ Courses", color: "bg-blue-100 text-blue-600" },
  { icon: Database, name: "Data Science", courses: "15+ Courses", color: "bg-green-100 text-green-600" },
  { icon: Code, name: "Web Development", courses: "20+ Courses", color: "bg-orange-100 text-orange-600" },
  { icon: Shield, name: "Cybersecurity", courses: "10+ Courses", color: "bg-purple-100 text-purple-600" },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-widest">Top Categories</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Innovative Services for Modern Learning
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From design to data science, explore expertly curated courses to help you grow your career and creativity.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {categories.map((category, index) => (
            <a
              key={index}
              href="#"
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-card-foreground mb-1">{category.name}</h3>
              <p className="text-muted-foreground text-sm">{category.courses}</p>
            </a>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            View All Categories
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
