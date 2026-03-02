"use client";

import { memo, useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchMenCategoryProducts,
  setMenPage,
  CategoryProduct,
} from "@/lib/redux/features/categoryProducts/categoryProductsSlice";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  WishlistItem,
} from "@/lib/redux/features/wishlist/wishlistSlice";
import {
  addToCart,
  removeFromCart,
  fetchCart,
} from "@/lib/redux/features/cart/cartSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ProductCard = memo(
  ({ product, uniqueKey, user }: { product: CategoryProduct; uniqueKey: string; user: any }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    const { items: wishlistItems, loading: wishlistLoading } = useAppSelector(
      (state) => state.wishlist,
    );
    const { items: cartItems, operationLoading: cartLoading } = useAppSelector(
      (state) => state.cart,
    );
    
    const [localWishlistLoading, setLocalWishlistLoading] = useState(false);
    const [localCartLoading, setLocalCartLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");

    const productId =
      product?.id?.toString() || (product as any)?._id?.toString();

    const isWishlisted = productId
      ? wishlistItems.some((item) => item.productId === productId)
      : false;

    const isInCart = productId
      ? cartItems.some((item) => item.productId === productId)
      : false;

    const showToastMessage = (message: string, type: "success" | "error" = "success") => {
      setToastMessage(message);
      setToastType(type);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleWishlistClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        router.push("/login");
        return;
      }

      if (localWishlistLoading || wishlistLoading || !productId) return;

      setLocalWishlistLoading(true);

      try {
        if (isWishlisted) {
          await dispatch(removeFromWishlist(productId)).unwrap();
          showToastMessage(`${product.title} removed from wishlist`);
        } else {
          const wishlistItem: Omit<WishlistItem, "id"> = {
            productId: productId,
            title: product.title || "Untitled Product",
            description: product.description || "",
            price: product.price || 0,
            image: product.image || "/placeholder-image.jpg",
            category: "Men",
          };
          await dispatch(addToWishlist(wishlistItem)).unwrap();
          showToastMessage(`${product.title} added to wishlist`);
        }
      } catch (error) {
        showToastMessage("Wishlist operation failed", "error");
        console.error("Wishlist operation failed:", error);
      } finally {
        setLocalWishlistLoading(false);
      }
    };

    const handleAddToCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        router.push("/login");
        return;
      }

      if (localCartLoading || cartLoading || !productId) return;

      setLocalCartLoading(true);

      try {
        const cartItem = {
          productId: productId,
          title: product.title || "Untitled Product",
          description: product.description || "",
          price: product.price || 0,
          image: product.image || "/placeholder-image.jpg",
          category: "men",
          size: null,
          quantity: 1,
        };

        await dispatch(addToCart(cartItem)).unwrap();
        showToastMessage(`${product.title} added to cart`);
      } catch (error) {
        showToastMessage("Failed to add to cart", "error");
        console.error("Add to cart failed:", error);
      } finally {
        setLocalCartLoading(false);
      }
    };

    const handleRemoveFromCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user) {
        router.push("/login");
        return;
      }

      if (localCartLoading || cartLoading || !productId) return;

      setLocalCartLoading(true);

      try {
        await dispatch(removeFromCart(productId)).unwrap();
        showToastMessage(`${product.title} removed from cart`);
      } catch (error) {
        showToastMessage("Failed to remove from cart", "error");
        console.error("Remove from cart failed:", error);
      } finally {
        setLocalCartLoading(false);
      }
    };

    if (!product) return null;

    const isLoading = localWishlistLoading || localCartLoading;
    const isDisabled = !productId;

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col"
        >
          <Link href={`/product/${product.id}`}>
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={product.image || "/placeholder-image.jpg"}
                alt={product.title || "Product image"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {product.isNew && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10">
                  NEW
                </div>
              )}

              {/* In Cart Badge */}
              {isInCart && (
                <div className="absolute top-2 left-2 bg-[#5D5FEF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm z-10 flex items-center gap-1">
                  <CheckCircle size={10} />
                  In Cart
                </div>
              )}

              <button
                onClick={handleWishlistClick}
                disabled={isLoading || isDisabled}
                className={`absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 z-20 hover:scale-110 ${
                  isWishlisted
                    ? "opacity-100 bg-red-50"
                    : "opacity-0 group-hover:opacity-100"
                } ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                {localWishlistLoading ? (
                  <div className="w-4 h-4 border-2 border-[#5D5FEF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart
                    size={16}
                    className={
                      isWishlisted ? "fill-red-500 text-red-500" : "text-gray-700"
                    }
                  />
                )}
              </button>
            </div>
          </Link>

          <div className="p-2 sm:p-2.5 flex flex-col flex-1">
            <Link href={`/product/${product.id}`}>
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 min-h-[2rem] mb-1 hover:text-[#5D5FEF] transition-colors">
                {product.title || "Untitled Product"}
              </h3>
            </Link>

            <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 min-h-[1.8rem] mb-1.5">
              {product.description || "No description available"}
            </p>

            <div className="mb-1.5">
              <span className="text-sm sm:text-base font-bold text-gray-900">
                ₹{(product.price || 0).toLocaleString()}
              </span>
            </div>

            <div className="mt-auto">
              {isInCart ? (
                <button
                  onClick={handleRemoveFromCart}
                  disabled={localCartLoading || !user}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-md font-medium text-[10px] sm:text-xs transition-all duration-300 flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {localCartLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={10} />
                      <span>Remove from Cart</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={localCartLoading || !user}
                  className="w-full bg-[#5D5FEF] hover:bg-[#4B4DC9] text-white py-1.5 rounded-md font-medium text-[10px] sm:text-xs transition-all duration-300 flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {localCartLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingBag size={10} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {product.isTrending && (
            <div className="absolute -top-1 -left-1 w-10 h-10 overflow-hidden">
              <div className="absolute top-0 left-0 transform -rotate-45 translate-x-[-30%] translate-y-[-30%] bg-orange-500 text-white text-[7px] font-bold py-0.5 w-14 text-center">
                TRENDING
              </div>
            </div>
          )}
        </motion.div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <div
                className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
                  toastType === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {toastType === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {toastMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  },
);

ProductCard.displayName = "ProductCard";

const Pagination = memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
    loading,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    loading: boolean;
  }) => {
    const getVisiblePages = (): (number | string)[] => {
      const delta = 2;
      const range: number[] = [];
      const rangeWithDots: (number | string)[] = [];
      let l: number | undefined;

      for (let i = 1; i <= totalPages; i++) {
        if (
          i === 1 ||
          i === totalPages ||
          (i >= currentPage - delta && i <= currentPage + delta)
        ) {
          range.push(i);
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push("...");
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    };

    const paginationId = useMemo(
      () => `pagination-${Math.random().toString(36).substr(2, 9)}`,
      [],
    );

    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-6 sm:mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs ${
            currentPage === 1 || loading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-600 hover:bg-[#5D5FEF] hover:text-white shadow-sm"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {getVisiblePages().map((page, index) => {
          if (page === "...") {
            const dotsKey = `${paginationId}-dots-${index}-${currentPage}`;
            return (
              <span
                key={dotsKey}
                className="text-gray-400 px-1 text-xs select-none"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const pageKey = `${paginationId}-page-${page}`;

          return (
            <button
              key={pageKey}
              onClick={() => onPageChange(page as number)}
              disabled={loading}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md font-medium text-xs transition-all ${
                currentPage === page
                  ? "bg-[#5D5FEF] text-white shadow-sm hover:bg-[#4B4DC9]"
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md text-xs ${
            currentPage === totalPages || loading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-600 hover:bg-[#5D5FEF] hover:text-white shadow-sm"
          }`}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    );
  },
);

