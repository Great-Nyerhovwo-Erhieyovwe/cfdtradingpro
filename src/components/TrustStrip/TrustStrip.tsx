import { FaLock, FaShieldAlt, FaUserCheck, FaHeadset, FaCreditCard, FaGlobe } from "react-icons/fa";
import { motion } from "framer-motion";

const items = [
    { icon: <FaLock size={32} />, label: "SSL Security", desc: "Bank-level encryption protects your data" },
    { icon: <FaShieldAlt size={32} />, label: "Encrypted Transactions", desc: "All trades secured with advanced cryptography" },
    { icon: <FaUserCheck size={32} />, label: "KYC‑Verified Accounts", desc: "Verified identities for maximum security" },
    { icon: <FaHeadset size={32} />, label: "24/7 Support", desc: "Round-the-clock customer assistance" },
    { icon: <FaCreditCard size={32} />, label: "Multiple Payment Methods", desc: "Fiat, crypto, and e-wallet support" },
    { icon: <FaGlobe size={32} />, label: "Global Accessibility", desc: "Trade from anywhere in the world" },
];

export const TrustStrip = () => (
    <section className="py-8 sm:py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <h2 className="mb-6 sm:mb-8 md:mb-12 text-center text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
                Trusted by Traders Worldwide
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {items.map((item, i) => (
                    <motion.div
                        key={i}
                        className="flex flex-col items-center text-center text-white p-4 sm:p-6 rounded-lg hover:bg-white/5 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="text-accent mb-3 sm:mb-4 text-4xl sm:text-5xl">{item.icon}</div>
                        <span className="text-base sm:text-lg font-medium mb-2">{item.label}</span>
                        <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);