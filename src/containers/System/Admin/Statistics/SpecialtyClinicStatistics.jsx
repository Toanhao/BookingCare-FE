import React, { useState, useEffect } from 'react';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { statisticService } from '../../../../services';
import DatePicker from '../../../../components/Input/DatePicker';
import './Statistics.scss';

const getDateOffset = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d;
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value || 0);
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const SpecialtyClinicStatistics = () => {
  const [startDate, setStartDate] = useState(getDateOffset(30));
  const [endDate, setEndDate] = useState(new Date());
  const [clinicsStats, setClinicsStats] = useState([]);
  const [specialtiesStats, setSpecialtiesStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clinics');
  const [selectedItem, setSelectedItem] = useState(null); // { type: 'clinic'|'specialty', id, name }
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const getDateRange = () => {
    return { from: formatDate(startDate), to: formatDate(endDate) };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { from, to } = getDateRange();
      const params = { from, to };

      const clinicsRes = await statisticService.getClinicStats(params);
      const specialtiesRes = await statisticService.getSpecialtyStats(params);

      setClinicsStats(clinicsRes.data || []);
      setSpecialtiesStats(specialtiesRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Clear selection when switching tabs
  useEffect(() => {
    setSelectedItem(null);
    setBookingDetails([]);
    setCurrentPage(1);
  }, [activeTab]);

  const handleDateChange = (field, dateArr) => {
    if (!Array.isArray(dateArr) || dateArr.length === 0) return;
    if (field === 'startDate') setStartDate(dateArr[0]);
    if (field === 'endDate') setEndDate(dateArr[0]);
  };

  const applyFilters = () => {
    if (!startDate || !endDate) return;
    if (new Date(startDate) > new Date(endDate)) return;
    fetchData();
    // refresh details for current selection if any
    if (selectedItem) {
      fetchBookingDetails(selectedItem.type, selectedItem.id);
    }
  };

  const fetchBookingDetails = async (type, id) => {
    if (!id) return;
    setDetailsLoading(true);
    try {
      const { from, to } = getDateRange();
      const params = {
        from,
        to,
        ...(type === 'clinic' ? { clinicId: id } : {}),
        ...(type === 'specialty' ? { specialtyId: id } : {}),
        limit: 100,
        offset: 0,
      };
      const res = await statisticService.getBookingDetails(params);
      const list = res?.data?.bookings || [];
      setBookingDetails(list);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching booking details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleChartClick = (state) => {
    if (!state || !Array.isArray(state.activePayload) || state.activePayload.length === 0) return;
    const datum = state.activePayload[0]?.payload || {};
    if (activeTab === 'clinics') {
      const id = datum?.clinicId ?? datum?.id;
      const name = datum?.clinicName ?? datum?.name;
      if (!id) {
        console.warn('Missing clinic id in stats payload');
        return;
      }
      setSelectedItem({ type: 'clinic', id, name });
      fetchBookingDetails('clinic', id);
    } else {
      const id = datum?.specialtyId ?? datum?.id;
      const name = datum?.specialtyName ?? datum?.name;
      if (!id) {
        console.warn('Missing specialty id in stats payload');
        return;
      }
      setSelectedItem({ type: 'specialty', id, name });
      fetchBookingDetails('specialty', id);
    }
  };

  const getPaginatedData = () => {
    const start = (currentPage - 1) * pageSize;
    return bookingDetails.slice(start, start + pageSize);
  };

  const getTotalPages = () => {
    const total = Math.ceil((bookingDetails?.length || 0) / pageSize);
    return Math.max(total, 1);
  };

  const changePage = (newPage) => {
    const total = getTotalPages();
    if (newPage < 1 || newPage > total) return;
    setCurrentPage(newPage);
  };

  const nextPage = () => changePage(currentPage + 1);
  const prevPage = () => changePage(currentPage - 1);

  const paginatedBookingDetails = getPaginatedData();
  const totalPages = getTotalPages();
  const baseIndex = (currentPage - 1) * pageSize;

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>
          <i className="fa-solid fa-hospital"></i> Thống Kê Chuyên Khoa & Cơ Sở
        </h1>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div className="filter-group date-range">
          <label>Khoảng thời gian:</label>
          <div className="date-inputs">
            <div className="date-field">
              <span>Từ</span>
              <DatePicker
                onChange={(date) => handleDateChange('startDate', date)}
                className="form-control"
                value={startDate}
              />
            </div>
            <div className="date-field">
              <span>Đến</span>
              <DatePicker
                onChange={(date) => handleDateChange('endDate', date)}
                className="form-control"
                value={endDate}
              />
            </div>
            <button className="apply-btn" onClick={applyFilters}>
              Xem
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="comparison-section">
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'clinics' ? 'active' : ''}`}
              onClick={() => setActiveTab('clinics')}
            >
              <i className="fa-solid fa-hospital"></i> So Sánh Cơ Sở
            </button>
            <button
              className={`tab-btn ${
                activeTab === 'specialties' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('specialties')}
            >
              <i className="fa-solid fa-stethoscope"></i> So Sánh Chuyên Khoa
            </button>
          </div>

          {activeTab === 'clinics' && (
            <div className="chart-card">
              <h3>So Sánh Doanh Thu Theo Cơ Sở</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={clinicsStats} layout="vertical" onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis xAxisId="revenue" type="number" orientation="top" />
                  <XAxis
                    xAxisId="bookings"
                    type="number"
                    orientation="bottom"
                  />
                  <YAxis dataKey="clinicName" type="category" width={250} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    xAxisId="revenue"
                    dataKey="revenue"
                    fill="#8884d8"
                    name="Doanh Thu (VNĐ)"
                  />
                  <Bar
                    xAxisId="bookings"
                    dataKey="bookingCount"
                    fill="#82ca9d"
                    name="Lượt Khám"
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="hint">Nhấp vào cột để xem chi tiết lượt khám.</div>
            </div>
          )}

          {activeTab === 'specialties' && (
            <div className="chart-card">
              <h3>So Sánh Doanh Thu Theo Chuyên Khoa</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={specialtiesStats} layout="vertical" onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis xAxisId="revenue" type="number" orientation="top" />
                  <XAxis
                    xAxisId="bookings"
                    type="number"
                    orientation="bottom"
                  />
                  <YAxis dataKey="specialtyName" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    xAxisId="revenue"
                    dataKey="revenue"
                    fill="#8884d8"
                    name="Doanh Thu (VNĐ)"
                  />
                  <Bar
                    xAxisId="bookings"
                    dataKey="bookingCount"
                    fill="#82ca9d"
                    name="Lượt Khám"
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="hint">Nhấp vào cột để xem chi tiết lượt khám.</div>
            </div>
          )}

          {selectedItem && (
            <div className="table-section">
              <div className="table-header">
                <h3>
                  <i className="fa-solid fa-list"></i> Chi Tiết Các Lượt Khám —
                  {selectedItem.type === 'clinic' ? ' Cơ Sở: ' : ' Chuyên Khoa: '}
                  {selectedItem.name || formatNumber(selectedItem.id)} ({formatNumber(bookingDetails.length)} lượt)
                </h3>
                <button
                  className="apply-btn"
                  onClick={() => {
                    setSelectedItem(null);
                    setBookingDetails([]);
                    setCurrentPage(1);
                  }}
                >
                  Đóng
                </button>
              </div>

              {detailsLoading ? (
                <div className="loading">Đang tải chi tiết...</div>
              ) : (
                <>
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Bệnh Nhân</th>
                        <th>SĐT</th>
                        <th>Bác Sĩ</th>
                        <th>Chuyên Khoa</th>
                        <th>Cơ Sở</th>
                        <th>Ngày Khám</th>
                        <th>Giờ Khám</th>
                        <th>Doanh Thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingDetails.length > 0 ? (
                        paginatedBookingDetails.map((booking, index) => (
                          <tr key={booking.id || index}>
                            <td>{baseIndex + index + 1}</td>
                            <td>{booking.patientName}</td>
                            <td>{booking.patientPhone}</td>
                            <td>{booking.doctorName}</td>
                            <td>{booking.specialty}</td>
                            <td>{booking.clinic}</td>
                            <td>{formatDateTime(booking.workDate)}</td>
                            <td>{booking.timeSlot}</td>
                            <td>{formatCurrency(booking.revenue)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center' }}>
                            Không có dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className="pagination-controls">
                    <div className="pager">
                      <button
                        className="pagination-btn"
                        onClick={prevPage}
                        disabled={currentPage <= 1}
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                        <span className="btn-text">Trước</span>
                      </button>
                      <span className="page-info">
                        Trang {formatNumber(currentPage)} / {formatNumber(totalPages)}
                      </span>
                      <button
                        className="pagination-btn"
                        onClick={nextPage}
                        disabled={currentPage >= totalPages}
                      >
                        <span className="btn-text">Sau</span>
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecialtyClinicStatistics;
