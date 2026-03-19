"use client";

import React from "react";
import DashboardClient from "./DashboardClient";

export default function Dashboard() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     async function fetchData() {
//       setLoading(true);
//       try {
//         const res = await fetch(`https://api.dexscreener.com/token-boosts/latest/v1`);
//         const json = await res.json();
//         if (!mounted) return;
//         if (json) setRows(json || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }
//     fetchData();
//     const t = setInterval(fetchData, 15_000);
//     return () => { mounted = false; clearInterval(t); };
//   }, []);

//   if (loading) return <div className="p-6">Loading market data…</div>;

  return (
    <div className="p-6 w-full">
          {/* KPI cards (normal flow) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
               <div className="rounded-xl border bg-gray-600 p-5 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Balance</div>
                    <div className="mt-2 text-2xl font-semibold">$0.00</div>
                    <div className="mt-1 text-sm text-gray-500">Available to trade</div>
               </div>

               <div className="rounded-xl border bg-gray-600 p-5 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-gray-500">24h PnL</div>
                    <div className="mt-2 text-2xl font-semibold text-green-600">+$0.00</div>
                    <div className="mt-1 text-sm text-gray-500">Since last session</div>
               </div>

               <div className="rounded-xl border bg-gray-600 p-5 shadow-sm">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Open Positions</div>
                    <div className="mt-2 text-2xl font-semibold">0</div>
                    <div className="mt-1 text-sm text-gray-500">Currently active</div>
               </div>
          </div>

          <DashboardClient/>
    </div>
  );
}