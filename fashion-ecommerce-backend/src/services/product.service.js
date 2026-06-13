const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Category = require("../models/category.model");

const normalizeProductImages = (data) => {
    if (data.image && !data.images) {
        data.images = [data.image];
    }
    if (data.images && !Array.isArray(data.images)) {
        data.images = [data.images];
    }
    return data;
};

// CREATE
const createProduct = async (data) => {
    return await Product.create(normalizeProductImages(data));
};

// GET ALL + SEARCH + FILTER + SORT
const getProducts = async (query) => {
    const { keyword, minPrice, maxPrice, category, size, color, sort, page = 1, limit = 12 } = query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, parseInt(limit, 10) || 12);

    let filter = { isDeleted: false };

    if (keyword) filter.name = { $regex: keyword, $options: "i" };

    if (category) {
        if (mongoose.Types.ObjectId.isValid(category)) {
            filter.category = category;
        } else {
            const categoryDoc = await Category.findOne({
                name: { $regex: `^${category}$`, $options: "i" }
            });
            if (!categoryDoc) return { products: [], total: 0, page: pageNumber, limit: pageLimit, pages: 0 };
            filter.category = categoryDoc._id;
        }
    }

    if (size) filter["variants.size"] = size;
    if (color) filter["variants.color"] = color;

    let products = await Product.find(filter).populate('category', 'name');

    // lọc theo price range (trong variant)
    if (minPrice || maxPrice) {
        products = products.filter((p) =>
            p.variants.some((v) => {
                return (
                    (!minPrice || v.price >= Number(minPrice)) &&
                    (!maxPrice || v.price <= Number(maxPrice))
                );
            })
        );
    }

    // sắp xếp
    if (sort === "price_asc") {
        products.sort((a, b) => {
            const priceA = Math.min(...a.variants.map((v) => v.price));
            const priceB = Math.min(...b.variants.map((v) => v.price));
            return priceA - priceB;
        });
    } else if (sort === "price_desc") {
        products.sort((a, b) => {
            const priceA = Math.min(...a.variants.map((v) => v.price));
            const priceB = Math.min(...b.variants.map((v) => v.price));
            return priceB - priceA;
        });
    } else {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = products.length;
    const start = (pageNumber - 1) * pageLimit;
    const paginatedProducts = products.slice(start, start + pageLimit);

    return {
        products: paginatedProducts,
        total,
        page: pageNumber,
        limit: pageLimit,
        pages: Math.ceil(total / pageLimit)
    };
};

// GET DETAIL
const getProductById = async (id) => {
    return await Product.findById(id).populate('category', 'name');
};

// GET EXPORT LIST
const getProductsForExport = async (query) => {
    const { category } = query;
    let filter = { isDeleted: false };
    if (category) filter.category = category;
    return await Product.find(filter).populate('category', 'name').sort({ createdAt: -1 });
};

// UPDATE
const updateProduct = async (id, data) => {
    return await Product.findByIdAndUpdate(id, normalizeProductImages(data), { new: true });
};

// DELETE (soft delete)
const deleteProduct = async (id) => {
    return await Product.findByIdAndUpdate(id, { isDeleted: true });
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    getProductsForExport,
    updateProduct,
    deleteProduct
};