import { motion, useMotionValue, animate } from "framer-motion";
import { FaUsers, FaExchangeAlt, FaMoneyBillWave } from "react-icons/fa";
import { heroCounters } from "../../utils/mockData";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Counter = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const count = useMotionValue(0);

    useEffect(() => {
        const controls = animate(count, value, {
            duration: 8,
            ease: "easeOut",
            onUpdate: (latest) => setDisplayValue(Math.round(latest))
        });

        return controls.stop;
    }, [count, value]);

    return (
        <motion.div
            className="text-center text-white flex-1 min-w-0"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
        >
            <motion.div
                className="text-3xl sm:text-4xl lg:text-5xl mb-2 text-accent flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            >
                {icon}
            </motion.div>
            <motion.div
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
            >
                {value >= 1000000 ? `${(displayValue / 1000000).toFixed(1)}M` :
                 value >= 1000 ? `${(displayValue / 1000).toFixed(0)}K` :
                 displayValue.toLocaleString()}
            </motion.div>
            <div className="text-xs sm:text-sm lg:text-base opacity-80 px-2">{label}</div>
        </motion.div>
    );
};

export const Hero = () => {

    const navigate = useNavigate();

    return (
        <section className="relative flex min-h-screen w-full items-center justify-center py-20">
            {/* Forex background image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
                    filter: 'brightness(0.5) contrast(0.8)'
                }}
            />
            {/* Dark neon blue overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f33]/90 via-[#0d1425]/85 to-[#0a0f33]/90" />

            {/* Floating elements for depth */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-xl" />
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-accent/5 to-blue-500/5 rounded-full blur-3xl" />

            {/* Glass container with enhanced styling */}
            <motion.div
                className="relative z-10 mx-4 sm:mx-6 md:mx-4 max-w-6xl px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-12 text-center"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <h1 className="mb-6 sm:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight bg-gradient-to-r from-white via-accent to-blue-200 bg-clip-text text-transparent">
                        Master the Art of Trading with CFD Trding Pro
                    </h1>

                    <p className="mb-8 sm:mb-12 text-base sm:text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light px-2 sm:px-0">
                        Enjoy lightning-fast execution, bank-level security, and cutting-edge trading tools designed for professionals and beginners alike. Join thousands of traders who trust CFD Trading Pro for their financial success.
                    </p>
                </motion.div>

                {/* CTA Buttons with enhanced styling */}
                <motion.div
                    className="mb-12 sm:mb-16 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <motion.button
                        className="group relative rounded-xl bg-gradient-to-r from-accent to-blue-500 px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 font-bold text-white text-sm sm:text-base md:text-lg shadow-2xl hover:shadow-accent/25 transition-all duration-300 overflow-hidden"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/login")}
                    >
                        <span className="relative z-10">Start Trading Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>

                    <motion.button
                        className="rounded-xl border-2 border-white/30 px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 font-bold text-white text-sm sm:text-base md:text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/signup')}
                    >
                        Create Free Account
                    </motion.button>
                </motion.div>

                {/* Key Features with enhanced animations */}
<motion.div
    className="mb-12 sm:mb-16 flex flex-col gap-4 sm:gap-6 px-4"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.8 }}
>
    {[ 
        { icon: "⚡", title: "Fast Execution", desc: "Execute trades in milliseconds with our advanced infrastructure and zero-latency technology." },
        { icon: "🔒", title: "Secure Funds", desc: "Your assets are protected with military-grade encryption and fully segregated accounts." },
        { icon: "📊", title: "Pro Tools", desc: "Access advanced charting, real-time data, and AI-powered analysis tools." }
    ].map((item, i) => (
        <motion.div
            key={i}
            className="flex items-center gap-4 sm:gap-5 bg-white/5 rounded-xl p-4 sm:p-5 group"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <motion.div
                className="text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                animate={{ rotate: i === 0 ? [0, 5, -5, 0] : undefined }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
                {item.icon}
            </motion.div>

            <div>
                <h3 className="text-base sm:text-lg font-bold text-accent mb-1">
                    {item.title}
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    {item.desc}
                </p>
            </div>
        </motion.div>
    ))}
</motion.div>

                {/* Animated counters with enhanced styling */}
                <motion.div
                    className="flex flex-row sm:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 xl:gap-16 w-full max-w-4xl mx-auto px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                >
                    <Counter label="Active Users" value={heroCounters.users} icon={<FaUsers />} />
                    <Counter label="Trades Executed" value={heroCounters.trades} icon={<FaExchangeAlt />} />
                    <Counter label="Total Payouts ($)" value={heroCounters.payouts} icon={<FaMoneyBillWave />} />
                </motion.div>
            </motion.div>
        </section>
    );
};