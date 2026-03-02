"use client";

import { memo, useMemo, useState, useEffect, useCallback } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Zap, 
  Sparkles, 
  Heart, 
  Home, 
  ShoppingBag, 
  Cpu,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  {
    id: 1,
    title: "Electronics",
    description: "Latest gadgets & gear",
    icon: Cpu,
    image: "/trending_img1.avif", 
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    itemCount: "2.5k+ products",
  },
  {
    id: 2,
    title: "Fashion",
    description: "Trendy styles & outfits",
    icon: Sparkles,
    image: "/trending_img2.avif", 
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    itemCount: "5k+ products",
  },
  {
    id: 3,
    title: "Beauty",
    description: "Skincare & cosmetics",
    icon: Heart,
    image: "/trending_img3.avif", 
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50",
    itemCount: "1.8k+ products",
  },
  {
    id: 4,
    title: "Home & Kitchen",
    description: "Essentials for your space",
    icon: Home,
    image: "/trending_img4.avif", 
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    itemCount: "3.2k+ products",
  },
  {
    id: 5,
    title: "Grocery",
    description: "Fresh & daily needs",
    icon: ShoppingBag,
    image: "/trending_img5.avif", 
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    itemCount: "1k+ products",
  },
  {
    id: 6,
    title: "Gadgets",
    description: "Smart & innovative",
    icon: Zap,
    image: "/trending_img6.avif", 
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    itemCount: "900+ products",
  },
  {
    id: 7,
    title: "Sports",
    description: "Equipment & apparel",
    icon: Zap,
    image: "/trending_img7.avif", 
    color: "from-green-500 to-teal-500",
    bgColor: "bg-green-50",
    itemCount: "1.2k+ products",
  },
  {
    id: 8,
    title: "Books",
    description: "Bestsellers & more",
    icon: Zap,
    image: "/trending_img8.avif", 
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-50",
    itemCount: "3k+ products",
  },
  {
    id: 9,
    title: "Toys",
    description: "Fun for all ages",
    icon: Zap,
    image: "/trending_img9.avif", 
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    itemCount: "800+ products",
  },
  {
    id: 10,
    title: "Furniture",
    description: "Style & comfort",
    icon: Zap,
    image: "/trending_img10.avif", 
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    itemCount: "600+ products",
  },
  {
    id: 11,
    title: "Jewelry",
    description: "Elegant accessories",
    icon: Zap,
    image: "/trending_img11.avif", 
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    itemCount: "400+ products",
  },
  {
    id: 12,
    title: "Automotive",
    description: "Parts & accessories",
    icon: Zap,
    image: "/trending_img12.avif", 
    color: "from-gray-500 to-slate-500",
    bgColor: "bg-gray-50",
    itemCount: "700+ products",
  },
];

// Fallback image URLs in case local images don't exist
const fallbackImages = {
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop",
  fashion: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
  home: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop",
  grocery: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop",
  gadgets: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600&auto=format&fit=crop",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop",
  books: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=600&auto=format&fit=crop",
  toys: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600&auto=format&fit=crop",
  furniture: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop",
  jewelry: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
  automotive: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop",
};

