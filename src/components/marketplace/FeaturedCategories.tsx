import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface CategoryConfig {
  label: string;
  dbCategory: string;
  image: string;
}

const categoryConfigs: CategoryConfig[] = [
  {
    label: "Templates",
    dbCategory: "Templates",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
  },
  {
    label: "UI Kits",
    dbCategory: "UI Kits",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop",
  },
  {
    label: "Ebooks",
    dbCategory: "Ebooks",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
  },
  {
    label: "Icons",
    dbCategory: "Icons",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
  },
  {
    label: "Presentations",
    dbCategory: "Presentations",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
  },
  {
    label: "Documents",
    dbCategory: "Documents",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
  },
];

const FeaturedCategories = () => {
  const navigate = useNavigate();
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("category")
          .eq("is_published", true);

        if (error) throw error;

        // Count products per category
        const counts: Record<string, number> = {};
        data?.forEach((product) => {
          const category = product.category;
          counts[category] = (counts[category] || 0) + 1;
        });

        setCategoryCounts(counts);
      } catch (error) {
        console.error("Error fetching category counts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const handleCategoryClick = (categoryLabel: string) => {
    navigate(`/products?category=${encodeURIComponent(categoryLabel)}`);
  };

  return (
    <section className="py-10 md:py-16 lg:py-20 bg-secondary/30">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-6 md:mb-10">
          <span className="text-xs md:text-sm font-medium text-primary uppercase tracking-wide">
            Browse by Category
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mt-2">
            Find What You Need
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-2 md:mt-3 max-w-2xl mx-auto">
            Explore our curated collection of premium digital assets across popular categories
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categoryConfigs.map((category) => (
            <Card
              key={category.label}
              className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              onClick={() => handleCategoryClick(category.dbCategory)}
            >
              <AspectRatio ratio={4 / 3}>
                <img
                  src={category.image}
                  alt={category.label}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </AspectRatio>
              <CardContent className="absolute bottom-0 left-0 right-0 p-2 md:p-3 text-white">
                <h3 className="font-semibold text-xs sm:text-sm md:text-base truncate">
                  {category.label}
                </h3>
                {isLoading ? (
                  <Skeleton className="h-3 w-12 md:w-16 bg-white/20" />
                ) : (
                  <p className="text-[10px] md:text-xs text-white/80">
                    {categoryCounts[category.dbCategory] || 0} products
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
