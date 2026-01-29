import {
  DollarSign,
  TrendingUp,
  Wallet,
  CreditCard,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EarningsSectionProps {
  totalEarnings: number;
}

const EarningsSection = ({ totalEarnings }: EarningsSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Earnings & Payouts</h2>
          <p className="text-muted-foreground">
            Track your revenue and manage payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="flex items-center text-green-500 text-sm font-medium">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +12%
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            ${totalEarnings.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Total Earnings</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">$0.00</p>
          <p className="text-sm text-muted-foreground mt-1">Available Balance</p>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">$0.00</p>
          <p className="text-sm text-muted-foreground mt-1">Pending Earnings</p>
        </div>
      </div>

      {/* Payout Section */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Request Payout
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Available balance must be at least $50 to request a payout. Payouts
              are processed within 3-5 business days.
            </p>
            <div className="p-4 rounded-xl bg-muted/30 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Available Balance
                </span>
                <span className="text-lg font-bold text-foreground">$0.00</span>
              </div>
            </div>
            <Button className="w-full" disabled>
              <Wallet className="h-4 w-4 mr-2" />
              Request Payout
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Minimum payout: $50.00
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Payment Methods
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Bank Transfer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Not configured
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Setup
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">PayPal</p>
                  <p className="text-xs text-muted-foreground">
                    Not configured
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Setup
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Transaction History
        </h3>
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No transactions yet. Your earnings and payouts will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarningsSection;
