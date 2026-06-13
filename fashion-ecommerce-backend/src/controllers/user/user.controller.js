const userService = require("../../services/user.service");

const getAllUsers = async (req, res) => {
    const users = await userService.getAllUsers(req.query);
    res.json(users);
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

const toggleBlockUser = async (req, res) => {
    try {
        const result = await userService.toggleBlockUser(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = { getAllUsers, getUserById, toggleBlockUser, updateUser, deleteUser };