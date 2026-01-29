import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const generateMockData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      sales: Math.floor(Math.random() * 15) + 2,
      earnings: Math.floor(Math.random() * 500) + 50,
    });
  }
  return data;
};

const timeRanges = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "This year", value: 365 },
];

export const SalesChart = () => {
  const [selectedRange, setSelectedRange] = useState(30);
  const data = generateMockData(selectedRange);

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sales Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Track your sales and earnings over time
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              size="sm"
              variant="ghost"
              className={cn(
                "h-8 px-3 text-xs",
                selectedRange === range.value &&
                  "bg-background shadow-sm text-foreground"
              )}
              onClick={() => setSelectedRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
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
              tickMargin={10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorSales)"
              name="Sales"
            />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#colorEarnings)"
              name="Earnings ($)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Earnings</span>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
