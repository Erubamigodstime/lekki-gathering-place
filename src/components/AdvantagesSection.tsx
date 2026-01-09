const advantages = [
  {
    number: "01",
    subtitle: "Seamless Learning for Everyone",
    title: "Course Accessibility",
    description: "Access courses from any device, whether you're at home or on the go. Our platform ensures a smooth, user-friendly experience for learners of all backgrounds.",
    image: "https://cdn.prod.website-files.com/6877615c9ceac92697b37112/688a04b1c8f60afe5f127485_Advantage%20Image%201.jpg",
    cta: "Access Courses Now",
  },
  {
    number: "02",
    subtitle: "Affordable Learning, Big Value",
    title: "Cost-Effectiveness",
    description: "Get high-quality education without the high cost. Enjoy expert-led courses and valuable skills at a fraction of traditional tuition fees.",
    image: "https://cdn.prod.website-files.com/6877615c9ceac92697b37112/688a04b1ffd680e2f6a79d1a_Advantage%20Image%202.jpg",
    cta: "Start Learning Anytime",
  },
  {
    number: "03",
    subtitle: "Your Learning, Your Way",
    title: "Personalized Learning",
    description: "Receive tailored course recommendations and progress tracking. Our platform adapts to your learning style, helping you grow faster and smarter.",
    image: "https://cdn.prod.website-files.com/6877615c9ceac92697b37112/688a04b108108099599d1208_Advantage%20Image%203.jpg",
    cta: "Get Your Learning Path",
  },
];

const AdvantagesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="space-y-16">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Image */}
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="relative rounded-3xl overflow-hidden">
                  <img
                    src={advantage.image}
                    alt={advantage.title}
                    className="w-full h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>

              {/* Content */}
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <span className="text-accent font-bold text-5xl opacity-20">{advantage.number}</span>
                <p className="text-primary font-medium text-sm uppercase tracking-widest mt-4 mb-2">
                  {advantage.subtitle}
                </p>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {advantage.title}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {advantage.description}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  {advantage.cta}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;
