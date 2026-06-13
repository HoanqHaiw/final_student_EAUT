const dashboardService = require("../services/dashboard.service");

const overview = async (req, res) => {
    const data = await dashboardService.getOverview();
    res.json(data);
};

const topProducts = async (req, res) => {
    const data = await dashboardService.getTopProducts();
    res.json(data);
};

const exportRevenue = async (req, res) => {
    const workbook = await dashboardService.exportRevenueExcel();
    res.setHeader("Content-Disposition", "attachment; filename=revenue.xlsx");
    await workbook.xlsx.write(res);
    res.end();
};

module.exports = {
    overview,
    topProducts,
    exportRevenue
};