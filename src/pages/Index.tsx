import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  ShieldCheck,
  FileCheck,
  Infinity,
  ArrowRight,
  Sparkles,
  CreditCard,
  Upload,
  DollarSign,
  BarChart3,
  Package,
  TrendingUp,
  Zap,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import Navbar from "@/components/marketplace/Navbar";
import Footer from "@/components/marketplace/Footer";
import ProductCard from "@/components/marketplace/ProductCard";
import FeaturedCategories from "@/components/marketplace/FeaturedCategories";
import NewsletterSection from "@/components/marketplace/NewsletterSection";

import FeatureCard from "@/components/marketplace/FeatureCard";
import TestimonialCard from "@/components/marketplace/TestimonialCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Import images
import heroMockup from "@/assets/hero-mockup.jpg";
import productBusinessPlan from "@/assets/product-business-plan.jpg";

interface DbProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  category: string;
  thumbnail_url: string | null;
  is_free: boolean | null;
  download_count: number | null;
  seller_id: string;
  profiles?: {
    display_name: string | null;
  } | null;
}

interface MarketplaceStats {
  totalDownloads: number;
  totalProducts: number;
  totalSellers: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [stats, setStats] = useState<MarketplaceStats>({
    totalDownloads: 0,
    totalProducts: 0,
    totalSellers: 0,
  });

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, original_price, category, thumbnail_url, is_free, download_count, seller_id")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      
      // Fetch seller names for each product
      if (data && data.length > 0) {
        const sellerIds = [...new Set(data.map(p => p.seller_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", sellerIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
        
        const productsWithSellers = data.map(product => ({
          ...product,
          profiles: { display_name: profileMap.get(product.seller_id) || "Seller" }
        }));
        
        setDbProducts(productsWithSellers);
      } else {
        setDbProducts([]);
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch product stats
      const { data: productStats } = await supabase
        .from("products")
        .select("download_count")
        .eq("is_published", true);

      const totalDownloads = productStats?.reduce((sum, p) => sum + (p.download_count || 0), 0) || 0;
      const totalProducts = productStats?.length || 0;

      // Fetch seller count
      const { count: sellerCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_seller", true);

      setStats({
        totalDownloads: totalDownloads > 0 ? totalDownloads : 10000,
        totalProducts: totalProducts > 0 ? totalProducts : 500,
        totalSellers: sellerCount || 50,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };


  // Empty state message when no products
  const emptyStateMessage = {
    title: "No products yet",
    description: "Be the first to upload a product! Start selling your digital assets today."
  };


  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Startup Founder",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      feedback:
        "DigitalHub saved me weeks of work. The business plan template was exactly what I needed to secure funding for my startup.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Freelance Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      feedback:
        "The UI kits are incredibly well-organized. I use them as a starting point for all my client projects now.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Manager",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      feedback:
        "Best investment I've made for my team. The social media templates have transformed our content quality.",
      rating: 4,
    },
  ];

  const sortOptions = ["Trending", "Newest", "Best Rated", "Lowest Price"];

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k+`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="container flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>New: Weekly bundles are live 🎉</span>
          <a href="#bundles" className="underline underline-offset-2 hover:no-underline ml-1">
            Check them out →
          </a>
        </div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient dark:bg-gradient-to-br dark:from-background dark:via-background dark:to-primary/10 py-10 md:py-16 lg:py-24 overflow-hidden relative">
        {/* Dark mode decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none dark:block hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              <div className="space-y-3 md:space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium border border-primary/20 dark:border-primary/30">
                  <Zap className="h-3 w-3 md:h-4 md:w-4" />
                  Trusted by {formatNumber(stats.totalSellers * 1000)} creators
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Buy & Download{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 dark:from-primary dark:to-accent">Premium Digital Assets</span> Instantly
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  PDFs, ZIP packs, templates, UI kits, ebooks, and tools for creators and
                  businesses. Start building faster today.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="btn-gradient-primary rounded-full px-6 md:px-8 h-11 md:h-12 text-sm md:text-base shadow-lg shadow-primary/25 dark:shadow-primary/40"
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Browse Products
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6 md:px-8 h-11 md:h-12 text-sm md:text-base border-2 hover:bg-secondary dark:border-border dark:hover:bg-primary/10 dark:hover:border-primary/50 transition-all"
                  onClick={() => navigate('/seller')}
                >
                  Start Selling
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 pt-2 md:pt-4">
                <div className="flex items-center gap-2 group">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm md:text-base text-foreground">{formatNumber(stats.totalDownloads)}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Downloads</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 group">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm md:text-base text-foreground">{formatNumber(stats.totalProducts)}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Products</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 group">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm md:text-base text-foreground">{stats.totalSellers}+</p>
                    <p className="text-xs md:text-sm text-muted-foreground">Sellers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative lg:pl-8">
              <div className="relative animate-float">
                {/* Glow effect behind image in dark mode */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/20 rounded-2xl blur-2xl scale-105 dark:opacity-60 opacity-0 transition-opacity" />
                <img
                  src={heroMockup}
                  alt="Digital product marketplace preview"
                  className="w-full h-auto rounded-2xl shadow-2xl relative z-10 dark:ring-1 dark:ring-white/10"
                />
                {/* Floating badge */}
                <div className="absolute -left-4 top-1/4 bg-card rounded-xl p-4 shadow-lg border border-border dark:border-primary/20 animate-pulse-soft hidden md:block dark:bg-card/90 dark:backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                      <Download className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">New download!</p>
                      <p className="text-xs text-muted-foreground">Business Plan Pro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <FeaturedCategories />

      {/* Featured Products Section */}
      <section id="products" className="py-10 md:py-16 lg:py-20">
        <div className="container px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-10">
            <div>
              <span className="text-xs md:text-sm font-medium text-primary uppercase tracking-wide">
                Featured Products
              </span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-1 md:mt-2">
                Top Picks for You
              </h2>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
              {sortOptions.map((option, index) => (
                <Button
                  key={option}
                  variant={index === 0 ? "default" : "ghost"}
                  size="sm"
                  className={`text-xs md:text-sm px-2.5 md:px-4 ${index === 0 ? "btn-gradient-primary rounded-full" : "rounded-full"}`}
                >
                  {index === 0 && <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-1.5" />}
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {isLoadingProducts ? (
              // Loading skeletons
              [...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden border border-border/50">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex justify-between items-center pt-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              ))
            ) : dbProducts.length > 0 ? (
              dbProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  creator={product.profiles?.display_name || "Seller"}
                  price={product.price}
                  originalPrice={product.original_price || undefined}
                  rating={4.5}
                  reviewCount={product.download_count || 0}
                  image={product.thumbnail_url || productBusinessPlan}
                  isFree={product.is_free || false}
                  onViewDetails={() => navigate(`/product/${product.id}`)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {emptyStateMessage.title}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {emptyStateMessage.description}
                </p>
                <Button 
                  className="btn-gradient-primary rounded-full px-8"
                  onClick={() => navigate('/seller')}
                >
                  Start Selling
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8 md:mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-6 md:px-8 text-sm md:text-base"
              onClick={() => navigate('/products')}
            >
              View All Products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="py-10 md:py-16 lg:py-20">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-xs md:text-sm font-medium text-primary uppercase tracking-wide">
              Why DigitalHub
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-1 md:mt-2">
              Built for Creators & Businesses
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <FeatureCard
              icon={Download}
              title="Instant Download"
              description="Get your files immediately after purchase. No waiting, no delays."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Secure Payments"
              description="Your transactions are protected with enterprise-grade security."
            />
            <FeatureCard
              icon={FileCheck}
              title="Quality Verified"
              description="Every product is reviewed and verified by our quality team."
            />
            <FeatureCard
              icon={Infinity}
              title="Lifetime Access"
              description="Buy once, access forever. Including all future updates."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 md:py-16 lg:py-20 bg-secondary/50">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-xs md:text-sm font-medium text-primary uppercase tracking-wide">
              Simple Process
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-1 md:mt-2">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-4 md:mb-6">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <Search className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-bold flex items-center justify-center">
                  1
                </span>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">Browse Products</h3>
              <p className="text-xs md:text-base text-muted-foreground">
                Explore our curated collection of premium digital products.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-4 md:mb-6">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-bold flex items-center justify-center">
                  2
                </span>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">Pay Securely</h3>
              <p className="text-xs md:text-base text-muted-foreground">
                Complete your purchase with our secure checkout system.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-4 md:mb-6">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mx-auto transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <Download className="h-6 w-6 md:h-8 md:w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground text-xs md:text-sm font-bold flex items-center justify-center">
                  3
                </span>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">Download Instantly</h3>
              <p className="text-xs md:text-base text-muted-foreground">
                Get immediate access to your files and start using them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 md:py-16 lg:py-20">
        <div className="container px-4">
          <div className="text-center mb-8 md:mb-12">
            <span className="text-xs md:text-sm font-medium text-primary uppercase tracking-wide">
              Testimonials
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-1 md:mt-2">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA Section */}
      <section id="seller" className="py-12 md:py-16 lg:py-24 dark-gradient text-center">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto space-y-5 md:space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
              Start earning today
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Sell Your Digital Products & Earn Online
            </h2>
            <p className="text-sm md:text-lg text-white/70 px-4">
              Join {stats.totalSellers}+ creators who are already earning on DigitalHub. Turn your expertise into
              income.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-2 md:pt-4 text-xs md:text-base">
              <div className="flex items-center gap-1.5 md:gap-2 text-white/90">
                <Upload className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span>Upload products easily</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-white/90">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span>Set your own price</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 text-white/90">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <span>Track sales in dashboard</span>
              </div>
            </div>

            <Button
              size="lg"
              className="btn-gradient-accent rounded-full px-6 md:px-10 h-11 md:h-14 text-sm md:text-lg font-semibold mt-2 md:mt-4"
              onClick={() => navigate('/seller')}
            >
              Become a Seller
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection />

      <Footer />
    </div>
  );
};

export default Index;
