const productService = require("../services/product.service");
const ExcelJS = require("exceljs");

// CREATE
const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET ALL
const getProducts = async (req, res) => {
    try {
        const products = await productService.getProducts(req.query);
        res.json(products);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const exportProducts = async (req, res) => {
    try {
        const products = await productService.getProductsForExport(req.query);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Products");

        worksheet.columns = [
            { header: "ID", key: "id", width: 30 },
            { header: "Tên", key: "name", width: 30 },
            { header: "Mô tả", key: "description", width: 40 },
            { header: "Danh mục", key: "category", width: 25 },
            { header: "Giá thấp nhất", key: "minPrice", width: 18 },
            { header: "Giá cao nhất", key: "maxPrice", width: 18 },
            { header: "Tổng tồn kho", key: "totalStock", width: 16 },
            { header: "Các biến thể", key: "variants", width: 50 },
            { header: "Trạng thái", key: "status", width: 15 },
            { header: "Ảnh", key: "images", width: 50 },
            { header: "Tạo lúc", key: "createdAt", width: 20 }
        ];

        products.forEach((product) => {
            const variantsText = product.variants?.map((v) =>
                `${v.size || 'N/A'} / ${v.color || 'N/A'} - ${v.price}đ x${v.stock}`
            ).join('; ') || '';

            const prices = product.variants?.map((v) => v.price) || [0];
            const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

            worksheet.addRow({
                id: product._id.toString(),
                name: product.name,
                description: product.description || '',
                category: product.category?.name || '',
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
                totalStock,
                variants: variantsText,
                status: product.isDeleted ? 'Đã xóa' : 'Hiện có',
                images: product.images?.join(', ') || '',
                createdAt: new Date(product.createdAt).toLocaleString('vi-VN')
            });
        });

        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET DETAIL
const getProduct = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// UPDATE
const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(
            req.params.id,
            req.body
        );
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE
const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    exportProducts,
    updateProduct,
    deleteProduct
};