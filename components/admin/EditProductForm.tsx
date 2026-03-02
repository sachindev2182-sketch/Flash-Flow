"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Image as ImageIcon,
  Tag,
  FileText,
  IndianRupee,
  Grid3x3,
  Sparkles,
  TrendingUp,
  Loader2,
  Upload,
  Trash2
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { updateProduct } from "@/lib/redux/features/products/productsAdminSlice";
import { uploadImage, clearUpload } from "@/lib/redux/features/upload/uploadSlice";

interface EditProductFormProps {
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductForm({ productId, onClose, onSuccess }: EditProductFormProps) {
  const dispatch = useAppDispatch();
  const { uploading, progress, error: uploadError, uploadedImage } = useAppSelector(
    (state) => state.upload
  );
  const { operationLoading } = useAppSelector((state) => state.productsAdmin);

  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "men",
    image: "",
    isNewArrival: false,
    isTrending: false,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);

  const categories = [
    { value: "men", label: "Men", color: "blue" },
    { value: "women", label: "Women", color: "pink" },
    { value: "kids", label: "Kids", color: "green" },
    { value: "beauty", label: "Beauty", color: "purple" },
    { value: "home", label: "Home", color: "amber" },
  ];

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetching(true);
        const res = await fetch(`/api/admin/products/${productId}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch product");

        const data = await res.json();
        const product = data.product;

        setFormData({
          title: product.title,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          image: product.image,
          isNewArrival: product.isNewArrival,
          isTrending: product.isTrending,
        });

        // Set preview image if exists
        if (product.image) {
          setPreviewImage(product.image);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setFetchError(error instanceof Error ? error.message : "Failed to load product data");
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle successful upload
  useEffect(() => {
    if (uploadedImage) {
      setFormData(prev => ({ ...prev, image: uploadedImage.url }));
      setPreviewImage(uploadedImage.url);
      dispatch(clearUpload());
    }
  }, [uploadedImage, dispatch]);

  // Handle upload error
  useEffect(() => {
    if (uploadError) {
      setLocalUploadError(uploadError);
    }
  }, [uploadError]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalUploadError(null);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      setLocalUploadError("Please upload a valid image file (JPEG, PNG, GIF, WEBP, AVIF)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setLocalUploadError("File size too large. Maximum 5MB allowed.");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file using Redux action
    dispatch(uploadImage(file));
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({ ...prev, image: "" }));
    setLocalUploadError(null);
    dispatch(clearUpload());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      setLocalUploadError("Please upload an image");
      return;
    }

    const result = await dispatch(updateProduct({
      id: productId,
      data: {
        ...formData,
        price: parseFloat(formData.price),
      },
    }));

    if (updateProduct.fulfilled.match(result)) {
      onSuccess();
    }
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
        <div className="bg-white w-full max-w-2xl rounded-[35px] p-10 flex items-center justify-center">
          <Loader2 size={40} className="text-[#5D5FEF] animate-spin" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-black/20">
        <div className="bg-white w-full max-w-2xl rounded-[35px] p-10 text-center">
          <p className="text-red-500 font-bold mb-4">{fetchError}</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#5D5FEF] text-white rounded-xl font-bold hover:bg-[#4B4DC9] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl bg-black/20">
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[35px] sm:rounded-[50px] shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-20 px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-100 flex justify-between items-center rounded-t-[35px] sm:rounded-t-[50px]">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1B2559] tracking-tight">
              Edit Product
            </h3>
            <p className="text-xs sm:text-sm text-[#A3AED0] font-semibold mt-1">
              Update the product details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F4F7FE] rounded-full text-[#A3AED0] hover:text-[#1B2559] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase text-[#A3AED0] tracking-wider ml-1">
              <ImageIcon size={14} className="text-[#5D5FEF]" />
              Product Image
            </label>
            
            <div className="relative">
              {!previewImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-[#5D5FEF] transition-colors group">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-[#F4F7FE] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-[#5D5FEF]" />
                    </div>
                    <p className="font-bold text-[#1B2559]">
                      Click to upload new image
                    </p>
                    <p className="text-xs text-[#A3AED0]">
                      PNG, JPG, GIF, WEBP, AVIF (Max 5MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                          <div 
                            className="h-full bg-[#5D5FEF] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-sm font-bold text-[#1B2559]">
                          Uploading... {progress}%
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {(localUploadError || uploadError) && (
                <p className="mt-2 text-xs text-red-500 font-semibold">
                  {localUploadError || uploadError}
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase text-[#A3AED0] tracking-wider ml-1">
              <Tag size={14} className="text-[#5D5FEF]" />
              Product Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold transition-all outline-none text-[#1B2559]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase text-[#A3AED0] tracking-wider ml-1">
              <FileText size={14} className="text-[#5D5FEF]" />
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-5 py-4 rounded-2xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold transition-all outline-none text-[#1B2559] resize-none"
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase text-[#A3AED0] tracking-wider ml-1">
                <IndianRupee size={14} className="text-[#5D5FEF]" />
                Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#A3AED0] font-bold">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-10 pr-5 py-4 rounded-2xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold transition-all outline-none text-[#1B2559]"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase text-[#A3AED0] tracking-wider ml-1">
                <Grid3x3 size={14} className="text-[#5D5FEF]" />
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {/* New Arrival Toggle */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F7FE] cursor-pointer group hover:bg-[#E9EDF7] transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  formData.isNewArrival ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#1B2559]">New Arrival</p>
                  <p className="text-xs text-[#A3AED0]">Mark as new product</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all ${
                formData.isNewArrival ? 'bg-green-500' : 'bg-gray-300'
              } relative`}>
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                />
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.isNewArrival ? 'translate-x-6' : ''
                }`} />
              </div>
            </label>

            {/* Trending Toggle */}
            <label className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F7FE] cursor-pointer group hover:bg-[#E9EDF7] transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  formData.isTrending ? 'bg-orange-500' : 'bg-gray-300'
                }`}>
                  <TrendingUp size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#1B2559]">Trending</p>
                  <p className="text-xs text-[#A3AED0]">Mark as trending</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-all ${
                formData.isTrending ? 'bg-orange-500' : 'bg-gray-300'
              } relative`}>
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                />
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  formData.isTrending ? 'translate-x-6' : ''
                }`} />
              </div>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={operationLoading || uploading}
              className="py-4 rounded-2xl font-black text-[#A3AED0] bg-[#F4F7FE] hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={operationLoading || uploading || !formData.image}
              className="py-4 rounded-2xl font-black text-white bg-gradient-to-r from-[#1B2559] to-[#5D5FEF] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {operationLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}