"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Star,
  StarHalf,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  SortDesc,
  Calendar,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchAllReviews,
  fetchReviewById,
  fetchReviewStats,
  updateReview,
  deleteReview,
  bulkDeleteReviews,
  setSelectedReview,
  setSearchTerm,
  setFilterBy,
  setFilterValue,
  setSortBy,
  setPage,
  clearError,
  resetFilters,
  AdminReview
} from "@/lib/redux/features/adminReviews/adminReviewsSlice";

// Placeholder image for error fallback
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Crect width='80' height='80' fill='%23F4F7FE'/%3E%3Cpath d='M30 35L40 45L50 35' stroke='%235D5FEF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M40 45V25' stroke='%235D5FEF' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";

export default function ReviewsTab() {
  const dispatch = useAppDispatch();
  const {
    reviews,
    filteredReviews,
    selectedReview,
    stats,
    loading,
    operationLoading,
    error,
    searchTerm,
    filterBy,
    filterValue,
    sortBy,
    pagination,
  } = useAppSelector((state) => state.adminReviews);

  // Local state
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [statsModal, setStatsModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [localSearch, setLocalSearch] = useState("");
  const [localFilterValue, setLocalFilterValue] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [editForm, setEditForm] = useState({
    rating: 5,
    comment: "",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch reviews on mount and when dependencies change
  useEffect(() => {
    dispatch(fetchAllReviews({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      filterBy,
      filterValue,
      sortBy,
    }));
    dispatch(fetchReviewStats());
  }, [dispatch, pagination.page, pagination.limit, searchTerm, filterBy, filterValue, sortBy]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(localSearch));
      dispatch(setPage(1));
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  // Handle filter value with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilterValue(localFilterValue));
      dispatch(setPage(1));
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilterValue, dispatch]);

  // Handle error
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
  };

  const handleViewReview = async (reviewId: string) => {
    setSelectedReviewId(reviewId);
    const result = await dispatch(fetchReviewById(reviewId));
    if (fetchReviewById.fulfilled.match(result)) {
      setViewModal(true);
    }
  };

  const handleEditReview = (review: AdminReview) => {
    setSelectedReviewId(review._id);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
    });
    setEditModal(true);
  };

  const handleUpdateReview = async () => {
    if (!selectedReviewId) return;

    const result = await dispatch(updateReview({
      reviewId: selectedReviewId,
      data: editForm,
    }));

    if (updateReview.fulfilled.match(result)) {
      setEditModal(false);
      showToast("Review updated successfully", "success");
      dispatch(fetchAllReviews({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        filterBy,
        filterValue,
        sortBy,
      }));
      dispatch(fetchReviewStats());
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setDeleteModal(true);
  };

  const confirmDeleteReview = async () => {
    if (!selectedReviewId) return;

    const result = await dispatch(deleteReview(selectedReviewId));

    if (deleteReview.fulfilled.match(result)) {
      setDeleteModal(false);
      showToast("Review deleted successfully", "success");
      dispatch(fetchAllReviews({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        filterBy,
        filterValue,
        sortBy,
      }));
      dispatch(fetchReviewStats());
    }
  };

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviewIds(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReviewIds.length === filteredReviews.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(filteredReviews.map(r => r._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviewIds.length === 0) return;
    setBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    const result = await dispatch(bulkDeleteReviews(selectedReviewIds));

    if (bulkDeleteReviews.fulfilled.match(result)) {
      setBulkDeleteModal(false);
      const deletedCount = result.payload?.deletedCount || selectedReviewIds.length;
      setSelectedReviewIds([]);
      showToast(`${deletedCount} ${deletedCount === 1 ? 'review' : 'reviews'} deleted successfully`, "success");
      dispatch(fetchAllReviews({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        filterBy,
        filterValue,
        sortBy,
      }));
      dispatch(fetchReviewStats());
    }
  };

  const handleImageError = (reviewId: string) => {
    setImageErrors(prev => ({ ...prev, [reviewId]: true }));
  };

const renderStars = (rating: number, size: number = 16, showEmpty: boolean = true) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star 
        key={`full-${i}`} 
        size={size} 
        className="fill-yellow-400 text-yellow-400" 
      />
    );
  }
  
  if (hasHalfStar) {
    stars.push(
      <StarHalf 
        key="half" 
        size={size} 
        className="fill-yellow-400 text-yellow-400" 
      />
    );
  }
  
  if (showEmpty) {
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          size={size} 
          className="text-gray-300" 
        />
      );
    }
  }
  
  return stars;
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getImageSrc = (review: AdminReview) => {
    if (imageErrors[review._id] || !review.productImage) {
      return PLACEHOLDER_IMAGE;
    }
    return review.productImage;
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-200">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#5D5FEF] font-black text-xs tracking-widest uppercase">
              Review Management
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2559] tracking-tight">
            Product Reviews
          </h2>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm mt-1">
            Manage all customer reviews - {pagination.total} total reviews
          </p>
        </div>

        {/* Stats Button */}
        <button
          onClick={() => setStatsModal(true)}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-[#1B2559] rounded-xl font-black text-sm sm:text-base hover:shadow-xl transition-all active:scale-95 whitespace-nowrap border border-gray-200"
        >
          <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" />
          View Statistics
        </button>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-3">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by review content..."
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559]"
              />
            </div>

            {/* Filter By */}
            <div className="sm:w-48 relative">
              <Filter size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
              <select
                value={filterBy}
                onChange={(e) => dispatch(setFilterBy(e.target.value as any))}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
              >
                <option value="all">All Reviews</option>
                <option value="product">By Product</option>
                <option value="user">By User</option>
              </select>
            </div>

            {/* Filter Value Input (appears when filterBy is not 'all') */}
            {filterBy !== 'all' && (
              <div className="sm:w-64 relative">
                <User size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
                <input
                  type="text"
                  value={localFilterValue}
                  onChange={(e) => setLocalFilterValue(e.target.value)}
                  placeholder={filterBy === 'product' ? "Enter product ID..." : "Enter user ID..."}
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559]"
                />
              </div>
            )}

            {/* Sort By */}
            <div className="sm:w-48 relative">
              <SortDesc size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
              <select
                value={sortBy}
                onChange={(e) => dispatch(setSortBy(e.target.value as any))}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between">
            {/* Bulk Selection */}
            {filteredReviews.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedReviewIds.length === filteredReviews.length && filteredReviews.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#5D5FEF] focus:ring-[#5D5FEF]"
                  />
                  <span className="text-sm font-medium text-[#1B2559]">
                    Select All ({selectedReviewIds.length} selected)
                  </span>
                </label>

                {selectedReviewIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
                  >
                    <Trash2 size={14} />
                    Delete Selected
                  </button>
                )}
              </div>
            )}

            {/* Reset Filters */}
            <button
              onClick={() => {
                dispatch(resetFilters());
                setLocalSearch("");
                setLocalFilterValue("");
              }}
              className="text-sm text-[#5D5FEF] font-medium hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      {loading && reviews.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="text-[#5D5FEF] animate-spin mx-auto mb-3 sm:mb-4" />
            <p className="text-[#A3AED0] font-bold text-sm sm:text-base">Loading reviews...</p>
          </div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F4F7FE] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <MessageSquare size={24} className="text-[#5D5FEF] sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#1B2559] mb-2">No Reviews Found</h3>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm">
            {localSearch || filterBy !== 'all' || localFilterValue
              ? "Try adjusting your filters"
              : "No reviews have been submitted yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Checkbox */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedReviewIds.includes(review._id)}
                      onChange={() => handleSelectReview(review._id)}
                      className="w-4 h-4 mt-1 rounded border-gray-300 text-[#5D5FEF] focus:ring-[#5D5FEF]"
                    />
                  </div>

                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden relative">
                      {getImageSrc(review) && (
                        <Image
                          src={getImageSrc(review)}
                          alt={`Product image for ${review.productTitle || 'product'}`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          onError={() => handleImageError(review._id)}
                          priority={false}
                        />
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-[#1B2559] text-base sm:text-lg mb-1">
                          {review.productTitle || 'Unknown Product'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#A3AED0]">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {review.userName || 'Unknown User'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {review.userEmail || 'Unknown Email'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating, 14)}
                        </div>
                        <span className="text-sm font-bold text-[#1B2559]">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {review.comment || 'No comment provided'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewReview(review._id)}
                        className="p-1.5 hover:bg-[#F4F7FE] rounded-lg text-[#A3AED0] hover:text-[#5D5FEF] transition-all"
                        title="View review"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-1.5 hover:bg-[#F4F7FE] rounded-lg text-[#A3AED0] hover:text-[#1B2559] transition-all"
                        title="Edit review"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-[#A3AED0] hover:text-red-500 transition-all"
                        title="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100">
              <p className="text-xs sm:text-sm font-bold text-[#A3AED0] order-2 sm:order-1">
                Page <span className="text-[#1B2559]">{pagination.page}</span> of {pagination.pages}
              </p>
              
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all ${
                    pagination.page === 1
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-[#1B2559] hover:bg-[#F4F7FE] shadow-sm hover:shadow'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === pagination.pages || 
                    Math.abs(page - pagination.page) <= 2
                  )
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <span key={`dots-${page}`} className="text-[#A3AED0] px-1">...</span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-black text-xs transition-all ${
                          pagination.page === page
                            ? 'bg-[#5D5FEF] text-white shadow-md'
                            : 'bg-white text-[#A3AED0] hover:bg-[#F4F7FE] hover:text-[#1B2559] border border-gray-100'
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
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-[#1B2559] hover:bg-[#F4F7FE] shadow-sm hover:shadow'
                  }`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* View Review Modal */}
{/* View Review Modal */}
<AnimatePresence>
  {viewModal && selectedReview && (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xl bg-black/20">
      <div className="absolute inset-0" onClick={() => setViewModal(false)} />
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-[35px] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] sm:max-h-[85vh] flex flex-col"
      >
        {/* Header with drag indicator */}
        <div className="relative pt-2 pb-1 sm:pb-2 border-b border-gray-100">
          <div className="flex justify-center sm:hidden">
            <div className="w-12 h-1 bg-gray-300 rounded-full mb-2" />
          </div>
          <div className="flex items-center justify-between px-4 sm:px-6 pb-2">
            <h3 className="text-lg sm:text-xl font-bold text-[#1B2559] flex items-center gap-2">
              <span className="w-1.5 h-5 bg-gradient-to-b from-[#5D5FEF] to-[#868CFF] rounded-full"></span>
              Review Details
            </h3>
            <button
              onClick={() => setViewModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={18} className="sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-5">
          <div className="space-y-4">
            {/* Product Card */}
            <div className="bg-gradient-to-br from-[#F4F7FE] to-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-[#A3AED0] mb-3 flex items-center gap-1">
                <Package size={14} />
                Product Information
              </p>
              <div className="flex items-center gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 bg-white rounded-lg overflow-hidden shadow-sm flex-shrink-0 border border-gray-200">
                  {selectedReview.productImage ? (
                    <Image
                      src={selectedReview.productImage}
                      alt={selectedReview.productTitle || 'Product'}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#1B2559] text-sm sm:text-base truncate">
                    {selectedReview.productTitle || 'Unknown Product'}
                  </h4>
                  <p className="text-xs text-[#A3AED0] mt-1 truncate">
                    ID: {selectedReview.productId}
                  </p>
                </div>
              </div>
            </div>

            {/* User Card */}
            <div className="bg-gradient-to-br from-[#F4F7FE] to-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-[#A3AED0] mb-3 flex items-center gap-1">
                <User size={14} />
                Reviewer Information
              </p>
              <div className="flex items-center gap-3">
                {/* User Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0">
                  {(selectedReview.userName || 'U').charAt(0).toUpperCase()}
                </div>
                
                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#1B2559] text-sm sm:text-base truncate">
                    {selectedReview.userName || 'Unknown User'}
                  </h4>
                  <p className="text-xs text-[#A3AED0] mt-1 truncate">
                    {selectedReview.userEmail || 'No email'}
                  </p>
                  <p className="text-xs text-[#A3AED0] mt-1 truncate">
                    ID: {selectedReview.userId}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Card */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl p-4 border border-amber-200/50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-amber-700 flex items-center gap-1">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  Rating
                </p>
                <span className="text-xs px-2 py-1 bg-white rounded-full text-amber-700 font-medium shadow-sm">
                  {selectedReview.rating}.0 / 5.0
                </span>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {renderStars(selectedReview.rating, 20)}
              </div>
            </div>

            {/* Review Comment Card */}
            <div className="bg-gradient-to-br from-[#F4F7FE] to-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-[#A3AED0] mb-3 flex items-center gap-1">
                <MessageSquare size={14} />
                Review Comment
              </p>
              <div className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedReview.comment || 'No comment provided'}
                </p>
              </div>
            </div>

            {/* Dates Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-3 border border-blue-200/50">
                <p className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  Created
                </p>
                <p className="text-xs font-semibold text-blue-800 break-words">
                  {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-[10px] text-blue-600 mt-1">
                  {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleTimeString() : ''}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl p-3 border border-purple-200/50">
                <p className="text-xs font-medium text-purple-700 mb-1 flex items-center gap-1">
                  <Clock size={12} />
                  Updated
                </p>
                <p className="text-xs font-semibold text-purple-800 break-words">
                  {selectedReview.updatedAt ? new Date(selectedReview.updatedAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-[10px] text-purple-600 mt-1">
                  {selectedReview.updatedAt ? new Date(selectedReview.updatedAt).toLocaleTimeString() : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setViewModal(false);
                handleEditReview(selectedReview);
              }}
              className="flex-1 py-3 bg-[#5D5FEF] text-white rounded-xl font-medium hover:bg-[#4B4DC9] transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
            >
              <Pencil size={16} />
              Edit Review
            </button>
            <button
              onClick={() => {
                setViewModal(false);
                handleDeleteReview(selectedReview._id);
              }}
              className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-all active:scale-95 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
      {/* Edit Review Modal */}
      <AnimatePresence>
        {editModal && selectedReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setEditModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[35px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1B2559]">Edit Review</h3>
                  <button
                    onClick={() => setEditModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Rating Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#A3AED0] mb-3">
                      Rating
                    </label>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            size={32}
                            className={`transition-colors ${
                              star <= editForm.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-medium text-[#1B2559]">
                        {editForm.rating} out of 5
                      </span>
                    </div>
                  </div>

                  {/* Comment Field */}
                  <div>
                    <label htmlFor="edit-comment" className="block text-sm font-medium text-[#A3AED0] mb-2">
                      Review Comment
                    </label>
                    <textarea
                      id="edit-comment"
                      rows={6}
                      value={editForm.comment}
                      onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20 outline-none transition-all resize-none text-[#1B2559]"
                      required
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setEditModal(false)}
                      disabled={operationLoading}
                      className="flex-1 py-3 border border-gray-200 text-[#1B2559] rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateReview}
                      disabled={operationLoading}
                      className="flex-1 py-3 bg-[#5D5FEF] text-white rounded-xl font-medium hover:bg-[#4B4DC9] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {operationLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Review'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Single Review Modal */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setDeleteModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[35px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#1B2559] mb-2">Delete Review</h3>
                <p className="text-[#A3AED0] mb-6">
                  Are you sure you want to delete this review? 
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal(false)}
                    disabled={operationLoading}
                    className="flex-1 py-3 border border-gray-200 text-[#1B2559] rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteReview}
                    disabled={operationLoading}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {operationLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Modal */}
      <AnimatePresence>
        {bulkDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setBulkDeleteModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[35px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#1B2559] mb-2">Delete Multiple Reviews</h3>
                <p className="text-[#A3AED0] mb-2">
                  Are you sure you want to delete {selectedReviewIds.length} selected reviews?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setBulkDeleteModal(false)}
                    disabled={operationLoading}
                    className="flex-1 py-3 border border-gray-200 text-[#1B2559] rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBulkDelete}
                    disabled={operationLoading}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {operationLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete All'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {statsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setStatsModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[35px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1B2559]">Review Statistics</h3>
                  <button
                    onClick={() => setStatsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Key Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] text-white rounded-xl text-center">
                      <p className="text-xs font-bold uppercase opacity-90 mb-1">Total Reviews</p>
                      <p className="text-2xl font-black">{stats.totalReviews}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl text-center">
                      <p className="text-xs font-bold uppercase opacity-90 mb-1">Avg Rating</p>
                      <p className="text-2xl font-black">{stats.averageRating.toFixed(1)}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl text-center">
                      <p className="text-xs font-bold uppercase opacity-90 mb-1">Products with Reviews</p>
                      <p className="text-2xl font-black">{stats.totalProductsWithReviews}</p>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div>
                    <h4 className="font-bold text-[#1B2559] mb-3">Rating Distribution</h4>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] || 0;
                        const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                        
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#1B2559] w-8">{star}★</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-[#A3AED0] w-12">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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