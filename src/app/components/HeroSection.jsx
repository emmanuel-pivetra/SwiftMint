import { Button } from "../../../src/app/components/ui/button";
// import heroDevices from "@/assets/hero-devices.jpg";

const HeroSection = () => {
  return (
    <section className="relative px-6 md:px-12 py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-corner pointer-events-none" />
      <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground">
            Profitability<br />on the rise
          </h1>
          <p className="text-muted-foreground text-lg">
            A Broker that supports your financial goals
          </p>
          <Button className="bg-gradient-green text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Start trading — it's free
          </Button>
        </div>
        <div className="flex-1">
          <img
          //   src={heroDevices}
            alt="Trading platform on multiple devices"
            width={1024}
            height={768}
            className="w-full max-w-lg mx-auto rounded-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;