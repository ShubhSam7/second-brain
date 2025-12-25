import { useEffect, useRef, useState } from "react";

interface FeatureSectionProps {
  number: string;
  title: string;
  description: string;
  features: string[];
}

export function FeatureSection({
  number,
  title,
  description,
  features,
}: FeatureSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="border border-border-muted bg-surface rounded-xl p-8 md:p-12 hover:border-accent-primary/30 transition-all duration-500 group">
        {/* Number Badge */}
        <div className="inline-block mb-6">
          <span className="text-6xl font-bold text-text-muted group-hover:text-accent-primary transition-colors duration-500">
            {number}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-wide">
          {title}
        </h3>

        {/* Description */}
        <p className="text-lg text-text-secondary mb-8 leading-relaxed">
          {description}
        </p>

        {/* Features List */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-text-secondary"
            >
              <span className="text-accent-primary mt-1.5">▸</span>
              <span className="text-base leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}