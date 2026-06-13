import { useEffect, useState, useMemo } from 'react';
import { adminService } from '../../services/adminService';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: '',
        discountPercent: 0,
        images: [],
        imageFiles: [],
        variants: [
            { size: '', color: '', price: '', stock: '' }
        ]
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const resetForm = () => {
        setEditingProduct(null);
        setForm({
            name: '',
            description: '',
            category: '',
            discountPercent: 0,
            images: [],
            imageFiles: [],
            variants: [
                { size: '', color: '', price: '', stock: '' }
            ]
        });
    };

    const fetchCategories = async () => {
        try {
            const response = await adminService.getCategories();
            setCategories(response.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: currentPage,
                limit: pageSize,
                ...(selectedCategory ? { category: selectedCategory } : {})
            };
            const response = await adminService.getProducts(params);
            setProducts(response.data.products || []);
            setTotalProducts(response.data.total || 0);
            setTotalPages(response.data.pages || 1);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể tải sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, currentPage, pageSize]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (index, field, value) => {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.map((variant, idx) =>
                idx === index ? { ...variant, [field]: value } : variant
            )
        }));
    };

    const addVariant = () => {
        setForm((prev) => ({
            ...prev,
            variants: [...prev.variants, { size: '', color: '', price: '', stock: '' }]
        }));
    };

    const removeVariant = (index) => {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.length > 1
                ? prev.variants.filter((_, idx) => idx !== index)
                : [{ size: '', color: '', price: '', stock: '' }]
        }));
    };

    const handleImageFilesChange = (e) => {
        const files = Array.from(e.target.files);
        setForm((prev) => ({ ...prev, imageFiles: [...prev.imageFiles, ...files] }));
    };

    const handleRemoveSelectedImage = (index) => {
        setForm((prev) => ({
            ...prev,
            imageFiles: prev.imageFiles.filter((_, idx) => idx !== index)
        }));
    };

    const handleRemoveExistingImage = (index) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== index)
        }));
    };

    useEffect(() => {
        if (!form.imageFiles.length) {
            setImagePreviews([]);
            return;
        }

        const previews = form.imageFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);

        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [form.imageFiles]);

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name || !form.category) {
            setError('Vui lòng điền tên và danh mục sản phẩm.');
            return;
        }

        const validVariants = form.variants.filter((variant) =>
            variant.size && variant.color && variant.price !== '' && variant.stock !== ''
        );

        if (!validVariants.length) {
            setError('Vui lòng thêm ít nhất một biến thể kích thước/màu/giá.');
            return;
        }

        if (validVariants.some((variant) => isNaN(Number(variant.price)) || isNaN(Number(variant.stock)))) {
            setError('Giá và số lượng phải là số hợp lệ.');
            return;
        }

        let images = [...form.images];
        if (form.imageFiles.length > 0) {
            try {
                const uploadResponse = await adminService.uploadProductImages(form.imageFiles);
                const uploaded = uploadResponse.data.urls || [];
                images = editingProduct ? [...images, ...uploaded] : uploaded;
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Không thể tải ảnh lên');
                return;
            }
        }

        if (!images.length) {
            setError('Vui lòng chọn ít nhất một ảnh sản phẩm.');
            return;
        }

        const payload = {
            name: form.name,
            description: form.description,
            category: form.category,
            discountPercent: Number(form.discountPercent) || 0,
            images,
            variants: validVariants.map((variant) => ({
                size: variant.size,
                color: variant.color,
                price: Number(variant.price),
                stock: Number(variant.stock)
            }))
        };

        try {
            if (editingProduct) {
                await adminService.updateProduct(editingProduct._id, payload);
            } else {
                await adminService.createProduct(payload);
            }
            resetForm();
            await fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Lưu sản phẩm thất bại');
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        setError('');
        try {
            await adminService.deleteProduct(id);
            await fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Xóa sản phẩm thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setForm({
            name: product.name || '',
            description: product.description || '',
            category: product.category?._id || '',
            discountPercent: product.discountPercent || 0,
            images: product.images || [],
            imageFiles: [],
            variants: product.variants?.length > 0
                ? product.variants.map((variant) => ({
                    size: variant.size || '',
                    color: variant.color || '',
                    price: variant.price || '',
                    stock: variant.stock || ''
                }))
                : [{ size: '', color: '', price: '', stock: '' }]
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h1 className="text-3xl font-bold mb-4">Quản lý sản phẩm</h1>
                <p className="text-sm text-gray-500 mb-6">Thêm hoặc chỉnh sửa sản phẩm và xem danh sách hiện có.</p>

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <form onSubmit={handleSaveProduct} className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium mb-2">Tên sản phẩm</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Danh mục</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleInputChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Giảm giá (%)</label>
                        <input
                            type="number"
                            name="discountPercent"
                            value={form.discountPercent}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium mb-2">Mô tả</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleInputChange}
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium mb-2">Ảnh sản phẩm (có thể chọn nhiều ảnh)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageFilesChange}
                            className="w-full rounded border border-gray-300 bg-white px-3 py-2"
                        />
                        {form.imageFiles.length > 0 && (
                            <>
                                <p className="text-sm text-gray-500 mt-2">Đã chọn {form.imageFiles.length} ảnh mới. Chúng sẽ được thêm vào ảnh hiện tại.</p>
                                <div className="mt-3 grid grid-cols-4 gap-2">
                                    {imagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative overflow-hidden rounded-lg border">
                                            <img src={src} alt={`Ảnh mới ${idx + 1}`} className="h-20 w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSelectedImage(idx)}
                                                className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-red-600"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {form.imageFiles.length === 0 && form.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-4 gap-2">
                                {form.images.map((src, idx) => (
                                    <div key={idx} className="relative overflow-hidden rounded-lg border">
                                        <img src={src} alt={`Ảnh ${idx + 1}`} className="h-20 w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(idx)}
                                            className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-red-600"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {editingProduct && form.images.length > 0 && form.imageFiles.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">Chọn ảnh mới nếu muốn thay thế ảnh hiện tại.</p>
                        )}
                    </div>
                    <div className="md:col-span-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="block text-sm font-medium mb-2">Danh sách biến thể</label>
                                <p className="text-sm text-gray-500">Thêm nhiều size, màu, giá và số lượng cho cùng một sản phẩm.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
                            >
                                Thêm biến thể
                            </button>
                        </div>
                        <div className="space-y-4 mt-4">
                            {form.variants.map((variant, idx) => (
                                <div key={idx} className="grid gap-4 md:grid-cols-4 items-end">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Size</label>
                                        <input
                                            value={variant.size}
                                            onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                                            className="w-full rounded border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Màu</label>
                                        <input
                                            value={variant.color}
                                            onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                                            className="w-full rounded border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Giá</label>
                                        <input
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                                            className="w-full rounded border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="w-full">
                                            <label className="block text-sm font-medium mb-2">Số lượng</label>
                                            <input
                                                type="number"
                                                value={variant.stock}
                                                onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                                                className="w-full rounded border border-gray-300 px-3 py-2"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(idx)}
                                            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-3 flex flex-col gap-3 md:flex-row md:justify-end">
                        {editingProduct && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                        )}
                        <button
                            type="submit"
                            className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
                        >
                            {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold">Danh sách sản phẩm</h2>
                        <p className="text-sm text-gray-500">Quản lý sản phẩm đã tạo và chỉnh sửa nội dung.</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                            value={selectedCategory}
                            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                            className="rounded border border-gray-300 bg-white px-4 py-2"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const response = await adminService.exportProducts({ category: selectedCategory });
                                    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                    const url = window.URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = 'products.xlsx';
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    window.URL.revokeObjectURL(url);
                                } catch (err) {
                                    setError(err.response?.data?.message || err.message || 'Không thể xuất Excel sản phẩm');
                                }
                            }}
                            className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
                        >
                            Xuất Excel
                        </button>
                    </div>
                </div>

                {loading && <p className="text-gray-600">Đang tải sản phẩm...</p>}
                {error && <p className="text-red-600 mb-4">{error}</p>}

                {products.length === 0 && !loading ? (
                    <p className="text-gray-600">Chưa có sản phẩm nào.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-sm text-gray-600 uppercase">
                                    <th className="px-4 py-3 border border-gray-200">Tên</th>
                                    <th className="px-4 py-3 border border-gray-200">Danh mục</th>
                                    <th className="px-4 py-3 border border-gray-200">Giá thấp nhất</th>
                                    <th className="px-4 py-3 border border-gray-200">Trạng thái</th>
                                    <th className="px-4 py-3 border border-gray-200">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                        <tr key={product._id} className="border-t border-gray-200 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-800">{product.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800">{product.category?.name || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800">{Math.min(...product.variants.map(v => v.price)).toLocaleString('vi-VN')} ₫</td>
                                            <td className="px-4 py-3 text-sm text-gray-800">{product.isDeleted ? 'Đã xóa' : 'Hiện có'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="rounded border border-black bg-white px-4 py-2 text-black hover:bg-black hover:text-white"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {/* Pagination controls */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-600">Hiển thị {products.length} trên {totalProducts} sản phẩm</div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                    className="rounded border border-gray-300 px-2 py-1"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className={`rounded px-3 py-1 ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-black text-white hover:bg-gray-800'}`}>
                                    Prev
                                </button>
                                <span className="text-sm text-gray-700">{currentPage} / {totalPages}</span>
                                <button
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    className={`rounded px-3 py-1 ${currentPage >= totalPages ? 'bg-gray-200 text-gray-500' : 'bg-black text-white hover:bg-gray-800'}`}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
