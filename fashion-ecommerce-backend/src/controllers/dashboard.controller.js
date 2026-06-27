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
    const { month, year } = req.query;
    const workbook = await dashboardService.exportRevenueExcel({
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null
    });
    const label = month && year ? `thang${month}-${year}` : year ? `nam${year}` : 'tat-ca';
    res.setHeader("Content-Disposition", `attachment; filename=bao-cao-doanh-thu-${label}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
};

module.exports = {
    overview,
    topProducts,
    exportRevenue
};