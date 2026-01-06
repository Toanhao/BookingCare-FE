/** @format */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './BookingHistoryModal.scss';
import { Modal } from 'reactstrap';
import {
  getPatientBookingHistory,
  cancelPatientBooking,
  getBookingDetails,
} from '../../../services/userService';
import ExaminationDetailModal from '../../System/Doctor/ExaminationDetailModal';
import moment from 'moment';
import { toast } from 'react-toastify';

const BookingHistoryModal = ({ isOpen, closeModal }) => {
  const userInfo = useSelector((state) => state.user.userInfo);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  const fetchBookingHistory = async () => {
    if (!userInfo || !userInfo.id) {
      return;
    }

    setIsLoading(true);
    try {
      let res = await getPatientBookingHistory(userInfo.id);
      if (res) {
        setBookingHistory(res);
        filterBookings('upcoming', res);
      } else {
        toast.error('Lỗi khi tải lịch sử khám!');
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      toast.error('Lỗi khi tải lịch sử khám!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBookingHistory();
    }
  }, [isOpen]);

  const filterBookings = (tab, history = bookingHistory) => {
    let filtered = [];

    if (tab === 'upcoming') {
      filtered = history.filter((booking) => booking.status === 'CONFIRMED');
    } else if (tab === 'completed') {
      filtered = history.filter((booking) => booking.status === 'DONE');
    } else if (tab === 'cancelled') {
      filtered = history.filter((booking) => booking.status === 'CANCELLED');
    }

    filtered.sort((a, b) => {
      const dateA = moment(a.date, 'DD/MM/YYYY');
      const dateB = moment(b.date, 'DD/MM/YYYY');
      return dateB - dateA;
    });

    setFilteredBookings(filtered);
    setActiveTab(tab);
  };

  const handleCancelBooking = (booking) => {
    setShowConfirmCancel(true);
    setSelectedBooking(booking);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking || !userInfo) return;

    try {
      let res = await cancelPatientBooking({
        bookingId: selectedBooking.id,
        patientId: userInfo.id,
      });

      if (res && res.errorCode === 0) {
        toast.success('Hủy lịch khám thành công!');
        setShowConfirmCancel(false);
        setSelectedBooking(null);
        await fetchBookingHistory();
      } else {
        toast.error(res.errMessage || 'Lỗi khi hủy lịch khám!');
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      toast.error('Lỗi khi hủy lịch khám!');
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmCancel(false);
    setSelectedBooking(null);
  };

  const handleViewDetails = async (booking) => {
    try {
      let res = await getBookingDetails(booking.id);
      if (res && res.id) {
        setShowDetailModal(true);
        setSelectedBookingDetail(res);
      } else {
        toast.error('Lỗi khi tải chi tiết khám!');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Lỗi khi tải chi tiết khám!');
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBookingDetail(null);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Chờ xác nhận email', className: 'status-pending' };
      case 'CONFIRMED':
        return { text: 'Chờ khám', className: 'status-confirmed' };
      case 'DONE':
        return { text: 'Đã khám xong', className: 'status-completed' };
      case 'CANCELLED':
        return { text: 'Đã hủy', className: 'status-cancelled' };
      default:
        return { text: 'Không xác định', className: '' };
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        className="booking-history-modal"
        size="lg"
        centered
      >
        <div className="modal-header-custom">
          <h3>
            <i className="fa-solid fa-history"></i> Lịch sử khám bệnh
          </h3>
          <button className="close-btn" onClick={closeModal}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => filterBookings('upcoming')}
          >
            <i className="fa-solid fa-calendar-check"></i> Chưa khám
          </button>
          <button
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => filterBookings('completed')}
          >
            <i className="fa-solid fa-check-circle"></i> Đã khám
          </button>
          <button
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => filterBookings('cancelled')}
          >
            <i className="fa-solid fa-times-circle"></i> Đã hủy
          </button>
        </div>

        <div className="modal-body-custom">
          {isLoading ? (
            <div className="loading-container">
              <i className="fa-solid fa-spinner fa-spin"></i> Đang tải...
            </div>
          ) : filteredBookings && filteredBookings.length > 0 ? (
            <div className="booking-list">
              {filteredBookings.map((booking, index) => {
                const status = getStatusText(booking.status);
                const canCancel =
                  activeTab === 'upcoming' && booking.status === 'CONFIRMED';

                return (
                  <div key={index} className="booking-item">
                    <div className="booking-header">
                      <div className="booking-date">
                        <i className="fa-solid fa-calendar"></i>
                        <strong>
                          {booking.schedule && booking.schedule.workDate
                            ? moment(booking.schedule.workDate).format(
                                'DD/MM/YYYY'
                              )
                            : 'Chưa xác định'}
                        </strong>
                      </div>
                      <span className={`booking-status ${status.className}`}>
                        {status.text}
                      </span>
                    </div>

                    <div className="booking-details">
                      <div className="detail-row">
                        <i className="fa-solid fa-user-md"></i>
                        <span>
                          <strong>Bác sĩ:</strong>{' '}
                          {booking.schedule &&
                          booking.schedule.doctor &&
                          booking.schedule.doctor.user
                            ? booking.schedule.doctor.user.fullName
                            : 'N/A'}
                        </span>
                      </div>

                      {booking.schedule && booking.schedule.timeSlot && (
                        <div className="detail-row">
                          <i className="fa-solid fa-clock"></i>
                          <span>
                            <strong>Thời gian:</strong>{' '}
                            {booking.schedule.timeSlot.label}
                          </span>
                        </div>
                      )}

                      {booking.queueNumber &&
                        booking.schedule &&
                        booking.schedule.maxPatient && (
                          <div className="detail-row">
                            <i className="fa-solid fa-sort-numeric-up"></i>
                            <span>
                              <strong>Số thứ tự khám trong ca:</strong> {booking.queueNumber}/
                              {booking.schedule.maxPatient}
                            </span>
                          </div>
                        )}

                      {activeTab === 'completed' &&
                        booking.schedule &&
                        booking.schedule.doctor &&
                        booking.schedule.doctor.fee !== undefined && (
                          <div className="detail-row">
                            <i className="fa-solid fa-money-bill"></i>
                            <span>
                              <strong>Giá khám:</strong>{' '}
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(
                                Number(booking.schedule.doctor.fee) || 0
                              )}
                            </span>
                          </div>
                        )}

                      {booking.schedule &&
                        booking.schedule.doctor &&
                        booking.schedule.doctor.specialty && (
                          <div className="detail-row">
                            <i className="fa-solid fa-stethoscope"></i>
                            <span>
                              <strong>Chuyên khoa:</strong>{' '}
                              {booking.schedule.doctor.specialty.name}
                            </span>
                          </div>
                        )}

                      {booking.schedule &&
                        booking.schedule.doctor &&
                        booking.schedule.doctor.clinic && (
                          <div className="detail-row">
                            <i className="fa-solid fa-hospital"></i>
                            <span>
                              <strong>Phòng khám:</strong>{' '}
                              {booking.schedule.doctor.clinic.name}
                            </span>
                          </div>
                        )}
                    </div>

                    {canCancel && (
                      <div className="booking-actions">
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancelBooking(booking)}
                        >
                          <i className="fa-solid fa-times"></i> Hủy lịch khám
                        </button>
                      </div>
                    )}

                    {activeTab === 'completed' && (
                      <div className="booking-actions">
                        <button
                          className="detail-btn"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <i className="fa-solid fa-eye"></i> Xem chi tiết
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-inbox"></i>
              <p>Không có lịch khám nào</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmCancel}
        className="confirm-cancel-modal"
        centered
      >
        <div className="modal-header">
          <h5 className="modal-title">Xác nhận hủy lịch</h5>
          <button type="button" className="close" onClick={closeConfirmModal}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          Bạn có chắc chắn muốn hủy lịch khám này không?
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeConfirmModal}
          >
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={confirmCancelBooking}
          >
            Hủy lịch khám
          </button>
        </div>
      </Modal>

      <ExaminationDetailModal
        isOpen={showDetailModal}
        onClose={closeDetailModal}
        bookingDetail={selectedBookingDetail}
      />
    </>
  );
};

export default BookingHistoryModal;
