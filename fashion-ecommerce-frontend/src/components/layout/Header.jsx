import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [wishlistCount, setWishlistCount] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth);
    const { items } = useSelector((state) => state.cart);

    const displayName = user?.name ? user.name.split(' ')[0] : 'User';
    const accountMenuRef = useRef(null);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);

    // Fetch categories từ database (1 lần duy nhất)
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        fetch(`${API_URL}/categories`)
            .then((res) => res.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : data.categories || [];
                setCategories(list.filter((c) => c.isActive !== false));
            })
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistCount(currentWishlist.length);
        const handleStorage = () => {
            const w = JSON.parse(localStorage.getItem('wishlist') || '[]');
            setWishlistCount(w.length);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setAccountMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/products?search=${searchQuery}`);
    };

    const handleLogout = () => {
        dispatch(logout());
        dispatch(clearCart());
        localStorage.removeItem('wishlist');
        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };

    return (
        <header className="bg-white border-b border-black sticky top-0 z-50 animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
                <div className="flex items-center justify-between gap-4">

                    {/* Brand Name bên trái */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden text-black hover:text-neutral-500 transition duration-300 mr-1"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>

                        {/* Brand dùng Cormorant Garamond italic - giống style lonelystonie */}
                        <Link
                            to="/"
                            className="font-heading text-2xl md:text-3xl font-light italic tracking-wide text-black select-none hover:opacity-70 transition duration-300 shrink-0"
                            style={{ letterSpacing: '0.04em' }}
                        >
                            Lonely Stonie
                        </Link>
                    </div>

                    {/* Category nav giữa - từ database */}
                    <nav className="hidden lg:flex items-center justify-center gap-x-7 xl:gap-x-9 uppercase text-[10px] tracking-[0.35em] font-medium text-black">
                        <Link to="/products" className="hover-underline-anim transition duration-300">ALL</Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat._id}
                                to={`/products?category=${cat._id}`}
                                className="hover-underline-anim transition duration-300 whitespace-nowrap"
                            >
                                {cat.name.toUpperCase()}
                            </Link>
                        ))}
                    </nav>

                    {/* Icons bên phải */}
                    <div className="flex items-center gap-4 md:gap-5 shrink-0 justify-end">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex items-center relative">
                            <div className={`flex items-center gap-2 border-b border-black overflow-hidden transition-all duration-300 ${searchOpen ? 'w-32 md:w-48 opacity-100 mr-1.5' : 'w-0 opacity-0 pointer-events-none'}`}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH..."
                                    className="w-full bg-transparent text-[10px] uppercase outline-none placeholder:text-neutral-400 tracking-wider text-black py-0.5"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (searchOpen && searchQuery.trim()) {
                                        navigate(`/products?search=${searchQuery}`);
                                    } else {
                                        setSearchOpen(!searchOpen);
                                    }
                                }}
                                className="text-black hover:text-neutral-500 transition duration-300 p-1 flex items-center"
                                aria-label="Toggle Search"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>

                        {/* Account */}
                        {token ? (
                            <div className="relative" ref={accountMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setAccountMenuOpen((prev) => !prev)}
                                    className="flex items-center gap-1 border border-black bg-white px-2.5 py-1 text-black hover:bg-black hover:text-white transition duration-300 rounded-none"
                                    aria-label="Account menu"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.08em] hidden md:inline ml-1">
                                        {displayName}
                                    </span>
                                </button>
                                {accountMenuOpen && (
                                    <div className="absolute right-0 mt-2 bg-white border border-black rounded-none py-1.5 w-40 shadow-lg z-50">
                                        <Link to="/profile" className="block px-4 py-2 text-[10px] uppercase tracking-wider text-black hover:bg-neutral-100">
                                            My Profile
                                        </Link>
                                        <Link to="/orders" className="block px-4 py-2 text-[10px] uppercase tracking-wider text-black hover:bg-neutral-100">
                                            My Orders
                                        </Link>
                                        {(user?.role === 'admin' || user?.role === 'staff') && (
                                            <Link to="/admin" className="block px-4 py-2 text-[10px] uppercase tracking-wider text-black hover:bg-neutral-100">
                                                Dashboard
                                            </Link>
                                        )}
                                        <hr className="border-t border-neutral-200 my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-[10px] uppercase tracking-wider text-red-600 hover:bg-neutral-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="text-black hover:text-neutral-500 transition duration-300 p-1 flex items-center" aria-label="Login">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>
                        )}

                        {/* Wishlist */}
                        <Link to="/wishlist" className="relative text-black hover:text-neutral-500 transition duration-300 p-1 flex items-center" aria-label="Wishlist">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                            </svg>
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-black text-white rounded-none border border-white w-4 h-4 flex items-center justify-center text-[8px] font-bold">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="relative text-black hover:text-neutral-500 transition duration-300 p-1 flex items-center" aria-label="Cart">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-black text-white rounded-none border border-white w-4 h-4 flex items-center justify-center text-[8px] font-bold animate-pulse">
                                    {items.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Mobile dropdown menu - categories từ database */}
                {mobileMenuOpen && (
                    <div className="lg:hidden mt-4 pt-4 border-t border-black flex flex-col gap-4 uppercase text-[10px] tracking-[0.3em] font-medium text-black animate-slide-down">
                        <Link
                            to="/products"
                            onClick={() => setMobileMenuOpen(false)}
                            className="hover:text-neutral-500 py-1 transition duration-200"
                        >
                            ALL
                        </Link>
                        {categories.map((cat) => (
                            <Link
                                key={cat._id}
                                to={`/products?category=${cat._id}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="hover:text-neutral-500 py-1 transition duration-200"
                            >
                                {cat.name.toUpperCase()}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}
