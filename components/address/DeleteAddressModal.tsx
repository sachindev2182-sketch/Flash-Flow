"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { deleteAddress } from "@/lib/redux/features/address/addressSlice";

interface DeleteAddressModalProps {
  isOpen: boolean;
  addressId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteAddressModal({
  isOpen,
  addressId,
  onClose,
  onSuccess,
}: DeleteAddressModalProps) {
  const dispatch = useAppDispatch();
  const { operationLoading } = useAppSelector((state) => state.address);

  const handleDelete = async () => {
    if (!addressId) return;
    
    const result = await dispatch(deleteAddress(addressId));
    if (deleteAddress.fulfilled.match(result)) {
      onSuccess();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10"
          >
            <div className="p-6 text-center">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors absolute top-4 right-4"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>

              <h3 className="text-lg font-bold text-[#1B2559] mb-2">Delete Address</h3>
              
              <p className="text-sm text-gray-500 mb-2">
                Are you sure you want to delete this address?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={operationLoading}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={operationLoading}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {operationLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}