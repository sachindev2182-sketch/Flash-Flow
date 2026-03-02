"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Flame, 
  Shield, 
  RefreshCw, 
  Brain, 
  Target,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Define Feature type
interface Feature {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

// Feature data with icons and text
const features: Feature[] = [
  {
    id: 1,
    icon: Zap,
    title: "Ultra-Fast Delivery",
    description: "Get your orders in 2-4 hours",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: 2,
    icon: Flame,
    title: "Flash Deals Every Day",
    description: "New discounts every 24 hours",
    color: "from-red-400 to-pink-500",
  },
  {
    id: 3,
    icon: Shield,
    title: "Secure & Easy Payments",
    description: "100% protected transactions",
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: 4,
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day hassle-free returns",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: 5,
    icon: Brain,
    title: "Smart Recommendations",
    description: "AI-powered product suggestions",
    color: "from-purple-400 to-violet-500",
  },
  {
    id: 6,
    icon: Target,
    title: "Personalized Shopping",
    description: "Tailored just for you",
    color: "from-cyan-400 to-teal-500",
  },
];

// Individual feature card component - memoized
const FeatureCard = memo(({ 
  feature, 
  index 
}: { 
  feature: Feature; 
  index: number;
}) => {
  const Icon = feature.icon;
  
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
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

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative h-full"
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`} />
      
      <div className="relative h-full rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl flex flex-col items-center text-center">
        <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-r ${feature.color} p-4 text-white shadow-lg mx-auto`}>
          <Icon size={28} className="shrink-0" />
        </div>
        
        <h3 className="mb-3 text-xl font-bold text-gray-900">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-600 max-w-[250px] mx-auto">
          {feature.description}
        </p>
        
        <div className={`absolute bottom-0 left-0 h-1 w-0 rounded-b-2xl bg-gradient-to-r ${feature.color} transition-all duration-300 group-hover:w-full`} />
      </div>
    </motion.div>
  );
});

FeatureCard.displayName = "FeatureCard";

// Mobile Slider Component
const MobileFeatureSlider = memo(({ features: sliderFeatures }: { features: Feature[] }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const itemsPerView = 1; // Show 1 feature at a time on mobile
  const maxIndex = Math.max(0, Math.ceil(sliderFeatures.length / itemsPerView) - 1);

  const nextSlide = useCallback((): void => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback((): void => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback((index: number): void => {
    setCurrentIndex(Math.min(index, maxIndex));
  }, [maxIndex]);

  // Get current visible features
  const visibleFeatures: Feature[] = useMemo(() => {
    const startIndex = currentIndex * itemsPerView;
    return sliderFeatures.slice(startIndex, startIndex + itemsPerView);
  }, [currentIndex, sliderFeatures]);

  return (
    <div className="relative sm:hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {visibleFeatures.map((feature: Feature, index: number) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      {sliderFeatures.length > itemsPerView && (
        <>
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute -left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all z-10 ${
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50 hover:scale-110"
            }`}
            aria-label="Previous features"
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
            aria-label="Next features"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {maxIndex > 0 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i: number) => (
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

MobileFeatureSlider.displayName = "MobileFeatureSlider";

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
      className="mb-12 text-center"
    >
      <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
        Why Choose{" "}
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Flash Flow
        </span>
      </h2>
      <p className="mx-auto max-w-2xl text-gray-600">
        Experience shopping reimagined with features designed to make your life easier,
        faster, and more enjoyable.
      </p>
    </motion.div>
  );
});

SectionHeader.displayName = "SectionHeader";

export default memo(function FeaturesSection() {
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-16 sm:py-20 md:py-24">
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-blue-100/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-100/20 blur-3xl" />
      
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        {/* Mobile Slider */}
        <MobileFeatureSlider features={features} />

        {/* Desktop Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="hidden sm:grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature: Feature, index: number) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </motion.div>

        {/* Stats Section - visible on all devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-4 rounded-2xl bg-white/50 p-6 backdrop-blur-sm sm:grid-cols-4"
        >
          {[
            { value: "10M+", label: "Happy Customers" },
            { value: "50K+", label: "Products" },
            { value: "100+", label: "Cities" },
            { value: "24/7", label: "Support" },
          ].map((stat: { value: string; label: string }, index: number) => (
            <div key={index} className="text-center">
              <div className="text-xl font-bold text-gray-900 sm:text-2xl">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});