const markets = [
  { name: "BTC/USD", price: "67,420", change: "+2.4%" },
  { name: "ETH/USD", price: "3,510", change: "-1.2%" },
  { name: "EUR/USD", price: "1.0923", change: "+0.3%" },
  { name: "GBP/USD", price: "1.2750", change: "-0.5%" },
  { name: "NASDAQ", price: "18,920", change: "+1.1%" },
  { name: "GOLD", price: "2,340", change: "+0.7%" },
];

export default function TopScroller() {
  return (
    <div className="w-full bg-accent text-primary overflow-hidden whitespace-nowrap py-1">
      <div className="flex animate-scroll gap-10">
        
        {[...markets, ...markets].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <span className="text-white/80">{item.name}</span>

            <span className="text-white">
              ${item.price}
            </span>

            <span
              className={
                item.change.includes("+")
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {item.change}
            </span>

            {/* mini chart icon */}
            <span className="opacity-70">
              {item.change.includes("+") ? "📈" : "📉"}
            </span>
          </div>
        ))}

      </div>
    </div>
  );
}
