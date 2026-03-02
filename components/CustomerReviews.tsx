"use client";

import { memo, useState, useMemo, useCallback, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Verified
} from "lucide-react";

// Define TypeScript interfaces
interface Review {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  product: string;
  productImage: string;
}

// Review data with real customer photos 
const reviews: Review[] = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    avatar: "/avatar_img1.avif", 
    rating: 5,
    date: "2 days ago",
    verified: true,
    title: "Amazing quality and fast delivery!",
    comment: "The product exceeded my expectations. Delivery was super fast and the quality is excellent. Will definitely shop again!",
    product: "Wireless Headphones",
    productImage: "/reviewPro_img1.avif", 
  },
  {
    id: 2,
    name: "Rahul Verma",
    location: "Delhi",
    avatar: "/avatar_img2.avif", 
    rating: 5,
    date: "5 days ago",
    verified: true,
    title: "Best shopping experience ever",
    comment: "The customer service is outstanding. They helped me choose the right product and it's perfect for my needs.",
    product: "Smart Watch",
    productImage: "/reviewPro_img2.avif", 
  },
  {
    id: 3,
    name: "Anjali Desai",
    location: "Bangalore",
    avatar: "/avatar_img3.avif", 
    rating: 5,
    date: "1 week ago",
    verified: true,
    title: "Great value for money",
    comment: "Found exactly what I was looking for at a great price. The quality is top-notch and shipping was quick.",
    product: "Backpack",
    productImage: "/reviewPro_img3.avif", 
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Jaipur",
    avatar: "/avatar_img4.avif", 
    rating: 4,
    date: "2 weeks ago",
    verified: true,
    title: "Very satisfied with my purchase",
    comment: "The product works great and the battery life is impressive. Would recommend to friends and family.",
    product: "Action Camera",
    productImage: "/reviewPro_img4.avif", 
  },
  {
    id: 5,
    name: "Neha Gupta",
    location: "Pune",
    avatar: "/avatar_img5.avif", 
    rating: 5,
    date: "3 weeks ago",
    verified: true,
    title: "Excellent customer support",
    comment: "Had a small issue with my order but the support team resolved it immediately. Great service!",
    product: "Wireless Earbuds",
    productImage: "/reviewPro_img5.avif", 
  },
  {
    id: 6,
    name: "Arjun Nair",
    location: "Kochi",
    avatar: "/avatar_img6.avif", 
    rating: 5,
    date: "1 month ago",
    verified: true,
    title: "Perfect fit and comfort",
    comment: "The shoes are incredibly comfortable and stylish. Exactly as described. Will buy again!",
    product: "Running Shoes",
    productImage: "/reviewPro_img6.avif", 
  },
  {
    id: 7,
    name: "Sneha Reddy",
    location: "Hyderabad",
    avatar: "/avatar_img7.avif", 
    rating: 5,
    date: "1 month ago",
    verified: true,
    title: "Excellent product quality",
    comment: "The material is top-notch and fits perfectly. Very happy with my purchase!",
    product: "Casual Shirt",
    productImage: "/reviewPro_img7.avif", 
  },
  {
    id: 8,
    name: "Amit Kumar",
    location: "Lucknow",
    avatar: "/avatar_img8.avif", 
    rating: 4,
    date: "2 months ago",
    verified: true,
    title: "Good value for money",
    comment: "Decent product at this price point. Delivery was on time.",
    product: "Smart Band",
    productImage: "/reviewPro_img8.avif", 
  },
  {
    id: 9,
    name: "Pooja Mehta",
    location: "Ahmedabad",
    avatar: "/avatar_img9.avif", 
    rating: 5,
    date: "2 months ago",
    verified: true,
    title: "Love this product!",
    comment: "Exactly as described. The quality is amazing and customer service was very helpful.",
    product: "Yoga Mat",
    productImage: "/reviewPro_img9.avif", 
  },
  {
    id: 10,
    name: "Rajesh Khanna",
    location: "Chandigarh",
    avatar: "/avatar_img10.avif", 
    rating: 5,
    date: "3 months ago",
    verified: true,
    title: "Highly recommended!",
    comment: "One of the best online shopping experiences I've had. Will definitely order again.",
    product: "Running Shoes",
    productImage: "/reviewPro_img10.avif", 
  },
  {
    id: 11,
    name: "Divya Joseph",
    location: "Chennai",
    avatar: "/avatar_img11.avif", 
    rating: 4,
    date: "3 months ago",
    verified: true,
    title: "Good product",
    comment: "Works as expected. Battery life is good. Happy with the purchase.",
    product: "Wireless Mouse",
    productImage: "/reviewPro_img11.avif", 
  },
  {
    id: 12,
    name: "Suresh Patil",
    location: "Nagpur",
    avatar: "/avatar_img12.avif", 
    rating: 5,
    date: "4 months ago",
    verified: true,
    title: "Excellent service",
    comment: "Fast delivery and great product quality. Very satisfied!",
    product: "Backpack",
    productImage: "/reviewPro_img12.avif", 
  },
];

