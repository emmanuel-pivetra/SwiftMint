import Image from "next/image";
import { Button } from "../components/ui/button";
import heroDevices from "../../../public/images/trading.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#0B1019] px-4 py-16 sm:px-6 md:py-24 lg:py-32">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#0B92F1]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-8 lg:gap-16">

        {/* ── LEFT CONTENT ── */}
        <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left space-y-6 w-full">

          <div className="inline-block px-4 py-2 rounded-full bg-[#0B92F1]/10 border border-[#0B92F1]/20 text-sm text-[#5DB3E7]">
            Smarter trading starts here
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
            Grow your wealth{" "}
            <span className="block">with confidence</span>
          </h1>

          <p className="text-[#8F9D98] text-base sm:text-lg max-w-md">
            SwiftMint helps you trade, track, and scale your finances with
            powerful tools and real-time insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button className="bg-[#0B92F1] hover:bg-[#5DB3E7] text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-[#0B92F1]/20 transition-all w-full sm:w-auto">
              Get Started
            </Button>
            <Button
              variant="outline"
              className="border-[#3F505F] text-white px-8 py-3 rounded-xl hover:bg-white/5 transition-all w-full sm:w-auto"
            >
              Learn more
            </Button>
          </div>
        </div>

        {/* ── RIGHT IMAGE ── */}
        <div className="flex-1 relative w-full max-w-xl mx-auto md:mx-0">

          {/* Glow behind image */}
          <div className="absolute inset-0 bg-[#0B92F1]/20 blur-3xl rounded-full pointer-events-none" />

          <Image
            src={heroDevices}
            alt="Trading platform on multiple devices"
            width={1024}
            height={768}
            className="relative w-full rounded-2xl shadow-2xl object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;