import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 h-16 sm:h-20 bg-white/70 backdrop-blur-xl z-50 px-4 sm:px-6 md:px-8 flex items-center justify-between border-b border-white/20 shadow-sm">
      
      <Link
        href="/"
        className="flex items-center gap-2 sm:gap-4 group cursor-pointer"
      >
        <div className="transform transition-all duration-500 ease-in-out 
        group-hover:scale-125 
        group-hover:rotate-[15deg] 
        group-hover:drop-shadow-[0_10px_12px_rgba(93,95,239,0.35)]">
          <Image
            src="/Flow_logo_.png"
            alt="Flash Flow"
            width={40}
            height={40}
            className="object-contain sm:w-12 sm:h-12"
          />
        </div>

        <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-tighter uppercase 
        text-[#1B2559] transition-colors duration-300 group-hover:text-[#5D5FEF]">
          Flash{" "}
          <span className="text-[#5D5FEF] group-hover:text-[#1B2559]">
            Flow
          </span>
        </h1>
      </Link>

      <div className="flex items-center gap-3 sm:gap-5">
        
        <Link
          href="/login"
          className="relative text-sm font-semibold text-[#1B2559] hover:text-[#5D5FEF] transition-colors group"
        >
          Log in
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#5D5FEF] transition-all duration-300 group-hover:w-full"></span>
        </Link>

        <Link
          href="/signup"
          className="relative overflow-hidden bg-gradient-to-r from-[#5D5FEF] to-[#868CFF] text-white px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold shadow-indigo-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group"
        >
          <span className="relative z-10">Get Started</span>

          <div className="absolute top-0 -inset-full h-full w-1/2 transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
        </Link>
      </div>
    </nav>
  );
}
