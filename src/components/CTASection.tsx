import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface CounterProps {
  end: number;
  suffix: string;
  label: string;
}

const Counter = ({ end, suffix, label }: CounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-primary-foreground/70">{label}</p>
    </div>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 lg:px-8">
        {/* CTA Content */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready To Start Learning and Level Up Your Skills?
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            Join thousands of learners transforming their careers with expert-led courses. Choose your path and start your journey today.
          </p>
          <Button className="rounded-full bg-accent text-accent-foreground hover:bg-enonix-yellow-hover px-8 py-6 text-base font-semibold">
            Get Started
            <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Counter end={50} suffix="k+" label="Successful Students" />
          <Counter end={1} suffix="M+" label="Students Enrolled" />
          <Counter end={100} suffix="+" label="Expert Instructors" />
          <Counter end={25} suffix="k+" label="Global Job Placements" />
        </div>
      </div>
    </section>
  );
};

export default CTASection;
