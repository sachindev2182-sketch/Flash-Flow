"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ShoppingCart,
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  SortDesc,
  User,
  Mail,
  Calendar,
  Package,
  TrendingUp,
  ShoppingBag,
  Clock,
  DollarSign,
  PieChart,
  Users,
  AlertCircle,
  CheckCircle,
  Tag,
  Box,
  Layers,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchAllCarts,
  fetchCartById,
  fetchCartStats,
  setSelectedCart,
  setSearchTerm,
  setFilterBy,
  setFilterValue,
  setSortBy,
  setPage,
  clearError,
  resetFilters,
  AdminCart,
  AdminCartItem,
} from "@/lib/redux/features/adminCart/adminCartSlice";

// Placeholder image
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Crect width='80' height='80' fill='%23F4F7FE'/%3E%3Cpath d='M30 35L40 45L50 35' stroke='%235D5FEF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M40 45V25' stroke='%235D5FEF' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";

export default function CartsTab() {
  const dispatch = useAppDispatch();
  const {
    carts,
    filteredCarts,
    selectedCart,
    stats,
    loading,
    error,
    searchTerm,
    filterBy,
    filterValue,
    sortBy,
    pagination,
  } = useAppSelector((state) => state.adminCart);

  const [viewModal, setViewModal] = useState(false);
  const [statsModal, setStatsModal] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [localFilterValue, setLocalFilterValue] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    dispatch(fetchAllCarts({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      filterBy,
      filterValue,
      sortBy,
    }));
    dispatch(fetchCartStats());
  }, [dispatch, pagination.page, pagination.limit, searchTerm, filterBy, filterValue, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(localSearch));
      dispatch(setPage(1));
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilterValue(localFilterValue));
      dispatch(setPage(1));
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilterValue, dispatch]);

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

  const handleViewCart = async (cartId: string) => {
    setSelectedCartId(cartId);
    const result = await dispatch(fetchCartById(cartId));
    if (fetchCartById.fulfilled.match(result)) {
      setViewModal(true);
    }
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const getImageSrc = (item: AdminCartItem) => {
    if (imageErrors[item.productId] || !item.productImage) {
      return PLACEHOLDER_IMAGE;
    }
    return item.productImage;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      men: "bg-blue-100 text-blue-600 border-blue-200",
      women: "bg-pink-100 text-pink-600 border-pink-200",
      kids: "bg-green-100 text-green-600 border-green-200",
      beauty: "bg-purple-100 text-purple-600 border-purple-200",
      home: "bg-amber-100 text-amber-600 border-amber-200",
    };
    return colors[category] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-200">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#5D5FEF] font-black text-xs tracking-widest uppercase">
              Cart Management
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2559] tracking-tight">
            User Carts
          </h2>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm mt-1">
            View all customer shopping carts - {pagination.total} total carts
          </p>
        </div>

        {/* Stats Button */}
        <button
          onClick={() => setStatsModal(true)}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-[#1B2559] rounded-xl font-black text-sm sm:text-base hover:shadow-xl transition-all active:scale-95 whitespace-nowrap border border-gray-200"
        >
          <PieChart size={16} className="sm:w-[18px] sm:h-[18px]" />
          View Statistics
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by user name or email..."
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559]"
              />
            </div>

            {/* Filter By */}
            <div className="sm:w-40 relative">
              <Filter size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
              <select
                value={filterBy}
                onChange={(e) => dispatch(setFilterBy(e.target.value as any))}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
              >
                <option value="all">All Filters</option>
                <option value="user">By User</option>
                <option value="category">By Category</option>
              </select>
            </div>

            {/* Filter Value Input */}
            {filterBy !== 'all' && (
              <div className="sm:w-64 relative">
                {filterBy === 'user' && <User size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />}
                {filterBy === 'category' && <Tag size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />}
                
                {filterBy === 'category' ? (
                  <select
                    value={localFilterValue}
                    onChange={(e) => setLocalFilterValue(e.target.value)}
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
                  >
                    <option value="">Select category</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="beauty">Beauty</option>
                    <option value="home">Home</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={localFilterValue}
                    onChange={(e) => setLocalFilterValue(e.target.value)}
                    placeholder={filterBy === 'user' ? "Enter user name..." : "Enter category..."}
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559]"
                  />
                )}
              </div>
            )}

            {/* Sort By */}
            <div className="sm:w-40 relative">
              <SortDesc size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
              <select
                value={sortBy}
                onChange={(e) => dispatch(setSortBy(e.target.value as any))}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Value</option>
                <option value="lowest">Lowest Value</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end">
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

      {/* Carts Grid */}
      {loading && carts.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="text-[#5D5FEF] animate-spin mx-auto mb-3 sm:mb-4" />
            <p className="text-[#A3AED0] font-bold text-sm sm:text-base">Loading carts...</p>
          </div>
        </div>
      ) : filteredCarts.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F4F7FE] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <ShoppingCart size={24} className="text-[#5D5FEF] sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#1B2559] mb-2">No Carts Found</h3>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm">
            {localSearch || filterBy !== 'all' || localFilterValue
              ? "Try adjusting your filters"
              : "No users have items in their carts yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredCarts.map((cart, index) => (
              <motion.div
                key={cart._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Cart Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-black text-lg">
                        <ShoppingCart size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1B2559] text-sm sm:text-base">
                          {cart.userName}
                        </h3>
                        <p className="text-xs text-[#A3AED0] flex items-center gap-1">
                          <Mail size={10} /> {cart.userEmail}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewCart(cart._id)}
                      className="p-2 hover:bg-white/50 rounded-lg text-[#A3AED0] hover:text-[#5D5FEF] transition-all"
                      title="View cart details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>

                {/* Cart Stats */}
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-[#F4F7FE] rounded-lg p-2 text-center">
                      <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">Items</p>
                      <p className="text-lg font-black text-[#1B2559]">{cart.totalItems}</p>
                    </div>
                    <div className="bg-[#F4F7FE] rounded-lg p-2 text-center">
                      <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">Total Value</p>
                      <p className="text-lg font-black text-[#1B2559]">{formatCurrency(cart.totalValue)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-[#A3AED0] flex items-center gap-1">
                      <Calendar size={12} />
                      Last Updated
                    </span>
                    <span className="font-medium text-[#1B2559]">
                      {new Date(cart.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Preview of items */}
                  {cart.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-2 flex items-center gap-1">
                        <Package size={12} />
                        Items ({cart.items.length})
                      </p>
                      <div className="flex -space-x-2 overflow-hidden">
                        {cart.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden"
                            title={`${item.productTitle} (x${item.quantity})`}
                          >
                            <Image
                              src={getImageSrc(item)}
                              alt={item.productTitle}
                              fill
                              className="object-cover"
                              onError={() => handleImageError(item.productId)}
                            />
                          </div>
                        ))}
                        {cart.items.length > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            +{cart.items.length - 4}
                          </div>
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

      {/* View Cart Modal */}
      <AnimatePresence>
        {viewModal && selectedCart && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setViewModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-4xl rounded-t-3xl sm:rounded-[35px] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] sm:max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="relative pt-2 pb-1 sm:pb-2 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex justify-center sm:hidden">
                  <div className="w-12 h-1 bg-gray-300 rounded-full mb-2" />
                </div>
                <div className="flex items-center justify-between px-4 sm:px-6 pb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1B2559] flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                    Cart Details
                  </h3>
                  <button
                    onClick={() => setViewModal(false)}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <X size={18} className="sm:w-5 sm:h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                {/* User Info Card */}
                <div className="bg-gradient-to-br from-[#F4F7FE] to-white rounded-xl p-4 mb-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0">
                      {selectedCart.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1B2559] text-sm sm:text-base">
                        {selectedCart.userName}
                      </h4>
                      <p className="text-xs text-[#A3AED0] mt-1">{selectedCart.userEmail}</p>
                      <p className="text-xs text-[#A3AED0] mt-1">User ID: {selectedCart.userId}</p>
                    </div>
                  </div>
                </div>

                {/* Cart Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <ShoppingBag size={16} className="text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">Items</p>
                    <p className="text-lg font-black text-[#1B2559]">{selectedCart.totalItems}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <DollarSign size={16} className="text-green-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">Total</p>
                    <p className="text-lg font-black text-[#1B2559]">{formatCurrency(selectedCart.totalValue)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <Package size={16} className="text-purple-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">Products</p>
                    <p className="text-lg font-black text-[#1B2559]">{selectedCart.items.length}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <Clock size={16} className="text-amber-500 mx-auto mb-1" />
                    <p className="text-[10px] font-bold text-[#A3AED0] uppercase mb-1">Updated</p>
                    <p className="text-xs font-black text-[#1B2559]">
                      {new Date(selectedCart.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <h4 className="font-bold text-[#1B2559] mb-3 flex items-center gap-2">
                  <Package size={16} />
                  Cart Items ({selectedCart.items.length})
                </h4>

                <div className="space-y-3">
                  {selectedCart.items.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[#F4F7FE] rounded-xl p-3 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100"
                    >
                      <div className="flex gap-3">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={getImageSrc(item)}
                            alt={item.productTitle}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                            onError={() => handleImageError(item.productId)}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-[#1B2559] text-sm truncate">
                                {item.productTitle}
                              </h5>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded mt-1 inline-block ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                            </div>
                            {item.size && (
                              <span className="text-[10px] px-2 py-1 bg-gray-200 rounded">
                                Size: {item.size}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <span className="text-sm font-black text-[#1B2559]">
                                {formatCurrency(item.price)} × {item.quantity}
                              </span>
                              <p className="text-[10px] text-[#A3AED0] mt-0.5">
                                Added: {new Date(item.addedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="text-sm font-black text-[#5D5FEF]">
                              {formatCurrency(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {statsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setStatsModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-[35px] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1B2559]">Cart Statistics</h3>
                  <button
                    onClick={() => setStatsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl text-center">
                    <ShoppingCart size={24} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase opacity-90 mb-1">Total Carts</p>
                    <p className="text-2xl font-black">{stats.totalCarts}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl text-center">
                    <Package size={24} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase opacity-90 mb-1">Total Items</p>
                    <p className="text-2xl font-black">{stats.totalItemsInCarts}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl text-center">
                    <DollarSign size={24} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase opacity-90 mb-1">Total Value</p>
                    <p className="text-2xl font-black">{formatCurrency(stats.totalCartValue)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl text-center">
                    <TrendingUp size={24} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase opacity-90 mb-1">Avg Cart Value</p>
                    <p className="text-2xl font-black">{formatCurrency(stats.averageCartValue)}</p>
                  </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Active Carts</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{stats.activeCarts}</p>
                    <p className="text-xs text-amber-600 mt-1">Last 7 days</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={16} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">Abandoned</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-600">{stats.abandonedCarts}</p>
                    <p className="text-xs text-gray-600 mt-1">Older than 7 days</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">Items/Cart</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{stats.itemsPerCart.toFixed(1)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Box size={16} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Unique Products</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {Object.keys(stats.categoryDistribution).length}
                    </p>
                  </div>
                </div>

                {/* Category Distribution */}
                <div>
                  <h4 className="font-bold text-[#1B2559] mb-3">Category Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(stats.categoryDistribution).map(([category, count]) => (
                      <div key={category} className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded w-16 text-center ${getCategoryColor(category)}`}>
                          {category}
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                            style={{
                              width: `${(count / stats.totalItemsInCarts) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#1B2559] w-16 text-right">
                          {count} ({((count / stats.totalItemsInCarts) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ))}
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