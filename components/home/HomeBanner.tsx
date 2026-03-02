"use client";

import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Main Banner Component - No background color, no borders
export default memo(function HomeBanner() {
  return (
    <section className="relative w-full py-4 sm:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full"
        >
          {/* Banner Image */}
          <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">
            <Image
              src="/Banner1_img1_.png"
              alt="Flash Flow Banner"
              fill
              className="object-contain"
              priority
              quality={100}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
});