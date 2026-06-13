import { Link } from 'react-router-dom';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-black text-white mt-20 border-t border-neutral-800">
            <div className="container-custom py-16">
                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    {/* About */}
                    <div className="space-y-4">
                        <h3 className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-neutral-800 pb-2">ABOUT US</h3>
                        <p className="text-neutral-400 text-xs leading-relaxed uppercase tracking-wider">
                            Premium streetwear label. Designed for the self-confident, bold, and hustling generation. Get dripped & chill!
                        </p>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-neutral-800 pb-2">CATEGORIES</h3>
                        <ul className="text-neutral-400 text-xs space-y-2.5 uppercase tracking-wider font-semibold">
                            <li><Link to="/products" className="hover:text-white transition-colors duration-200">ALL</Link></li>
                            <li><Link to="/products?category=top" className="hover:text-white transition-colors duration-200">TOP</Link></li>
                            <li><Link to="/products?category=bottom" className="hover:text-white transition-colors duration-200">BOTTOM</Link></li>
                            <li><Link to="/products?category=outerwears" className="hover:text-white transition-colors duration-200">OUTERWEARS</Link></li>
                            <li><Link to="/products?category=underwear" className="hover:text-white transition-colors duration-200">UNDERWEAR</Link></li>
                            <li><Link to="/products?category=accessories" className="hover:text-white transition-colors duration-200">ACCESSORIES</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="space-y-4">
                        <h3 className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-neutral-800 pb-2">CUSTOMER SERVICE</h3>
                        <ul className="text-neutral-400 text-xs space-y-2.5 uppercase tracking-wider font-semibold">
                            <li><Link to="/faq" className="hover:text-white transition-colors duration-200">FAQ</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors duration-200">ABOUT US</Link></li>
                            <li><Link to="/shipping" className="hover:text-white transition-colors duration-200">SHIPPING INFO</Link></li>
                            <li><Link to="/return" className="hover:text-white transition-colors duration-200">RETURNS</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors duration-200">CONTACT US</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-white border-b border-neutral-800 pb-2">CONTACT</h3>
                        <p className="text-neutral-400 text-xs tracking-wider leading-relaxed">
                            📍 322 MAI ANH TUAN STREET, DONG DA DISTRICT, HANOI
                        </p>
                        <p className="text-neutral-400 text-xs tracking-wider">
                            📞 <a href="tel:+84365001420" className="hover:text-white transition-colors duration-200">(+84) 365 001 420</a>
                        </p>
                        <p className="text-neutral-400 text-xs tracking-wider">
                            ✉️ <a href="mailto:lonelystonie420@gmail.com" className="hover:text-white transition-colors duration-200">lonelystonie420@gmail.com</a>
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-3.5 pt-2">
                            <a href="https://facebook.com/lonelystonie420" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-all duration-300 hover:scale-105" title="Facebook">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                                </svg>
                            </a>
                            <a href="https://instagram.com/ls_vietnam" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-all duration-300 hover:scale-105" title="Instagram">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>
                            <a href="https://tiktok.com/@lonelystonieofficial" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-all duration-300 hover:scale-105" title="TikTok">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.57 4.23 1.02.02 2.05.02 3.08.01v3.83c-1.39-.01-2.78-.45-3.89-1.28v6.7c-.07 3.52-2.14 6.78-5.32 8.35-3.18 1.57-7.05 1.4-10.08-.43-3.03-1.83-4.73-5.26-4.33-8.77.41-3.51 3.05-6.42 6.55-7.14 1.13-.23 2.3-.2 3.42.09v3.91c-.88-.22-1.81-.22-2.69.02-1.61.44-2.88 1.84-3.12 3.49-.24 1.66.49 3.32 1.84 4.3 1.35.98 3.19 1.1 4.66.3 1.47-.8 2.32-2.39 2.27-4.08V.02z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Policies Link Row */}
                <div className="border-t border-neutral-900 py-6 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
                    <Link to="/faq" className="hover:text-white transition duration-200">PRIVACY POLICY</Link>
                    <Link to="/return" className="hover:text-white transition duration-200">RETURN POLICY</Link>
                    <Link to="/shipping" className="hover:text-white transition duration-200">SHIPPING POLICY</Link>
                    <Link to="/about" className="hover:text-white transition duration-200">TERMS OF SERVICE</Link>
                </div>

                {/* Bottom section */}
                <div className="border-t border-neutral-900 pt-8 text-center text-neutral-600 text-[10px] tracking-wider uppercase space-y-1">
                    <p>&copy; {currentYear} Lonely Stonie. All rights reserved.</p>
                    <p>Business Registration Certificate No. 01E8041877 issued by Dong Da District People's Committee on 22/02/2024</p>
                </div>
            </div>
        </footer>
    );
}
