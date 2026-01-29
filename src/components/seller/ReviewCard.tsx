import { Star, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
  rating: number;
  comment: string;
  productName: string;
  buyerName: string;
  buyerAvatar?: string;
  date: string;
}

interface ReviewCardProps {
  review: Review;
  onReply?: (reviewId: string) => void;
}

export const ReviewCard = ({ review, onReply }: ReviewCardProps) => {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-4 hover:shadow-sm transition-all duration-300">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={review.buyerAvatar} alt={review.buyerName} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {review.buyerName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-foreground">{review.buyerName}</p>
            <span className="text-xs text-muted-foreground">{review.date}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < review.rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            for <span className="font-medium text-foreground">{review.productName}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            "{review.comment}"
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 h-8 text-xs"
            onClick={() => onReply?.(review.id)}
          >
            <Reply className="h-3.5 w-3.5 mr-1" />
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
