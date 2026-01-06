/** @format */

import React from 'react';
import './ExaminationDetailModal.scss';

const formatCurrency = (amount) => {
  return amount
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount)
    : '---';
};

const getDisplayValue = (value, fallback = '---') => value || fallback;

const renderPrescriptionItems = (bookingDetail) => {
  const items = bookingDetail?.medicalRecord?.prescription?.items;

  if (!items || items.length === 0) {
    return <p className="no-data">Không có dữ liệu</p>;
  }

  return (
    <div className="table-responsive">
      <table className="detail-table">
        <thead>
          <tr>
            <th>Tên thuốc</th>
            <th>Số lượng</th>
            <th>Cách dùng</th>
            <th>Số ngày</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.medicine?.name || 'N/A'}</td>
              <td>{item.quantity}</td>
              <td>{item.usage}</td>
              <td>{item.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ExaminationDetailModal = ({ isOpen, onClose, bookingDetail }) => {
  if (!isOpen || !bookingDetail) return null;

  const patient = bookingDetail?.patient?.user;
  const medicalRecord = bookingDetail?.medicalRecord;
  const prescription = medicalRecord?.prescription;
  const bill = medicalRecord?.bill;
  const schedule = bookingDetail?.schedule;
  const doctor = schedule?.doctor?.user;
  const workDate = schedule?.workDate
    ? new Date(schedule.workDate).toLocaleDateString('vi-VN')
    : '---';

  return (
    <div className="exam-detail-overlay">
      <div className="exam-detail-modal">
        <div className="edm-header">
          <h2>Chi tiết khám bệnh</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="edm-body">
          {/* Thông tin bệnh nhân & lịch khám */}
          <div className="section">
            <h3 className="section-title">
              <i className="fa-solid fa-user-circle"></i> Thông tin khám
            </h3>
            <table className="info-table">
              <tbody>
                <tr>
                  <td className="label">Họ tên bệnh nhân</td>
                  <td className="value">
                    {getDisplayValue(patient?.fullName)}
                  </td>
                  <td className="label">Ngày khám</td>
                  <td className="value">{workDate}</td>
                </tr>
                <tr>
                  <td className="label">SĐT</td>
                  <td className="value">
                    {getDisplayValue(patient?.phoneNumber)}
                  </td>
                  <td className="label">Giờ khám</td>
                  <td className="value">
                    {getDisplayValue(schedule?.timeSlot?.label)}
                  </td>
                </tr>
                <tr>
                  <td className="label">Email</td>
                  <td className="value">{getDisplayValue(patient?.email)}</td>
                  <td className="label">Lý do khám</td>
                  <td className="value">
                    {getDisplayValue(bookingDetail?.reason)}
                  </td>
                </tr>
                <tr>
                  <td className="label">Giới tính</td>
                  <td className="value">{getDisplayValue(patient?.gender)}</td>
                  <td className="label">Bác sĩ</td>
                  <td className="value">{getDisplayValue(doctor?.fullName)}</td>
                </tr>
                <tr>
                  <td className="label">Địa chỉ</td>
                  <td className="value">{getDisplayValue(patient?.address)}</td>
                  <td className="label">Chuyên khoa</td>
                  <td className="value">
                    {getDisplayValue(schedule?.doctor?.specialty?.name)}
                  </td>
                </tr>
                <tr>
                  <td className="label">Phòng khám</td>
                  <td className="value">
                    {getDisplayValue(schedule?.doctor?.clinic?.name)}
                  </td>
                  <td className="label">Phí khám</td>
                  <td className="value">
                    {formatCurrency(schedule?.doctor?.fee)}
                  </td>
                </tr>
                <tr>
                  <td className="label">STT</td>
                  <td className="value">
                    {getDisplayValue(bookingDetail?.queueNumber)}
                  </td>
                  <td className="label">Trạng thái</td>
                  <td className="value">
                    <span
                      className={`status-badge status-${bookingDetail?.status?.toLowerCase()}`}
                    >
                      {getDisplayValue(bookingDetail?.status)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Hồ sơ bệnh án */}
          {medicalRecord && (
            <div className="section">
              <h3 className="section-title">
                <i className="fa-solid fa-file-medical"></i> Hồ sơ bệnh án
              </h3>
              <div className="record-box">
                <div className="record-field">
                  <label>Chẩn đoán</label>
                  <p>{getDisplayValue(medicalRecord.diagnosis)}</p>
                </div>
                <div className="record-field">
                  <label>Kết luận</label>
                  <p>{getDisplayValue(medicalRecord.conclusion)}</p>
                </div>
                <div className="record-field">
                  <label>Ghi chú</label>
                  <p>{getDisplayValue(medicalRecord.note)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Đơn thuốc */}
          {prescription && (
            <div className="section">
              <h3 className="section-title">
                <i className="fa-solid fa-prescription-bottle"></i> Đơn thuốc
              </h3>
              <div className="prescription-items">
                {renderPrescriptionItems(bookingDetail)}
              </div>
              {prescription.note && (
                <div className="prescription-note">
                  <strong>Ghi chú:</strong> {prescription.note}
                </div>
              )}
            </div>
          )}

          {/* Hóa đơn */}
          {bill && (
            <div className="section">
              <h3 className="section-title">
                <i className="fa-solid fa-receipt"></i> Hóa đơn
              </h3>
              <div className="bill-box">
                <div className="bill-item">
                  <span>Phí khám (không bao gồm thuốc)</span>
                  <strong>{formatCurrency(bill.total)}</strong>
                </div>
                <div className="bill-item">
                  <span>Phương thức thanh toán</span>
                  <strong>{getDisplayValue(bill.method)}</strong>
                </div>
                <div className="bill-item">
                  <span>Trạng thái</span>
                  <strong>
                    <span
                      className={`status-badge status-${bill.status?.toLowerCase()}`}
                    >
                      {getDisplayValue(bill.status)}
                    </span>
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="edm-footer">
          <button className="close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExaminationDetailModal;
