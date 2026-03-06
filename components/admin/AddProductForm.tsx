"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { createProduct } from "@/lib/redux/features/products/productsAdminSlice";
import { uploadImage, clearUpload } from "@/lib/redux/features/upload/uploadSlice";

interface AddProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
  const dispatch = useAppDispatch();
  const { uploading, progress, error: uploadError, uploadedImage } = useAppSelector(
    (state) => state.upload
  );
  const { operationLoading } = useAppSelector((state) => state.productsAdmin);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "men",
    subcategory: "",
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

  useEffect(() => {
    if (uploadedImage) {
      setFormData(prev => ({ ...prev, image: uploadedImage.url }));
      setPreviewImage(uploadedImage.url);
      dispatch(clearUpload());
    }
  }, [uploadedImage, dispatch]);

  useEffect(() => {
    if (uploadError) {
      setLocalUploadError(uploadError);
    }
  }, [uploadError]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalUploadError(null);
    setPreviewImage(null);
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      setLocalUploadError("Please upload a valid image file (JPEG, PNG, GIF, WEBP, AVIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalUploadError("File size too large. Maximum 5MB allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

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

    if (!formData.subcategory) {
      setLocalUploadError("Please select a subcategory");
      return;
    }

    const result = await dispatch(createProduct({
      ...formData,
      price: parseFloat(formData.price),
    }));

    if (createProduct.fulfilled.match(result)) {
      onSuccess();
    }
  };

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
              Add New Product
            </h3>
            <p className="text-xs sm:text-sm text-[#A3AED0] font-semibold mt-1">
              Fill in the details to create a new product
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
                      Click to upload
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
              className="w-full px-5 py-4 rounded-2xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold transition-all outline-none text-[#1B2559] placeholder:text-[#A3AED0]"
              placeholder="e.g. Premium Cotton T-Shirt"
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
              className="w-full px-5 py-4 rounded-2xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold transition-all outline-none text-[#1B2559] placeholder:text-[#A3AED0] resize-none"
              placeholder="Describe your product..."
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full pl-10 pr-5 py-4 rounded-2xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold transition-all outline-none text-[#1B2559] placeholder:text-[#A3AED0]"
                  placeholder="0.00"
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
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: "" })}
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

          {/* Subcategory  */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase text-[#A3AED0] tracking-wider ml-1">
              <Grid3x3 size={14} className="text-[#5D5FEF]" />
              Subcategory
            </label>
            <select
              required
              value={formData.subcategory}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-[#F4F7FE] border-2 border-transparent focus:border-[#5D5FEF] focus:bg-white font-semibold transition-all outline-none text-[#1B2559] appearance-none cursor-pointer"
            >
              <option value="">Select subcategory</option>
              {formData.category === "men" && (
                <>
                  <option value="Clothing">Clothing</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Sports">Sports</option>
                  <option value="Accessories">Accessories</option>
                </>
              )}
              {formData.category === "women" && (
                <>
                  <option value="Clothing">Clothing</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Jewelery">Jewelery</option>
                  <option value="Beauty">Beauty</option>
                </>
              )}
              {formData.category === "kids" && (
                <>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Toys">Toys</option>
                </>
              )}
              {formData.category === "home" && (
                <>
                  <option value="Home decor">Home decor</option>
                  <option value="Furnishing">Furnishing</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Gadgets">Gadgets</option>
                  <option value="Books">Books</option>
                </>
              )}
              {formData.category === "beauty" && (
                <>
                  <option value="Makeup">Makeup</option>
                  <option value="Skincare">Skincare</option>
                  <option value="Haircare">Haircare</option>
                  <option value="Fragrance">Fragrance</option>
                </>
              )}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
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
              disabled={operationLoading || uploading || !formData.image || !formData.subcategory}
              className="py-4 rounded-2xl font-black text-white bg-gradient-to-r from-[#1B2559] to-[#5D5FEF] hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {operationLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}