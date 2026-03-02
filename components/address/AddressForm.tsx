"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Briefcase,
  MapPin,
  Phone,
  User,
  Star,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { addAddress, updateAddress } from "@/lib/redux/features/address/addressSlice";

interface AddressFormProps {
  user: any;
  editingAddress: any | null;
  onClose: () => void;
  isVisible: boolean;
}

export default function AddressForm({ user, editingAddress, onClose, isVisible }: AddressFormProps) {
  const dispatch = useAppDispatch();
  const { operationLoading } = useAppSelector((state) => state.address);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    houseNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
    addressType: "home" as "home" | "work" | "other",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        fullName: editingAddress.fullName,
        phoneNumber: editingAddress.phoneNumber,
        houseNumber: editingAddress.houseNumber,
        street: editingAddress.street,
        city: editingAddress.city,
        state: editingAddress.state,
        pincode: editingAddress.pincode,
        isDefault: editingAddress.isDefault,
        addressType: editingAddress.addressType,
      });
    } else {
      setFormData({
        fullName: user?.name || user?.displayName || "",
        phoneNumber: "",
        houseNumber: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false,
        addressType: "home",
      });
    }
    setFormErrors({});
    setTouched({});
  }, [editingAddress, user]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "phoneNumber":
        if (!value) return "Phone number is required";
        if (!/^[0-9]{10}$/.test(value)) return "Enter a valid 10-digit phone number";
        break;
      case "houseNumber":
        if (!value) return "House/Flat number is required";
        break;
      case "street":
        if (!value) return "Street address is required";
        break;
      case "city":
        if (!value) return "City is required";
        break;
      case "state":
        if (!value) return "State is required";
        break;
      case "pincode":
        if (!value) return "Pincode is required";
        if (!/^[0-9]{6}$/.test(value)) return "Enter a valid 6-digit pincode";
        break;
      case "fullName":
        if (!value) return "Full name is required";
        break;
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (key !== "isDefault" && key !== "addressType") {
        const error = validateField(key, formData[key as keyof typeof formData] as string);
        if (error) {
          errors[key] = error;
          isValid = false;
        }
      }
    });

    setFormErrors(errors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (editingAddress) {
      await dispatch(
        updateAddress({
          addressId: editingAddress._id,
          addressData: formData,
        })
      );
    } else {
      await dispatch(addAddress(formData));
    }
  };

  const inputClasses = (fieldName: string) => `
    w-full px-3 py-2.5 bg-white border rounded-lg focus:outline-none transition-all text-sm 
    ${formErrors[fieldName] && touched[fieldName]
      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      : "border-gray-200 focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20"
    }
  `;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg sticky top-24"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1B2559]">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputClasses("fullName")} pl-10`}
                placeholder="Your full name"
              />
            </div>
            {formErrors.fullName && touched.fullName && (
              <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={10}
                className={`${inputClasses("phoneNumber")} pl-10`}
                placeholder="10-digit mobile number"
              />
            </div>
            {formErrors.phoneNumber && touched.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{formErrors.phoneNumber}</p>
            )}
          </div>

          {/* House/Flat Number */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              House/Flat Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="houseNumber"
              value={formData.houseNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClasses("houseNumber")}
              placeholder="e.g., Flat 101, Building A"
            />
            {formErrors.houseNumber && touched.houseNumber && (
              <p className="text-xs text-red-500 mt-1">{formErrors.houseNumber}</p>
            )}
          </div>

          {/* Street */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClasses("street")}
              placeholder="Street name, area, landmark"
            />
            {formErrors.street && touched.street && (
              <p className="text-xs text-red-500 mt-1">{formErrors.street}</p>
            )}
          </div>

          {/* City and State Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClasses("city")}
                placeholder="City"
              />
              {formErrors.city && touched.city && (
                <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClasses("state")}
                placeholder="State"
              />
              {formErrors.state && touched.state && (
                <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>
              )}
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={6}
              className={inputClasses("pincode")}
              placeholder="6-digit pincode"
            />
            {formErrors.pincode && touched.pincode && (
              <p className="text-xs text-red-500 mt-1">{formErrors.pincode}</p>
            )}
          </div>

          {/* Address Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Address Type
            </label>
            <div className="flex gap-2">
              {[
                { value: "home", label: "Home", icon: Home },
                { value: "work", label: "Work", icon: Briefcase },
                { value: "other", label: "Other", icon: MapPin },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: type.value as any })}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm ${
                      formData.addressType === type.value
                        ? "border-[#5D5FEF] bg-[#5D5FEF]/10 text-[#5D5FEF]"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Set as Default Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-[#5D5FEF] focus:ring-[#5D5FEF]"
            />
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Star size={14} className="text-gray-400" />
              Set as default address
            </span>
          </label>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={operationLoading}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all active:scale-95 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={operationLoading}
              className="flex-1 py-2.5 bg-[#5D5FEF] text-white rounded-lg font-medium hover:bg-[#4B4DC9] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {operationLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {editingAddress ? "Updating..." : "Saving..."}
                </>
              ) : (
                editingAddress ? "Update Address" : "Save Address"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}