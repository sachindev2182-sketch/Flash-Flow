"use client";

import { useState, useEffect, useRef, memo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
};

const slides: Slide[] = [
  {
    id: 1,
    title: "Big Fashion Sale",
    subtitle: "Up to 70% off on trending styles",
    image: "slide_img1.jfif",
  },
  {
    id: 2,
    title: "Latest Gadgets",
    subtitle: "Upgrade your lifestyle today",
    image: "slide_img2.jpg",
  },
  {
    id: 3,
    title: "Pure Radiance",
    subtitle: "Unlock your natural glow in a flash",
    image: "slide_img3.avif",
  },
];

const AUTO_SLIDE_TIME = 4000;

export default memo(function HeroSlider() {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* ------------------ AUTO SLIDE ------------------ */
  useEffect(() => {
    resetTimer();

    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_TIME);

    return () => resetTimer();
  }, [index]);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  /* ------------------ BUTTONS ------------------ */
  const prevSlide = () => {
    resetTimer();
    setIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    resetTimer();
    setIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full overflow-hidden bg-gray-100">
      <div className="relative h-[280px] sm:h-[350px] md:h-[420px] lg:h-[500px] xl:h-[550px]">
        <div className="absolute inset-0">
          <img
            src={slides[index].image}
            alt={slides[index].title}
            className="h-full w-full object-cover transition-opacity duration-500"
            loading="eager"
          />

          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20 text-white max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              {slides[index].title}
            </h2>
            <p className="mt-3 text-sm sm:text-base md:text-lg opacity-90">
              {slides[index].subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2
          bg-white/80 hover:bg-white text-black p-2 sm:p-3 rounded-full shadow z-10"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2
          bg-white/80 hover:bg-white text-black p-2 sm:p-3 rounded-full shadow z-10"
        >
          <ChevronRight size={20} />
        </button>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                resetTimer();
                setIndex(i);
              }}
              className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-300
              ${i === index ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
});