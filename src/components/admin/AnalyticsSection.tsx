import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Package, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  download_count: number | null;
  price: number;
  thumbnail_url: string | null;
}

const timeRanges = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "All time", value: 365 },
];

const AnalyticsSection = () => {
  const [selectedRange, setSelectedRange] = useState(30);
  const [orders, setOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - selectedRange);

      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at")
        .gte("created_at", dateFrom.toISOString())
        .order("created_at", { ascending: true });

      setOrders(ordersData || []);

      // Fetch top products by downloads
      const { data: productsData } = await supabase
        .from("products")
        .select("id, title, download_count, price, thumbnail_url")
        .eq("is_published", true)
        .order("download_count", { ascending: false })
        .limit(5);

      setTopProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status === "completed" ? o.total_amount : 0), 0);
  const totalOrders = orders.filter(o => o.status === "completed").length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Generate chart data
  const generateChartData = () => {
    const data: { date: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    
    for (let i = selectedRange - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayOrders = orders.filter(o => 
        o.created_at.startsWith(dateStr) && o.status === "completed"
      );
      
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total_amount, 0),
        orders: dayOrders.length,
      });
    }
    
    // Aggregate if too many days
    if (selectedRange > 30) {
      const aggregated: typeof data = [];
      for (let i = 0; i < data.length; i += 7) {
        const week = data.slice(i, i + 7);
        aggregated.push({
          date: week[0]?.date || "",
          revenue: week.reduce((s, d) => s + d.revenue, 0),
          orders: week.reduce((s, d) => s + d.orders, 0),
        });
      }
      return aggregated;
    }
    
    return data;
  };

  const chartData = generateChartData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sales Analytics</h2>
          <p className="text-muted-foreground">Track your store's performance</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 px-3 text-xs",
                selectedRange === range.value && "bg-background shadow-sm text-foreground"
              )}
              onClick={() => setSelectedRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Last {selectedRange} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue Overview
          </CardTitle>
          <CardDescription>Daily revenue for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {chartData.some(d => d.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickMargin={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `$${value}`}
                    tickMargin={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No revenue data for this period</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top Products
          </CardTitle>
          <CardDescription>Most downloaded products</CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No products yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                    {product.thumbnail_url ? (
                      <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.title}</p>
                    <p className="text-sm text-muted-foreground">${product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{product.download_count || 0}</p>
                    <p className="text-xs text-muted-foreground">downloads</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
