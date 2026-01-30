import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Upload,
  ShoppingCart,
  DollarSign,
  Percent,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import zyrobayLogo from "@/assets/zyrobay-logo.png";

interface SellerSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "products", label: "My Products", icon: Package },
  { id: "upload", label: "Upload New Product", icon: Upload },
  { id: "orders", label: "Orders & Downloads", icon: ShoppingCart },
  { id: "earnings", label: "Earnings & Payouts", icon: DollarSign },
  { id: "discounts", label: "Discounts & Coupons", icon: Percent },
  { id: "reviews", label: "Reviews & Ratings", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

export const SellerSidebar = ({
  isCollapsed,
  onToggle,
  activeSection,
  onSectionChange,
}: SellerSidebarProps) => {
  const { signOut } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <Link to="/" className="flex items-center">
            <img src={zyrobayLogo} alt="ZyroBay" className="h-10" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("h-8 w-8", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              activeSection === item.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={signOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default SellerSidebar;
