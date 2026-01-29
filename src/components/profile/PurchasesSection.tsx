import { useState, useEffect } from "react";
import { Download, Package, Loader2, Trash2, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  product_id: string;
  price: number;
  quantity: number;
  product: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    file_url: string | null;
    category: string;
  } | null;
}

interface Order {
  id: string;
  payment_id: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

const PurchasesSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          payment_id,
          status,
          total_amount,
          created_at,
          order_items (
            id,
            product_id,
            price,
            quantity,
            product:products (
              id,
              title,
              thumbnail_url,
              file_url,
              category
            )
          )
        `)
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as unknown as Order[]) || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error loading purchases",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: OrderItem) => {
    if (!item.product?.file_url) {
      toast({
        title: "Download unavailable",
        description: "This product doesn't have a downloadable file.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingId(item.id);

    try {
      const { data, error } = await supabase.storage
        .from("product-files")
        .createSignedUrl(item.product.file_url, 60);

      if (error) throw error;

      window.open(data.signedUrl, "_blank");

      toast({
        title: "Download started",
        description: "Your file is being downloaded.",
      });
    } catch (error: any) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: error.message || "Could not download the file.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingId(orderId);

    try {
      // First delete order items
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Update local state
      setOrders(orders.filter(order => order.id !== orderId));

      toast({
        title: "Purchase removed",
        description: "The purchase has been removed from your history.",
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Could not delete the purchase.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Your Purchases
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="border-border/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Your Purchases
          </CardTitle>
          <CardDescription>
            Products you've purchased will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">You haven't made any purchases yet.</p>
            <Button variant="outline" asChild>
              <a href="/#products">Browse Products</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Your Purchases
        </CardTitle>
        <CardDescription>
          Download your purchased products anytime
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="border border-border/50 rounded-xl p-5 bg-card/50 hover:bg-card/80 transition-colors"
          >
            {/* Order Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(order.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium text-foreground">${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-success/20 text-success border-0">
                  Completed
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      disabled={deletingId === order.id}
                    >
                      {deletingId === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Purchase Record</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this purchase from your history? 
                        This action cannot be undone. You will lose access to download links for this order.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteOrder(order.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
                >
                  {/* Thumbnail */}
                  <div className="h-14 w-14 rounded-lg bg-secondary overflow-hidden flex-shrink-0 shadow-sm">
                    {item.product?.thumbnail_url ? (
                      <img
                        src={item.product.thumbnail_url}
                        alt={item.product?.title || "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {item.product?.title || "Product"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {item.product?.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <Button
                    size="sm"
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item.id || !item.product?.file_url}
                    className="flex-shrink-0"
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-1.5" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PurchasesSection;
