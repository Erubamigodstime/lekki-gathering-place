import CourseCard from "./CourseCard";
import { Button } from "@/components/ui/button";

const courses = [
  {
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/6889a8751315c17a6924107f_Course%20Thumbnail%2012.jpg",
    category: "UX/UI Design",
    title: "Practical Hands-On Design Practice",
    rating: 4.9,
    reviews: 257,
    enrolled: "250+",
    videos: 25,
    price: 49,
  },
  {
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/6889a7afea8576d7fe9559d8_Course%20Thumbnail%2011.jpg",
    category: "Cybersecurity",
    title: "Essential Skills for Navigating a Safer Internet",
    rating: 4.8,
    reviews: 257,
    enrolled: "250+",
    videos: 38,
    price: 69,
  },
  {
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/6889a70076d1502bb3f31545_Course%20Thumbnail%2010.jpg",
    category: "Digital Marketing",
    title: "Social Media Marketing Masterclass",
    rating: 4.6,
    reviews: 340,
    enrolled: "300+",
    videos: 38,
    price: 59,
  },
  {
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/6878c5beb32a6d81f1fa902a_Course%20Thumbnail%209.jpg",
    category: "Web Development",
    title: "Full-Stack Web Developer Bootcamp",
    rating: 4.9,
    reviews: 307,
    enrolled: "300+",
    videos: 38,
    price: 79,
  },
  {
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/6878c53f214f031f650d58e3_Course%20Thumbnail%208.jpg",
    category: "UX/UI Design",
    title: "Master Essential UI Design Using Figma",
    rating: 4.8,
    reviews: 153,
    enrolled: "350+",
    videos: 30,
    price: 49,
  },
  {
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/6878c3f003b18466f639898a_Course%20Thumbnail%203.jpg",
    category: "Data Science",
    title: "Exploring Machine Learning Using Python",
    rating: 4.8,
    reviews: 275,
    enrolled: "230+",
    videos: 48,
    price: 89,
  },
];

const CoursesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-widest">Popular Courses</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">
            Explore Top Courses Loved by Learners
          </h2>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map((course, index) => (
            <CourseCard key={index} {...course} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6">
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
