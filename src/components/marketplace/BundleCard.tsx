import * as React from "react";
import { Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BundleCardProps {
  title: string;
  description: string;
  itemCount: number;
  price: number;
  originalPrice: number;
  image: string;
  onView?: () => void;
}

export const BundleCard = React.forwardRef<HTMLDivElement, BundleCardProps>(
  ({ title, description, itemCount, price, originalPrice, image, onView }, ref) => {
    const discount = Math.round((1 - price / originalPrice) * 100);

    return (
      <div 
        ref={ref}
        className="group relative bg-card rounded-2xl overflow-hidden card-hover border border-border/50"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-2/5 aspect-video md:aspect-auto overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-semibold mb-3">
                <Package className="h-4 w-4" />
                Save {discount}%
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground mb-4">{description}</p>

              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{itemCount} items</span> included
              </p>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">${price}</span>
                <span className="text-muted-foreground line-through">${originalPrice}</span>
              </div>
              <Button 
                className="btn-gradient-primary rounded-full group/btn"
                onClick={onView}
              >
                View Bundle
                <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BundleCard.displayName = "BundleCard";

export default BundleCard;