Pagination.displayName = "Pagination";

interface MenCollectionProps {
  user: any;
}

export default memo(function MenCollection({ user }: MenCollectionProps) {
  const dispatch = useAppDispatch();

  const { menProducts, menPagination, loading, error } = useAppSelector(
    (state) => ({
      menProducts: state.categoryProducts.menProducts,
      menPagination: state.categoryProducts.menPagination,
      loading: state.categoryProducts.loading.men,
      error: state.categoryProducts.error.men,
    }),
  );

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  useEffect(() => {
    dispatch(
      fetchMenCategoryProducts({
        page: menPagination.page,
        limit: menPagination.productsPerPage,
      }),
    );
  }, [dispatch, menPagination.page, menPagination.productsPerPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setMenPage(page));
      const productsGrid = document.getElementById("products-grid");
      if (productsGrid) {
        productsGrid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [dispatch],
  );

  if (loading && menProducts.length === 0) {
    return (
      <section className="w-full py-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 size={40} className="text-[#5D5FEF] animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() =>
              dispatch(
                fetchMenCategoryProducts({
                  page: 1,
                  limit: menPagination.productsPerPage,
                }),
              )
            }
            className="px-4 py-2 bg-[#5D5FEF] text-white rounded-md hover:bg-[#4B4DC9] transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!menProducts || menProducts.length === 0) {
    return (
      <section className="w-full py-6">
        <div className="text-center">
          <p className="text-gray-600">No products found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-3 sm:py-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Men's Collection
          </h2>
          <p className="text-xs text-gray-500">
            {menPagination.totalProducts} products
          </p>
        </div>
      </div>

      <div id="products-grid">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {menProducts.map((product, index) => {
            const productId = product?.id || (product as any)?._id;
            const uniqueKey = productId
              ? `product-${productId}`
              : `product-fallback-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

            return (
              <ProductCard
                key={uniqueKey}
                product={product}
                uniqueKey={uniqueKey}
                user={user}
              />
            );
          })}
        </div>
      </div>

      {menPagination.totalPages > 1 && (
        <Pagination
          currentPage={menPagination.page}
          totalPages={menPagination.totalPages}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}
    </section>
  );
});