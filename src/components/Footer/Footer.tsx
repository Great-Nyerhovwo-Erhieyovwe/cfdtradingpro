import { FaFacebookF, FaTwitter, FaLinkedinIn, FaTelegramPlane, FaEnvelope, FaPhone } from "react-icons/fa";

export const Footer = () => (
    <footer className="py-12">
        <div className="mx-auto max-w-7xl px-4 text-white">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                {/* Company info */}
                <div>
                    <h4 className="mb-4 text-lg font-semibold text-accent">CFD Trading Pro</h4>
                    <p className="text-sm text-white/70 mb-4">
                        Your trusted partner in advanced trading solutions. Experience the future of financial markets.
                    </p>
                    <p className="text-xs text-white/60">
                        © {new Date().getFullYear()} CFD Trading Pro. All rights reserved.
                    </p>
                    <p className="text-xs text-white/60 mt-2">
                        Risk Disclaimer: Trading involves risk. Do not invest money you cannot afford to lose.
                    </p>
                </div>

                {/* Quick links */}
                <div>
                    <h4 className="mb-4 text-lg font-semibold">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/about" className="text-white/70 hover:text-accent transition-colors">About Us</a></li>
                        <li><a href="/markets" className="text-white/70 hover:text-accent transition-colors">Markets</a></li>
                        <li><a href="/platform" className="text-white/70 hover:text-accent transition-colors">Platform</a></li>
                        <li><a href="/support" className="text-white/70 hover:text-accent transition-colors">Support</a></li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="mb-4 text-lg font-semibold">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="text-white/70 hover:text-accent transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="text-white/70 hover:text-accent transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="text-white/70 hover:text-accent transition-colors">Cookie Policy</a></li>
                        <li><a href="#" className="text-white/70 hover:text-accent transition-colors">AML Policy</a></li>
                    </ul>
                </div>

                {/* Contact & Social */}
                <div>
                    <h4 className="mb-4 text-lg font-semibold">Contact Us</h4>
                    <div className="space-y-2 text-sm text-white/70 mb-4">
                        <div className="flex items-center">
                            <FaEnvelope className="mr-2" />
                            <span>support@cfdtradingpro.com</span>
                        </div>
                        <div className="flex items-center">
                            <FaPhone className="mr-2" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <a href="#" className="text-white/70 hover:text-accent transition-colors"><FaFacebookF size={20} /></a>
                        <a href="#" className="text-white/70 hover:text-accent transition-colors"><FaTwitter size={20} /></a>
                        <a href="#" className="text-white/70 hover:text-accent transition-colors"><FaLinkedinIn size={20} /></a>
                        <a href="#" className="text-white/70 hover:text-accent transition-colors"><FaTelegramPlane size={20} /></a>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/60">
                <p>CFD Trading Pro is regulated and licensed. Trading CFDs involves significant risk and may not be suitable for all investors.</p>
            </div>
        </div>
    </footer>
);