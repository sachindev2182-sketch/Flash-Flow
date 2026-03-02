"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Heart,
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Mail,
  Calendar,
  ShoppingBag,
  Filter,
  Download,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchAllWishlists,
  fetchWishlistByUserId,
  setSelectedWishlist,
  setSearchTerm,
  setUserFilter,
  setPage,
  filterWishlists,
  clearError,
  AdminWishlist,
  AdminWishlistItem,
} from "@/lib/redux/features/adminWishlists/adminWishlistsSlice";
import { h3 } from "framer-motion/client";

export default function WishlistsTab() {
  const dispatch = useAppDispatch();
  const {
    wishlists,
    filteredWishlists,
    loading,
    error,
    selectedWishlist,
    searchTerm,
    userFilter,
    pagination,
  } = useAppSelector((state) => state.adminWishlists);

  const [viewModal, setViewModal] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [localUserFilter, setLocalUserFilter] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [statsModal, setStatsModal] = useState(false);

  useEffect(() => {
    dispatch(
      fetchAllWishlists({ page: pagination.page, limit: pagination.limit }),
    );
  }, [dispatch, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(localSearch));
      dispatch(setUserFilter(localUserFilter));
      dispatch(filterWishlists());
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, localUserFilter, dispatch]);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
    dispatch(fetchAllWishlists({ page: newPage, limit: pagination.limit }));
  };

  const handleViewWishlist = async (userId: string) => {
    const result = await dispatch(fetchWishlistByUserId(userId));
    if (fetchWishlistByUserId.fulfilled.match(result)) {
      setViewModal(true);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Men: "bg-blue-100 text-blue-600",
      Women: "bg-pink-100 text-pink-600",
      Kids: "bg-green-100 text-green-600",
      Beauty: "bg-purple-100 text-purple-600",
      Home: "bg-amber-100 text-amber-600",
    };
    return colors[category] || "bg-gray-100 text-gray-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalWishlists = wishlists.length;
    const totalItems = wishlists.reduce((sum, w) => sum + w.totalItems, 0);
    const totalValue = wishlists.reduce((sum, w) => sum + w.totalValue, 0);
    const avgItemsPerUser =
      totalWishlists > 0 ? (totalItems / totalWishlists).toFixed(1) : 0;

    // Category distribution
    const categoryCount: Record<string, number> = {};
    wishlists.forEach((wishlist) => {
      wishlist.items.forEach((item) => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
    });

    return {
      totalWishlists,
      totalItems,
      totalValue,
      avgItemsPerUser,
      categoryCount,
    };
  }, [wishlists]);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-200">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-[#5D5FEF] font-black text-xs tracking-widest uppercase">
              Wishlist Management
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2559] tracking-tight">
            Users Wishlists
          </h2>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm mt-1">
            View all customer wishlists - {pagination.total} total wishlists
          </p>
        </div>

        {/* Stats Button */}
        <button
          onClick={() => setStatsModal(true)}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-[#1B2559] rounded-xl font-black text-sm sm:text-base hover:shadow-xl transition-all active:scale-95 whitespace-nowrap border border-gray-200"
        >
          <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
          View Statistics
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search by product */}
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]"
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by product name or description..."
              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559]"
            />
          </div>

          {/* Filter by user */}
          <div className="sm:w-64 relative">
            <User
              size={16}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]"
            />
            <input
              type="text"
              value={localUserFilter}
              onChange={(e) => setLocalUserFilter(e.target.value)}
              placeholder="Filter by user name or email..."
              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559]"
            />
          </div>
        </div>
      </div>

      {/* Wishlists Grid */}
      {loading && wishlists.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2
              size={32}
              className="text-[#5D5FEF] animate-spin mx-auto mb-3 sm:mb-4"
            />
            <p className="text-[#A3AED0] font-bold text-sm sm:text-base">
              Loading wishlists...
            </p>
          </div>
        </div>
      ) : filteredWishlists.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F4F7FE] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Heart size={24} className="text-[#5D5FEF] sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#1B2559] mb-2">
            No Wishlists Found
          </h3>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm">
            {localSearch || localUserFilter
              ? "Try adjusting your filters"
              : "No users have added items to their wishlists yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredWishlists.map((wishlist) => (
              <motion.div
                key={wishlist.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* User Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-[#F4F7FE] to-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] rounded-xl flex items-center justify-center text-white font-black text-lg">
                        {wishlist.userName !== "Unknown User"
                          ? wishlist.userName.charAt(0).toUpperCase()
                          : "?"}
                      </div>{" "}
                      <div>
                        <h3 className="font-bold text-[#1B2559] text-sm sm:text-base">
                          {wishlist.userName}
                        </h3>
                        <p className="text-xs text-[#A3AED0] flex items-center gap-1">
                          <Mail size={10} /> {wishlist.userEmail}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewWishlist(wishlist.userId)}
                      className="p-2 hover:bg-[#F4F7FE] rounded-lg text-[#A3AED0] hover:text-[#5D5FEF] transition-all"
                      title="View wishlist details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Heart size={14} className="text-red-500 fill-red-500" />
                      <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">
                        Items
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#1B2559]">
                      {wishlist.totalItems}{" "}
                      {wishlist.totalItems === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={14} className="text-[#5D5FEF]" />
                      <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">
                        Total Value
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#1B2559]">
                      {formatCurrency(wishlist.totalValue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#A3AED0]" />
                      <span className="text-xs font-bold text-[#A3AED0] uppercase tracking-wider">
                        Last Updated
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#1B2559]">
                      {formatDate(wishlist.updatedAt)}
                    </span>
                  </div>

                  {/* Preview of first 3 items */}
                  {wishlist.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-2">
                        Recent Items
                      </p>
                      <div className="space-y-2">
                        {wishlist.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/30?text=No+Image";
                                }}
                              />
                            </div>
                            <p className="text-xs text-[#1B2559] truncate flex-1">
                              {item.title}
                            </p>
                            <span
                              className={`text-[8px] font-black px-1.5 py-0.5 rounded ${getCategoryColor(item.category)}`}
                            >
                              {item.category}
                            </span>
                          </div>
                        ))}
                        {wishlist.items.length > 3 && (
                          <p className="text-[10px] text-[#A3AED0] text-center mt-1">
                            +{wishlist.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100">
              <p className="text-xs sm:text-sm font-bold text-[#A3AED0] order-2 sm:order-1">
                Page <span className="text-[#1B2559]">{pagination.page}</span>{" "}
                of {pagination.pages}
              </p>

              <div className="flex items-center justify-center gap-1 sm:gap-1.5 order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all ${
                    pagination.page === 1
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-white text-[#1B2559] hover:bg-[#F4F7FE] shadow-sm hover:shadow"
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.pages ||
                      Math.abs(page - pagination.page) <= 2,
                  )
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <span
                          key={`dots-${page}`}
                          className="text-[#A3AED0] px-1"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-black text-xs transition-all ${
                          pagination.page === page
                            ? "bg-[#5D5FEF] text-white shadow-md"
                            : "bg-white text-[#A3AED0] hover:bg-[#F4F7FE] hover:text-[#1B2559] border border-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                  className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all ${
                    pagination.page === pagination.pages
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : "bg-white text-[#1B2559] hover:bg-[#F4F7FE] shadow-sm hover:shadow"
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Wishlist Modal */}
      <AnimatePresence>
        {viewModal && selectedWishlist && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
            <div
              className="absolute inset-0"
              onClick={() => setViewModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl rounded-[35px] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#F4F7FE] to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] rounded-xl flex items-center justify-center text-white font-black text-lg">
                    {selectedWishlist.userName !== "Unknown User"
                      ? selectedWishlist.userName.charAt(0).toUpperCase()
                      : "?"}
                  </div>{" "}
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#1B2559]">
                      {selectedWishlist.userName === "Unknown User"
                        ? "User Wishlist"
                        : `${selectedWishlist.userName}'s Wishlist`}
                    </h3>{" "}
                    <p className="text-xs text-[#A3AED0]">
                      {selectedWishlist.userEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewModal(false)}
                  className="p-2 hover:bg-white rounded-full text-[#A3AED0] hover:text-[#1B2559] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                  <div className="bg-[#F4F7FE] rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">
                      Items
                    </p>
                    <p className="text-lg sm:text-xl font-black text-[#1B2559]">
                      {selectedWishlist.totalItems}
                    </p>
                  </div>
                  <div className="bg-[#F4F7FE] rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">
                      Total Value
                    </p>
                    <p className="text-lg sm:text-xl font-black text-[#1B2559]">
                      {formatCurrency(selectedWishlist.totalValue)}
                    </p>
                  </div>
                  <div className="bg-[#F4F7FE] rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">
                      Last Updated
                    </p>
                    <p className="text-xs sm:text-sm font-black text-[#1B2559]">
                      {formatDate(selectedWishlist.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Items Grid */}
                {selectedWishlist.items.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart size={40} className="text-[#A3AED0] mx-auto mb-3" />
                    <p className="text-[#A3AED0] font-semibold">
                      This wishlist is empty
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {selectedWishlist.items.map(
                      (item: AdminWishlistItem, index: number) => (
                        <motion.div
                          key={`${item.productId}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-3 p-3 bg-[#F4F7FE] rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100"
                        >
                          {/* Product Image */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://via.placeholder.com/80?text=No+Image";
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-[#1B2559] text-sm truncate">
                                {item.title}
                              </h4>
                              <span
                                className={`text-[8px] font-black px-1.5 py-0.5 rounded whitespace-nowrap ${getCategoryColor(item.category)}`}
                              >
                                {item.category}
                              </span>
                            </div>

                            <p className="text-xs text-[#A3AED0] line-clamp-2 mt-1">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between mt-2">
                              <span className="font-black text-[#1B2559]">
                                {formatCurrency(item.price)}
                              </span>
                              <span className="text-[8px] text-[#A3AED0]">
                                Added{" "}
                                {new Date(item.addedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {statsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
            <div
              className="absolute inset-0"
              onClick={() => setStatsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[35px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-[#1B2559]">
                  Wishlist Statistics
                </h3>
                <button
                  onClick={() => setStatsModal(false)}
                  className="p-2 hover:bg-[#F4F7FE] rounded-full text-[#A3AED0] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] text-white rounded-xl p-4">
                    <p className="text-xs font-bold uppercase opacity-90 mb-1">
                      Total Wishlists
                    </p>
                    <p className="text-2xl sm:text-3xl font-black">
                      {statistics.totalWishlists}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl p-4">
                    <p className="text-xs font-bold uppercase opacity-90 mb-1">
                      Total Items
                    </p>
                    <p className="text-2xl sm:text-3xl font-black">
                      {statistics.totalItems}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-4">
                    <p className="text-xs font-bold uppercase opacity-90 mb-1">
                      Total Value
                    </p>
                    <p className="text-2xl sm:text-3xl font-black">
                      {formatCurrency(statistics.totalValue)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4">
                    <p className="text-xs font-bold uppercase opacity-90 mb-1">
                      Avg Items/User
                    </p>
                    <p className="text-2xl sm:text-3xl font-black">
                      {statistics.avgItemsPerUser}
                    </p>
                  </div>
                </div>

                <h4 className="font-black text-[#1B2559] mb-3">
                  Category Distribution
                </h4>
                <div className="space-y-3">
                  {Object.entries(statistics.categoryCount).map(
                    ([category, count]) => (
                      <div key={category} className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${getCategoryColor(category)}`}
                        >
                          {category}
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#5D5FEF] to-[#868CFF] rounded-full"
                            style={{
                              width: `${(count / statistics.totalItems) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#1B2559]">
                          {count} (
                          {((count / statistics.totalItems) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[200]"
          >
            <div
              className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl font-bold text-xs sm:text-sm ${
                toast.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
