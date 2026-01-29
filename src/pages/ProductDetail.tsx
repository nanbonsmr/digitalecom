import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Download,
  Heart,
  Share2,
  Shield,
  Clock,
  FileCheck,
  Loader2,
  User,
  Package,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/marketplace/Navbar";
import Footer from "@/components/marketplace/Footer";

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  thumbnail_url: string | null;
  is_free: boolean;
  is_published: boolean;
  download_count: number;
  created_at: string;
}

interface SellerProfile {
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, isInCart } = useCart();
  const inCart = id ? isInCart(id) : false;

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .maybeSingle();

      if (productError) throw productError;

      if (!productData) {
        navigate("/404");
        return;
      }

      setProduct(productData);

      // Fetch seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, bio")
        .eq("user_id", productData.seller_id)
        .maybeSingle();

      if (!sellerError && sellerData) {
        setSeller(sellerData);
      }
    } catch (error: any) {
      toast({
        title: "Error loading product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (id) {
      addToCart(id);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Share",
        description: "Copy the URL from your browser to share this product.",
      });
    }
  };

  const discountPercentage =
    product?.original_price && product.price < product.original_price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <p className="text-muted-foreground mb-6">
            This product may have been removed or is no longer available.
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/#products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      <main className="container py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl bg-secondary overflow-hidden border border-border">
              {product.thumbnail_url ? (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 rounded-xl bg-secondary/50 text-center">
                <Download className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs font-medium">Instant Download</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-secondary/50 text-center">
                <Shield className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs font-medium">Secure Payment</p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-secondary/50 text-center">
                <FileCheck className="h-5 w-5 text-primary mb-2" />
                <p className="text-xs font-medium">Quality Verified</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{product.category}</Badge>
              {product.is_free && (
                <Badge className="bg-success text-success-foreground">Free</Badge>
              )}
              {discountPercentage && (
                <Badge className="bg-accent text-accent-foreground">
                  {discountPercentage}% OFF
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              {product.title}
            </h1>

            {/* Rating & Downloads */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < 4
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span className="ml-1 text-muted-foreground">(4.8)</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1 text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>{product.download_count} downloads</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {product.is_free ? (
                <span className="text-4xl font-bold text-success">Free</span>
              ) : (
                <>
                  <span className="text-4xl font-bold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.original_price && (
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.original_price.toFixed(2)}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className={cn(
                  "flex-1 h-14 text-lg",
                  inCart ? "bg-success hover:bg-success/90" : "btn-gradient-primary"
                )}
                onClick={handleAddToCart}
                disabled={inCart}
              >
                {inCart ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.is_free ? "Download Free" : "Add to Cart"}
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="h-14">
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            {/* Seller Info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border">
              <Avatar className="h-14 w-14">
                <AvatarImage src={seller?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {seller?.display_name?.charAt(0) || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {seller?.display_name || "Anonymous Seller"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {seller?.bio || "Digital product creator"}
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">What's included:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileCheck className="h-4 w-4 text-success" />
                  High-quality digital files
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Download className="h-4 w-4 text-success" />
                  Instant download after purchase
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-success" />
                  Lifetime access to files
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-success" />
                  Money-back guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
