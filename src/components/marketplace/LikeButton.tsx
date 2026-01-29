import { forwardRef } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLikes } from "@/hooks/useLikes";

interface LikeButtonProps {
  productId: string;
  showCount?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export const LikeButton = forwardRef<HTMLButtonElement, LikeButtonProps>(({
  productId,
  showCount = true,
  size = "sm",
  className,
}, ref) => {
  const { likeCount, isLiked, isLoading, toggleLike } = useLikes(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike();
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "group/like transition-all duration-200",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        isLiked && "text-destructive",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", size === "sm" ? "h-4 w-4" : "h-5 w-5")} />
      ) : (
        <div className="flex items-center gap-1">
          <Heart
            className={cn(
              "transition-all duration-200",
              size === "sm" ? "h-4 w-4" : "h-5 w-5",
              isLiked
                ? "fill-destructive text-destructive"
                : "group-hover/like:text-destructive/70"
            )}
          />
          {showCount && likeCount > 0 && (
            <span className={cn("font-medium", size === "sm" ? "text-[10px]" : "text-xs")}>
              {likeCount}
            </span>
          )}
        </div>
      )}
    </Button>
  );
});

LikeButton.displayName = "LikeButton";

export default LikeButton;
