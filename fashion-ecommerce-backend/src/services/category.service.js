const Category = require("../models/category.model");

const createCategory = async (data) => {
    return await Category.create(data);
};

const getCategories = async () => {
    return await Category.find({ isActive: true }).sort({ name: 1 });
};

const getCategoryById = async (id) => {
    const cat = await Category.findById(id);
    if (!cat) throw new Error("Category not found");
    return cat;
};

const updateCategory = async (id, data) => {
    const cat = await Category.findByIdAndUpdate(id, data, { new: true });
    if (!cat) throw new Error("Category not found");
    return cat;
};

const deleteCategory = async (id) => {
    const cat = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!cat) throw new Error("Category not found");
    return cat;
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};