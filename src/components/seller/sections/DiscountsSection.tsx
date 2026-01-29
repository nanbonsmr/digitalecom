import { useState } from "react";
import { Percent, Plus, Trash2, Copy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
}

const DiscountsSection = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "",
    type: "percentage" as "percentage" | "fixed",
    usageLimit: "",
    expiresAt: "",
  });

  const handleCreateCoupon = () => {
    if (!newCoupon.code || !newCoupon.discount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const coupon: Coupon = {
      id: Date.now().toString(),
      code: newCoupon.code.toUpperCase(),
      discount: parseFloat(newCoupon.discount),
      type: newCoupon.type,
      usageLimit: parseInt(newCoupon.usageLimit) || 0,
      usedCount: 0,
      isActive: true,
      expiresAt: newCoupon.expiresAt || null,
    };

    setCoupons([...coupons, coupon]);
    setNewCoupon({
      code: "",
      discount: "",
      type: "percentage",
      usageLimit: "",
      expiresAt: "",
    });
    setIsDialogOpen(false);

    toast({
      title: "Coupon created",
      description: `Coupon ${coupon.code} has been created.`,
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Coupon code copied to clipboard.",
    });
  };

  const handleDeleteCoupon = (id: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
    toast({
      title: "Coupon deleted",
    });
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons(
      coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Discounts & Coupons
          </h2>
          <p className="text-muted-foreground">
            Create and manage promotional codes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., SUMMER25"
                  value={newCoupon.code}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, code: e.target.value })
                  }
                  className="uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount *</Label>
                  <Input
                    id="discount"
                    type="number"
                    placeholder="25"
                    value={newCoupon.discount}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newCoupon.type}
                    onValueChange={(value: "percentage" | "fixed") =>
                      setNewCoupon({ ...newCoupon, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={newCoupon.usageLimit}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, usageLimit: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={newCoupon.expiresAt}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, expiresAt: e.target.value })
                  }
                />
              </div>

              <Button
                className="w-full btn-gradient-primary"
                onClick={handleCreateCoupon}
              >
                Create Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coupons List */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm">
        {coupons.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No coupons yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Create discount coupons to offer special deals to your customers.
            </p>
            <Button
              className="btn-gradient-primary"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Coupon
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Percent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">
                        {coupon.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Badge variant={coupon.isActive ? "default" : "secondary"}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {coupon.type === "percentage"
                        ? `${coupon.discount}% off`
                        : `$${coupon.discount} off`}
                      {coupon.usageLimit > 0 &&
                        ` • ${coupon.usedCount}/${coupon.usageLimit} used`}
                      {coupon.expiresAt && ` • Expires ${coupon.expiresAt}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={() => handleToggleCoupon(coupon.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-muted/30 rounded-xl p-4">
        <h4 className="font-medium text-foreground mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use memorable codes like SUMMER25 or WELCOME10</li>
          <li>• Set usage limits to create urgency</li>
          <li>• Share codes on social media for better reach</li>
        </ul>
      </div>
    </div>
  );
};

export default DiscountsSection;
