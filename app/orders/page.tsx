"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  AlertCircle,
  Eye,
  X,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  ShoppingBag,
  Home,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchUserOrders, fetchOrderById, Order } from "@/lib/redux/features/order/orderSlice";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/Footer";

const orderStatusColors = {
  pending: "bg-yellow-100 text-yellow-600",
  confirmed: "bg-blue-100 text-blue-600",
  processing: "bg-purple-100 text-purple-600",
  shipped: "bg-indigo-100 text-indigo-600",
  delivered: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

const orderStatusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const trackingSteps = [
  { status: "confirmed", label: "Order Confirmed", icon: CheckCircle },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [customUser, setCustomUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const { orders, loading, pagination } = useAppSelector((state) => state.order);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
      }

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setCustomUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        router.push("/login");
      }

      setPageLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (customUser || firebaseUser) {
      dispatch(fetchUserOrders({ page: 1, limit: 10 }));
    }
  }, [dispatch, customUser, firebaseUser]);

  const user = customUser || firebaseUser;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewOrder = async (orderId: string) => {
    const result = await dispatch(fetchOrderById(orderId));
    if (fetchOrderById.fulfilled.match(result)) {
      setSelectedOrder(result.payload);
      setShowOrderModal(true);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    setCancelling(true);
    try {
      const response = await fetch(`/api/orders/${selectedOrder._id}/cancel`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setCancelModal(false);
        setShowOrderModal(false);
        showToast("Order cancelled successfully", "success");
        // Refresh orders list
        dispatch(fetchUserOrders({ page: 1, limit: 10 }));
      } else {
        showToast("Failed to cancel order", "error");
      }
    } catch (error) {
      showToast("Failed to cancel order", "error");
    } finally {
      setCancelling(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  const getTrackingStepStatus = (orderStatus: string, stepStatus: string) => {
    const statusOrder = ["confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(orderStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    if (orderStatus === "cancelled") {
      return "cancelled";
    }
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={48} className="text-[#5D5FEF] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar user={user} onProfileClick={() => setShowProfile(true)} />

      <main className="flex-grow pt-20 sm:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/home" className="text-gray-600 hover:text-[#5D5FEF]">
              Home
            </Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">My Orders</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1B2559] mb-6">My Orders</h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="text-[#5D5FEF] animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Package size={48} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#1B2559] mb-2">No Orders Yet</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5D5FEF] text-white rounded-xl font-medium hover:bg-[#4B4DC9] transition-all"
              >
                Start Shopping
                <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const StatusIcon = orderStatusIcons[order.orderStatus];

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    {/* Order Header */}
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="font-medium text-[#1B2559]">{order.orderId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Placed on</p>
                        <p className="font-medium text-[#1B2559]">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-bold text-[#5D5FEF]">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${orderStatusColors[order.orderStatus]}`}>
                          <StatusIcon size={12} />
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Eye size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-4">
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex-none w-16 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mb-1">
                              <Image
                                src={item.image}
                                alt={item.title}
                                width={64}
                                height={64}
                                className="object-cover"
                              />
                            </div>
                            <p className="text-xs text-gray-600 truncate">x{item.quantity}</p>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex-none w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-500">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-xl bg-black/20">
            <div className="absolute inset-0" onClick={() => setShowOrderModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full sm:max-w-4xl rounded-t-3xl sm:rounded-[35px] overflow-hidden shadow-2xl relative z-10 max-h-[90vh] sm:max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="relative pt-2 pb-1 sm:pb-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-center sm:hidden">
                  <div className="w-12 h-1 bg-gray-300 rounded-full mb-2" />
                </div>
                <div className="flex items-center justify-between px-4 sm:px-6 pb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-[#1B2559] flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-gradient-to-b from-[#5D5FEF] to-[#868CFF] rounded-full"></span>
                    Order Details
                  </h3>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <X size={18} className="sm:w-5 sm:h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 p-4 sm:p-6">
                {/* Order Info Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-600 mb-1">Order ID</p>
                    <p className="font-bold text-[#1B2559] text-sm truncate">{selectedOrder.orderId}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-green-600 mb-1">Order Date</p>
                    <p className="font-bold text-[#1B2559] text-sm">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs text-purple-600 mb-1">Payment</p>
                    <p className="font-bold text-[#1B2559] text-sm capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-amber-600 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${orderStatusColors[selectedOrder.orderStatus]}`}>
                      {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Tracking Timeline */}
                {selectedOrder.orderStatus !== "cancelled" && (
                  <div className="mb-6">
                    <h4 className="font-bold text-[#1B2559] mb-4 flex items-center gap-2">
                      <Truck size={16} />
                      Order Tracking
                    </h4>
                    <div className="relative">
                      {/* Progress Bar */}
                      <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#5D5FEF] to-[#868CFF] rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              trackingSteps.findIndex(s => s.status === selectedOrder.orderStatus) >= 0
                                ? (trackingSteps.findIndex(s => s.status === selectedOrder.orderStatus) + 1) * 25
                                : 0
                            }%`,
                          }}
                        />
                      </div>

                      {/* Steps */}
                      <div className="flex justify-between relative">
                        {trackingSteps.map((step, index) => {
                          const status = getTrackingStepStatus(selectedOrder.orderStatus, step.status);
                          const Icon = step.icon;

                          return (
                            <div key={step.status} className="flex flex-col items-center text-center z-10">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                  status === "completed"
                                    ? "bg-green-500 text-white"
                                    : status === "current"
                                    ? "bg-[#5D5FEF] text-white"
                                    : status === "cancelled"
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-200 text-gray-400"
                                }`}
                              >
                                <Icon size={18} />
                              </div>
                              <p
                                className={`text-xs font-medium ${
                                  status === "completed" || status === "current"
                                    ? "text-[#1B2559]"
                                    : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>
                              {status === "current" && selectedOrder.orderStatus === step.status && (
                                <p className="text-[10px] text-[#5D5FEF] mt-1">Current</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-bold text-[#1B2559] mb-3 flex items-center gap-2">
                    <ShoppingBag size={16} />
                    Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-3 flex gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-[#1B2559] text-sm">{item.title}</h5>
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-[#1B2559]">
                                ₹{item.price} × {item.quantity}
                              </span>
                              {item.size && (
                                <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-bold text-[#5D5FEF]">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <h4 className="font-bold text-[#1B2559] mb-3 flex items-center gap-2">
                    <MapPin size={16} />
                    Delivery Address
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getAddressTypeIcon(selectedOrder.shippingAddress.addressType)}
                      <span className="text-xs font-medium capitalize">
                        {selectedOrder.shippingAddress.addressType}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-[#1B2559]">{selectedOrder.shippingAddress.fullName}</p>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Phone size={12} />
                        {selectedOrder.shippingAddress.phoneNumber}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.houseNumber}, {selectedOrder.shippingAddress.street}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{" "}
                        {selectedOrder.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="mb-6">
                  <h4 className="font-bold text-[#1B2559] mb-3 flex items-center gap-2">
                    <CreditCard size={16} />
                    Payment Summary
                  </h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-[#1B2559]">₹{selectedOrder.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charge</span>
                      {selectedOrder.deliveryCharge === 0 ? (
                        <span className="font-medium text-green-600">Free</span>
                      ) : (
                        <span className="font-medium text-[#1B2559]">₹{selectedOrder.deliveryCharge}</span>
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#1B2559]">Total</span>
                        <span className="text-lg font-bold text-[#5D5FEF]">
                          ₹{selectedOrder.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <div className="flex gap-3">
                  {selectedOrder.orderStatus !== "cancelled" && 
                   selectedOrder.orderStatus !== "delivered" && 
                   selectedOrder.orderStatus !== "shipped" && (
                    <button
                      onClick={() => setCancelModal(true)}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all active:scale-95"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {cancelModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setCancelModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-[#1B2559] mb-2">Cancel Order</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCancelModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm"
                  >
                    No, Keep It
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Yes, Cancel"
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
              className={`px-4 py-3 rounded-lg shadow-xl font-medium text-sm flex items-center gap-2 ${
                toast.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}