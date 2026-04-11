import { useNavigate } from "react-router-dom";
import { AssetCard } from "./AssetCard";
import { useState, useEffect } from "react";

const mockAssets = [
  {
    name: "EUR/USD",
    symbol: "Forex",
    price: "1.0834",
    change: 0.12,
    data: [1.08, 1.081, 1.082, 1.083, 1.084, 1.0834],
  },
  {
    name: "BTC/USD",
    symbol: "Crypto",
    price: "$27,540",
    change: -1.04,
    data: [27600, 27750, 27800, 27500, 27400, 27540],
  },
  {
    name: "Apple Inc.",
    symbol: "Stocks",
    price: "$185.22",
    change: 0.45,
    data: [184, 184.5, 185, 185.2, 185.1, 185.22],
  },
  {
    name: "S&P 500",
    symbol: "Indices",
    price: "4,210.5",
    change: 0.09,
    data: [4190, 4195, 4200, 4210, 4215, 4210.5],
  },
  {
    name: "Gold",
    symbol: "Commodities",
    price: "$1,950.30",
    change: 0.8,
    data: [1940, 1945, 1950, 1955, 1950, 1950.3],
  },
  {
    name: "ETH/USD",
    symbol: "Crypto",
    price: "$1,650",
    change: 2.1,
    data: [1620, 1630, 1640, 1650, 1645, 1650],
  },
];

export const MarketPreview = () => {
  const navigate = useNavigate();

  const [assets, setAssets] = useState(mockAssets)
  
  console.log(assets);
// Example: rotate first asset to the end every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev: any) => {
        const newAssets = [...prev];
        const first = newAssets.shift();
        if (first) newAssets.push(first)
        return newAssets
      });
    }, 5000); // 5 secs
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h2 className="mb-3 sm:mb-4 md:mb-6 text-center text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
          Live Market Overview
        </h2>
        <p className="mb-8 sm:mb-10 md:mb-12 text-center text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed px-2">
          Stay ahead of the market with real-time data across multiple asset classes. Our platform provides instant updates and advanced analytics.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {mockAssets.map((a, i) => (
            <AssetCard key={i} {...a} />
          ))}
        </div>
        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <p className="text-white/60 mb-3 sm:mb-4 text-sm sm:text-base">Want to see more markets?</p>
          <button className="bg-accent text-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors text-sm sm:text-base" onClick={() => navigate('/markets')}>
            View All Markets
          </button>
        </div>
      </div>
    </section>
  )
};

// function useState(mockAssets: { name: string; symbol: string; price: string; change: number; data: number[]; }[]): [any, any] {
//   throw new Error("Function not implemented.");
// }
