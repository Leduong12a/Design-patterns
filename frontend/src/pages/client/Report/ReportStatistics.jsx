import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import reportService from '../../../services/client/reportService';
import { toast } from 'react-toastify';
import '../../../styles/client/pages/reportStatistics.css';

const ReportStatistics = () => {
  const navigate = useNavigate();
  const [filterCriteria, setFilterCriteria] = useState('Toàn thời gian');
  const [filterMonth, setFilterMonth] = useState('1');
  const [filterWeek, setFilterWeek] = useState('1');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCVs: 0,
    totalEmailsSent: 0,
    responseRate: '0%',
    chartData: []
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('');

  const fetchStatistics = useCallback(async () => {
    let filterDate = '';
    if (filterCriteria === 'Theo tháng') filterDate = filterMonth;
    else if (filterCriteria === 'Theo Tuần') filterDate = filterWeek;

    try {
      setLoading(true);
      const response = await reportService.getStatistics(filterCriteria, filterDate);
      if (response && response.success) {
        setStats(response.data);

        if (filterCriteria === 'Theo tháng' && response.data.totalCVs === 0 && response.data.totalEmailsSent === 0) {
          toast.info('Không có dữ liệu thống kê!', {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
      toast.error('Lỗi khi tải dữ liệu thống kê!');
    } finally {
      setLoading(false);
    }
  }, [filterCriteria, filterMonth, filterWeek]);

  React.useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  React.useEffect(() => {
    const handleStorageChange = (e) => {
      
      if (e.key === 'hr-agent-sync') {
        try {
          const syncData = JSON.parse(e.newValue);
          if (syncData && syncData.type === 'candidate-status-changed') {
            console.log('Detected status change from another tab, updating stats:', syncData);
            
            setTimeout(() => {
              fetchStatistics();
            }, 1000);
          }
        } catch (err) {
          console.error('Error parsing sync data:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    console.log('Storage listener registered for cross-tab sync');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchStatistics]);

  React.useEffect(() => {
    const handleCustomEvent = (e) => {
      console.log('Detected status change from custom event, updating stats:', e.detail);
      
      setTimeout(() => {
        fetchStatistics();
      }, 1000);
    };

    window.addEventListener('candidate-status-changed', handleCustomEvent);
    console.log('Custom event listener registered for same-tab sync');

    return () => {
      window.removeEventListener('candidate-status-changed', handleCustomEvent);
    };
  }, [fetchStatistics]);

  const handleBack = () => {
    navigate(-1);
  };

  const exportToExcel = () => {
    
    const summaryData = [
      { 'Chỉ số': 'Số lượng CV đã tiếp nhận', 'Giá trị': stats.totalCVs },
      { 'Chỉ số': 'Số lịch phỏng vấn đã tạo', 'Giá trị': stats.totalEmailsSent },
      { 'Chỉ số': 'Tỷ lệ phỏng vấn hoàn thành', 'Giá trị': stats.responseRate },
      { 'Chỉ số': '', 'Giá trị': '' } 
    ];

    const chartDataFormatted = stats.chartData.map(item => ({
      'Thời gian': item.name,
      'CV tiếp nhận': item.blueValue,
      'Lịch phỏng vấn': item.orangeValue,
      'Hoàn thành': item.grayValue
    }));

    const finalData = [...summaryData, ...chartDataFormatted];

    const ws = XLSX.utils.json_to_sheet(finalData);

    ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Thong_Ke");

    XLSX.writeFile(wb, `Bao_Cao_Thong_Ke_${filterCriteria.replace(' ', '_')}.xlsx`);
  };

  const exportToPDF = async () => {
    const reportElement = document.getElementById("report-client-content");
    if (!reportElement) {
      toast.error("Không tìm thấy nội dung để xuất PDF!");
      return;
    }

    try {
      toast.info("Đang xử lý PDF, vui lòng chờ...", { autoClose: 2000 });
      
      const canvas = await html2canvas(reportElement, { scale: 2, backgroundColor: "#f8f9fa" });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bao_Cao_Thong_Ke_${filterCriteria.replace(' ', '_')}.pdf`);
      toast.success("Xuất PDF thành công!");
    } catch (error) {
      console.error("Lỗi xuất PDF: ", error);
      toast.error("Đã xảy ra lỗi khi tạo file PDF.");
    }
  };

  const handleExport = () => {
    if (exportFormat === 'excel') {
      exportToExcel();
    } else {
      exportToPDF();
    }
    setShowExportModal(false);
  };
  
  return (
    <div className="report-page-container">
      {}
      <div className="report-header">
        <a href="#!" className="report-back-btn" onClick={(e) => { e.preventDefault(); handleBack(); }}>

          &lt;- Quay lại
        </a>
        <h1 className="report-title">Báo cáo &amp; Thống kê</h1>
      </div>

      {}
      <div id="report-client-content" className="report-content-wrapper">
        {}
        <div className="report-left-col">
          {}
          <div className="report-filters-card mb-4">
            <div className="filter-row">
              <label className="filter-label">Tiêu chí lọc :</label>
              <select
                className="filter-input"
                value={filterCriteria}
                onChange={(e) => setFilterCriteria(e.target.value)}
              >
                <option value="Toàn thời gian">Toàn thời gian</option>
                <option value="Theo tháng">Theo tháng</option>
                <option value="Theo Tuần">Theo Tuần</option>
              </select>
            </div>

            {}
            {filterCriteria === 'Theo tháng' && (
              <div className="filter-row">
                <label className="filter-label">Thời gian :</label>
                <select
                  className="filter-input"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={String(m)}>Tháng {m}</option>
                  ))}
                </select>
              </div>
            )}

            {}
            {filterCriteria === 'Theo Tuần' && (
              <div className="filter-row">
                <label className="filter-label">Thời gian :</label>
                <select
                  className="filter-input"
                  value={filterWeek}
                  onChange={(e) => setFilterWeek(e.target.value)}
                >
                  {Array.from({ length: 52 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={String(w)}>Tuần {w}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {}
          <div className="report-stats-card">
            {loading ? (
              <div className="text-center py-4">Đang tải...</div>
            ) : (
              <>
                <div className="stat-row">
                  <span className="stat-label">Số lượng CV đã quét/thu nhập:</span>
                  <span className="stat-value">{stats.totalCVs}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Số lượng email đã gửi:</span>
                  <span className="stat-value">{stats.totalEmailsSent}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Tỷ lệ phản hồi:</span>
                  <span className="stat-value">{stats.responseRate}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {}
        <div className="report-right-col">
          <div className="report-chart-card">
            <h5 className="chart-title mb-4">Biểu đồ thống kê CV</h5>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={350}>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <span>Đang tải biểu đồ...</span>
                  </div>
                ) : (
                  <BarChart
                    data={stats.chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#6c757d' }} axisLine={{ stroke: '#ced4da' }} tickLine={false} />
                    <YAxis tick={{ fill: '#6c757d' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8f9fa' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                    <Bar dataKey="blueValue" name="CV tiếp nhận" fill="#0d6efd" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      <LabelList dataKey="blueValue" position="top" fill="#6c757d" fontSize={12} fontWeight={600} />
                    </Bar>
                    <Bar dataKey="orangeValue" name="Lịch phỏng vấn" fill="#fd7e14" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      <LabelList dataKey="orangeValue" position="top" fill="#6c757d" fontSize={12} fontWeight={600} />
                    </Bar>
                    <Bar dataKey="grayValue" name="Hoàn thành" fill="#6c757d" radius={[4, 4, 0, 0]} maxBarSize={50}>
                      <LabelList dataKey="grayValue" position="top" fill="#6c757d" fontSize={12} fontWeight={600} />
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="report-footer">
        <button
          className="btn btn-export-data"
          onClick={() => { setExportFormat(''); setShowExportModal(true); }}
        >
          Xuất dữ liệu
        </button>
      </div>

      {}
      {showExportModal && (
        <div className="export-modal-overlay">
          <div className="export-modal">
            {}
            <div className="export-modal-header">
              <h5 className="export-modal-title">Xuất dữ liệu thống kê</h5>
              <button
                className="export-modal-close"
                onClick={() => setShowExportModal(false)}
                title="Đóng"
              >
                &times;
              </button>
            </div>

            {}
            <div className="export-modal-body">
              <div className="export-modal-row">
                <label className="export-modal-label">Chọn định dạng :</label>
                <select
                  className="export-modal-select"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <option value="" disabled></option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>
            </div>

            {}
            <div className="export-modal-footer">
              <button
                className="export-modal-btn export-modal-btn--cancel"
                onClick={() => { setExportFormat(''); setShowExportModal(false); }}
              >
                Hủy
              </button>
              <button
                className="export-modal-btn export-modal-btn--download"
                onClick={handleExport}
                disabled={!exportFormat}
                style={{ opacity: exportFormat ? 1 : 0.5, cursor: exportFormat ? 'pointer' : 'not-allowed' }}
              >
                Tải xuống
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportStatistics;
