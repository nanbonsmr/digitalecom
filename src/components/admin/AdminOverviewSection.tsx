import {
  Users,
  Store,
  Package,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  pendingRequests: number;
  pendingProducts: number;
}

interface AdminOverviewSectionProps {
  stats: Stats;
  onNavigate: (section: string) => void;
}

const AdminOverviewSection = ({ stats, onNavigate }: AdminOverviewSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor your platform at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSellers}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved sellers</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Listed products</p>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-md transition-shadow ${stats.pendingProducts > 0 ? "border-primary/50 bg-primary/5" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Products</CardTitle>
            <FileCheck className={`h-4 w-4 ${stats.pendingProducts > 0 ? "text-primary" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.pendingProducts > 0 ? "text-primary" : ""}`}>
              {stats.pendingProducts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className={`hover:shadow-md transition-shadow ${stats.pendingRequests > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seller Requests</CardTitle>
            <ShieldCheck className={`h-4 w-4 ${stats.pendingRequests > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.pendingRequests > 0 ? "text-amber-500" : ""}`}>
              {stats.pendingRequests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Products CTA */}
        {stats.pendingProducts > 0 && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Products Awaiting Review
              </CardTitle>
              <CardDescription>
                {stats.pendingProducts} products need your approval before appearing on the marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate("products")} className="btn-gradient-primary">
                Review Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Seller Requests CTA */}
        {stats.pendingRequests > 0 && (
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                Seller Applications
              </CardTitle>
              <CardDescription>
                {stats.pendingRequests} users are waiting for seller approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onNavigate("requests")} variant="outline" className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
                Review Requests
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Platform Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Growth
            </CardTitle>
            <CardDescription>Your marketplace is growing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">Users</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{stats.totalSellers}</p>
                <p className="text-xs text-muted-foreground mt-1">Sellers</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
                <p className="text-xs text-muted-foreground mt-1">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate("users")}>
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate("sellers")}>
              <Store className="h-4 w-4 mr-2" />
              View Sellers
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate("products")}>
              <Package className="h-4 w-4 mr-2" />
              Moderate Products
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverviewSection;
