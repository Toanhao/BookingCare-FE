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

const SpecialtyClinicStatistics = () => {
  const [startDate, setStartDate] = useState(getDateOffset(30));
  const [endDate, setEndDate] = useState(new Date());
  const [clinicsStats, setClinicsStats] = useState([]);
  const [specialtiesStats, setSpecialtiesStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('clinics');

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
                <BarChart data={clinicsStats} layout="vertical">
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
            </div>
          )}

          {activeTab === 'specialties' && (
            <div className="chart-card">
              <h3>So Sánh Doanh Thu Theo Chuyên Khoa</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={specialtiesStats} layout="vertical">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecialtyClinicStatistics;
