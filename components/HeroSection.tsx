"use client";

import { memo, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react";

/* ------------------ ANIMATION VARIANTS ------------------ */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 16 },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 70, damping: 20 },
  },
};

/* ------------------ BUTTON ------------------ */

const ActionButton = memo(
  ({
    children,
    icon: Icon,
    onClick,
  }: {
    children: React.ReactNode;
    icon: React.ElementType;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className="flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl
      bg-blue-600 px-5 sm:px-7 py-3 sm:py-4 text-sm sm:text-base
      font-semibold text-white shadow-lg transition hover:bg-blue-700
      w-full sm:w-auto"
    >
      <Icon size={18} />
      {children}
    </motion.button>
  )
);
ActionButton.displayName = "ActionButton";

/* ------------------ TRUST BADGE ------------------ */

const TrustBadge = memo(
  ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <div className="flex items-center gap-2">
      <Icon size={18} className="text-blue-600 shrink-0" />
      <span className="text-xs sm:text-sm text-gray-600">{text}</span>
    </div>
  )
);
TrustBadge.displayName = "TrustBadge";

/* ------------------ HERO ------------------ */

export default memo(function HeroSection() {
    const router = useRouter();

  const trustBadges = useMemo(
    () => [
      { icon: ShieldCheck, text: "Secure Payments" },
      { icon: Truck, text: "Fast Delivery" },
      { icon: RotateCcw, text: "Easy Returns" },
    ],
    []
  );

  return (
    <section className="relative overflow-hidden bg-gradient-to-br
    from-white via-blue-50 to-indigo-50">

      {/* background blur */}
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />

      <div
        className="relative mx-auto w-full max-w-7xl
        px-4 sm:px-6 lg:px-8
        py-14 sm:py-20 lg:py-28"
      >
        <div
          className="grid items-center gap-10
          lg:grid-cols-2"
        >
          {/* LEFT CONTENT */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 text-center lg:text-left"
          >
            <motion.h1
              variants={itemVariants}
              className="font-bold leading-tight
              text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Shop Faster. Live Smarter with
              <span className="block bg-gradient-to-r
              from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Flash Flow
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-xl
              text-sm sm:text-base md:text-lg text-gray-600 lg:mx-0"
            >
              Discover trending products, lightning-fast delivery, and
              unbeatable deals designed to simplify your everyday lifestyle.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <ActionButton  onClick={() => router.push("/login")} icon={ShoppingBag}>Shop Now</ActionButton>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-5 justify-center lg:justify-start pt-2"
            >
              {trustBadges.map((badge, i) => (
                <TrustBadge key={i} icon={badge.icon} text={badge.text} />
              ))}
            </motion.div>
          </motion.div>

          {/* IMAGE */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            <img
              src="hero_image.avif"
              alt="shopping lifestyle"
              className="rounded-2xl sm:rounded-3xl shadow-2xl
              w-full object-cover aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
});
