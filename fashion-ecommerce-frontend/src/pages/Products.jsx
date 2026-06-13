import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { setLoading, setProducts, setError } from '../redux/slices/productSlice';
import { productAPI, categoryAPI } from '../services/authService';
import ProductCard from '../components/ProductCard';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOR_OPTIONS = ['Be', 'Ghi', 'Nâu', 'Trắng', 'Vàng', 'Xanh', 'Xanh Đen', 'Xám', 'black', 'white', 'Đen', 'Đỏ'];
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
const SORT_OPTIONS = [
    { value: '', label: 'Latest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' }
];

export default function Products() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, loading, error, totalCount } = useSelector((state) => state.product);
    const [searchParams, setSearchParams] = useSearchParams();
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [categories, setCategories] = useState([]);

    const rawCategory = searchParams.get('category') || '';
    const category = rawCategory === 'all' ? '' : rawCategory;
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || '';
    const size = searchParams.get('size') || '';
    const color = searchParams.get('color') || '';
    const page = Number(searchParams.get('page') || 1);

    const pageSize = 12;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const buildParams = () => {
        const params = {
            keyword: search || undefined,
            category: category || undefined,
            sort: sort || undefined,
            size: size || undefined,
            color: color || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            page,
            limit: pageSize
        };
        return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                dispatch(setLoading());
                const params = buildParams();
                const response = await productAPI.getAll(params);
                dispatch(setProducts(response.data));
            } catch (err) {
                dispatch(setError(err.response?.data?.message || err.message || 'Failed to load products'));
            }
        };

        fetchProducts();
    }, [dispatch, category, search, sort, size, color, page, minPrice, maxPrice]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getAll();
                setCategories(response.data || []);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };

        fetchCategories();
    }, []);

    const updateSearchParam = (key, value) => {
        const params = Object.fromEntries(Array.from(searchParams.entries()));
        if (value === undefined || value === '') {
            delete params[key];
        } else {
            params[key] = value;
        }
        params.page = 1;
        setSearchParams(params);
    };

    const handleApplyFilters = () => {
        const params = buildParams();
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        const params = {};
        if (search) params.search = search;
        params.page = 1;
        setSearchParams(params);
    };

    const handlePageChange = (newPage) => {
        const params = buildParams();
        params.page = newPage;
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const showCategory = categories.find((item) => item._id === category)?.name || category;

    return (
        <div className="container-custom py-16">
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                <aside className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Filters</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                                <div className="grid gap-2">
                                    <button
                                        type="button"
                                        onClick={() => updateSearchParam('category', undefined)}
                                        className={`w-full rounded border px-3 py-2 text-left text-sm ${!category ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((item) => (
                                        <button
                                            key={item._id}
                                            type="button"
                                            onClick={() => updateSearchParam('category', item._id)}
                                            className={`w-full rounded border px-3 py-2 text-left text-sm ${category === item._id ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => updateSearchParam('search', e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                    placeholder="Search product name"
                                    className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 focus:border-black focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="From"
                                        className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 focus:border-black focus:bg-white"
                                    />
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="To"
                                        className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 focus:border-black focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SIZE_OPTIONS.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => updateSearchParam('size', size === item ? undefined : item)}
                                            className={`rounded border px-3 py-2 text-sm ${size === item ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {COLOR_OPTIONS.map((item) => (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => updateSearchParam('color', color === item ? undefined : item)}
                                            className={`rounded border px-3 py-2 text-sm ${color === item ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                                        >
                                            {COLOR_TRANSLATIONS[item] || item}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    value={sort}
                                    onChange={(e) => updateSearchParam('sort', e.target.value || undefined)}
                                    className="w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 focus:border-black focus:bg-white"
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleApplyFilters}
                                    className="flex-1 rounded bg-black px-4 py-3 text-white hover:bg-gray-800"
                                >
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="flex-1 rounded border border-gray-300 px-4 py-3 text-sm text-gray-700 hover:border-black"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold">Products</h1>
                            <p className="text-gray-600 mt-2">
                                {search ? `Search results for "${search}"` : category ? `Category: ${showCategory}` : 'All Products'}
                            </p>
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing {products.length} of {totalCount} products
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, index) => (
                                <div key={index} className="bg-gray-200 h-72 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 text-gray-600 rounded-xl border border-gray-200 bg-white p-8">
                            No products found matching the filters.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-2 py-8">
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`min-w-[40px] rounded border px-3 py-2 text-sm ${page === pageNumber ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'}`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
