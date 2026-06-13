import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

const getWishlist = () => JSON.parse(localStorage.getItem('wishlist') || '[]');
const saveWishlist = (items) => localStorage.setItem('wishlist', JSON.stringify(items));

export default function ProductCard({ product }) {
    const dispatch = useDispatch();
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        const wishlist = getWishlist();
        setIsFavorited(wishlist.some((item) => item._id === product._id));
    }, [product._id]);

    const handleAddToCart = () => {
        const variant = product.variants?.[0];
        if (variant) {
            dispatch(addToCart({
                productId: product._id,
                name: product.name,
                price: Math.round(variant.price * (1 - (product.discountPercent || 0) / 100)),
                image: product.image || product.images?.[0] || 'https://via.placeholder.com/300x400',
                size: variant.size,
                color: variant.color,
                quantity: 1,
            }));
            alert('Product added to cart successfully!');
        }
    };

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const wishlist = getWishlist();
        const alreadyFavorited = wishlist.some((item) => item._id === product._id);

        const nextWishlist = alreadyFavorited
            ? wishlist.filter((item) => item._id !== product._id)
            : [...wishlist, {
                _id: product._id,
                name: product.name,
                image: product.image || product.images?.[0] || 'https://via.placeholder.com/300x400',
                variants: product.variants,
                category: product.category
            }];

        saveWishlist(nextWishlist);
        setIsFavorited(!alreadyFavorited);
        window.dispatchEvent(new Event('storage'));
    };

    const displayImage = product.image || product.images?.[0] || 'https://via.placeholder.com/300x400';

    return (
        <div className="relative overflow-hidden border border-black bg-white flex flex-col product-card-hover group transition-all duration-300 rounded-none">
            {/* Favorite Button */}
            <button
                type="button"
                onClick={handleToggleFavorite}
                className={`absolute right-3 top-3 z-20 border border-black p-2 transition duration-300 rounded-none ${
                    isFavorited ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'
                }`}
            >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.682l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
            </button>

            {/* Lookbook Image Container with Hover Swap */}
            <Link to={`/product/${product._id}`} className="block overflow-hidden bg-neutral-50 h-72 flex-shrink-0 relative">
                {product.discountPercent > 0 && (
                    <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                        -{product.discountPercent}%
                    </span>
                )}
                <div className="product-image-container h-full w-full">
                    <img
                        src={displayImage}
                        alt={product.name}
                        className={`w-full h-full object-cover product-image-primary ${
                            product.images?.[1] ? '' : 'product-image-single'
                        }`}
                        loading="lazy"
                    />
                    {product.images?.[1] && (
                        <img
                            src={product.images[1]}
                            alt={`${product.name} hover`}
                            className="product-image-secondary"
                            loading="lazy"
                        />
                    )}
                </div>
            </Link>

            {/* Product Meta Body */}
            <div className="p-4 flex flex-col flex-1">
                <div className="space-y-1">
                    <Link
                        to={`/product/${product._id}`}
                        className="block text-xs font-bold uppercase tracking-wider text-black hover:text-neutral-500 line-clamp-2 leading-relaxed"
                    >
                        {product.name}
                    </Link>

                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                        {product.category?.name || product.category || 'Unknown'}
                    </p>

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex flex-col">
                            {product.discountPercent > 0 ? (
                                <>
                                    <span className="text-[10px] text-gray-400 line-through">
                                        {product.variants?.[0]?.price?.toLocaleString('vi-VN')} ₫
                                    </span>
                                    <span className="text-xs font-bold tracking-wider text-red-600">
                                        {Math.round(product.variants?.[0]?.price * (1 - product.discountPercent / 100)).toLocaleString('vi-VN')} ₫
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs font-bold tracking-wider text-black">
                                    {product.variants?.[0]?.price?.toLocaleString('vi-VN')} ₫
                                </span>
                            )}
                        </div>
                        {product.variants?.[0]?.stock > 0 ? (
                            <span className="text-[9px] border border-black px-1.5 py-0.5 uppercase tracking-widest font-bold text-black">
                                In Stock
                            </span>
                        ) : (
                            <span className="text-[9px] border border-red-500 text-red-500 px-1.5 py-0.5 uppercase tracking-widest font-bold">
                                Out of Stock
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.variants?.[0]?.stock === 0}
                        className="w-full border border-black bg-black text-white hover:bg-white hover:text-black transition-all duration-300 py-2.5 text-[10px] uppercase tracking-widest font-bold disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:border-neutral-200 disabled:text-neutral-400 rounded-none"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
