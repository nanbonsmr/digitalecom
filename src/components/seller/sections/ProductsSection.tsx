import { useState } from "react";
import { Package, Search, Plus, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductRow from "@/components/seller/ProductRow";

interface Product {
  id: string;
  title: string;
  thumbnail?: string;
  price: number;
  downloads: number;
  status: "active" | "draft";
}

interface ProductsSectionProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onUploadNew: () => void;
}

const ProductsSection = ({
  products,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onUploadNew,
}: ProductsSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Products</h2>
          <p className="text-muted-foreground">
            Manage your digital products catalog
          </p>
        </div>
        <Button className="btn-gradient-primary" onClick={onUploadNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="active">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products List */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No products found"
                : "No products yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by uploading your first digital product"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button className="btn-gradient-primary" onClick={onUploadNew}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4">
                <ProductRow
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {products.filter((p) => p.status === "active").length}
          </p>
          <p className="text-sm text-muted-foreground">Published</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {products.filter((p) => p.status === "draft").length}
          </p>
          <p className="text-sm text-muted-foreground">Drafts</p>
        </div>
        <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {products.reduce((sum, p) => sum + p.downloads, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Downloads</p>
        </div>
      </div>
    </div>
  );
};

export default ProductsSection;
