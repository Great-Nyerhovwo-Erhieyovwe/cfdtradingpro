import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Function to check if a link is active
    const isActiveLink = (path: string) => {
        if (path === '/' && location.pathname === '/') {
            return true;
        }
        if (path !== '/' && location.pathname.startsWith(path)) {
            return true;
        }
        return false;
    };

    // Function to get link styles based on active state
    const getLinkStyles = (path: string, isMobile: boolean = false) => {
        const baseStyles = isMobile
            ? "block px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-all duration-300"
            : "px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300";

        const activeStyles = isActiveLink(path)
            ? "text-accent bg-accent/10 border-b-2 border-accent"
            : "text-white hover:text-accent hover:bg-white/5";

        return `${baseStyles} ${activeStyles}`;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    {/* Logo */}
                    <motion.div
                        className="flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                    >
                        <img src="/logo.svg" alt="CFD Trading Pro Logo" className="h-6 sm:h-8 w-auto" />
                    </motion.div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-6 lg:ml-10 flex items-center gap-1 lg:gap-4">
                            <motion.a
                                href="/"
                                className={getLinkStyles('/')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Home
                            </motion.a>
                            <motion.a
                                href="/markets"
                                className={getLinkStyles('/markets')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Markets
                            </motion.a>
                            <motion.a
                                href="/platform"
                                className={getLinkStyles('/platform')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Platform
                            </motion.a>
                            <motion.a
                                href="/about"
                                className={getLinkStyles('/about')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                About
                            </motion.a>
                            <motion.a
                                href="/contact"
                                className={getLinkStyles('/contact')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Contact
                            </motion.a>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:block">
                        <motion.button
                            className="bg-accent text-primary px-4 py-2 rounded-md font-medium text-sm hover:bg-accent/90 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </motion.button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-2">
                        <motion.button
                            className="bg-accent text-primary px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm hover:bg-accent/90 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </motion.button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white hover:text-accent p-2 rounded-md"
                        >
                            <svg className="h-5 sm:h-6 w-5 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        className="md:hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="px-3 sm:px-4 pt-2 pb-4 space-y-1 bg-primary/95 border-t border-white/10">
                            <motion.a
                                href="/"
                                className={getLinkStyles('/', true)}
                                onClick={() => setIsOpen(false)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Home
                            </motion.a>
                            <motion.a
                                href="/markets"
                                className={getLinkStyles('/markets', true)}
                                onClick={() => setIsOpen(false)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Markets
                            </motion.a>
                            <motion.a
                                href="/platform"
                                className={getLinkStyles('/platform', true)}
                                onClick={() => setIsOpen(false)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Platform
                            </motion.a>
                            <motion.a
                                href="/about"
                                className={getLinkStyles('/about', true)}
                                onClick={() => setIsOpen(false)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                About
                            </motion.a>
                            <motion.a
                                href="/contact"
                                className={getLinkStyles('/contact', true)}
                                onClick={() => setIsOpen(false)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Contact
                            </motion.a>
                        </div>
                    </motion.div>
                )}
            </div>
        </nav>
    );
};