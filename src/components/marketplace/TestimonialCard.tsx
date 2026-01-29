import { forwardRef } from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  name: string;
  role: string;
  avatar: string;
  feedback: string;
  rating: number;
}

export const TestimonialCard = forwardRef<HTMLDivElement, TestimonialCardProps>(
  ({ name, role, avatar, feedback, rating }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-card rounded-2xl p-6 card-hover border border-border/50 relative"
      >
        {/* Quote Icon */}
        <div className="absolute top-4 right-4 text-primary/10">
          <Quote className="h-12 w-12" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating ? "fill-gold text-gold" : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Feedback */}
        <p className="text-foreground leading-relaxed mb-6 relative z-10">
          "{feedback}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={name}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
          />
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>
    );
  }
);

TestimonialCard.displayName = "TestimonialCard";

export default TestimonialCard;
