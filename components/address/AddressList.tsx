"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Home,
  Briefcase,
  Phone,
  User,
  Star,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setDefaultAddress } from "@/lib/redux/features/address/addressSlice";

interface Address {
  _id: string;
  fullName: string;
  phoneNumber: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  addressType: "home" | "work" | "other";
}

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  showForm: boolean;
  onSuccess: () => void;
}

export default function AddressList({
  addresses,
  onEdit,
  onDelete,
  showForm,
  onSuccess,
}: AddressListProps) {
  const dispatch = useAppDispatch();

  const handleSetDefault = async (addressId: string) => {
    if (!addressId) return;

    const result = await dispatch(setDefaultAddress(addressId));
    if (setDefaultAddress.fulfilled.match(result)) {
      onSuccess();
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

  if (addresses.length === 0 && !showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 text-center border border-gray-100"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-[#1B2559] mb-2">
          No Addresses Found
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          You haven't added any delivery addresses yet.
        </p>
        <p className="text-xs text-gray-400">
          Click the "Add New Address" button to get started.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {addresses.map((address, index) => (
          <motion.div
            key={address._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-xl p-5 border-2 transition-all ${
              address.isDefault
                ? "border-[#5D5FEF] shadow-lg shadow-indigo-100"
                : "border-gray-100 hover:border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Address Type and Default Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getAddressTypeColor(
                      address.addressType,
                    )}`}
                  >
                    {getAddressTypeIcon(address.addressType)}
                    {address.addressType.charAt(0).toUpperCase() +
                      address.addressType.slice(1)}
                  </span>
                  {address.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#5D5FEF]/10 text-[#5D5FEF] rounded-full text-xs font-medium">
                      <Star size={12} className="fill-[#5D5FEF]" />
                      Default Address
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {address.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2559]">
                      {address.fullName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone size={10} />
                      {address.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Address Details */}
                <div className="space-y-1 text-sm text-gray-600 ml-1">
                  <p>{address.houseNumber}</p>
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-start gap-1 ml-4">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-[#5D5FEF] group"
                    title="Set as default"
                  >
                    <Star
                      size={16}
                      className="group-hover:fill-[#5D5FEF] group-hover:text-[#5D5FEF]"
                    />
                  </button>
                )}
                <button
                  onClick={() => onEdit(address)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-[#5D5FEF]"
                  title="Edit address"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(address._id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                  title="Delete address"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {addresses.length === 0 && showForm && (
        <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
          <AlertCircle size={24} className="text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Add your first address using the form on the right
          </p>
        </div>
      )}
    </div>
  );
}
