"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

// Category slider data
const categorySlides = [
  {
    id: 1,
    title: "MEN",
    tagline: "Urban Streetwear",
    description: "Fresh looks, bold styles",
    image: "/man_category_slide.avif",
    accent: "from-blue-600 to-cyan-400",
    lightBg: "bg-blue-50",
    href: "/category/men"
  },
  {
    id: 2,
    title: "WOMEN",
    tagline: "Ethereal Elegance",
    description: "Timeless fashion for every occasion",
    image: "/women_category_slide.avif",
    accent: "from-pink-600 to-rose-400",
    lightBg: "bg-pink-50",
    href: "/category/women"
  },
  {
    id: 3,
    title: "KIDS",
    tagline: "Playful Energy",
    description: "Comfort meets cuteness",
    image: "/kids_category_slide.avif",
    accent: "from-green-600 to-emerald-400",
    lightBg: "bg-green-50",
    href: "/category/kids"
  },
  {
    id: 4,
    title: "BEAUTY",
    tagline: "Radiance Revealed",
    description: "Skincare, makeup & more",
    image: "/beauty_category_slide.avif",
    accent: "from-purple-600 to-violet-400",
    lightBg: "bg-purple-50",
    href: "/category/beauty"
  }
];

// Individual slide component - Modern card style
const CategorySlide = memo(({ slide, isActive }: { slide: typeof categorySlides[0]; isActive: boolean }) => {
  if (!isActive) return null;
  
  return (
    <Link href={slide.href} className="block w-full h-full">
      <div className="relative w-full h-full group cursor-pointer">
        {/* Split layout: Image on top for mobile, side by side for desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          {/* Image Side */}
          <div className="relative h-[200px] sm:h-[250px] md:h-full overflow-hidden order-1">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority
            />
            <div className={`absolute inset-0 bg-gradient-to-tr ${slide.accent} opacity-20`} />
            
            {/* Mobile Category Badge - Visible only on mobile */}
            <span className={`absolute top-4 left-4 md:hidden inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider text-white bg-gradient-to-r ${slide.accent} shadow-lg`}>
              {slide.title}
            </span>
          </div>
          
          {/* Content Side */}
          <div className={`relative flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 ${slide.lightBg} order-2`}>
            {/* Decorative elements - Hidden on mobile */}
            <div className="hidden md:block absolute top-4 right-4 opacity-10">
              <Sparkles size={80} className={`text-transparent bg-gradient-to-r ${slide.accent} bg-clip-text`} />
            </div>
            
            {/* Category badge - Hidden on mobile (shown in image) */}
            <span className={`hidden md:inline-block w-fit px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold tracking-wider text-white bg-gradient-to-r ${slide.accent} shadow-lg mb-3 sm:mb-4`}>
              {slide.title}
            </span>
            
            {/* Main content */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
              {slide.tagline}
            </h3>
            
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md">
              {slide.description}
            </p>
            
            {/* Features/Specs - Responsive gap and text size */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
              {slide.title === "MEN" && (
                <>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Shirts</span>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">T-Shirts</span>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Footwear</span>
                </>
              )}
              {slide.title === "WOMEN" && (
                <>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Dresses</span>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Ethnic</span>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Accessories</span>
                </>
              )}
              {slide.title === "KIDS" && (
                <>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Clothing</span>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Toys</span>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Footwear</span>
                </>
              )}
              {slide.title === "BEAUTY" && (
                <>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Makeup</span>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Skincare</span>
                  <span className="px-2 sm:px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">Fragrance</span>
                </>
              )}
            </div>
            
            {/* CTA Button */}
            <div className="inline-flex items-center gap-2 sm:gap-3 text-sm font-semibold text-gray-900 group/btn relative w-fit">
              <span>Explore Collection</span>
              <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${slide.accent} group-hover/btn:w-full transition-all duration-300`} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

CategorySlide.displayName = "CategorySlide";

// Main Slider Component
export default memo(function CategorySlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    // Reset transition lock after animation completes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    goToSlide((currentIndex + 1) % categorySlides.length);
  }, [currentIndex, isTransitioning, goToSlide]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    goToSlide(currentIndex === 0 ? categorySlides.length - 1 : currentIndex - 1);
  }, [currentIndex, isTransitioning, goToSlide]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (isTransitioning || touchStart === 0 || touchEnd === 0) return;
    
    if (touchStart - touchEnd > 75) {
      nextSlide();
    } else if (touchStart - touchEnd < -75) {
      prevSlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section className="w-full bg-white py-8 sm:py-10 md:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header - Responsive text sizes */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <span className="text-xs sm:text-sm font-semibold text-[#5D5FEF] uppercase tracking-[0.2em]">
            Curated Collections
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 mt-1 sm:mt-2">
            Select by <span className="font-bold">Style</span>
          </h2>
        </div>

        {/* Slider Container */}
        <div 
          className="relative w-full bg-gray-50 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slider - Simple crossfade without blink */}
          <div className="relative w-full h-[500px] sm:h-[450px] md:h-[400px] lg:h-[450px] xl:h-[500px]">
            {categorySlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                style={{ pointerEvents: index === currentIndex ? 'auto' : 'none' }}
              >
                <CategorySlide slide={slide} isActive={index === currentIndex} />
              </div>
            ))}

            {/* Navigation Arrows - Hidden on mobile, visible on tablet/desktop */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="hidden md:flex absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg items-center justify-center hover:bg-white transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="hidden md:flex absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg items-center justify-center hover:bg-white transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next slide"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>

            {/* Mobile Navigation Buttons - Visible only on mobile */}
            <div className="flex md:hidden absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-3 z-20">
              <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous slide"
              >
                <ChevronLeft size={18} className="text-gray-700" />
              </button>
              <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next slide"
              >
                <ChevronRight size={18} className="text-gray-700" />
              </button>
            </div>
          </div>

          {/* Bottom Navigation - Responsive */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 bg-white border-t border-gray-100 gap-3 sm:gap-0">
            {/* Dots with labels - Hidden on mobile, shown on tablet/desktop */}
            <div className="hidden sm:flex items-center gap-2 md:gap-3">
              {categorySlides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => !isTransitioning && goToSlide(index)}
                  disabled={isTransitioning}
                  className="group flex items-center gap-1 md:gap-2 disabled:opacity-50"
                >
                  <span className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? `w-6 md:w-8 bg-gradient-to-r ${categorySlides[currentIndex].accent}` 
                      : 'w-1.5 bg-gray-300 group-hover:bg-gray-400'
                  }`} />
                  {index === currentIndex && (
                    <span className="text-xs font-medium text-gray-600">
                      {categorySlides[index].title}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Dots - Simple dots without labels */}
            <div className="flex sm:hidden items-center gap-2">
              {categorySlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isTransitioning && goToSlide(index)}
                  disabled={isTransitioning}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? `w-6 bg-gradient-to-r ${categorySlides[currentIndex].accent}` 
                      : 'w-2 bg-gray-300'
                  } disabled:opacity-50`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Counter */}
            <span className="text-xs sm:text-sm text-gray-500">
              {String(currentIndex + 1).padStart(2, '0')} / {String(categorySlides.length).padStart(2, '0')}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
});