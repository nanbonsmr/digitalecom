import { cn } from "@/lib/utils";

interface CategoryPillProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export const CategoryPill = ({ label, icon, isActive, onClick }: CategoryPillProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
        "border border-border hover:border-primary/30",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-md"
          : "bg-card text-foreground hover:bg-secondary"
      )}
    >
      {icon && <span className="text-current">{icon}</span>}
      {label}
    </button>
  );
};

export default CategoryPill;
