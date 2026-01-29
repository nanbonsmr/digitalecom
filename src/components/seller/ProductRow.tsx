import { Edit, Trash2, Eye, Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  title: string;
  thumbnail?: string;
  price: number;
  downloads: number;
  status: "active" | "draft";
  moderationStatus?: "pending" | "approved" | "rejected";
}

interface ProductRowProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export const ProductRow = ({ product, onEdit, onDelete, onView }: ProductRowProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:shadow-sm transition-all duration-300">
      <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{product.title}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm font-semibold text-primary">${product.price.toFixed(2)}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            {product.downloads}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          className={
            product.status === "active"
              ? "bg-success/20 text-success border-0"
              : "bg-muted text-muted-foreground border-0"
          }
        >
          {product.status === "active" ? "Published" : "Draft"}
        </Badge>
        {product.moderationStatus && (
          <Badge
            className={
              product.moderationStatus === "approved"
                ? "bg-success/20 text-success border-0"
                : product.moderationStatus === "rejected"
                ? "bg-destructive/20 text-destructive border-0"
                : "bg-amber-500/20 text-amber-600 border-0"
            }
          >
            {product.moderationStatus === "approved"
              ? "Approved"
              : product.moderationStatus === "rejected"
              ? "Rejected"
              : "Pending Review"}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onView?.(product.id)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit?.(product.id)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete?.(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductRow;
