import CustomerReviews from '@/components/CustomerReviews';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import HeroSlider from '@/components/HeroSlider';
import Navbar from '@/components/Navbar';
import TrendingCategories from '@/components/TrendingCategories';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] selection:bg-blue-100">
      <Navbar />

      <main className="pt-16 sm:pt-20">
        <HeroSlider />
        <HeroSection />
        <FeaturesSection />
        <TrendingCategories />
        <CustomerReviews />
        <Footer />
      </main>
    </div>
  );
}
