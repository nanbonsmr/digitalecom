import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Bell,
  DollarSign,
  ShoppingCart,
  Package,
  Clock,
  Upload,
  ArrowRight,
  HelpCircle,
  Menu,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import SellerSidebar from "@/components/seller/SellerSidebar";
import StatCard from "@/components/seller/StatCard";
import ProductRow from "@/components/seller/ProductRow";
import SalesChart from "@/components/seller/SalesChart";
import ProductForm from "@/components/seller/ProductForm";
import ProductsSection from "@/components/seller/sections/ProductsSection";
import OrdersSection from "@/components/seller/sections/OrdersSection";
import EarningsSection from "@/components/seller/sections/EarningsSection";
import DiscountsSection from "@/components/seller/sections/DiscountsSection";
import ReviewsSection from "@/components/seller/sections/ReviewsSection";
import SettingsSection from "@/components/seller/sections/SettingsSection";

// Stats will be calculated from real data

interface Product {
  id: string;
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
  moderation_status: "pending" | "approved" | "rejected";
  moderation_notes: string | null;
}

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && profile && !profile.is_seller) {
      toast({
        title: "Access Denied",
        description: "Please enable seller mode in your profile to access the dashboard.",
        variant: "destructive",
      });
      navigate("/profile");
    } else if (user && profile?.is_seller) {
      fetchProducts();
    }
  }, [user, profile, loading, navigate]);

  const fetchProducts = async () => {
    if (!user) return;
    setIsLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setIsProductFormOpen(true);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted" });
      fetchProducts();
    }
  };

  const handleProductSaved = () => {
    setIsProductFormOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate real stats from products
  const displayProducts = products.map(p => ({
    id: p.id,
    title: p.title,
    thumbnail: p.thumbnail_url || undefined,
    price: p.price,
    downloads: p.download_count || 0,
    status: p.is_published ? "active" as const : "draft" as const,
    moderationStatus: p.moderation_status,
  }));

  const stats = {
    totalSales: products.reduce((sum, p) => sum + (p.download_count || 0), 0),
    totalEarnings: products.reduce((sum, p) => sum + ((p.download_count || 0) * p.price), 0),
    activeProducts: products.filter(p => p.is_published).length,
    draftProducts: products.filter(p => !p.is_published).length,
    totalProducts: products.length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SellerSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            if (section === "upload") {
              setEditingProduct(null);
              setIsProductFormOpen(true);
            }
          }}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SellerSidebar
            isCollapsed={false}
            onToggle={() => {}}
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              if (section === "upload") {
                setEditingProduct(null);
                setIsProductFormOpen(true);
              }
              setIsMobileSidebarOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border h-16 flex items-center px-4 lg:px-6">
          <div className="flex items-center justify-between w-full gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page Title */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-foreground">Seller Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Hello, {profile?.display_name || "Seller"}! 👋
              </p>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or orders..."
                  className="pl-10 h-10 rounded-full bg-muted/50 border-0"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.display_name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{profile?.display_name || "Seller"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/">Back to Marketplace</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-6 space-y-6">
          {activeSection === "overview" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Sales"
                  value={stats.totalSales}
                  icon={ShoppingCart}
                  trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                  title="Total Earnings"
                  value={`$${stats.totalEarnings.toLocaleString()}`}
                  icon={DollarSign}
                  trend={{ value: 8, isPositive: true }}
                />
                <StatCard
                  title="Active Products"
                  value={stats.activeProducts}
                  icon={Package}
                  trend={{ value: 2, isPositive: true }}
                />
                <StatCard
                  title="Draft Products"
                  value={stats.draftProducts}
                  icon={Clock}
                />
              </div>

              {/* Sales Chart */}
              <SalesChart />

              {/* Upload CTA + Earnings Summary */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Upload CTA */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        Upload a New Digital Product
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add PDFs, ZIP bundles, templates, and start earning today.
                      </p>
                      <Button
                        className="mt-4 btn-gradient-primary"
                        onClick={() => {
                          setEditingProduct(null);
                          setIsProductFormOpen(true);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Product
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Earnings Summary */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Earnings & Payout
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                      <p className="text-2xl font-bold text-foreground">${stats.totalEarnings}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                      <p className="text-2xl font-bold text-foreground">$0</p>
                      <p className="text-xs text-muted-foreground mt-1">Pending</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-xl">
                      <p className="text-2xl font-bold text-foreground">$0</p>
                      <p className="text-xs text-muted-foreground mt-1">Withdrawn</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline" onClick={() => setActiveSection("earnings")}>
                    View Earnings Details
                  </Button>
                </div>
              </div>

              {/* Products + Reviews Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* My Products */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm">
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">My Products</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your latest digital products
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveSection("products")}>
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    {isLoadingProducts ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : displayProducts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No products yet. Upload your first one!</p>
                      </div>
                    ) : (
                      displayProducts.slice(0, 3).map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          onView={(id) => navigate(`/product/${id}`)}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Reviews */}
                <div className="bg-card rounded-2xl border border-border/50 shadow-sm">
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Customer Reviews</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Latest feedback from buyers
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveSection("reviews")}>
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Reviews will appear here once customers purchase your products.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center py-6 border-t border-border">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Need help? Visit the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Seller Support Center
                  </a>{" "}
                  or contact us anytime.
                </p>
              </div>
            </>
          )}

          {activeSection === "products" && (
            <ProductsSection
              products={displayProducts}
              isLoading={isLoadingProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onView={(id) => navigate(`/product/${id}`)}
              onUploadNew={() => {
                setEditingProduct(null);
                setIsProductFormOpen(true);
              }}
            />
          )}

          {activeSection === "orders" && <OrdersSection />}

          {activeSection === "earnings" && (
            <EarningsSection totalEarnings={stats.totalEarnings} />
          )}

          {activeSection === "discounts" && <DiscountsSection />}

          {activeSection === "reviews" && <ReviewsSection />}

          {activeSection === "settings" && <SettingsSection />}
        </main>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Upload New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSuccess={handleProductSaved}
            onCancel={() => {
              setIsProductFormOpen(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerDashboard;
