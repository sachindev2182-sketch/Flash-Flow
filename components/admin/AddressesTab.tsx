"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MapPin,
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  SortDesc,
  Home,
  Briefcase,
  Phone,
  User,
  Calendar,
  Building,
  Star,
  TrendingUp,
  Map,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  fetchAllAddresses,
  fetchAddressById,
  fetchAddressStats,
  setSelectedAddress,
  setSearchTerm,
  setFilterBy,
  setFilterValue,
  setSortBy,
  setPage,
  clearError,
  resetFilters,
  AdminAddress,
} from "@/lib/redux/features/adminAddresses/adminAddressesSlice";

// Placeholder image for error fallback
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80' fill='none'%3E%3Crect width='80' height='80' fill='%23F4F7FE'/%3E%3Cpath d='M30 35L40 45L50 35' stroke='%235D5FEF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M40 45V25' stroke='%235D5FEF' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";

export default function AddressesTab() {
  const dispatch = useAppDispatch();
  const {
    addresses,
    filteredAddresses,
    selectedAddress,
    stats,
    loading,
    error,
    searchTerm,
    filterBy,
    filterValue,
    sortBy,
    pagination,
  } = useAppSelector((state) => state.adminAddresses);

  const [viewModal, setViewModal] = useState(false);
  const [statsModal, setStatsModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [localFilterValue, setLocalFilterValue] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    dispatch(fetchAllAddresses({
      page: pagination.page,
      limit: pagination.limit,
      search: searchTerm,
      filterBy,
      filterValue,
      sortBy,
    }));
    dispatch(fetchAddressStats());
  }, [dispatch, pagination.page, pagination.limit, searchTerm, filterBy, filterValue, sortBy]);

  // Handle search 
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(localSearch));
      dispatch(setPage(1));
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, dispatch]);

  // Handle filter value 
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

  const handleViewAddress = async (addressId: string) => {
    setSelectedAddressId(addressId);
    const result = await dispatch(fetchAddressById(addressId));
    if (fetchAddressById.fulfilled.match(result)) {
      setViewModal(true);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home size={16} className="text-blue-500" />;
      case "work":
        return <Briefcase size={16} className="text-purple-500" />;
      default:
        return <MapPin size={16} className="text-gray-500" />;
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case "home":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "work":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-200">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#5D5FEF] font-black text-xs tracking-widest uppercase">
              Address Management
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2559] tracking-tight">
            User Addresses
          </h2>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm mt-1">
            View all user addresses - {pagination.total} total addresses
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

      {/* Filters and Search */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search by name, address, city, pincode..."
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
                <option value="city">By City</option>
                <option value="state">By State</option>
                <option value="type">By Type</option>
              </select>
            </div>

            {/* Filter Value Input */}
            {filterBy !== 'all' && (
              <div className="sm:w-64 relative">
                {filterBy === 'user' && <User size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />}
                {filterBy === 'city' && <Building size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />}
                {filterBy === 'state' && <Map size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />}
                {filterBy === 'type' && <Home size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />}
                
                {filterBy === 'type' ? (
                  <select
                    value={localFilterValue}
                    onChange={(e) => setLocalFilterValue(e.target.value)}
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
                  >
                    <option value="">Select type</option>
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={localFilterValue}
                    onChange={(e) => setLocalFilterValue(e.target.value)}
                    placeholder={filterBy === 'user' ? "Enter user name..." : filterBy === 'city' ? "Enter city..." : "Enter state..."}
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
                <option value="name">By Name</option>
                <option value="city">By City</option>
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

      {/* Addresses Grid */}
      {loading && addresses.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="text-[#5D5FEF] animate-spin mx-auto mb-3 sm:mb-4" />
            <p className="text-[#A3AED0] font-bold text-sm sm:text-base">Loading addresses...</p>
          </div>
        </div>
      ) : filteredAddresses.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F4F7FE] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <MapPin size={24} className="text-[#5D5FEF] sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#1B2559] mb-2">No Addresses Found</h3>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm">
            {localSearch || filterBy !== 'all' || localFilterValue
              ? "Try adjusting your filters"
              : "No addresses have been added yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredAddresses.map((address, index) => (
              <motion.div
                key={address._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  {/* User Info */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {address.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1B2559] text-sm">{address.userName}</h4>
                      <p className="text-xs text-[#A3AED0]">{address.userEmail}</p>
                    </div>
                  </div>

                  {/* Address Type Badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getAddressTypeColor(address.addressType)}`}>
                    {getAddressTypeIcon(address.addressType)}
                    {address.addressType.charAt(0).toUpperCase() + address.addressType.slice(1)}
                  </span>
                </div>

                {/* Default Badge */}
                {address.isDefault && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#5D5FEF]/10 text-[#5D5FEF] rounded-full text-xs font-medium">
                      <Star size={12} className="fill-[#5D5FEF]" />
                      Default Address
                    </span>
                  </div>
                )}

                {/* Address Details */}
                <div className="space-y-2 mb-3">
                  <p className="text-sm text-[#1B2559] font-medium">{address.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {address.houseNumber}, {address.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone size={12} />
                    {address.phoneNumber}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="text-xs text-[#A3AED0] flex items-center gap-1">
                    <Calendar size={12} />
                    Added {formatDate(address.createdAt)}
                  </p>
                  <button
                    onClick={() => handleViewAddress(address._id)}
                    className="p-1.5 hover:bg-[#F4F7FE] rounded-lg text-[#A3AED0] hover:text-[#5D5FEF] transition-all"
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
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

      {/* View Address Modal */}
      <AnimatePresence>
        {viewModal && selectedAddress && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setViewModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-[35px] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] sm:max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="relative pt-2 pb-1 sm:pb-2 border-b border-gray-100">
                <div className="flex justify-center sm:hidden">
                  <div className="w-12 h-1 bg-gray-300 rounded-full mb-2" />
                </div>
                <div className="flex items-center justify-between px-4 sm:px-6 pb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1B2559] flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
                    Address Details
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
                  {/* User Info Card */}
                  <div className="bg-gradient-to-br from-[#F4F7FE] to-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-[#A3AED0] mb-3 flex items-center gap-1">
                      <User size={14} />
                      User Information
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0">
                        {selectedAddress.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#1B2559] text-sm sm:text-base truncate">
                          {selectedAddress.userName}
                        </h4>
                        <p className="text-xs text-[#A3AED0] mt-1 truncate">
                          {selectedAddress.userEmail}
                        </p>
                        <p className="text-xs text-[#A3AED0] mt-1 truncate">
                          ID: {selectedAddress.userId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Type Card */}
                  <div className="bg-gradient-to-br from-[#F4F7FE] to-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-[#A3AED0] mb-3 flex items-center gap-1">
                      <MapPin size={14} />
                      Address Type
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${getAddressTypeColor(selectedAddress.addressType)}`}>
                        {getAddressTypeIcon(selectedAddress.addressType)}
                        {selectedAddress.addressType.charAt(0).toUpperCase() + selectedAddress.addressType.slice(1)}
                      </span>
                      {selectedAddress.isDefault && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5D5FEF]/10 text-[#5D5FEF] rounded-full text-sm font-medium">
                          <Star size={14} className="fill-[#5D5FEF]" />
                          Default Address
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Details Card */}
                  <div className="bg-gradient-to-br from-[#F4F7FE] to-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-[#A3AED0] mb-3 flex items-center gap-1">
                      <Phone size={14} />
                      Contact Details
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-[#1B2559]">
                        <span className="font-medium">Full Name:</span> {selectedAddress.fullName}
                      </p>
                      <p className="text-sm text-[#1B2559]">
                        <span className="font-medium">Phone:</span> {selectedAddress.phoneNumber}
                      </p>
                    </div>
                  </div>

                  {/* Address Details Card */}
                  <div className="bg-gradient-to-br from-[#F4F7FE] to-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-medium text-[#A3AED0] mb-3 flex items-center gap-1">
                      <MapPin size={14} />
                      Address Details
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-[#1B2559]">
                        <span className="font-medium">House/Flat:</span> {selectedAddress.houseNumber}
                      </p>
                      <p className="text-sm text-[#1B2559]">
                        <span className="font-medium">Street:</span> {selectedAddress.street}
                      </p>
                      <p className="text-sm text-[#1B2559]">
                        <span className="font-medium">City:</span> {selectedAddress.city}
                      </p>
                      <p className="text-sm text-[#1B2559]">
                        <span className="font-medium">State:</span> {selectedAddress.state}
                      </p>
                      <p className="text-sm text-[#1B2559]">
                        <span className="font-medium">Pincode:</span> {selectedAddress.pincode}
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
                      <p className="text-xs font-semibold text-blue-800">
                        {formatDate(selectedAddress.createdAt)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl p-3 border border-purple-200/50">
                      <p className="text-xs font-medium text-purple-700 mb-1 flex items-center gap-1">
                        <Calendar size={12} />
                        Updated
                      </p>
                      <p className="text-xs font-semibold text-purple-800">
                        {formatDate(selectedAddress.updatedAt)}
                      </p>
                    </div>
                  </div>
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
              className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-[35px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1B2559]">Address Statistics</h3>
                  <button
                    onClick={() => setStatsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] text-white rounded-xl text-center">
                      <p className="text-xs font-bold uppercase opacity-90 mb-1">Total Addresses</p>
                      <p className="text-2xl font-black">{stats.totalAddresses}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl text-center">
                      <p className="text-xs font-bold uppercase opacity-90 mb-1">Users with Addresses</p>
                      <p className="text-2xl font-black">{stats.totalUsersWithAddresses}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl text-center">
                      <p className="text-xs font-bold uppercase opacity-90 mb-1">Default Addresses</p>
                      <p className="text-2xl font-black">{stats.defaultAddresses}</p>
                    </div>
                  </div>

                  {/* Address Type Distribution */}
                  <div>
                    <h4 className="font-bold text-[#1B2559] mb-3">Address Type Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1B2559] w-16">Home</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            style={{ width: `${(stats.homeAddresses / stats.totalAddresses) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#A3AED0] w-12">{stats.homeAddresses}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1B2559] w-16">Work</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                            style={{ width: `${(stats.workAddresses / stats.totalAddresses) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#A3AED0] w-12">{stats.workAddresses}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1B2559] w-16">Other</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"
                            style={{ width: `${(stats.otherAddresses / stats.totalAddresses) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-[#A3AED0] w-12">{stats.otherAddresses}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Home size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Home Addresses</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{stats.homeAddresses}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={16} className="text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Work Addresses</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{stats.workAddresses}</p>
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