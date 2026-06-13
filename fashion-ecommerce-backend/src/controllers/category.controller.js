const categoryService = require("../services/category.service");

const createCategory = async (req, res) => {
    try {
        const cat = await categoryService.createCategory(req.body);
        res.status(201).json(cat);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getCategories = async (req, res) => {
    const cats = await categoryService.getCategories();
    res.json(cats);
};

const getCategoryById = async (req, res) => {
    try {
        const cat = await categoryService.getCategoryById(req.params.id);
        res.json(cat);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const cat = await categoryService.updateCategory(req.params.id, req.body);
        res.json(cat);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};