// Rating stars component
const RatingStars = memo(({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i: number) => (
        <Star
          key={i}
          size={size}
          className={`${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          } transition-colors`}
        />
      ))}
    </div>
  );
});

RatingStars.displayName = "RatingStars";

// Individual review card
const ReviewCard = memo(({ review, index }: { review: Review; index: number }) => {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, scale: 1.02 }}
      className="group h-full"
    >
      <div className="relative h-full rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
        {/* Quote icon decoration */}
        <Quote className="absolute right-4 top-4 h-12 w-12 text-gray-100" />
        
        {/* Header with avatar and name */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white shadow-md">
              <Image
                src={review.avatar}
                alt={review.name}
                fill
                className="object-cover"
                sizes="48px"
                loading="lazy"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-gray-900">{review.name}</h3>
                {review.verified && (
                  <Verified size={14} className="text-blue-500 fill-blue-500" />
                )}
              </div>
              <p className="text-xs text-gray-500">{review.location}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">{review.date}</span>
        </div>

        {/* Rating */}
        <div className="mb-3">
          <RatingStars rating={review.rating} />
        </div>

        <h4 className="mb-2 font-semibold text-gray-900 line-clamp-1">
          {review.title}
        </h4>

        <p className="mb-4 text-sm text-gray-600 line-clamp-3">
          {review.comment}
        </p>

        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-md">
            <Image
              src={review.productImage}
              alt={review.product}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <span className="text-xs text-gray-600 line-clamp-1">
            Purchased: {review.product}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

ReviewCard.displayName = "ReviewCard";

// Main Slider Component (works for both mobile and desktop)
const ReviewSlider = memo(({ reviews: sliderReviews }: { reviews: Review[] }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [itemsPerView, setItemsPerView] = useState<number>(3);
  const maxIndex = Math.max(0, Math.ceil(sliderReviews.length / itemsPerView) - 1);

  // Update items per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 items
      } else {
        setItemsPerView(3); // Desktop: 3 items
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = useCallback((): void => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const prevSlide = useCallback((): void => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback((index: number): void => {
    setCurrentIndex(Math.min(index, maxIndex));
  }, [maxIndex]);

  // Calculate visible reviews
  const visibleReviews = useMemo(() => {
    const startIndex = currentIndex * itemsPerView;
    return sliderReviews.slice(startIndex, startIndex + itemsPerView);
  }, [currentIndex, itemsPerView, sliderReviews]);

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentIndex}-${itemsPerView}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className={`grid gap-5 ${
            itemsPerView === 1 
              ? "grid-cols-1" 
              : itemsPerView === 2 
                ? "grid-cols-1 sm:grid-cols-2" 
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {visibleReviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons - only show if there are more items */}
      {sliderReviews.length > itemsPerView && (
        <>
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all ${
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50 hover:scale-110"
            }`}
            aria-label="Previous reviews"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-all ${
              currentIndex >= maxIndex
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50 hover:scale-110"
            }`}
            aria-label="Next reviews"
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

      {/* Reviews count */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Showing {visibleReviews.length} of {sliderReviews.length} reviews
      </div>
    </div>
  );
});

ReviewSlider.displayName = "ReviewSlider";

// Main component
export default memo(function CustomerReviews() {
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

  // Calculate average rating
  const averageRating = useMemo((): string => {
    const sum = reviews.reduce((acc: number, review: Review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, []);

  // Get total reviews
  const totalReviews: number = useMemo(() => reviews.length, []);

  return (
    <section id="customer-reviews" className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20 md:py-24">
      {/* Background decoration */}
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-100/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-100/20 blur-3xl" />
      
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center sm:mb-14"
        >
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
            What Our{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-600 sm:text-base">
            Join thousands of happy customers who trust us for their shopping needs
          </p>
          
          {/* Rating summary */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <RatingStars rating={Number(averageRating)} size={20} />
              <span className="font-semibold text-gray-900">{averageRating}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600">{totalReviews}+ verified reviews</span>
          </div>
        </motion.div>

        {/* Review Slider - Works on all screen sizes */}
        <ReviewSlider reviews={reviews} />
      </div>
    </section>
  );
});