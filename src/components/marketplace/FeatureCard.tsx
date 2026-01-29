import { forwardRef } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon: Icon, title, description, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group bg-card rounded-xl md:rounded-2xl p-4 md:p-6 text-center card-hover border border-border/50",
          className
        )}
      >
        <div className="inline-flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 text-primary mb-3 md:mb-4 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
          <Icon className="h-5 w-5 md:h-7 md:w-7" />
        </div>
        <h3 className="font-semibold text-sm md:text-lg text-foreground mb-1 md:mb-2">{title}</h3>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export default FeatureCard;
