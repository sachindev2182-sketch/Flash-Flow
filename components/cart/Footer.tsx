"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-indigo-600 border-t border-indigo-500 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-white rounded-lg p-1.5">
              <Image
                src="/Flow_logo_.png"
                alt="Flash Flow"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Flash Flow</h2>
              <p className="text-xs text-indigo-200">© 2026 Flash Flow. All rights reserved.</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="" className="text-indigo-200 hover:text-white transition-colors">
              Terms of Use
            </Link>
            <Link href="" className="text-indigo-200 hover:text-white transition-colors">
              Terms of Supply
            </Link>
            <Link href="" className="text-indigo-200 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>

          {/* Made in India Badge */}
          <div className="text-xs text-indigo-200 bg-indigo-700/30 px-4 py-2 rounded-full">
             Rooted in India
          </div>
        </div>
      </div>
    </footer>
  );
}