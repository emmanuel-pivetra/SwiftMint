import { Play } from "lucide-react";


const cards = [
  { tag: "CHF JPY", title: "", color: "bg-card", stat: "107.067", statSub: "+12% in 15 min" },
  { tag: "SECURE ACCOUNT", title: "You can now use your Fingerprint to access our Android App.", color: "bg-card-green/20 border border-card-green/30" },
  { tag: "WEBINAR", title: 'Trading Strategy "Triple Ricochet"', color: "bg-card-blue/20 border border-card-blue/30", hasPlay: true },
  { tag: "EDUCATION", title: "How to start trading on the platform?", color: "bg-card-blue/20 border border-card-blue/30", hasPlay: true },
  { tag: "TRADE", title: "", color: "bg-card" },
  { tag: "ANNIVERSARY", title: "Our Broker has been trailblazing the industry for the past 5 years", color: "bg-card-purple/20 border border-card-purple/30" },
];

const NewsSection = () => {
  return (
    <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        The latest from our broker
      </h2>
      <p className="text-muted-foreground mb-10">
        New features, latest webinars and more...
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`${card.color} rounded-xl p-5 min-h-[180px] flex flex-col justify-between transition-transform hover:scale-[1.02]`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              {card.tag}
            </span>

            {card.title && (
              <p className="text-sm text-muted-foreground mt-2">
                {card.title}
              </p>
            )}

            <div className="mt-auto pt-4 flex items-end justify-between">
              {card.stat && (
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {card.stat}
                  </p>
                  <p className="text-xs text-primary">
                    {card.statSub}
                  </p>
                </div>
              )}

              {card.hasPlay && (
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-primary fill-primary" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;