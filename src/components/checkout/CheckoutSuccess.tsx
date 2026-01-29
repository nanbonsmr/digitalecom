import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Download, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PurchasedItem {
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

interface RecentOrder {
  id: string;
  order_items: PurchasedItem[];
}

const CheckoutSuccess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recentOrder, setRecentOrder] = useState<RecentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecentOrder();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecentOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
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
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setRecentOrder(data as unknown as RecentOrder);
    } catch (error: any) {
      console.error("Error fetching recent order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: PurchasedItem) => {
    if (!item.product?.file_url) {
      toast({
        title: "Download unavailable",
        description: "This product doesn't have a downloadable file yet.",
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

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-success" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Thank you for your purchase!</h1>
      <p className="text-muted-foreground mb-8">
        Your order has been confirmed. Download your digital products below or access them anytime from your profile.
      </p>

      {/* Download Section */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : recentOrder && recentOrder.order_items.length > 0 ? (
        <Card className="mb-8 text-left">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Your Downloads
            </h3>
            <div className="space-y-3">
              {recentOrder.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="h-12 w-12 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                    {item.product?.thumbnail_url ? (
                      <img
                        src={item.product.thumbnail_url}
                        alt={item.product?.title || "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {item.product?.title || "Product"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.product?.category}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item.id || !item.product?.file_url}
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
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild>
          <Link to="/profile">Go to Profile</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
