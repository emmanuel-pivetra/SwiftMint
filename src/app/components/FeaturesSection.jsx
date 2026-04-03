import { Shield, ShoppingBag, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "RISK FREE TRADES",
    description: "Practice trading without risking your capital with our demo account.",
    color: "border-card-teal/30 bg-card-teal/10",
    iconColor: "text-card-teal",
  },
  {
    icon: ShoppingBag,
    title: "MARKETPLACE",
    description: "Customize the platform with unique add-ons to elevate your trading.",
    color: "border-destructive/30 bg-destructive/10",
    iconColor: "text-destructive",
  },
  {
    icon: Zap,
    title: "FAST EXECUTION",
    description: "Lightning-fast order execution with minimal slippage on all trades.",
    color: "border-star-gold/30 bg-star-gold/10",
    iconColor: "text-star-gold",
  },
  {
    icon: BarChart3,
    title: "ADVANCED ANALYTICS",
    description: "Professional-grade charting tools and real-time market analysis.",
    color: "border-card-blue/30 bg-card-blue/10",
    iconColor: "text-card-blue",
  },
];

const FeaturesSection = () => {
  return (
    <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">
        A platform that <br /> works for you
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <div
              key={index}
              className={`${feature.color} border rounded-xl p-6 transition-transform hover:scale-[1.02]`}
            >
              <Icon className={`w-6 h-6 mb-4 ${feature.iconColor}`} />

              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesSection;