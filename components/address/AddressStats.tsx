"use client";

import { motion } from "framer-motion";
import { MapPin, Home, Star, Shield } from "lucide-react";

interface AddressStatsProps {
  addresses: any[];
}

export default function AddressStats({ addresses }: AddressStatsProps) {
  const totalAddresses = addresses.length;
  const defaultAddress = addresses.find((addr) => addr.isDefault);
  const homeAddresses = addresses.filter((addr) => addr.addressType === "home").length;
  const workAddresses = addresses.filter((addr) => addr.addressType === "work").length;

  const stats = [
    {
      label: "Total Addresses",
      value: totalAddresses,
      icon: MapPin,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Default Address",
      value: defaultAddress ? "Set" : "Not Set",
      icon: Star,
      color: "from-yellow-500 to-yellow-600",
      bg: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Home Addresses",
      value: homeAddresses,
      icon: Home,
      color: "from-green-500 to-green-600",
      bg: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Work Addresses",
      value: workAddresses,
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center ${stat.textColor}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-[#1B2559]">
                  {typeof stat.value === "number" ? stat.value : stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}