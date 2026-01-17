/** @format */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import './QuickBookingModal.scss';
import { Modal } from 'reactstrap';
import DatePicker from '../../../../components/Input/DatePicker';
import { LANGUAGES } from '../../../../utils';
import Select from 'react-select';
import {
  getAllSpecialty,
  getAllClinic,
  getDoctorsFiltered,
  getScheduleDoctorByDate,
  createBooking,
} from '../../../../services/userService';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const QuickBookingModal = ({ isOpenModal, closeModal }) => {
  const navigate = useNavigate();
  const language = useSelector((state) => state.app.language);
  const isLoggedIn = useSelector(
    (state) => state.user && state.user.isLoggedIn
  );
  const userInfo = useSelector((state) => state.user && state.user.userInfo);

  const [currentStep, setCurrentStep] = useState(1);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => getToday());
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isShowLoading, setIsShowLoading] = useState(false);

  const fillUserFromProps = useCallback(() => {
    if (isLoggedIn && userInfo) {
      const userPhone =
        userInfo.phoneNumber || userInfo.phonenumber || userInfo.phone || '';
      setFullName(userInfo.fullName || '');
      setPhoneNumber(userPhone);
      setEmail(userInfo.email || '');
      setAddress(userInfo.address || '');
      setBirthday(userInfo.birthday ? new Date(userInfo.birthday) : '');
    }
  }, [isLoggedIn, userInfo]);

  const loadSpecialties = useCallback(async () => {
    try {
      const res = await getAllSpecialty();
      if (res && res.errCode === 0) {
        const specialtyOptions = res.data.map((item) => ({
          value: item.id,
          label: item.name,
          data: item,
        }));
        setSpecialties(specialtyOptions);
      }
    } catch (error) {
      console.log('Error loading specialties:', error);
    }
  }, []);

  const loadClinics = useCallback(async () => {
    try {
      const res = await getAllClinic();
      if (res && res.errCode === 0) {
        const clinicOptions = res.data.map((item) => ({
          value: item.id,
          label: item.name,
          data: item,
        }));
        setClinics(clinicOptions);
      }
    } catch (error) {
      console.log('Error loading clinics:', error);
    }
  }, []);

  const loadDoctors = useCallback(async () => {
    if (!selectedSpecialty || !selectedClinic) return;
    try {
      const res = await getDoctorsFiltered(
        selectedClinic.value,
        selectedSpecialty.value,
        true
      );
      const data = Array.isArray(res) ? res : res?.data;
      const doctorOptions = (data || []).map((item) => ({
        value: item.id,
        label: item.user?.fullName,
        data: item,
      }));
      setDoctors(doctorOptions);
    } catch (error) {
      console.log('Error loading doctors:', error);
    }
  }, [selectedClinic, selectedSpecialty]);

  const loadTimeSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    try {
      const dateStr = moment(selectedDate).format('YYYY-MM-DD');
      const res = await getScheduleDoctorByDate(selectedDoctor.value, dateStr);
      const schedules = Array.isArray(res) ? res : res?.data;
      if (Array.isArray(schedules) && schedules.length > 0) {
        const timeOptions = schedules.map((item) => {
          const label =
            item.timeSlot?.label ||
            item.timeSlot?.valueVi ||
            item.timeSlot?.valueEn ||
            (item.timeSlot?.startTime && item.timeSlot?.endTime
              ? `${item.timeSlot.startTime} - ${item.timeSlot.endTime}`
              : 'Giờ không xác định');
          return { value: item.id, label, data: item };
        });
        setTimeSlots(timeOptions);
      } else {
        setTimeSlots([]);
        toast.info('Không có lịch khám trong ngày này!');
      }
    } catch (error) {
      console.log('Error loading time slots:', error);
      setTimeSlots([]);
    }
  }, [selectedDate, selectedDoctor]);

  useEffect(() => {
    setSelectedDate(getToday());
    loadSpecialties();
    loadClinics();
  }, [loadClinics, loadSpecialties]);

  useEffect(() => {
    if (isOpenModal) {
      setSelectedDate(getToday());
      if (isLoggedIn) {
        fillUserFromProps();
      } else {
        closeModal?.();
        navigate('/login');
      }
    }
  }, [isOpenModal, isLoggedIn, fillUserFromProps, closeModal, navigate]);

  useEffect(() => {
    if (selectedSpecialty && selectedClinic) {
      loadDoctors();
    }
  }, [selectedSpecialty, selectedClinic, loadDoctors]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadTimeSlots();
    }
  }, [selectedDoctor, selectedDate, loadTimeSlots]);

  const getActiveBookingCount = useCallback((schedule) => {
    if (!schedule || !Array.isArray(schedule.bookings)) return 0;
    return schedule.bookings.filter((b) =>
      ['PENDING', 'CONFIRMED', 'DONE'].includes(b.status)
    ).length;
  }, []);

  const handleSelectSpecialty = (selectedOption) => {
    setSelectedSpecialty(selectedOption);
    setSelectedDoctor(null);
    setTimeSlots([]);
    setSelectedTime(null);
    setDoctors([]);
  };

  const handleSelectClinic = (selectedOption) => {
    setSelectedClinic(selectedOption);
    setSelectedDoctor(null);
    setTimeSlots([]);
    setSelectedTime(null);
    setDoctors([]);
  };

  const handleSelectDate = (date) => {
    const pickedDate = Array.isArray(date) ? date[0] : date;
    setSelectedDate(pickedDate);
    setTimeSlots([]);
    setSelectedTime(null);
  };

  const handleSelectDoctor = (selectedOption) => {
    setSelectedDoctor(selectedOption);
  };

  const handleSelectTime = (selectedOption) => {
    setSelectedTime(selectedOption);
  };

  const handleOnChangeInput = (event, id) => {
    const value = event.target.value;
    if (id === 'reason') setReason(value);
  };

  const validateStep = (step) => {
    if (step === 1 && !selectedSpecialty) {
      toast.error('Vui lòng chọn chuyên khoa!');
      return false;
    }
    if (step === 2 && !selectedClinic) {
      toast.error('Vui lòng chọn cơ sở y tế!');
      return false;
    }
    if (step === 3) {
      if (!selectedDoctor) {
        toast.error('Vui lòng chọn bác sĩ!');
        return false;
      }
      if (!selectedDate) {
        toast.error('Vui lòng chọn ngày khám!');
        return false;
      }
      if (timeSlots.length === 0) {
        toast.error('Hôm nay bác sĩ không có lịch khám!');
        return false;
      }
      if (!selectedTime) {
        toast.error('Vui lòng chọn giờ khám!');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    const totalSteps = 4;
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (step) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      return;
    }
    toast.info('Vui lòng hoàn thành bước hiện tại trước khi tiếp tục.');
  };

  const handleConfirmBooking = async () => {
    const stepsToValidate = [1, 2, 3];
    for (const step of stepsToValidate) {
      if (!validateStep(step)) return;
    }

    if (!reason || !reason.trim()) {
      toast.error('Vui lòng nhập lý do khám!');
      return;
    }

    if (!userInfo || !userInfo.id) {
      toast.error('Vui lòng đăng nhập!');
      return;
    }

    const scheduleId = selectedTime?.value || selectedTime?.data?.id;
    if (!scheduleId) {
      toast.error('Không tìm thấy lịch khám!');
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
        toast.success('Đặt lịch khám nhanh thành công!');
        closeModal?.();
        setTimeout(() => resetForm(), 0);
      } else {
        toast.error('Đặt lịch khám thất bại!');
      }
    } catch (error) {
      setIsShowLoading(false);
      const message = error.message || 'Có lỗi xảy ra khi đặt lịch!';
      toast.error(message);
      console.log('Error booking:', error);
    }
  };

  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setSelectedSpecialty(null);
    setSelectedClinic(null);
    setSelectedDate(getToday());
    setSelectedDoctor(null);
    setSelectedTime(null);
    setDoctors([]);
    setTimeSlots([]);
    setFullName('');
    setPhoneNumber('');
    setEmail('');
    setAddress('');
    setReason('');
    setBirthday('');
  }, []);

  const steps = useMemo(
    () => [
      { number: 1, label: 'Chuyên khoa' },
      { number: 2, label: 'Cơ sở' },
      { number: 3, label: 'Bác sĩ & Giờ' },
      { number: 4, label: 'Thông tin' },
    ],
    []
  );

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={`step ${currentStep >= step.number ? 'active' : ''} ${
            currentStep === step.number ? 'current' : ''
          }`}
          onClick={() => handleStepClick(step.number)}
        >
          <div className="step-number">{step.number}</div>
          <div className="step-label">{step.label}</div>
          {index < steps.length - 1 && <div className="step-line"></div>}
        </div>
      ))}
    </div>
  );

  const renderSpecialtyStep = () => (
    <div className="step-content">
      <h4 className="step-title">
        <i className="fa-solid fa-stethoscope"></i> Chọn chuyên khoa khám
      </h4>
      <p className="step-description">Bạn muốn khám chuyên khoa nào?</p>
      <Select
        value={selectedSpecialty}
        onChange={handleSelectSpecialty}
        options={specialties}
        placeholder="Chọn chuyên khoa..."
        className="select-specialty"
      />
    </div>
  );

  const renderClinicStep = () => (
    <div className="step-content">
      <h4 className="step-title">
        <i className="fa-solid fa-hospital"></i> Chọn cơ sở y tế
      </h4>
      <p className="step-description">
        Chọn bệnh viện hoặc phòng khám bạn muốn đến
      </p>
      <Select
        value={selectedClinic}
        onChange={handleSelectClinic}
        options={clinics}
        placeholder="Chọn cơ sở y tế..."
        className="select-clinic"
      />

      {selectedClinic && (
        <div className="clinic-info">
          <p>
            <strong>Thông tin cơ sở:</strong>
          </p>
          <p>
            <strong>Tên cơ sở:</strong> {selectedClinic.data.name}
          </p>
          <p>
            <strong>Địa chỉ:</strong> {selectedClinic.data.address}
          </p>
        </div>
      )}
    </div>
  );

  const renderDoctorStep = () => (
    <div className="step-content">
      <h4 className="step-title">
        <i className="fa-solid fa-user-md"></i> Chọn bác sĩ
      </h4>
      <p className="step-description">Chọn bác sĩ bạn muốn khám và ngày khám</p>
      <Select
        value={selectedDoctor}
        onChange={handleSelectDoctor}
        options={doctors}
        placeholder="Chọn bác sĩ..."
        className="select-doctor"
      />

      <div className="doctor-date-wrapper">
        <DatePicker
          onChange={handleSelectDate}
          className="form-control date-picker-quick"
          value={selectedDate}
          placeholder="Chọn ngày khám..."
          minDate={getToday()}
        />
      </div>

      {!selectedDoctor && doctors.length === 0 && (
        <div className="no-doctor-alert">
          <p>
            <i className="fa-solid fa-info-circle"></i> Không có bác sĩ nào thoả
            mãn điều kiện, hãy chọn chuyên khoa và cơ sở khác
          </p>
        </div>
      )}

      {selectedDoctor && selectedDoctor.data && (
        <div className="doctor-fee-box">
          <p>
            <strong>
              {language === LANGUAGES.VI ? 'Giá khám: ' : 'Examination Fee: '}
            </strong>
            <span className="fee-value">
              {selectedDoctor.data.fee != null
                ? `${selectedDoctor.data.fee} VND`
                : 'N/A'}
            </span>
          </p>
        </div>
      )}

      {selectedDoctor && selectedDate && timeSlots.length > 0 && (
        <div className="time-slots-section">
          <h5 className="time-title">
            <i className="fa-solid fa-clock"></i> Chọn giờ khám
          </h5>
          <div className="time-slots-grid">
            {timeSlots.map((time) => {
              const activeBookings = getActiveBookingCount(time.data);
              const maxPatient = time.data?.maxPatient;
              const isFull = maxPatient ? activeBookings >= maxPatient : false;
              const occupancyText = maxPatient
                ? ` (hiện có ${activeBookings}/${maxPatient} ca )`
                : ` (hiện có ${activeBookings})`;
              const isSelected =
                !!selectedTime && selectedTime.value === time.value;
              return (
                <div
                  key={time.value}
                  className={`time-slot ${isSelected ? 'selected' : ''} ${
                    isFull ? 'disabled' : ''
                  }`}
                  onClick={() => {
                    if (!isFull) handleSelectTime(time);
                  }}
                  aria-disabled={isFull}
                  role="button"
                  tabIndex={isFull ? -1 : 0}
                  title={isFull ? 'Lịch này đã đầy' : undefined}
                >
                  <i className="fa-regular fa-clock"></i> {time.label}
                  <span className="time-occupancy">{occupancyText}</span>
                </div>
              );
            })}
          </div>
          {selectedTime && (
            <div className="time-queue-hint">
              {(() => {
                const maxPatient = selectedTime.data?.maxPatient;
                const activeBookings = getActiveBookingCount(selectedTime.data);
                const yourNumber = maxPatient
                  ? Math.min(activeBookings + 1, maxPatient)
                  : activeBookings + 1;
                if (!maxPatient) {
                  return <span>Số thứ tự dự kiến của bạn: {yourNumber}</span>;
                }

                if (activeBookings >= maxPatient) {
                  return (
                    <span style={{ color: '#dc3545' }}>
                      <i className="fa-solid fa-exclamation-circle"></i> Lịch
                      khám này đã đầy ({activeBookings}/{maxPatient}). Vui lòng
                      chọn giờ khác hoặc ngày khác.
                    </span>
                  );
                }

                return (
                  <span>
                    Hiện có {activeBookings}/{maxPatient} người đã đăng ký. Số
                    thứ tự dự kiến của bạn: {yourNumber}/{maxPatient}.
                  </span>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {selectedDoctor && selectedDate && timeSlots.length === 0 && (
        <div className="no-time-slot-alert">
          <p>
            <i className="fa-solid fa-calendar-times"></i> Hôm nay bác sĩ không
            có lịch khám
          </p>
        </div>
      )}
    </div>
  );

  const renderPatientInfoStep = () => (
    <div className="step-content patient-info-content">
      <h4 className="step-title">
        <i className="fa-solid fa-user-edit"></i> Thông tin bệnh nhân
      </h4>

      <div className="booking-summary">
        <h5>Thông tin đặt lịch:</h5>
        <div className="summary-item">
          <strong>Chuyên khoa:</strong> {selectedSpecialty?.label}
        </div>
        <div className="summary-item">
          <strong>Cơ sở:</strong> {selectedClinic?.label}
        </div>
        <div className="summary-item">
          <strong>Bác sĩ:</strong> {selectedDoctor?.label}
        </div>
        {selectedDoctor?.data?.fee != null && (
          <div className="summary-item">
            <strong>Giá khám:</strong> {`${selectedDoctor.data.fee} VND`}
          </div>
        )}
        <div className="summary-item">
          <strong>Ngày:</strong>{' '}
          {selectedDate && moment(selectedDate).format('DD/MM/YYYY')}
        </div>
        <div className="summary-item">
          <strong>Giờ:</strong> {selectedTime?.label}
        </div>
      </div>

      <div className="row patient-form">
        <div className="col-6 form-group">
          <label>
            Họ và tên <span className="required">*</span>
          </label>
          <input
            className="form-control"
            value={fullName}
            readOnly
            placeholder="Họ và tên"
          />
        </div>

        <div className="col-6 form-group">
          <label>
            Số điện thoại <span className="required">*</span>
          </label>
          <input
            className="form-control"
            value={phoneNumber}
            readOnly
            placeholder="Số điện thoại"
          />
        </div>

        <div className="col-6 form-group">
          <label>
            Email <span className="required">*</span>
          </label>
          <input
            className="form-control"
            value={email}
            readOnly
            placeholder="Email"
          />
        </div>

        <div className="col-6 form-group">
          <label>Địa chỉ</label>
          <input
            className="form-control"
            value={address}
            readOnly
            placeholder="Địa chỉ"
          />
        </div>

        <div className="col-6 form-group">
          <label>Ngày sinh</label>
          <DatePicker
            className="form-control"
            value={birthday}
            disabled={true}
            placeholder="Ngày sinh"
          />
        </div>

        <div className="col-12 form-group">
          <label>Lý do khám</label>
          <textarea
            className="form-control"
            rows="3"
            value={reason}
            onChange={(event) => handleOnChangeInput(event, 'reason')}
            placeholder="Nhập lý do khám bệnh..."
          />
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderSpecialtyStep();
      case 2:
        return renderClinicStep();
      case 3:
        return renderDoctorStep();
      case 4:
        return renderPatientInfoStep();
      default:
        return null;
    }
  };

  return (
    <div className="quick-booking-modal-wrapper">
      {isShowLoading && (
        <div className="loading-overlay">
          <ProgressSpinner />
        </div>
      )}
      <Modal
        isOpen={isOpenModal}
        className="quick-booking-modal-container"
        size="lg"
        centered={true}
      >
        <div className="quick-booking-modal-content">
          <div className="quick-booking-modal-header">
            <div className="header-content">
              <h3>
                <i className="fa-solid fa-calendar-alt"></i> Đặt lịch khám nhanh
              </h3>
              <p>Chỉ 4 bước đơn giản để đặt lịch khám bệnh</p>
            </div>
            <span className="close-btn" onClick={closeModal}>
              <i className="fa-solid fa-times"></i>
            </span>
          </div>

          <div className="quick-booking-modal-body">
            {renderStepIndicator()}
            {renderStepContent()}
          </div>

          <div className="quick-booking-modal-footer">
            {currentStep > 1 && (
              <button className="btn-prev" onClick={prevStep}>
                <i className="fa-solid fa-arrow-left"></i> Quay lại
              </button>
            )}

            {currentStep < 4 && (
              <button className="btn-next" onClick={nextStep}>
                Tiếp tục <i className="fa-solid fa-arrow-right"></i>
              </button>
            )}

            {currentStep === 4 && (
              <button className="btn-confirm" onClick={handleConfirmBooking}>
                <i className="fa-solid fa-check-circle"></i> Xác nhận đặt lịch
              </button>
            )}

            <button className="btn-cancel" onClick={closeModal}>
              Hủy bỏ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuickBookingModal;
