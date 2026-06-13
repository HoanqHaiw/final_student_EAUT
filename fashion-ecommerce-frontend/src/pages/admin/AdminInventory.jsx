import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';

const LOW_STOCK_THRESHOLD = 5;
const PAGE_SIZE = 10;

export default function AdminInventory() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [stockMap, setStockMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        try {
            const response = await adminService.getCategories();
            setCategories(response.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async ({ category = '', keyword = '', pageNumber = 1 } = {}) => {
        setLoading(true);
        setError('');

        try {
            const params = {
                limit: PAGE_SIZE,
                page: pageNumber,
                category: category || undefined,
                keyword: keyword || undefined
            };
            const response = await adminService.getProducts(params);
            const items = response.data.products || [];
            setProducts(items);
            setPage(response.data.page || pageNumber);
            setPages(response.data.pages || 1);
            setTotal(response.data.total || 0);

            const initialStock = {};
            items.forEach((product) => {
                product.variants?.forEach((variant, index) => {
                    initialStock[`${product._id}_${index}`] = variant.stock ?? 0;
                });
            });
            setStockMap(initialStock);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu kho hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts({ category: selectedCategory, keyword: searchTerm, pageNumber: page });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchProducts({ category: selectedCategory, keyword: searchTerm, pageNumber: page });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, page, searchTerm]);

    const handleStockChange = (productId, index, value) => {
        const stockValue = Number(value);
        setStockMap((prev) => ({
            ...prev,
            [`${productId}_${index}`]: Number.isNaN(stockValue) ? 0 : stockValue
        }));
    };

    const handleSaveStock = async (product) => {
        setSavingId(product._id);
        setError('');

        try {
            const updatedVariants = product.variants.map((variant, index) => ({
                ...variant,
                stock: stockMap[`${product._id}_${index}`] ?? variant.stock ?? 0
            }));
            await adminService.updateProduct(product._id, { variants: updatedVariants });
            await fetchProducts(selectedCategory);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Cập nhật kho hàng thất bại');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý kho hàng</h1>
                    <p className="text-sm text-gray-500">Theo dõi tồn kho theo biến thể và cập nhật số lượng kịp thời.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => {
                            setPage(1);
                            setSearchTerm(e.target.value);
                        }}
                        className="w-full rounded border border-gray-300 px-4 py-2"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setPage(1);
                            setSelectedCategory(e.target.value);
                        }}
                        className="rounded border border-gray-300 bg-white px-4 py-2"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500">Tìm thấy {total} sản phẩm</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Trang trước
                    </button>
                    <span>
                        {page} / {pages}
                    </span>
                    <button
                        type="button"
                        disabled={page === pages}
                        onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                        className="rounded border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Trang sau
                    </button>
                </div>
            </div>

            {loading && <p className="text-gray-600">Đang tải kho hàng...</p>}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {products.length === 0 && !loading ? (
                <p className="text-gray-600">Không có sản phẩm nào để hiển thị.</p>
            ) : (
                <div className="space-y-6">
                    {products.map((product) => (
                        <div key={product._id} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold">{product.name}</h2>
                                    <p className="text-sm text-gray-500">Danh mục: {product.category?.name || 'Chưa xác định'}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleSaveStock(product)}
                                    disabled={savingId === product._id}
                                    className="rounded bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                                >
                                    {savingId === product._id ? 'Đang lưu...' : 'Lưu kho hàng'}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white text-sm text-gray-600 uppercase">
                                            <th className="px-4 py-3 border border-gray-200">Size</th>
                                            <th className="px-4 py-3 border border-gray-200">Màu</th>
                                            <th className="px-4 py-3 border border-gray-200">Giá</th>
                                            <th className="px-4 py-3 border border-gray-200">Tồn kho</th>
                                            <th className="px-4 py-3 border border-gray-200">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.variants?.map((variant, index) => {
                                            const currentStock = stockMap[`${product._id}_${index}`] ?? variant.stock ?? 0;
                                            const lowStock = currentStock <= LOW_STOCK_THRESHOLD;
                                            return (
                                                <tr key={index} className="border-t border-gray-200 bg-white hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-800">{variant.size || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">{variant.color || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">{variant.price?.toLocaleString('vi-VN') ?? 0} ₫</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">
                                                        <input
                                                            type="number"
                                                            value={currentStock}
                                                            min="0"
                                                            onChange={(e) => handleStockChange(product._id, index, e.target.value)}
                                                            className="w-24 rounded border border-gray-300 px-3 py-2"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${lowStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {lowStock ? 'Hàng thấp' : 'Đủ hàng'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex items-center justify-between rounded border border-gray-200 bg-white p-4">
                <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                    Trang trước
                </button>
                <p className="text-sm text-gray-600">
                    Trang {page} / {pages} — {total} sản phẩm
                </p>
                <button
                    type="button"
                    onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
                    disabled={page === pages}
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
}
