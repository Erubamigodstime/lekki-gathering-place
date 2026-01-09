import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const tutors = [
  {
    name: "Sophia Collins",
    role: "Frontend Developer",
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/687cac212f2022ec9be1abfd_Team%20Image%201.jpg",
  },
  {
    name: "Michael Reynolds",
    role: "ML Expert",
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/687cabe65d64d587a6d74484_Team%20Image%202.jpg",
  },
  {
    name: "Emma Harrison",
    role: "Senior UX/UI Designer",
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/687cabc0174a1571248ce6e2_Team%20Image%203.jpg",
  },
  {
    name: "Brandon Nicholls",
    role: "Full-Stack Developer",
    image: "https://cdn.prod.website-files.com/687893c8ed5edacc1749592a/687cab86db199b2f4e01117b_Team%20Image%204.jpg",
  },
];

const TutorsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-widest">Our Tutors</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
            Meet Our Expert Tutors
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get insights from industry experts! Our experienced tutors are dedicated to helping you achieve your goals.
          </p>
        </div>

        {/* Tutors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tutors.map((tutor, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img
                  src={tutor.image}
                  alt={tutor.name}
                  className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Social Links Overlay */}
                <div className="absolute inset-0 bg-primary/80 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-10 h-10 bg-primary-foreground rounded-full flex items-center justify-center text-primary hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="p-5 text-center">
                <h3 className="font-semibold text-card-foreground">{tutor.name}</h3>
                <p className="text-muted-foreground text-sm">{tutor.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6">
            View All Tutors
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TutorsSection;
