import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="min-h-screen bg-[#070B14] text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-center gap-14 pb-16 pt-10 lg:grid-cols-2 lg:pt-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-200 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Smarter money moves for modern users
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Grow your money with confidence.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/65 sm:text-lg">
              SwiftMint helps you track balances, automate transfers, and make faster decisions with clear insights and secure controls.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-white/85 backdrop-blur transition hover:bg-white/10">
                View dashboard
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-white/55">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Bank-grade security
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Real-time insights
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -top-10 right-10 h-32 w-32 rounded-full bg-sky-500/20 blur-3xl" />
            <div className="absolute bottom-0 left-8 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-sky-500/20 via-transparent to-cyan-400/10 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">Portfolio</p>
                    <p className="mt-1 text-lg font-semibold">$48,920.18</p>
                  </div>
                  <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/20">
                    +12.4% this month
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.4fr_0.9fr]">
                  <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
                    <div className="mb-4 flex items-center justify-between text-sm text-white/55">
                      <span>Balance trend</span>
                      <span>Last 30 days</span>
                    </div>

                    <div className="relative h-72 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-sky-500/10 to-transparent">
                      <svg viewBox="0 0 600 260" className="absolute inset-0 h-full w-full">
                        <defs>
                          <linearGradient id="lineGlow" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#38BDF8" stopOpacity="1" />
                            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.9" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M20,190 C65,160 85,70 140,92 C190,112 205,160 255,148 C305,136 330,48 380,62 C430,76 460,168 515,122 C550,92 565,78 580,58"
                          fill="none"
                          stroke="url(#lineGlow)"
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M20,190 C65,160 85,70 140,92 C190,112 205,160 255,148 C305,136 330,48 380,62 C430,76 460,168 515,122 C550,92 565,78 580,58 L580,260 L20,260 Z"
                          fill="url(#lineGlow)"
                          opacity="0.14"
                        />
                      </svg>

                      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
                        +6.8% growth
                      </div>
                      <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
                        Automated savings active
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/35">Today</p>
                      <p className="mt-2 text-2xl font-bold">$2,480</p>
                      <p className="mt-1 text-sm text-emerald-300">+8.3% from yesterday</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/35">Transfers</p>
                      <div className="mt-3 space-y-3">
                        {[
                          ["Salary deposit", "+$3,400"],
                          ["Savings vault", "-$700"],
                          ["Crypto buy", "-$150"],
                        ].map(([label, amount]) => (
                          <div key={label} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                            <span className="text-white/70">{label}</span>
                            <span className="font-medium text-white">{amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-8 w-32 rounded-[1.75rem] border border-white/10 bg-[#0B1220] p-3 shadow-xl shadow-black/30 backdrop-blur-xl sm:-right-10 sm:w-40">
                <div className="mb-3 flex items-center justify-between text-xs text-white/45">
                  <span>SwiftMint Pay</span>
                  <span>Live</span>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 p-3 text-white">
                  <p className="text-xs/5 opacity-90">Available</p>
                  <p className="mt-2 text-2xl font-bold">$1,240</p>
                </div>
              </div>

              <div className="absolute -left-6 top-16 hidden rounded-2xl border border-white/10 bg-[#0B1220] p-3 shadow-xl shadow-black/30 backdrop-blur-xl md:block">
                <p className="text-xs text-white/40">Verified</p>
                <p className="mt-1 text-sm font-semibold">2FA enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
