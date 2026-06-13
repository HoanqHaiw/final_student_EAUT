import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setProducts, setError } from '../redux/slices/productSlice';
import { productAPI, categoryAPI } from '../services/authService';
import ProductCard from '../components/ProductCard';

export default function Home() {
    const dispatch = useDispatch();
    const { products, loading } = useSelector((state) => state.product);
    const [categories, setCategories] = useState([]);
    const [activeSlide, setActiveSlide] = useState(0);

    const slides = [
        {
            name: 'Summer Launch',
            title: 'Get dripped & chill',
            description: 'Khám phá bộ sưu tập thời trang streetwear cao cấp với các thiết kế tối giản, táo bạo và chất riêng độc bản.',
            badge: 'NEW ARRIVALS',
            ctaText: 'Mua Ngay',
            ctaHref: '#products',
            image: 'https://lonelystonie.com/wp-content/uploads/2026/03/z7447938240201_1cac93bc48ff99f021c1a59d5c85e187.jpg'
        },
        {
            name: 'Street Festival',
            title: 'Live your vibe',
            description: 'Đồng hành cùng cộng đồng yêu thích hip-hop và thời trang đường phố qua những chiến dịch đặc biệt hàng tuần.',
            badge: 'POPUP DROP',
            ctaText: 'Xem Sự Kiện',
            ctaHref: '/events',
            image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1600&auto=format&fit=crop'
        },
        {
            name: 'Flash Release',
            title: 'Hustle and bold style',
            description: 'Các mẫu sản phẩm giới hạn luôn được làm mới liên tục với chất liệu cao cấp và kiểu dáng unisex phá cách.',
            badge: 'TRENDING NOW',
            ctaText: 'Khám Phá',
            ctaHref: '/products?sort=newest',
            image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop'
        }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                dispatch(setLoading());
                const response = await productAPI.getAll({ limit: 12 });
                dispatch(setProducts(response.data));
            } catch (err) {
                dispatch(setError(err.message));
            }
        };

        fetchProducts();
    }, [dispatch]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryAPI.getAll();
                setCategories(res.data || []);
            } catch (err) {
                // ignore
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="animate-fadeIn">
            {/* Lookbook Hero Slideshow */}
            <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden bg-black text-white flex items-center">
                {/* Slides Container */}
                <div className="absolute inset-0">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        >
                            {/* Slide Image Background */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            />
                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-black/45" />
                        </div>
                    ))}
                </div>

                {/* Floating Content Overlay */}
                <div className="container-custom relative z-20 w-full">
                    <div className="max-w-2xl text-left space-y-6">
                        <span className="inline-block border border-white/50 px-3.5 py-1 text-[10px] uppercase tracking-[0.25em] text-white/95 font-semibold">
                            {slides[activeSlide].badge}
                        </span>
                        
                        <h1 className="text-4xl md:text-6xl font-heading uppercase tracking-[0.2em] leading-tight text-white transition-all duration-700">
                            {slides[activeSlide].title}
                        </h1>
                        
                        <p className="text-sm md:text-base text-neutral-200 tracking-wider leading-relaxed font-light">
                            {slides[activeSlide].description}
                        </p>

                        <div className="pt-4 flex items-center gap-4">
                            <a
                                href={slides[activeSlide].ctaHref}
                                className="inline-flex items-center justify-center border border-white bg-white px-8 py-3 text-[10px] uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-transparent hover:text-white font-bold"
                            >
                                {slides[activeSlide].ctaText}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveSlide(index)}
                            className={`h-1.5 transition-all duration-300 rounded-none ${
                                index === activeSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                            }`}
                            aria-label={`Slide ${index + 1}`}
                        />
                    ))}
                </div>
            </section>

            {/* New Arrivals Section */}
            <section className="container-custom py-20" id="products">
                <div className="flex flex-col items-center justify-center text-center mb-12 space-y-2">
                    <h2 className="text-2xl md:text-3xl font-heading uppercase tracking-[0.25em] text-black">NEW ARRIVALS</h2>
                    <div className="w-12 h-[2px] bg-black" />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-neutral-100 border border-neutral-200 h-[360px] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(0, 8).map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Categories Section */}
            <section className="bg-neutral-50 border-t border-b border-neutral-200/80 py-20">
                <div className="container-custom">
                    <div className="flex flex-col items-center justify-center text-center mb-12 space-y-2">
                        <h2 className="text-2xl md:text-3xl font-heading uppercase tracking-[0.25em] text-black">CATEGORIES</h2>
                        <div className="w-12 h-[2px] bg-black" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <a
                            href="/products"
                            className="border border-black bg-white text-black p-8 text-center uppercase tracking-[0.25em] text-xs font-bold hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center min-h-[100px]"
                        >
                            All Products
                        </a>
                        {categories.slice(0, 3).map((cat) => (
                            <a
                                key={cat._id}
                                href={`/products?category=${encodeURIComponent(cat.name)}`}
                                className="border border-black bg-white text-black p-8 text-center uppercase tracking-[0.25em] text-xs font-bold hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center min-h-[100px]"
                            >
                                {cat.name}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brand Store & Connect Section (lonelystonie.com exact details) */}
            <section className="bg-white border-t border-black py-20">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start text-black">
                        {/* Info list */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h4 className="font-heading uppercase tracking-[0.2em] text-sm font-bold">POPUP STORE:</h4>
                                <p className="text-neutral-600 text-xs tracking-widest uppercase leading-relaxed font-semibold">
                                    SỐ 322 MAI ANH TUẤN, ĐỐNG ĐA, HÀ NỘI.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-heading uppercase tracking-[0.2em] text-sm font-bold">LIÊN HỆ:</h4>
                                <p className="text-neutral-600 text-xs tracking-widest leading-relaxed font-semibold">
                                    SĐT: <a href="tel:0365001420" className="hover:text-black hover-underline-anim transition duration-200">(+84) 365 001 420</a>
                                    <br />
                                    EMAIL: <a href="mailto:lonelystonie420@gmail.com" className="hover:text-black hover-underline-anim transition duration-200">lonelystonie420@gmail.com</a>
                                </p>
                            </div>
                        </div>

                        {/* Social connect */}
                        <div className="flex flex-col md:items-end justify-center h-full space-y-6">
                            <h4 className="font-heading uppercase tracking-[0.2em] text-sm font-bold">CONNECT WITH US</h4>
                            <div className="flex gap-4">
                                <a href="https://facebook.com/lonelystonie420" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 hover:scale-105" title="Facebook">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                                    </svg>
                                </a>
                                <a href="https://instagram.com/ls_vietnam" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 hover:scale-105" title="Instagram">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </a>
                                <a href="https://tiktok.com/@lonelystonieofficial" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300 hover:scale-105" title="TikTok">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.57 4.23 1.02.02 2.05.02 3.08.01v3.83c-1.39-.01-2.78-.45-3.89-1.28v6.7c-.07 3.52-2.14 6.78-5.32 8.35-3.18 1.57-7.05 1.4-10.08-.43-3.03-1.83-4.73-5.26-4.33-8.77.41-3.51 3.05-6.42 6.55-7.14 1.13-.23 2.3-.2 3.42.09v3.91c-.88-.22-1.81-.22-2.69.02-1.61.44-2.88 1.84-3.12 3.49-.24 1.66.49 3.32 1.84 4.3 1.35.98 3.19 1.1 4.66.3 1.47-.8 2.32-2.39 2.27-4.08V.02z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
