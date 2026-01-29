import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Category {
  label: string;
  image: string;
  productCount: number;
}

const categories: Category[] = [
  {
    label: "Business Templates",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
    productCount: 120,
  },
  {
    label: "UI Kits",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop",
    productCount: 85,
  },
  {
    label: "Ebooks",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
    productCount: 64,
  },
  {
    label: "Icons",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
    productCount: 200,
  },
  {
    label: "Presentations",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    productCount: 45,
  },
  {
    label: "Documents",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
    productCount: 92,
  },
];

const FeaturedCategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryLabel: string) => {
    navigate(`/products?category=${encodeURIComponent(categoryLabel)}`);
  };

  return (
    <section className="py-16 lg:py-20 bg-secondary/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-sm font-medium text-primary uppercase tracking-wide">
            Browse by Category
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Find What You Need
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Explore our curated collection of premium digital assets across popular categories
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Card
              key={category.label}
              className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              onClick={() => handleCategoryClick(category.label)}
            >
              <AspectRatio ratio={4 / 3}>
                <img
                  src={category.image}
                  alt={category.label}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </AspectRatio>
              <CardContent className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <h3 className="font-semibold text-sm md:text-base truncate">
                  {category.label}
                </h3>
                <p className="text-xs text-white/80">
                  {category.productCount} products
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
