import {
  Users,
  Package,
  TrendingUp,
  ArrowRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalCustomers: number;
  totalProducts: number;
  publishedProducts: number;
}

interface StoreOverviewSectionProps {
  stats: Stats;
  onNavigate: (section: string) => void;
}

const StoreOverviewSection = ({ stats, onNavigate }: StoreOverviewSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Store Overview</h2>
        <p className="text-muted-foreground">Monitor your store at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Products in your store</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Visible to customers</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Products CTA */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Manage Products
            </CardTitle>
            <CardDescription>
              Add, edit, or remove products from your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate("products")} className="btn-gradient-primary">
              View Products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Store Stats
            </CardTitle>
            <CardDescription>Your store performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
                <p className="text-xs text-muted-foreground mt-1">Products</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{stats.publishedProducts}</p>
                <p className="text-xs text-muted-foreground mt-1">Live</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
                <p className="text-xs text-muted-foreground mt-1">Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate("products")}>
              <Package className="h-4 w-4 mr-2" />
              Manage Products
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate("users")}>
              <Users className="h-4 w-4 mr-2" />
              View Customers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreOverviewSection;