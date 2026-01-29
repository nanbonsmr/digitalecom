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
  Briefcase,
  FileText,
  Scale,
  Palette,
  BookOpen,
  Package,
  Gift,
  TrendingUp,
  Clock,
  Star as StarIcon,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Navbar from "@/components/marketplace/Navbar";
import Footer from "@/components/marketplace/Footer";
import ProductCard from "@/components/marketplace/ProductCard";
import CategoryPill from "@/components/marketplace/CategoryPill";
import BundleCard from "@/components/marketplace/BundleCard";
import FeatureCard from "@/components/marketplace/FeatureCard";
import TestimonialCard from "@/components/marketplace/TestimonialCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Import images
import heroMockup from "@/assets/hero-mockup.jpg";
import bundleBusiness from "@/assets/bundle-business.jpg";
import bundleResume from "@/assets/bundle-resume.jpg";
import bundleBranding from "@/assets/bundle-branding.jpg";
import productBusinessPlan from "@/assets/product-business-plan.jpg";
import productUiKit from "@/assets/product-ui-kit.jpg";
import productEbook from "@/assets/product-ebook.jpg";
import productSocial from "@/assets/product-social.jpg";
import productInvoice from "@/assets/product-invoice.jpg";
import productIcons from "@/assets/product-icons.jpg";
import productPitch from "@/assets/product-pitch.jpg";
import productResume from "@/assets/product-resume.jpg";

