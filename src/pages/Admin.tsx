import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Menu, Bell, Search } from "lucide-react";
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverviewSection from "@/components/admin/AdminOverviewSection";
import ProductModerationSection from "@/components/admin/ProductModerationSection";
import UsersSection from "@/components/admin/UsersSection";
import SellersSection from "@/components/admin/SellersSection";
import SellerRequestsSection from "@/components/admin/SellerRequestsSection";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_seller: boolean | null;
  seller_request_pending: boolean | null;
  bio: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: "admin" | "moderator" | "user";
}

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  pendingRequests: number;
  pendingProducts: number;
}

const Admin = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    pendingRequests: 0,
    pendingProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      }
      setCheckingAdmin(false);
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !checkingAdmin) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        });
      }
    }
  }, [user, loading, checkingAdmin, isAdmin, navigate, toast]);

  // Fetch all data
  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;
      setUserRoles(rolesData || []);

      // Fetch stats
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: pendingProductCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("moderation_status", "pending");

      const sellers = profilesData?.filter((p) => p.is_seller) || [];
      const pending = profilesData?.filter((p) => p.seller_request_pending) || [];

      setStats({
        totalUsers: profilesData?.length || 0,
        totalSellers: sellers.length,
        totalProducts: productCount || 0,
        pendingRequests: pending.length,
        pendingProducts: pendingProductCount || 0,
      });
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          pendingProducts={stats.pendingProducts}
          pendingRequests={stats.pendingRequests}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebar
            isCollapsed={false}
            onToggle={() => {}}
            activeSection={activeSection}
            onSectionChange={(section) => {
              setActiveSection(section);
              setIsMobileSidebarOpen(false);
            }}
            pendingProducts={stats.pendingProducts}
            pendingRequests={stats.pendingRequests}
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
              <h1 className="text-xl font-semibold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {profile?.display_name || "Admin"}! 👋
              </p>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users or products..."
                  className="pl-10 h-10 rounded-full bg-muted/50 border-0"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {(stats.pendingProducts > 0 || stats.pendingRequests > 0) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {profile?.display_name?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{profile?.display_name || "Admin"}</p>
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
        <main className="p-4 lg:p-6">
          {activeSection === "overview" && (
            <AdminOverviewSection stats={stats} onNavigate={setActiveSection} />
          )}

          {activeSection === "products" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Product Moderation</h2>
                <p className="text-muted-foreground">Review and approve products</p>
              </div>
              <ProductModerationSection onProductModerated={fetchData} />
            </div>
          )}

          {activeSection === "users" && (
            <UsersSection
              profiles={profiles}
              userRoles={userRoles}
              isLoading={isLoading}
              onDataChange={fetchData}
            />
          )}

          {activeSection === "sellers" && (
            <SellersSection
              profiles={profiles}
              isLoading={isLoading}
              onDataChange={fetchData}
            />
          )}

          {activeSection === "requests" && (
            <SellerRequestsSection
              profiles={profiles}
              isLoading={isLoading}
              onDataChange={fetchData}
            />
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Settings</h2>
                <p className="text-muted-foreground">Platform configuration</p>
              </div>
              <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                <p className="text-muted-foreground">Settings section coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
