import { useState, useRef } from "react";
import { Loader2, Upload, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category: string;
  thumbnail_url: string | null;
  file_url: string | null;
  is_free: boolean;
  is_published: boolean;
}

interface ProductFormProps {
  product: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  "Business Templates",
  "CV / Resume",
  "Legal Docs",
  "Design Assets",
  "Ebooks",
  "UI Kits",
  "Icons",
  "Social Media",
  "Other",
];

const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price?.toString() || "0");
  const [originalPrice, setOriginalPrice] = useState(
    product?.original_price?.toString() || ""
  );
  const [category, setCategory] = useState(product?.category || "");
  const [isFree, setIsFree] = useState(product?.is_free || false);
  const [isPublished, setIsPublished] = useState(product?.is_published || false);
  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnail_url || "");
  const [fileUrl, setFileUrl] = useState(product?.file_url || "");
  const [fileName, setFileName] = useState(product?.file_url ? "Existing file" : "");

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Thumbnail must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingThumbnail(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-thumbnails")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("product-thumbnails")
        .getPublicUrl(fileName);

      setThumbnailUrl(`${urlData.publicUrl}?t=${Date.now()}`);

      toast({
        title: "Thumbnail uploaded",
        description: "Your product image has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Product file must be less than 100MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingFile(true);

    try {
      const fileExt = file.name.split(".").pop();
      const uploadFileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-files")
        .upload(uploadFileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Store the file path for database
      setFileUrl(uploadFileName);
      setFileName(file.name);

      toast({
        title: "File uploaded",
        description: "Your product file has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a product title.",
        variant: "destructive",
      });
      return;
    }

    if (!category) {
      toast({
        title: "Category required",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        seller_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        price: isFree ? 0 : parseFloat(price) || 0,
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        category,
        thumbnail_url: thumbnailUrl || null,
        file_url: fileUrl || null,
        is_free: isFree,
        is_published: isPublished,
        moderation_status: 'approved' as const,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;

        toast({
          title: "Product updated",
          description: "Your product has been updated successfully.",
        });
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;

        toast({
          title: "Product created",
          description: "Your product has been added to your catalog.",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error saving product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thumbnail */}
      <div className="space-y-2">
        <Label>Product Thumbnail</Label>
        <div className="flex items-start gap-4">
          <div
            onClick={() => thumbnailInputRef.current?.click()}
            className="h-32 w-32 rounded-lg border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors overflow-hidden"
          >
            {isUploadingThumbnail ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Thumbnail"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              Upload a thumbnail image for your product. Recommended size: 800x600px.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={isUploadingThumbnail}
            >
              {isUploadingThumbnail ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Image
            </Button>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Business Plan Template Pro"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your product..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={2000}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Free Product</Label>
          <Switch checked={isFree} onCheckedChange={setIsFree} />
        </div>

        {!isFree && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="29.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price ($)</Label>
              <Input
                id="originalPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="49.00"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Shows as crossed-out price
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Product File */}
      <div className="space-y-2">
        <Label>Product File</Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingFile}
          >
            {isUploadingFile ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Upload File
          </Button>
          {fileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="truncate max-w-[200px]">{fileName}</span>
              <button
                type="button"
                onClick={() => setFileName("")}
                className="text-destructive hover:text-destructive/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Upload your product file (PDF, ZIP, etc.). Max 100MB.
        </p>
      </div>

      {/* Publish */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/30">
        <div>
          <p className="font-medium">Publish immediately</p>
          <p className="text-sm text-muted-foreground">
            Make this product visible on the marketplace
          </p>
        </div>
        <Switch checked={isPublished} onCheckedChange={setIsPublished} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="btn-gradient-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : product ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