interface DbProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  category: string;
  thumbnail_url: string | null;
  is_free: boolean;
  download_count: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, original_price, category, thumbnail_url, is_free, download_count")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      setDbProducts(data || []);
    } catch (error: any) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const categories = [
    { label: "Business Templates", icon: <Briefcase className="h-4 w-4" /> },
    { label: "CV / Resume", icon: <FileText className="h-4 w-4" /> },
    { label: "Legal Docs", icon: <Scale className="h-4 w-4" /> },
    { label: "Design Assets", icon: <Palette className="h-4 w-4" /> },
    { label: "Ebooks", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Bundles", icon: <Package className="h-4 w-4" /> },
    { label: "Free Downloads", icon: <Gift className="h-4 w-4" /> },
  ];

  const products = [
    {
      title: "Business Plan Template Pro",
      creator: "StartupDocs",
      price: 29,
      originalPrice: 49,
      rating: 4.8,
      reviewCount: 234,
      image: productBusinessPlan,
    },
    {
      title: "Mobile App UI Kit",
      creator: "DesignLab",
      price: 59,
      originalPrice: 89,
      rating: 4.9,
      reviewCount: 567,
      image: productUiKit,
    },
    {
      title: "Digital Marketing Ebook",
      creator: "MarketPro",
      price: 19,
      rating: 4.7,
      reviewCount: 189,
      image: productEbook,
    },
    {
      title: "Social Media Template Kit",
      creator: "ContentCreators",
      price: 39,
      originalPrice: 59,
      rating: 4.6,
      reviewCount: 312,
      image: productSocial,
    },
    {
      title: "Invoice Template Pack",
      creator: "BusinessEssentials",
      price: 0,
      rating: 4.5,
      reviewCount: 89,
      image: productInvoice,
      isFree: true,
    },
    {
      title: "Premium Icon Collection",
      creator: "IconMaster",
      price: 24,
      rating: 4.9,
      reviewCount: 445,
      image: productIcons,
    },
    {
      title: "Startup Pitch Deck",
      creator: "PitchPerfect",
      price: 49,
      originalPrice: 79,
      rating: 4.8,
      reviewCount: 178,
      image: productPitch,
    },
    {
      title: "Modern Resume Template",
      creator: "CareerBoost",
      price: 15,
      rating: 4.7,
      reviewCount: 623,
      image: productResume,
    },
  ];

  const bundles = [
    {
      title: "Startup Business Pack",
      description:
        "Everything you need to launch your startup. Business plan, pitch deck, financial projections, and more.",
      itemCount: 12,
      price: 79,
      originalPrice: 199,
      image: bundleBusiness,
    },
    {
      title: "Resume + Cover Letter Kit",
      description:
        "Land your dream job with professionally designed resume templates and matching cover letters.",
      itemCount: 8,
      price: 29,
      originalPrice: 59,
      image: bundleResume,
    },
    {
      title: "Branding Assets Pack",
      description:
        "Complete branding toolkit with logo templates, social media graphics, and brand guidelines.",
      itemCount: 15,
      price: 99,
      originalPrice: 249,
      image: bundleBranding,
    },
  ];

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
      <section className="hero-gradient py-16 lg:py-24 overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  Trusted by 50,000+ creators
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Buy & Download{" "}
                  <span className="text-primary">Premium Digital Assets</span> Instantly
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  PDFs, ZIP packs, templates, UI kits, ebooks, and tools for creators and
                  businesses. Start building faster today.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="btn-gradient-primary rounded-full px-8 h-12 text-base">
                  Browse Products
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-12 text-base border-2 hover:bg-secondary"
                >
                  Start Selling
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">10,000+</p>
                    <p className="text-sm text-muted-foreground">Downloads</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">500+</p>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Secure</p>
                    <p className="text-sm text-muted-foreground">Payments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative lg:pl-8">
              <div className="relative animate-float">
                <img
                  src={heroMockup}
                  alt="Digital product marketplace preview"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                {/* Floating badge */}
                <div className="absolute -left-4 top-1/4 bg-card rounded-xl p-4 shadow-lg border border-border animate-pulse-soft hidden md:block">
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

      {/* Search + Categories Section */}
      <section id="categories" className="py-12 border-b border-border">
        <div className="container space-y-8">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates, ebooks, UI kits..."
                className="pl-12 pr-4 h-14 text-base rounded-2xl bg-card border-2 border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 btn-gradient-primary rounded-xl h-10">
                Search
              </Button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat, index) => (
              <CategoryPill key={cat.label} label={cat.label} icon={cat.icon} isActive={index === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-16 lg:py-20">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-sm font-medium text-primary uppercase tracking-wide">
                Featured Products
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                Top Picks for You
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {sortOptions.map((option, index) => (
                <Button
                  key={option}
                  variant={index === 0 ? "default" : "ghost"}
                  size="sm"
                  className={index === 0 ? "btn-gradient-primary rounded-full" : "rounded-full"}
                >
                  {index === 0 && <TrendingUp className="h-4 w-4 mr-1.5" />}
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Product Grid - Show DB products if available, otherwise show demo products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dbProducts.length > 0
              ? dbProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    creator="Seller"
                    price={product.price}
                    originalPrice={product.original_price || undefined}
                    rating={4.5}
                    reviewCount={product.download_count}
                    image={product.thumbnail_url || productBusinessPlan}
                    isFree={product.is_free}
                    onViewDetails={() => navigate(`/product/${product.id}`)}
                  />
                ))
              : products.map((product) => (
                  <ProductCard
                    key={product.title}
                    {...product}
                    onViewDetails={() => console.log("View details:", product.title)}
                  />
                ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              View All Products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Best Selling Bundles */}
      <section id="bundles" className="py-16 lg:py-20 bg-secondary/50">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              Save More, Get More
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Best Selling Bundles
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Get everything you need in one package. Our curated bundles save you up to 60% compared to
              buying individually.
            </p>
          </div>

          {/* Bundle Cards */}
          <div className="space-y-6">
            {bundles.map((bundle) => (
              <BundleCard
                key={bundle.title}
                {...bundle}
                onView={() => console.log("View bundle:", bundle.title)}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Button size="lg" className="btn-gradient-primary rounded-full px-8">
              View All Bundles
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              Why DigitalHub
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Built for Creators & Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <section className="py-16 lg:py-20 bg-secondary/50">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <Search className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Browse Products</h3>
              <p className="text-muted-foreground">
                Explore our curated collection of premium digital products.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <CreditCard className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Pay Securely</h3>
              <p className="text-muted-foreground">
                Complete your purchase with our secure checkout system.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto transition-all duration-300 group-hover:bg-primary group-hover:scale-110">
                  <Download className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Download Instantly</h3>
              <p className="text-muted-foreground">
                Get immediate access to your files and start using them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA Section */}
      <section id="seller" className="py-16 lg:py-24 dark-gradient text-center">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Start earning today
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Sell Your Digital Products & Earn Online
            </h2>
            <p className="text-lg text-white/70">
              Join thousands of creators who are already earning on DigitalHub. Turn your expertise into
              income.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-white/90">
                <Upload className="h-5 w-5 text-primary" />
                <span>Upload products easily</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>Set your own price</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Track sales in dashboard</span>
              </div>
            </div>

            <Button
              size="lg"
              className="btn-gradient-accent rounded-full px-10 h-14 text-lg font-semibold mt-4"
            >
              Become a Seller
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
