import { Star, Apple, Play } from "lucide-react";
// import devicesShowcase from "@/assets/devices-showcase.jpg";

const DevicesSection = () => {
  return (
    <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Smooth experience on any device
      </h2>

      <p className="text-muted-foreground mb-12">
        Whether you prefer{" "}
        <span className="font-semibold text-foreground">
          trading at your desk or on the go
        </span>{" "}
        — Axioms has got you covered
      </p>

      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <img
          //   src={devicesShowcase}
            alt="Trading app on multiple devices"
            loading="lazy"
            width={800}
            height={800}
            className="w-full max-w-md mx-auto rounded-xl"
          />
        </div>

        <div className="flex-1 space-y-6">
          <p className="text-muted-foreground">
            The custom-built platform has been adapted to any device you may
            choose and switching is 100% seamless.
          </p>

          <div className="bg-card-teal/10 border border-card-teal/20 rounded-xl p-5 max-w-xs">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-bold text-foreground">4.4</span>

              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4
                        ? "text-star-gold fill-star-gold"
                        : "text-star-gold"
                    }`}
                  />
                ))}
              </div>

              <span className="text-xs text-muted-foreground">
                app rating
              </span>
            </div>

            <p className="text-xs text-muted-foreground italic">
              "This is the best trading platform I've ever seen. Thank you so much!"
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-16 gap-8">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-3">Desktop</p>

          <div className="flex gap-2">
            <span className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-xs flex items-center gap-2">
              <span className="text-primary">⚡</span> MetaTrader4
            </span>

            <span className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-xs flex items-center gap-2">
              <Apple className="w-3 h-3" /> macOS{" "}
              <span className="text-muted-foreground">54.21 Mb</span>
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-3">Mobile</p>

          <div className="flex gap-2">
            <span className="bg-secondary p-3 rounded-lg">
              <Apple className="w-4 h-4" />
            </span>
            <span className="bg-secondary p-3 rounded-lg">
              <Play className="w-4 h-4 fill-foreground" />
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-3">
            App downloads
          </p>
          <p className="text-3xl font-bold text-foreground">12M+</p>
        </div>
      </div>
    </section>
  );
};

export default DevicesSection;