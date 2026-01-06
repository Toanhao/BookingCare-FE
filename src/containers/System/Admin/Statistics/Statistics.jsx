import React, { useState, useEffect } from 'react';
import {
  Line,
  Area,
  ComposedChart,
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
  }).format(value);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const mergeTimeSeriesData = (bookings, revenue) => {
  const map = {};

  bookings.forEach((item) => {
    if (!map[item.date]) map[item.date] = { date: item.date };
    map[item.date].bookings = parseInt(item.count) || 0;
  });

  revenue.forEach((item) => {
    if (!map[item.date]) map[item.date] = { date: item.date };
    map[item.date].revenue = parseFloat(item.revenue) || 0;
  });

  return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date));
};

const Statistics = () => {
  const [clinicId, setClinicId] = useState(null);
  const [specialtyId, setSpecialtyId] = useState(null);
  const [startDate, setStartDate] = useState(getDateOffset(30));
  const [endDate, setEndDate] = useState(new Date());
  const [kpi, setKpi] = useState({ totalBookings: 0, totalRevenue: 0 });
  const [timeSeries, setTimeSeries] = useState([]);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchFilterOptions = async () => {
    try {
      const clinicsRes = await statisticService.getClinics();
      const specialtiesRes = await statisticService.getSpecialties();

      setClinics(clinicsRes.data || []);
      setSpecialties(specialtiesRes.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const getDateRange = () => {
    return { from: formatDate(startDate), to: formatDate(endDate) };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { from, to } = getDateRange();

      const params = {
        from,
        to,
        ...(clinicId && { clinicId }),
        ...(specialtyId && { specialtyId }),
      };

      const kpiRes = await statisticService.getDashboardKPI(params);
      const kpiData = kpiRes.data || kpi;

      const timeSeriesRes = await statisticService.getTimeSeries(params);

      const bookingsData = timeSeriesRes.data?.bookings || [];
      const revenueData = timeSeriesRes.data?.revenue || [];
      const mergedTimeSeries = mergeTimeSeriesData(bookingsData, revenueData);

      let bookingDetailsList = [];
      try {
        const bookingDetailsRes = await statisticService.getBookingDetails({
          ...params,
          limit: 50,
          offset: 0,
        });
        bookingDetailsList = bookingDetailsRes.data?.bookings || [];
      } catch (err) {
        console.error('Error fetching booking details:', err);
      }

      setKpi(kpiData);
      setTimeSeries(mergedTimeSeries);
      setBookingDetails(bookingDetailsList);
      setLoading(false);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [clinicId, specialtyId]);

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

  const nextPage = () => {
    changePage(currentPage + 1);
  };

  const prevPage = () => {
    changePage(currentPage - 1);
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'clinicId') setClinicId(value);
    if (filterName === 'specialtyId') setSpecialtyId(value);
  };

  const handleDateChange = (field, dateArr) => {
    if (!Array.isArray(dateArr) || dateArr.length === 0) return;
    if (field === 'startDate') setStartDate(dateArr[0]);
    if (field === 'endDate') setEndDate(dateArr[0]);
  };

  const applyFilters = () => {
    if (!startDate || !endDate) return;
    if (new Date(startDate) > new Date(endDate)) return;
    fetchData();
  };

  const paginatedBookingDetails = getPaginatedData();
  const totalPages = getTotalPages();
  const baseIndex = (currentPage - 1) * pageSize;

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>
          <i className="fa-solid fa-chart-bar"></i> Dashboard Thống Kê Khám Bệnh
        </h1>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar sticky">
        <div className="filter-group">
          <label>Cơ sở y tế:</label>
          <select
            value={clinicId || ''}
            onChange={(e) =>
              handleFilterChange(
                'clinicId',
                e.target.value ? parseInt(e.target.value) : null
              )
            }
          >
            <option value="">Tất cả cơ sở</option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Chuyên khoa:</label>
          <select
            value={specialtyId || ''}
            onChange={(e) =>
              handleFilterChange(
                'specialtyId',
                e.target.value ? parseInt(e.target.value) : null
              )
            }
          >
            <option value="">Tất cả chuyên khoa</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
        </div>

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
        <>
          {/* KPI CARDS (theo khoảng thời gian lọc) */}
          <div className="kpi-section">
            <div className="kpi-card">
              <div className="kpi-icon">
                <i className="fa-solid fa-clipboard-list"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Tổng Lượt Khám</div>
                <div className="kpi-value">
                  {formatNumber(kpi.totalBookings)}
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <i className="fa-solid fa-money-bill-wave"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Tổng Doanh Thu</div>
                <div className="kpi-value">
                  {formatCurrency(kpi.totalRevenue)}
                </div>
              </div>
            </div>
          </div>

          {/* CHARTS */}
          <div className="charts-section">
            <div className="chart-card">
              <h3>
                <i className="fa-solid fa-chart-line"></i> Lượt Khám & Doanh Thu
                Theo Ngày
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={timeSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    yAxisId="left"
                    label={{
                      value: 'Lượt khám',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: 'Doanh thu (VNĐ)',
                      angle: 90,
                      position: 'insideRight',
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#8884d8"
                    name="Lượt khám"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    fill="#82ca9d"
                    stroke="#82ca9d"
                    name="Doanh thu"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BOOKING DETAILS TABLE */}
          <div className="table-section">
            <h3>
              <i className="fa-solid fa-list"></i> Chi Tiết Các Lượt Khám (
              {formatNumber(bookingDetails.length)} lượt)
            </h3>
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
                    <tr key={booking.id}>
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
            {/* Pagination Controls */}
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
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;
