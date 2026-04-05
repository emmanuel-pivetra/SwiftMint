import { Play } from "lucide-react";

const cards = [
  {
    tag: "MARKET PULSE",
    title: "",
    color: "bg-card",
    stat: "$PEPE",
    statSub: "+340% in 7 days",
  },
  {
    tag: "TRADING ALERT",
    title: "Dogecoin surges 18% as social media volume hits a 6-month high. Momentum traders eye the $0.25 resistance level.",
    color: "bg-card-green/20 border border-card-green/30",
  },
  {
    tag: "WEBINAR",
    title: 'How to Trade Memecoins: "Ride the Wave, Not the Hype"',
    color: "bg-card-blue/20 border border-card-blue/30",
    hasPlay: true,
  },
  {
    tag: "EDUCATION",
    title: "What makes a memecoin pump? Community, liquidity, and timing explained.",
    color: "bg-card-blue/20 border border-card-blue/30",
    hasPlay: true,
  },
  {
    tag: "SPOTLIGHT",
    title: "",
    color: "bg-card",
    stat: "$WIF",
    statSub: "Top gainer this week",
  },
  {
    tag: "INSIGHT",
    title: "From DOGE to BONK — how memecoins evolved from jokes to a $50B asset class worth watching.",
    color: "bg-card-purple/20 border border-card-purple/30",
  },
];

const NewsSection = () => {
  return (
    <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        The latest in memecoin trading
      </h2>
      <p className="text-muted-foreground mb-10">
        Market moves, education, and opportunities across the memecoin space.
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