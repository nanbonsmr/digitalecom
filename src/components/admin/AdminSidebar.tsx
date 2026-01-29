import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  FileCheck,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  pendingProducts?: number;
  pendingRequests?: number;
}

const menuItems = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "products", label: "Product Moderation", icon: FileCheck, badgeKey: "pendingProducts" },
  { id: "users", label: "All Users", icon: Users },
  { id: "sellers", label: "Sellers", icon: Store },
  { id: "requests", label: "Seller Requests", icon: ShieldCheck, badgeKey: "pendingRequests" },
  { id: "settings", label: "Settings", icon: Settings },
];

export const AdminSidebar = ({
  isCollapsed,
  onToggle,
  activeSection,
  onSectionChange,
  pendingProducts = 0,
  pendingRequests = 0,
}: AdminSidebarProps) => {
  const { signOut } = useAuth();

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === "pendingProducts") return pendingProducts;
    if (badgeKey === "pendingRequests") return pendingRequests;
    return 0;
  };

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
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Admin Panel</span>
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
        {menuItems.map((item) => {
          const badgeCount = getBadgeCount(item.badgeKey);
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
              {badgeCount > 0 && (
                <span
                  className={cn(
                    "h-5 min-w-5 px-1.5 rounded-full text-xs flex items-center justify-center font-medium",
                    activeSection === item.id
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary text-primary-foreground",
                    isCollapsed && "absolute -top-1 -right-1"
                  )}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Back to Marketplace & Logout */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          to="/"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
            isCollapsed && "justify-center px-2"
          )}
        >
          <Store className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Back to Marketplace</span>}
        </Link>
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

export default AdminSidebar;
