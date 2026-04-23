const messages = [
    "Welcome to CFD Trading Pro",
    "Earn up to $5000 daily profits",
    "Instant deposits & fast withdrawals",
    "Your funds are 100% secured",
    "Trade Forex, Crypto, Indices & Stocks seamlessly",
    "Trusted by traders worldwide",
]

export default function TopScroller() {
    return (
        <div className="w-full bg-accent text-primary overflow-hidden whitespace-nowrap py-1">
            <div className="flex animate-scroll gap-10">
                {/* Duplicate for smooth loop */}
                {[...messages, ...messages].map((msg, i) => (
                    <span key={i} className="text-sm sm:text-base font-medium">
                        {msg}
                    </span>
                ))}
            </div>
        </div>
    );
}