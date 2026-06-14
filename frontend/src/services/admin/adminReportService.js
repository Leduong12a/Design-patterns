import API from "./index.js";

const adminReportService = {
  
  getSystemStatistics: async (filterCriteria, filterDate, hrId = null) => {
    try {
      const params = { filterCriteria, filterDate };
      if (hrId) params.hrId = hrId;

      const res = await API.get("/admin/report/statistics", { params });

      if (!res.success) {
        throw new Error(res.message || 'Không thể lấy dữ liệu thống kê');
      }

      return res;
    } catch (error) {
      console.error("❌ Error getting system statistics:", error.message);
      throw error;
    }
  },

  getAllHRs: async () => {
    try {
      const res = await API.get("/admin/report/users");

      if (!res.success) {
        throw new Error(res.message || 'Không thể lấy danh sách HR');
      }

      return res;
    } catch (error) {
      console.error("❌ Error getting HRs list:", error.message);
      throw error;
    }
  },

  exportStatistics: async (filterCriteria, filterDate, format = 'pdf') => {
    try {
      
      if (!['pdf', 'excel'].includes(format)) {
        throw new Error('Định dạng không hợp lệ. Chỉ hỗ trợ: pdf, excel');
      }

      const params = { filterCriteria, filterDate, format };
      const res = await API.get("/admin/report/export", { params });

      if (!res.success) {
        throw new Error(res.message || 'Không thể xuất dữ liệu');
      }

      return res;
    } catch (error) {
      console.error("❌ Error exporting statistics:", error.message);
      throw error;
    }
  }
};

export default adminReportService;