// Individual category card component 
const CategoryCard = memo(({ 
  category, 
  index 
}: { 
  category: typeof categories[0]; 
  index: number;
}) => {
  const router = useRouter();
  const Icon = category.icon;
  
  // Stagger animation with delay based on index
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15,
        delay: index * 0.1 
      }
    }
  };

  // Determine which fallback to use based on category title
  const getFallbackImage = () => {
    switch(category.title.toLowerCase()) {
      case "electronics": return fallbackImages.electronics;
      case "fashion": return fallbackImages.fashion;
      case "beauty": return fallbackImages.beauty;
      case "home & kitchen": return fallbackImages.home;
      case "grocery": return fallbackImages.grocery;
      case "gadgets": return fallbackImages.gadgets;
      case "sports": return fallbackImages.sports;
      case "books": return fallbackImages.books;
      case "toys": return fallbackImages.toys;
      case "furniture": return fallbackImages.furniture;
      case "jewelry": return fallbackImages.jewelry;
      case "automotive": return fallbackImages.automotive;
      default: return fallbackImages.electronics;
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative h-full"
    >
      <Link href={'/login'} className="block h-full">
        <div className="relative h-full overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />
          
          {/* Image Container */}
          <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
            <picture>
              <source srcSet={category.image} type="image/avif" />
              <img
                src={getFallbackImage()}
                alt={category.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            </picture>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            <div className={`absolute left-3 top-3 rounded-full bg-white/90 p-2 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-white`}>
              <Icon size={18} className={`text-transparent bg-gradient-to-r ${category.color} bg-clip-text`} style={{ color: 'transparent' }} />
            </div>
            
            {/* Category title on image */}
            <h3 className="absolute bottom-3 left-3 text-xl font-bold text-white md:hidden">
              {category.title}
            </h3>
          </div>
          
          {/* Content */}
          <div className="hidden p-5 md:block">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {category.title}
              </h3>
              <span className="text-xs font-medium text-gray-500">
                {category.itemCount}
              </span>
            </div>
            
            <p className="mb-4 text-sm text-gray-600">
              {category.description}
            </p>
            
            <div onClick={()=> router.push('/login')} className="flex items-center text-sm font-semibold text-gray-900 group-hover:text-blue-600 cursor-pointer">
              <span>Shop now</span>
              <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-gray-50 p-3 md:hidden">
            <div>
              <p className="text-xs text-gray-500">{category.itemCount}</p>
              <p className="text-xs text-gray-600">{category.description}</p>
            </div>
            <div className={`rounded-full bg-gradient-to-r ${category.color} p-1.5 text-white`}>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

CategoryCard.displayName = "CategoryCard";

// Section header component
const SectionHeader = memo(() => {
  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mb-8 text-center sm:mb-12"
    >
      <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
        Trending{" "}
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Categories
        </span>
      </h2>
      <p className="mx-auto max-w-2xl px-4 text-sm text-gray-600 sm:text-base">
        Explore our most popular categories and find exactly what you're looking for
      </p>
      
      <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
    </motion.div>
  );
});

SectionHeader.displayName = "SectionHeader";

// Mobile Slider Component
const MobileSlider = memo(({ categories: sliderCategories }: { categories: typeof categories }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const itemsPerView = 1; // Show 1 category at a time on mobile
  const maxIndex = Math.max(0, Math.ceil(sliderCategories.length / itemsPerView) - 1);

  const nextSlide = useCallback((): void => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback((): void => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback((index: number): void => {
    setCurrentIndex(Math.min(index, maxIndex));
  }, [maxIndex]);

  // Get current visible categories
  const visibleCategories = useMemo(() => {
    const startIndex = currentIndex * itemsPerView;
    return sliderCategories.slice(startIndex, startIndex + itemsPerView);
  }, [currentIndex, sliderCategories]);

  return (
    <div className="relative md:hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-4"
        >
          {visibleCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      {sliderCategories.length > itemsPerView && (
        <>
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute -left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all z-10 ${
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50 hover:scale-110"
            }`}
            aria-label="Previous categories"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all z-10 ${
              currentIndex >= maxIndex
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50 hover:scale-110"
            }`}
            aria-label="Next categories"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {maxIndex > 0 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "w-6 bg-blue-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

MobileSlider.displayName = "MobileSlider";

// Desktop Pagination Component
const DesktopPagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) => {
  const getVisiblePages = (): (number | string)[] => {
    const delta: number = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="hidden md:flex items-center justify-center gap-2 mt-12">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
        } transition-all duration-200`}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </motion.button>
      
      {getVisiblePages().map((page, index) => (
        page === '...' ? (
          <span key={`dots-${index}`} className="text-gray-400 px-2">
            ...
          </span>
        ) : (
          <motion.button
            key={page}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPageChange(page as number)}
            className={`h-10 w-10 rounded-full font-medium transition-all duration-200 ${
              currentPage === page
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
            }`}
          >
            {page}
          </motion.button>
        )
      ))}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
        } transition-all duration-200`}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </motion.button>
    </div>
  );
});

DesktopPagination.displayName = "DesktopPagination";

// Main component
export default memo(function TrendingCategories() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 items per page on desktop
  
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  
  // Get current page items for desktop
  const currentCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return categories.slice(startIndex, endIndex);
  }, [currentPage]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of section smoothly
    const element = document.getElementById('trending-categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="trending-categories" className="relative overflow-hidden bg-white py-12 sm:py-16 md:py-20">
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-100/30 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-indigo-100/30 blur-3xl" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #9ca3af 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        {/* Mobile Slider */}
        <MobileSlider categories={categories} />

        {/* Desktop Grid with Pagination */}
        <div className="hidden md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
            >
              {currentCategories.map((category, index) => (
                <CategoryCard 
                  key={category.id} 
                  category={category} 
                  index={index} 
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Desktop Pagination */}
          {totalPages > 1 && (
            <DesktopPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* Items count indicator for desktop */}
          <div className="hidden md:block mt-4 text-center text-sm text-gray-500">
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, categories.length)} of {categories.length} categories
          </div>
        </div>

        {/* Mobile items count */}
        <div className="md:hidden mt-4 text-center text-sm text-gray-500">
          {categories.length} categories
        </div>
      </div>
    </section>
  );
});