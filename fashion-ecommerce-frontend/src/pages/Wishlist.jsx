import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlist(stored);
    }, []);

    const handleRemove = (id) => {
        const next = wishlist.filter((item) => item._id !== id);
        localStorage.setItem('wishlist', JSON.stringify(next));
        setWishlist(next);
    };

    return (
        <div className="container-custom py-16">
            <h1 className="text-3xl font-bold mb-6">Wishlist</h1>

            {wishlist.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-sm">
                    No items in your wishlist.
                    <div className="mt-5">
                        <Link to="/products" className="inline-flex rounded bg-black px-6 py-3 text-white hover:bg-gray-800">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlist.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
