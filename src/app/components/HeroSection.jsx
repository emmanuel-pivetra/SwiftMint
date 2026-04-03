import Image from "next/image";
import { Button } from "../components/ui/button";
import heroDevices from "../../../public/images/trading.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-[#0B1019]">
      
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-5">
        
        {/* LEFT CONTENT */}
        <div className="flex-1 space-y-6">
          
          <div className="inline-block px-4 py-2 rounded-full bg-[#0B92F1]/10 border border-[#0B92F1]/20 text-sm text-[#5DB3E7]">
            Smarter trading starts here
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
            Grow your wealth <br /> with confidence
          </h1>

          <p className="text-[#8F9D98] text-lg max-w-md">
            SwiftMint helps you trade, track, and scale your finances with powerful tools and real-time insights.
          </p>

          <div className="flex gap-4">
            <Button className="bg-[#0B92F1] hover:bg-[#5DB3E7] text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-[#0B92F1]/20 transition-all">
              Get Started
            </Button>

            <Button variant="outline" className="border-[#3F505F] text-white px-8 py-3 rounded-xl">
              Learn more
            </Button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex-1 relative">
          
          {/* Glow behind image */}
          <div className="absolute inset-0 bg-[#0B92F1]/20 blur-3xl rounded-full" />

          <Image
            src={heroDevices}
            alt="Trading platform on multiple devices"
            width={1024}
            height={768}
            className="relative w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;