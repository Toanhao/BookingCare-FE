/** @format */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './BookingModal.scss';
import { Modal } from 'reactstrap';
import ProfileDoctor from '../ProfileDoctor';
import _ from 'lodash';
import DatePicker from '../../../../components/Input/DatePicker';
import { createBooking } from '../../../../services/userService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';

const BookingModal = (props) => {
  const { isOpenModal, closeBookingClose, dataTime } = props;
  const navigate = useNavigate();
  const isLoggedIn = useSelector(
    (state) => state.user && state.user.isLoggedIn
  );
  const userInfo = useSelector((state) => state.user && state.user.userInfo);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [reason, setReason] = useState('');
  const [birthday, setBirthday] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [isShowLoading, setIsShowLoading] = useState(false);

  const doctorId = useMemo(() => {
    if (dataTime && !_.isEmpty(dataTime)) return dataTime.doctorId;
    return '';
  }, [dataTime]);

  const getActiveBookingCount = (schedule) => {
    if (!schedule || !Array.isArray(schedule.bookings)) return 0;
    return schedule.bookings.filter((b) =>
      ['PENDING', 'CONFIRMED', 'DONE'].includes(b.status)
    ).length;
  };
  const fillUserFromProps = useCallback(() => {
    if (isLoggedIn && userInfo) {
      setFullName(userInfo.fullName || '');
      setPhoneNumber(userInfo.phoneNumber || '');
      setEmail(userInfo.email || '');
      setAddress(userInfo.address || '');
      setGender(userInfo.gender || '');
      setBirthday(userInfo.birthday ? new Date(userInfo.birthday) : '');
    }
  }, [isLoggedIn, userInfo]);

  useEffect(() => {
    if (dataTime && !_.isEmpty(dataTime)) {
      setScheduleId(dataTime.id);
    }
  }, [dataTime]);

  useEffect(() => {
    if (isOpenModal) {
      if (isLoggedIn) {
        fillUserFromProps();
      } else {
        closeBookingClose?.();
        navigate('/login');
      }
    }
  }, [isOpenModal, isLoggedIn, fillUserFromProps, navigate, closeBookingClose]);

  const handleConfirmBooking = async () => {
    if (!reason || !reason.trim()) {
      toast.error('Vui lòng nhập lý do khám!');
      return;
    }

    setIsShowLoading(true);
    try {
      const res = await createBooking({
        patientId: userInfo.id,
        scheduleId,
        reason: reason.trim(),
      });
      setIsShowLoading(false);
      if (res && res.id) {
        toast.success(
          'Đặt lịch hẹn thành công! Vui lòng kiểm tra email để xác nhận.'
        );
        setReason('');
        closeBookingClose?.();
      } else {
        toast.error('Đặt lịch hẹn thất bại!');
      }
    } catch (error) {
      setIsShowLoading(false);
      const message = error.message || 'Đặt lịch hẹn thất bại!';
      toast.error(message);
    }
  };

  return (
    <div className="booking-modal-wrapper">
      {isShowLoading && (
        <div className="loading-overlay">
          <ProgressSpinner />
        </div>
      )}
      <Modal
        isOpen={isOpenModal}
        className={'booking-modal-container'}
        size="lg"
        centered={true}
      >
        <div className="booking-modal-content">
          <div className="booking-modal-header">
            <span className="left">
              <FormattedMessage id="patient.booking-modal.title" />
            </span>
            <span className="right" onClick={closeBookingClose}>
              <i className="fa-solid fa-times"></i>
            </span>
          </div>

          <div className="booking-modal-body">
            <div className="doctor-Infor">
              <ProfileDoctor
                doctorId={doctorId}
                isShowDescriptionDoctor={false}
                dataTime={dataTime}
                isShowLinkDetail={false}
                isShowPrice={true}
              />
            </div>

            {dataTime && !_.isEmpty(dataTime) && (
              <div className="queue-info">
                {(() => {
                  const maxPatient = dataTime.maxPatient;
                  const activeBookings = getActiveBookingCount(dataTime);
                  const yourNumber = maxPatient
                    ? Math.min(activeBookings + 1, maxPatient)
                    : activeBookings + 1;
                  if (!maxPatient) {
                    return (
                      <div className="queue-hint">
                        <i className="fa-solid fa-info-circle"></i>
                        <span>
                          Số thứ tự dự kiến của bạn:{' '}
                          <strong>{yourNumber}</strong>
                        </span>
                      </div>
                    );
                  }

                  if (activeBookings >= maxPatient) {
                    return (
                      <div className="queue-hint" style={{ color: '#dc3545' }}>
                        <i className="fa-solid fa-exclamation-circle"></i>
                        <span>
                          <strong>
                            Lịch khám này đã đầy ({activeBookings}/{maxPatient}
                            ).
                          </strong>{' '}
                          Vui lòng chọn giờ hoặc ngày khác.
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div className="queue-hint">
                      <i className="fa-solid fa-info-circle"></i>
                      <span>
                        Hiện có{' '}
                        <strong>
                          {activeBookings}/{maxPatient}
                        </strong>{' '}
                        người đã đăng ký. Số thứ tự dự kiến của bạn:{' '}
                        <strong>
                          {yourNumber}/{maxPatient}
                        </strong>
                        .
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="row">
              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="patient.booking-modal.fullName" />
                </label>
                <input className="form-control" value={fullName} readOnly />
              </div>

              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="patient.booking-modal.phoneNumber" />
                </label>
                <input className="form-control" value={phoneNumber} readOnly />
              </div>

              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="patient.booking-modal.email" />
                </label>
                <input className="form-control" value={email} readOnly />
              </div>

              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="patient.booking-modal.address" />
                </label>
                <input className="form-control" value={address} readOnly />
              </div>

              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="patient.booking-modal.birthday" />
                </label>
                <DatePicker
                  className="form-control"
                  value={birthday ? new Date(birthday) : null}
                  disabled={true}
                />
              </div>

              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="patient.booking-modal.gender" />
                </label>
                <input className="form-control" value={gender} readOnly />
              </div>

              <div className="col-12 form-group">
                <label>
                  <FormattedMessage id="patient.booking-modal.reason" />
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Nhập lý do khám bệnh..."
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="booking-modal-footer">
            <button
              className="bnt-booking-confirm"
              onClick={handleConfirmBooking}
            >
              <FormattedMessage id="patient.booking-modal.btnConfirm" />
            </button>
            <button className="bnt-booking-cancel" onClick={closeBookingClose}>
              <FormattedMessage id="patient.booking-modal.btnCancel" />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingModal;
