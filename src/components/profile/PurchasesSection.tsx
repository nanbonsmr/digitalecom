import { useState, useEffect } from "react";
import { Download, Package, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

      // Type assertion to handle the nested query result
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
      // Get signed URL for private file
      const { data, error } = await supabase.storage
        .from("product-files")
        .createSignedUrl(item.product.file_url, 60); // 60 seconds expiry

      if (error) throw error;

      // Open download in new tab
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Purchases
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Purchases
          </CardTitle>
          <CardDescription>
            Products you've purchased will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>You haven't made any purchases yet.</p>
            <Button variant="link" className="mt-2" asChild>
              <a href="/#products">Browse Products</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Your Purchases
        </CardTitle>
        <CardDescription>
          Download your purchased products anytime
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                <span>Order placed: </span>
                <span className="font-medium text-foreground">
                  {format(new Date(order.created_at), "MMM d, yyyy")}
                </span>
              </div>
              <Badge variant="secondary" className="bg-success/20 text-success">
                Completed
              </Badge>
            </div>

            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="h-14 w-14 rounded-md bg-secondary overflow-hidden flex-shrink-0">
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

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {item.product?.title || "Product"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.product?.category} • ${item.price.toFixed(2)}
                    </p>
                  </div>

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
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PurchasesSection;
