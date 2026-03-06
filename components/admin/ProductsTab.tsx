"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package,
  Plus,
  Search,
  Eye,
  X,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  TrendingUp,
  Filter,
  Grid3x3
} from "lucide-react";
import Image from "next/image";
import AddProductForm from "./AddProductForm";
import EditProductForm from "./EditProductForm";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { 
  fetchAdminProducts, 
  deleteProduct,
  setPagination,
  clearProductsError
} from "@/lib/redux/features/products/productsAdminSlice";
import { getSubcategories } from "@/lib/utils/categoryUtils";

export default function ProductsTab() {
  const dispatch = useAppDispatch();
  const { products, pagination, loading, operationLoading, error } = useAppSelector(
    (state) => state.productsAdmin
  );
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; productId: string | null }>({
    show: false,
    productId: null,
  });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(0);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "men", label: "Men" },
    { value: "women", label: "Women" },
    { value: "kids", label: "Kids" },
    { value: "beauty", label: "Beauty" },
    { value: "home", label: "Home" },
  ];

  useEffect(() => {
    if (categoryFilter && categoryFilter !== "all") {
      setAvailableSubcategories(getSubcategories(categoryFilter));
      setSubcategoryFilter("all");
    } else {
      setAvailableSubcategories([]);
      setSubcategoryFilter("all");
    }
  }, [categoryFilter]);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProducts = useCallback((page: number = pagination.page, category: string = categoryFilter, subcategory: string = subcategoryFilter, searchTerm: string = search) => {
    dispatch(fetchAdminProducts({
      page,
      limit: pagination.limit,
      category: category !== "all" ? category : undefined,
      subcategory: subcategory !== "all" ? subcategory : undefined,
      search: searchTerm || undefined,
    }));
  }, [dispatch, pagination.limit]);

  const handleCategoryChange = (newCategory: string) => {
    setCategoryFilter(newCategory);
    dispatch(setPagination({ page: 1 }));
    fetchProducts(1, newCategory, subcategoryFilter, search);
  };

  const handleSubcategoryChange = (newSubcategory: string) => {
    setSubcategoryFilter(newSubcategory);
    dispatch(setPagination({ page: 1 }));
    fetchProducts(1, categoryFilter, newSubcategory, search);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setPagination({ page: 1 }));
      fetchProducts(1, categoryFilter, subcategoryFilter, search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, categoryFilter, subcategoryFilter, fetchProducts]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPagination({ page: newPage }));
    fetchProducts(newPage, categoryFilter, subcategoryFilter, search);
  };

  useEffect(() => {
    fetchProducts(1, categoryFilter, subcategoryFilter, search);
  }, []);

  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearProductsError());
    }
  }, [error, dispatch]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(result)) {
      showToast("Product deleted successfully", "success");
      fetchProducts(pagination.page, categoryFilter, subcategoryFilter, search);
    } else {
      showToast("Failed to delete product", "error");
    }
    setDeleteModal({ show: false, productId: null });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      men: "bg-blue-100 text-blue-600",
      women: "bg-pink-100 text-pink-600",
      kids: "bg-green-100 text-green-600",
      beauty: "bg-purple-100 text-purple-600",
      home: "bg-amber-100 text-amber-600",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-600";
  };

  const getSubcategoryColor = (subcategory: string) => {
    const colors: Record<string, string> = {
      Clothing: "bg-blue-50 text-blue-600",
      Footwear: "bg-indigo-50 text-indigo-600",
      Sports: "bg-green-50 text-green-600",
      Accessories: "bg-purple-50 text-purple-600",
      Jewelery: "bg-yellow-50 text-yellow-600",
      Beauty: "bg-pink-50 text-pink-600",
      Boys: "bg-cyan-50 text-cyan-600",
      Girls: "bg-rose-50 text-rose-600",
      Toys: "bg-orange-50 text-orange-600",
      "Home decor": "bg-amber-50 text-amber-600",
      Furnishing: "bg-stone-50 text-stone-600",
      Kitchen: "bg-lime-50 text-lime-600",
      Groceries: "bg-emerald-50 text-emerald-600",
      Electronics: "bg-sky-50 text-sky-600",
      Gadgets: "bg-violet-50 text-violet-600",
      Books: "bg-gray-50 text-gray-600",
      Makeup: "bg-rose-50 text-rose-600",
      Skincare: "bg-teal-50 text-teal-600",
      Haircare: "bg-fuchsia-50 text-fuchsia-600",
      Fragrance: "bg-purple-50 text-purple-600",
    };
    return colors[subcategory] || "bg-gray-50 text-gray-600";
  };

  const getVisiblePages = () => {
    let delta = 2;
    
    if (windowWidth < 640) {
      delta = 1;
    } else if (windowWidth >= 640 && windowWidth < 1024) {
      delta = 2;
    } else {
      delta = 3;
    }
    
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= pagination.pages; i++) {
      if (i === 1 || i === pagination.pages || (i >= pagination.page - delta && i <= pagination.page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-200">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#5D5FEF] font-black text-xs tracking-widest uppercase">
              Product Management
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B2559] tracking-tight">
            Products Catalog
          </h2>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm mt-1">
            Manage your product inventory - {pagination.total} total products
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#1B2559] to-[#5D5FEF] text-white rounded-xl font-black text-sm sm:text-base hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559]"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:w-36 lg:w-40 relative">
            <Filter size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter  */}
          {categoryFilter !== "all" && availableSubcategories.length > 0 && (
            <div className="sm:w-44 lg:w-48 relative">
              <Grid3x3 size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" />
              <select
                value={subcategoryFilter}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold text-sm transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
              >
                <option value="all">All Subcategories</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="text-[#5D5FEF] animate-spin mx-auto mb-3 sm:mb-4" />
            <p className="text-[#A3AED0] font-bold text-sm sm:text-base">Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F4F7FE] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Package size={24} className="text-[#5D5FEF] sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#1B2559] mb-2">No Products Found</h3>
          <p className="text-[#A3AED0] font-semibold text-xs sm:text-sm">
            {search || categoryFilter !== "all" || subcategoryFilter !== "all"
              ? "Try adjusting your filters" 
              : "Get started by adding your first product"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                {/* Product Image */}
                <div className="relative h-36 sm:h-40 lg:h-48 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=No+Image";
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {product.isNewArrival && (
                      <span className="w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={10} className="sm:w-3 sm:h-3" />
                      </span>
                    )}
                    {product.isTrending && (
                      <span className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <h3 className="font-bold text-[#1B2559] text-sm sm:text-base line-clamp-1">
                      {product.title}
                    </h3>
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-xs font-black uppercase ${getCategoryColor(product.category)} whitespace-nowrap`}>
                      {product.category}
                    </span>
                  </div>

                  {/* Subcategory Badge */}
                  {product.subcategory && (
                    <div className="mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-medium ${getSubcategoryColor(product.subcategory)}`}>
                        {product.subcategory}
                      </span>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-[#A3AED0] line-clamp-2 mb-2 sm:mb-3">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-base sm:text-lg lg:text-xl font-black text-[#1B2559]">
                      ₹{product.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={() => setViewingProduct(product)}
                        className="p-1.5 sm:p-2 hover:bg-[#F4F7FE] rounded-lg text-[#A3AED0] hover:text-[#5D5FEF] transition-all"
                        title="View product"
                      >
                        <Eye size={14} className="sm:w-[16px] sm:h-[16px]" />
                      </button>
                      <button
                        onClick={() => setEditingProduct(product._id)}
                        className="p-1.5 sm:p-2 hover:bg-[#F4F7FE] rounded-lg text-[#A3AED0] hover:text-[#1B2559] transition-all"
                        title="Edit product"
                      >
                        <Pencil size={14} className="sm:w-[16px] sm:h-[16px]" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, productId: product._id })}
                        className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg text-[#A3AED0] hover:text-red-500 transition-all"
                        title="Delete product"
                      >
                        <Trash2 size={14} className="sm:w-[16px] sm:h-[16px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 relative z-10 mb-12 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100">
              <p className="text-xs sm:text-sm font-bold text-[#A3AED0] order-2 sm:order-1">
                Page <span className="text-[#1B2559]">{pagination.page}</span> of {pagination.pages}
              </p>
              
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 order-1 sm:order-2 w-full sm:w-auto overflow-x-auto py-1 px-0.5 scrollbar-hide">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || operationLoading}
                  className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all ${
                    pagination.page === 1
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-[#1B2559] hover:bg-[#F4F7FE] shadow-sm hover:shadow'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
                  {getVisiblePages().map((page, index) => (
                    page === '...' ? (
                      <span key={`dots-${index}`} className="flex-shrink-0 text-[#A3AED0] px-1 sm:px-1.5 text-xs sm:text-sm">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`flex-shrink-0 min-w-[32px] sm:min-w-[38px] md:min-w-[40px] h-8 sm:h-9 md:h-10 rounded-lg font-black text-xs sm:text-sm md:text-base transition-all ${
                          pagination.page === page
                            ? 'bg-[#5D5FEF] text-white shadow-md'
                            : 'bg-white text-[#A3AED0] hover:bg-[#F4F7FE] hover:text-[#1B2559] border border-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || operationLoading}
                  className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all ${
                    pagination.page === pagination.pages
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-[#1B2559] hover:bg-[#F4F7FE] shadow-sm hover:shadow'
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddForm && (
          <AddProductForm
            onClose={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              fetchProducts(1, categoryFilter, subcategoryFilter, search);
              showToast("Product created successfully", "success");
            }}
          />
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <EditProductForm
            productId={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSuccess={() => {
              setEditingProduct(null);
              fetchProducts(pagination.page, categoryFilter, subcategoryFilter, search);
              showToast("Product updated successfully", "success");
            }}
          />
        )}
      </AnimatePresence>

      {/* View Product Modal */}
      <AnimatePresence>
        {viewingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setViewingProduct(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[35px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="relative h-48 sm:h-64 bg-gray-100">
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/600?text=No+Image";
                  }}
                />
                <button
                  onClick={() => setViewingProduct(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                >
                  <X size={16} className="sm:w-5 sm:h-5 text-[#1B2559]" />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#1B2559] mb-1">
                      {viewingProduct.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A3AED0]">
                      Added by {viewingProduct.createdBy?.name || 'Admin'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase ${getCategoryColor(viewingProduct.category)} w-fit`}>
                      {viewingProduct.category}
                    </span>
                    {viewingProduct.subcategory && (
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getSubcategoryColor(viewingProduct.subcategory)} w-fit`}>
                        {viewingProduct.subcategory}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  {viewingProduct.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div>
                    <p className="text-2xl sm:text-3xl font-black text-[#1B2559]">
                      ₹{viewingProduct.price.toLocaleString()}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#A3AED0] mt-1">
                      Added on {new Date(viewingProduct.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {viewingProduct.isNewArrival && (
                      <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1">
                        <Sparkles size={10} className="sm:w-3 sm:h-3" /> NEW
                      </span>
                    )}
                    {viewingProduct.isTrending && (
                      <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1">
                        <TrendingUp size={10} className="sm:w-3 sm:h-3" /> TRENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && deleteModal.productId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setDeleteModal({ show: false, productId: null })} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[35px] p-6 shadow-2xl relative z-10"
            >
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-500 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#1B2559] mb-2">
                  Delete Product
                </h3>
                <p className="text-sm sm:text-base text-[#A3AED0] font-semibold mb-6">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ show: false, productId: null })}
                    disabled={operationLoading}
                    className="flex-1 py-2.5 sm:py-3 rounded-xl font-black text-[#A3AED0] bg-[#F4F7FE] hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteModal.productId!)}
                    disabled={operationLoading}
                    className="flex-1 py-2.5 sm:py-3 rounded-xl font-black text-white bg-red-500 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {operationLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" />
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