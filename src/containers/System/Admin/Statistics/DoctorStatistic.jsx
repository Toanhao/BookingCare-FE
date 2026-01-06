import React, { useState, useEffect } from 'react';
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

const DoctorStatistic = () => {
  const [clinicId, setClinicId] = useState(null);
  const [specialtyId, setSpecialtyId] = useState(null);
  const [startDate, setStartDate] = useState(getDateOffset(30));
  const [endDate, setEndDate] = useState(new Date());
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [specialties, setSpecialties] = useState([]);

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

      const doctorsRes = await statisticService.getTopDoctors(params);

      setTopDoctors(doctorsRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'clinicId') setClinicId(value);
    if (filterName === 'specialtyId') setSpecialtyId(value);
  };

  useEffect(() => {
    fetchData();
  }, [clinicId, specialtyId]);

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
          <i className="fa-solid fa-user-md"></i> Thống Kê Bác Sĩ
        </h1>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
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
        <div className="table-section">
          <h3>
            <i className="fa-solid fa-user-md"></i> Các bác sĩ nổi bật
          </h3>
          <table className="stats-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên Bác Sĩ</th>
                <th>Chuyên Khoa</th>
                <th>Cơ Sở</th>
                <th>Lượt Khám</th>
                <th>Doanh Thu</th>
              </tr>
            </thead>
            <tbody>
              {topDoctors.length > 0 ? (
                topDoctors.map((doctor, index) => (
                  <tr key={doctor.doctorId}>
                    <td>{index + 1}</td>
                    <td>{doctor.doctorName}</td>
                    <td>{doctor.specialty}</td>
                    <td>{doctor.clinic}</td>
                    <td>{formatNumber(doctor.bookingCount)}</td>
                    <td>{formatCurrency(doctor.revenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorStatistic;
