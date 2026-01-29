import { Star, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  title: string;
  creator: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  isFree?: boolean;
  onAddToCart?: () => void;
  onViewDetails?: () => void;
}

export const ProductCard = ({
  title,
  creator,
  price,
  originalPrice,
  rating,
  reviewCount,
  image,
  isFree,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) => {
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <div className="group bg-card rounded-xl overflow-hidden card-hover border border-border/50">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isFree && (
            <span className="badge-free">FREE</span>
          )}
          {discount > 0 && !isFree && (
            <span className="badge-discount">-{discount}%</span>
          )}
        </div>

        {/* Quick actions on hover */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full shadow-lg bg-card hover:bg-card"
            onClick={onViewDetails}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Creator */}
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">by {creator}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < Math.floor(rating) ? "fill-gold text-gold" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {rating.toFixed(1)} ({reviewCount})
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            {isFree ? (
              <span className="text-lg font-bold text-success">Free</span>
            ) : (
              <>
                <span className="text-lg font-bold text-foreground">${price}</span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
                )}
              </>
            )}
          </div>
          <Button
            size="sm"
            className="btn-gradient-primary rounded-full px-4"
            onClick={onAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
