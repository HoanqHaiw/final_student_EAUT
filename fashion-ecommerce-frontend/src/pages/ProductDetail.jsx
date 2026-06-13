import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { productAPI, reviewAPI } from '../services/authService';

const getWishlist = () => JSON.parse(localStorage.getItem('wishlist') || '[]');
const saveWishlist = (items) => localStorage.setItem('wishlist', JSON.stringify(items));

const COLOR_TRANSLATIONS = {
    'Be': 'Beige',
    'Ghi': 'Grey (Ghi)',
    'Nâu': 'Brown',
    'Trắng': 'White',
    'Vàng': 'Yellow',
    'Xanh': 'Blue/Green',
    'Xanh Đen': 'Navy Blue',
    'Xám': 'Grey',
    'black': 'Black',
    'white': 'White',
    'Đen': 'Black',
    'Đỏ': 'Red'
};

export default function ProductDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [isFavorited, setIsFavorited] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [reviewMessage, setReviewMessage] = useState('');
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await productAPI.getById(id);
                const productData = response.data;
                setProduct(productData);
                const firstVariant = productData.variants?.[0] || null;
                setSelectedSize(firstVariant?.size || '');
                setSelectedColor(firstVariant?.color || '');
                setSelectedVariant(firstVariant);
                setSelectedImage(productData.images?.[0] || productData.image || 'https://via.placeholder.com/300x400');
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (!product) return;

        const wishlist = getWishlist();
        setIsFavorited(wishlist.some((item) => item._id === product._id));

        const fetchReviews = async () => {
            try {
                const res = await reviewAPI.getByProduct(product._id);
                setReviews(res.data.data || []);
            } catch (err) {
                console.error("Failed to load reviews", err);
            }
        };

        fetchReviews();
    }, [product]);

    useEffect(() => {
        if (!product) return;

        const matchedVariant = product.variants?.find(
            (v) => v.size === selectedSize && v.color === selectedColor
        );

        if (matchedVariant) {
            setSelectedVariant(matchedVariant);
            return;
        }

        const variantBySize = product.variants?.find((v) => v.size === selectedSize);
        if (variantBySize) {
            setSelectedColor(variantBySize.color);
            setSelectedVariant(variantBySize);
            return;
        }

        const variantByColor = product.variants?.find((v) => v.color === selectedColor);
        if (variantByColor) {
            setSelectedSize(variantByColor.size);
            setSelectedVariant(variantByColor);
            return;
        }

        setSelectedVariant(product.variants?.[0] || null);
    }, [product, selectedSize, selectedColor]);

    const sizes = useMemo(
        () => [...new Set(product?.variants?.map((v) => v.size).filter(Boolean))],
        [product]
    );

    const colors = useMemo(
        () => [...new Set(product?.variants?.map((v) => v.color).filter(Boolean))],
        [product]
    );

    const handleSelectSize = (size) => {
        if (!product) return;
        setSelectedSize(size);
        const variant = product.variants?.find((v) => v.size === size && v.color === selectedColor) ||
            product.variants?.find((v) => v.size === size);
        if (variant) setSelectedColor(variant.color);
    };

    const handleSelectColor = (color) => {
        if (!product) return;
        setSelectedColor(color);
        const variant = product.variants?.find((v) => v.color === color && v.size === selectedSize) ||
            product.variants?.find((v) => v.color === color);
        if (variant) setSelectedSize(variant.size);
    };

    const handleAddToCart = () => {
        if (!selectedVariant) return;

        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = currentCart.find(
            (i) => i.productId === product._id && i.size === selectedVariant.size && i.color === selectedVariant.color
        );
        const currentCartQuantity = existingItem ? existingItem.quantity : 0;
        const totalRequested = currentCartQuantity + quantity;

        if (totalRequested > selectedVariant.stock) {
            alert(`Không đủ tồn kho. Tồn kho: ${selectedVariant.stock}, Đã có trong giỏ: ${currentCartQuantity}`);
            return;
        }

        dispatch(
            addToCart({
                productId: product._id,
                name: product.name,
                price: Math.round(selectedVariant.price * (1 - (product.discountPercent || 0) / 100)),
                image: selectedImage,
                size: selectedVariant.size,
                color: selectedVariant.color,
                quantity,
                stock: selectedVariant.stock
            })
        );
        alert('Product added to cart successfully!');
    };

    const handleToggleFavorite = () => {
        if (!product) return;
        const wishlist = getWishlist();
        const alreadyFavorited = wishlist.some((item) => item._id === product._id);

        const nextWishlist = alreadyFavorited
            ? wishlist.filter((item) => item._id !== product._id)
            : [...wishlist, {
                _id: product._id,
                name: product.name,
                image: selectedImage,
                variants: product.variants,
                category: product.category
            }];

        saveWishlist(nextWishlist);
        setIsFavorited(!alreadyFavorited);
        window.dispatchEvent(new Event('storage'));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewMessage('');
        setReviewError('');

        if (!token) {
            alert('Vui lòng đăng nhập để đánh giá sản phẩm.');
            navigate('/login');
            return;
        }

        if (!reviewForm.comment) {
            setReviewError('Vui lòng nhập nội dung đánh giá.');
            return;
        }

        try {
            await reviewAPI.create(product._id, {
                rating: Number(reviewForm.rating),
                comment: reviewForm.comment
            });
            
            // Reload reviews
            const res = await reviewAPI.getByProduct(product._id);
            setReviews(res.data.data || []);
            
            setReviewForm({ rating: 5, comment: '' });
            setReviewMessage('Đánh giá của bạn đã được ghi nhận. Cảm ơn bạn!');
        } catch (err) {
            setReviewError(err.response?.data?.message || err.message || 'Lỗi khi gửi đánh giá');
        }
    };

    if (loading) {
        return (
            <div className="container-custom py-16">
                <div className="h-96 bg-gray-200 animate-pulse rounded" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-custom py-16">
                <div className="bg-red-100 text-red-800 p-6 rounded">{error}</div>
            </div>
        );
    }

    if (!product) {
        return null;
    }

    const imageUrl = selectedImage;
    const categoryLabel = product.category?.name || product.category || 'Unknown Category';
    const ratingSummary = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : null;

    return (
        <div className="container-custom py-16">
            <Link to="/products" className="text-sm text-black hover:text-gray-600 mb-6 inline-block">
                ← Back to products
            </Link>

            <div className="grid gap-10 lg:grid-cols-[420px_1fr]">
                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm relative">
                        {product.discountPercent > 0 && (
                            <span className="absolute top-6 left-6 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-widest rounded-sm shadow-md">
                                -{product.discountPercent}%
                            </span>
                        )}
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full rounded object-cover"
                        />
                        <div className="mt-4 grid grid-cols-4 gap-3">
                            {(product.images || [product.image]).filter(Boolean).map((img, index) => (
                                <button
                                    key={`${img}-${index}`}
                                    type="button"
                                    onClick={() => setSelectedImage(img)}
                                    className={`overflow-hidden rounded-lg border ${imageUrl === img ? 'border-black' : 'border-gray-200'} transition`}
                                >
                                    <img src={img} alt={`${product.name} ${index + 1}`} className="h-20 w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold">{product.name}</h1>
                                <p className="text-sm text-gray-500 mt-1">{categoryLabel}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleFavorite}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isFavorited ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                            >
                                {isFavorited ? 'Favorited' : 'Add to Wishlist'}
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            {ratingSummary ? (
                                <span><span className="text-black mr-1">★</span> {ratingSummary} / 5 · {reviews.length} đánh giá</span>
                            ) : (
                                <span>Chưa có đánh giá</span>
                            )}
                            <span className="px-2 py-1 rounded bg-gray-100">{product.variants?.length || 1} phân loại</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                        <p className="text-sm text-gray-500 mb-2">Price</p>
                        {product.discountPercent > 0 ? (
                            <div className="flex flex-col mb-6">
                                <span className="text-xl text-gray-400 line-through">
                                    {selectedVariant?.price?.toLocaleString('vi-VN')} ₫
                                </span>
                                <span className="text-4xl font-bold text-red-600">
                                    {Math.round(selectedVariant?.price * (1 - product.discountPercent / 100)).toLocaleString('vi-VN')} ₫
                                </span>
                            </div>
                        ) : (
                            <p className="text-4xl font-bold text-black mb-6">{selectedVariant?.price?.toLocaleString('vi-VN')} ₫</p>
                        )}

                        <div className="grid gap-4 md:grid-cols-2 mb-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Size</p>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => handleSelectSize(size)}
                                            className={`px-4 py-2 rounded border text-sm ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Color</p>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => handleSelectColor(color)}
                                            className={`px-4 py-2 rounded border text-sm ${selectedColor === color ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                                        >
                                            {COLOR_TRANSLATIONS[color] || color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mb-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Quantity</p>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedVariant?.stock || 1}
                                    value={quantity}
                                    onChange={(e) => {
                                        let val = Math.max(1, Number(e.target.value));
                                        if (selectedVariant?.stock && val > selectedVariant.stock) {
                                            val = selectedVariant.stock;
                                        }
                                        setQuantity(val);
                                    }}
                                    className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3"
                                />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Inventory</p>
                                <div className="rounded border border-gray-300 bg-gray-50 px-4 py-3">
                                    {selectedVariant?.stock > 0 ? (
                                        <span className="text-green-700 font-semibold">{selectedVariant.stock} in stock</span>
                                    ) : (
                                        <span className="text-red-700 font-semibold">Out of stock</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={selectedVariant?.stock === 0}
                            className="w-full rounded bg-black px-6 py-4 text-white hover:bg-gray-800 transition disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {selectedVariant?.stock === 0 ? 'Out of stock' : 'Add to Cart'}
                        </button>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">Product Information</h2>
                                <p className="text-sm text-gray-500">Reviews and wishlist status.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                <div>
                                    <p className="font-semibold">Category</p>
                                    <p>{categoryLabel}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Variants</p>
                                    <p>{product.variants?.length || 1}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                <div>
                                    <p className="font-semibold">Status</p>
                                    <p>{selectedVariant?.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">SKU</p>
                                    <p>{product._id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">Customer Reviews</h2>
                                <p className="text-sm text-gray-500">Write a review for this product.</p>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{reviews.length} reviews</span>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <select
                                    value={reviewForm.rating}
                                    onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: e.target.value }))}
                                    className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 text-black tracking-widest text-lg"
                                >
                                    {[5, 4, 3, 2, 1].map((rating) => (
                                        <option key={rating} value={rating}>
                                            {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <textarea
                                rows="4"
                                placeholder="Viết đánh giá của bạn..."
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3"
                            />
                            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                            {reviewMessage && <p className="text-sm text-green-700">{reviewMessage}</p>}
                            <button type="submit" className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800 transition">
                                Gửi đánh giá
                            </button>
                        </form>

                        {reviews.length > 0 && (
                            <div className="mt-8 space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-semibold">{review.user?.name || 'Khách hàng'}</p>
                                            <span className="text-sm text-black tracking-widest text-lg">
                                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                        <p className="mt-3 text-gray-700">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
