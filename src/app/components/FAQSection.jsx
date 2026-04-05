"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is SwiftMint?",
    answer:
      "SwiftMint is a memecoin trading platform built on Solana. It gives you real-time market data, a custodial wallet, and the tools to trade tokens like $PEPE, $WIF, $BONK, and hundreds more — all from one place without needing a separate crypto wallet.",
  },
  {
    question: "Do I need a crypto wallet to get started?",
    answer:
      "No. SwiftMint automatically creates a Solana wallet for you when you sign up. Just deposit SOL to your wallet address and you're ready to trade. No Phantom, no MetaMask — nothing extra needed.",
  },
  {
    question: "How do I deposit funds?",
    answer:
      "After signing up, go to your dashboard and click the Deposit button. You'll see your personal Solana wallet address and a QR code. Send SOL from any exchange or wallet (Coinbase, Binance, Phantom, etc.) to that address and it will appear in your balance within seconds.",
  },
  {
    question: "How do I withdraw or send SOL?",
    answer:
      "Click the Send button on your dashboard, enter the destination Solana address and the amount you want to send, then confirm. The transaction is signed securely on our servers and broadcast to the Solana blockchain. You'll get a Solscan link to track it.",
  },
  {
    question: "Are memecoins a good investment?",
    answer:
      "Memecoins are highly volatile and speculative assets. They can generate extraordinary returns in short periods but can also lose most of their value just as quickly. SwiftMint provides the tools and data to help you make informed decisions — but always only trade what you can afford to lose.",
  },
  {
    question: "Which memecoins can I trade on SwiftMint?",
    answer:
      "SwiftMint tracks 500+ memecoins across Solana and EVM chains including $PEPE, $WIF, $BONK, $DOGE, $FLOKI, $POPCAT, and new launches as they appear on DexScreener. The trending table on your dashboard updates every 15 seconds.",
  },
  {
    question: "Is my money safe?",
    answer:
      "Your funds are held in a dedicated Solana wallet generated exclusively for your account. Private keys are encrypted with AES-256 and stored securely — they are never exposed to the client or transmitted over the network. That said, SwiftMint is a custodial platform, meaning we manage the keys on your behalf. Never deposit more than you are comfortable with.",
  },
  {
    question: "What are the fees?",
    answer:
      "SwiftMint charges no deposit fees. Withdrawals and on-chain transactions incur only the standard Solana network fee (~$0.00025 per transaction). Trading fees vary by pair and are shown before you confirm any trade.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
        Frequently asked questions
      </h2>
      <p className="text-muted-foreground mb-10">
        Everything you need to know about trading memecoins on SwiftMint.
      </p>

      <div className="flex flex-col divide-y divide-white/10">
        {faqs.map((faq, i) => (
          <div key={i} className="py-5">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left group"
            >
              <span className="text-sm md:text-base font-medium text-foreground group-hover:text-primary transition-colors">
                {faq.question}
              </span>

              {/* Plus / minus icon */}
              <span className="flex-shrink-0 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                {open === i ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </button>

            {/* Answer */}
            {open === i && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-xl bg-card-blue/10 border border-card-blue/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Still have questions?</p>
          <p className="text-xs text-muted-foreground mt-1">Our support team replies within 24 hours.</p>
        </div>
        <a
          href="/contact"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/80 transition-colors text-white text-sm font-semibold whitespace-nowrap"
        >
          Contact support
        </a>
      </div>
    </section>
  );
}