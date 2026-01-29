import { useState, useEffect } from "react";
import {
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  thumbnail_url: string | null;
  seller_id: string;
  is_published: boolean;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_notes: string | null;
  created_at: string;
  seller_name?: string;
}

interface ProductModerationSectionProps {
  onProductModerated?: () => void;
}

const ProductModerationSection = ({ onProductModerated }: ProductModerationSectionProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [moderationAction, setModerationAction] = useState<"approve" | "reject" | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("moderation_status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch seller names
      const sellerIds = [...new Set((data || []).map((p) => p.seller_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", sellerIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p.display_name])
      );

      const productsWithSellers = (data || []).map((p) => ({
        ...p,
        seller_name: profileMap.get(p.seller_id) || "Unknown Seller",
      }));

      setProducts(productsWithSellers as Product[]);
    } catch (error: any) {
      toast({
        title: "Error loading products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeration = async (action: "approve" | "reject") => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({
          moderation_status: action === "approve" ? "approved" : "rejected",
          moderation_notes: moderationNotes || null,
        })
        .eq("id", selectedProduct.id);

      if (error) throw error;

      toast({
        title: action === "approve" ? "Product Approved" : "Product Rejected",
        description:
          action === "approve"
            ? "The product is now visible on the marketplace."
            : "The seller has been notified of the rejection.",
      });

      setIsDialogOpen(false);
      setSelectedProduct(null);
      setModerationNotes("");
      setModerationAction(null);
      fetchProducts();
      onProductModerated?.();
    } catch (error: any) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openModerationDialog = (product: Product, action: "approve" | "reject") => {
    setSelectedProduct(product);
    setModerationAction(action);
    setModerationNotes(product.moderation_notes || "");
    setIsDialogOpen(true);
  };

  const pendingCount = products.filter((p) => p.moderation_status === "pending").length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Product Moderation
                {filter === "pending" && pendingCount > 0 && (
                  <Badge className="bg-amber-500 text-white">{pendingCount}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Review and approve products before they appear on the marketplace
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
              >
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("approved")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approved
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("rejected")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejected
              </Button>
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products to review</h3>
              <p className="text-muted-foreground">
                {filter === "pending"
                  ? "All products have been reviewed!"
                  : `No ${filter} products found.`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {product.thumbnail_url ? (
                            <img
                              src={product.thumbnail_url}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[200px]">
                            {product.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.description?.substring(0, 50) || "No description"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.seller_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${product.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.moderation_status === "approved"
                            ? "bg-success/20 text-success border-0"
                            : product.moderation_status === "rejected"
                            ? "bg-destructive/20 text-destructive border-0"
                            : "bg-amber-500/20 text-amber-600 border-0"
                        }
                      >
                        {product.moderation_status === "approved"
                          ? "Approved"
                          : product.moderation_status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => window.open(`/product/${product.id}`, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {product.moderation_status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90 h-8"
                              onClick={() => openModerationDialog(product, "approve")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={() => openModerationDialog(product, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {product.moderation_status !== "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => openModerationDialog(product, product.moderation_status === "approved" ? "reject" : "approve")}
                          >
                            {product.moderation_status === "approved" ? "Reject" : "Approve"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Moderation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderationAction === "approve" ? "Approve Product" : "Reject Product"}
            </DialogTitle>
            <DialogDescription>
              {moderationAction === "approve"
                ? "This product will be visible on the marketplace."
                : "Please provide a reason for rejection. The seller will see this feedback."}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-lg bg-background overflow-hidden flex-shrink-0">
                  {selectedProduct.thumbnail_url ? (
                    <img
                      src={selectedProduct.thumbnail_url}
                      alt={selectedProduct.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedProduct.title}</p>
                  <p className="text-sm text-muted-foreground">
                    by {selectedProduct.seller_name}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {moderationAction === "reject" ? "Rejection Reason (required)" : "Notes (optional)"}
                </label>
                <Textarea
                  placeholder={
                    moderationAction === "reject"
                      ? "Explain why this product was rejected..."
                      : "Add any notes for this product..."
                  }
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => moderationAction && handleModeration(moderationAction)}
              className={
                moderationAction === "approve"
                  ? "bg-success hover:bg-success/90"
                  : ""
              }
              variant={moderationAction === "reject" ? "destructive" : "default"}
              disabled={moderationAction === "reject" && !moderationNotes.trim()}
            >
              {moderationAction === "approve" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductModerationSection;
