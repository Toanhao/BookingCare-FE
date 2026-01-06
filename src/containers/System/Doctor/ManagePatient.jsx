/** @format */

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import './ManagePatient.scss';
import DatePicker from '../../../components/Input/DatePicker';
import { toast } from 'react-toastify';
import { ProgressSpinner } from 'primereact/progressspinner';
import ExaminationDetailModal from './ExaminationDetailModal';
import {
  getDoctorBookings,
  getBookingDetails,
  createMedicalRecord,
  createPrescription,
  createBill,
  payBill,
  getMedicines,
} from '../../../services/userService';

const ManagePatient = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [bookingsPending, setBookingsPending] = useState([]);
  const [bookingsHistory, setBookingsHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailBooking, setSelectedDetailBooking] = useState(null);
  const [step, setStep] = useState(1);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [note, setNote] = useState('');
  const [createdMedicalRecord, setCreatedMedicalRecord] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [items, setItems] = useState([
    { medicineId: '', quantity: 1, usage: '', duration: 1 },
  ]);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [prescription, setPrescription] = useState(null);
  const [bill, setBill] = useState(null);
  const [payMethod, setPayMethod] = useState('Tiền mặt');
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const user = useSelector((state) => state.user.userInfo);

  const getDoctorId = () => {
    return user?.doctorData?.id || user?.id;
  };

  const formatDateParam = (dateObj) => {
    const d = new Date(dateObj);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const doctorId = getDoctorId();
      if (!doctorId) {
        toast.error('Không xác định được bác sĩ đăng nhập');
        return;
      }
      const workDate = formatDateParam(currentDate);

      const [pending, history] = await Promise.all([
        getDoctorBookings({ doctorId, workDate, status: 'CONFIRMED' }),
        getDoctorBookings({ doctorId, status: 'DONE' }),
      ]);

      setBookingsPending(pending || []);
      setBookingsHistory(history || []);
    } catch (e) {
      toast.error(e?.message || 'Không tải được danh sách lịch khám');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentDate]);

  const onDateChange = (date) => {
    const picked = Array.isArray(date) ? date[0] : date;
    setCurrentDate(picked);
  };

  const openExamination = async (booking) => {
    try {
      setLoading(true);
      const [detail, meds] = await Promise.all([
        getBookingDetails(booking.id),
        getMedicines(),
      ]);

      const record = detail?.medicalRecord;
      const prescriptionData = record?.prescription;
      const billData = record?.bill;
      const isHistory = booking?.status === 'DONE' || activeTab === 'history';

      const prefetchedItems = prescriptionData?.items?.length
        ? prescriptionData.items.map(
            ({ medicineId, quantity, usage, duration }) => ({
              medicineId,
              quantity,
              usage,
              duration,
            })
          )
        : [{ medicineId: '', quantity: 1, usage: '', duration: 1 }];

      setShowModal(true);
      setStep(1);
      setIsHistoryMode(isHistory);
      setSelectedBooking(booking);
      setBookingDetail(detail);
      setDiagnosis(record?.diagnosis || '');
      setConclusion(record?.conclusion || '');
      setNote(record?.note || '');
      setCreatedMedicalRecord(record);
      setMedicines(meds || []);
      setItems(prefetchedItems);
      setPrescriptionNote(prescriptionData?.note || '');
      setPrescription(prescriptionData);
      setBill(billData);
      setPayMethod(
        billData?.method && billData.method !== 'UNDEFINED'
          ? billData.method
          : 'Tiền mặt'
      );
      setShowPaymentQR(
        billData?.method &&
        billData.method !== 'UNDEFINED' &&
        billData.method !== 'Tiền mặt'
      );
      setPaymentConfirmed(
        billData?.method === 'Tiền mặt' || billData?.status === 'PAID'
      );
    } catch (e) {
      toast.error(e?.message || 'Không mở được hồ sơ khám');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setBookingDetail(null);
    setStep(1);
    setIsHistoryMode(false);
    setDiagnosis('');
    setConclusion('');
    setNote('');
    setCreatedMedicalRecord(null);
    setItems([{ medicineId: '', quantity: 1, usage: '', duration: 1 }]);
    setPrescriptionNote('');
    setPrescription(null);
    setBill(null);
    setShowPaymentQR(false);
    setPaymentConfirmed(false);
  };

  const openDetailModal = async (booking) => {
    try {
      setLoading(true);
      const detail = await getBookingDetails(booking.id);
      setShowDetailModal(true);
      setSelectedDetailBooking(detail);
    } catch (e) {
      toast.error(e?.message || 'Không mở được chi tiết khám');
    } finally {
      setLoading(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDetailBooking(null);
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const nextStep = () => {
    switch (step) {
      case 1:
        setStep(2);
        break;
      case 2:
        goNextMedical();
        break;
      case 3:
        goNextPrescription();
        break;
      case 4:
        finalizeExamination();
        break;
      default:
        break;
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep <= step) {
      setStep(targetStep);
    }
  };

  const goNextMedical = () => {
    if (isHistoryMode || createdMedicalRecord?.id) {
      setStep(3);
      return;
    }
    if (!diagnosis || !conclusion) {
      toast.warn('Vui lòng nhập chẩn đoán và kết luận');
      return;
    }
    setStep(3);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { medicineId: '', quantity: 1, usage: '', duration: 1 },
    ]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validatePrescription = () => {
    if (items.length === 0) {
      toast.warn('Vui lòng nhập đầy đủ đơn thuốc');
      return false;
    }
    const valid = items.every(
      (i) => i.medicineId && i.quantity > 0 && i.duration > 0 && i.usage
    );
    if (!valid) {
      toast.warn('Vui lòng nhập đầy đủ đơn thuốc');
      return false;
    }
    if (!prescriptionNote.trim()) {
      toast.warn('Vui lòng nhập ghi chú đơn thuốc');
      return false;
    }
    return true;
  };

  const goNextPrescription = () => {
    if (isHistoryMode || prescription?.id) {
      setStep(4);
      return;
    }
    if (validatePrescription()) {
      setStep(4);
    }
  };

  const renderVNPayQR = (amount, bookingDetail, bill) => {
    const bankId = '970436';
    const accountNumber = '9347581948';
    const accountName = 'DINH VAN TOAN';

    const description = `THANH TOAN HOA DON ID ${bookingDetail?.id} ${bookingDetail?.patient?.user?.fullName}`;

    // VietQR API với accountName để hiển thị tên người nhận khi quét
    const vietqrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      description
    )}&accountName=${encodeURIComponent(accountName)}`;

    return (
      <div className="qr-code">
        <img
          src={vietqrUrl}
          alt="VNPay QR Code"
          style={{ maxWidth: '250px', height: 'auto' }}
          onError={(e) => {
            // Fallback nếu VietQR không hoạt động
            console.error('VietQR failed, using fallback');
            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
              `Bank: ${accountName}\nSTK: ${accountNumber}\nAmount: ${amount} VND\nContent: ${description}`
            )}`;
          }}
        />
      </div>
    );
  };

  const finalizeExamination = async () => {
    if (isHistoryMode) return;

    // Kiểm tra xác nhận thanh toán online
    if (payMethod !== 'Tiền mặt' && !paymentConfirmed) {
      toast.warn('Vui lòng xác nhận đã thanh toán');
      return;
    }

    const needsMedical = !createdMedicalRecord?.id;
    const needsPrescription = !prescription?.id;

    if (needsMedical && (!diagnosis || !conclusion)) {
      toast.warn('Vui lòng nhập chẩn đoán và kết luận');
      return;
    }
    if (needsPrescription && !validatePrescription()) {
      return;
    }

    try {
      setLoading(true);
      let record = createdMedicalRecord;
      if (!record?.id) {
        const res = await createMedicalRecord({
          bookingId: selectedBooking.id,
          diagnosis,
          conclusion,
          note,
        });
        record = res?.data || res;
        setCreatedMedicalRecord(record);
      }

      let rx = prescription;
      if (!rx?.id) {
        const res = await createPrescription({
          medicalRecordId: record.id,
          note: prescriptionNote,
          items,
        });
        rx = res?.data || res;
        setPrescription(rx);
      }

      let currentBill = bill;
      if (!currentBill) {
        const res = await createBill({
          medicalRecordId: record.id,
          method: 'UNDEFINED',
        });
        currentBill = res?.data || res;
      }
      if (currentBill?.status !== 'PAID') {
        const payRes = await payBill({
          billId: currentBill.id,
          method: payMethod,
        });
        currentBill = payRes?.data || payRes;
      }

      setBill(currentBill);
      toast.success('Khám bệnh hoàn tất và đã thanh toán');
      closeModal();
      await loadBookings();
    } catch (e) {
      toast.error(e?.errMessage || e?.message || 'Lỗi khi hoàn tất khám');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="mp-header">
        <div className="mp-title">Quản lý bệnh nhân</div>
        <div className="mp-controls">
          {activeTab === 'pending' && (
            <div className="mp-date">
              <span>Ngày khám:</span>
              <DatePicker
                onChange={onDateChange}
                className="form-control"
                value={currentDate}
                minDate="today"
              />
            </div>
          )}
          <div className="mp-tabs">
            <button
              className={activeTab === 'pending' ? 'active' : ''}
              onClick={() => setActiveTab('pending')}
            >
              Chưa khám
            </button>
            <button
              className={activeTab === 'history' ? 'active' : ''}
              onClick={() => setActiveTab('history')}
            >
              Lịch sử khám
            </button>
          </div>
        </div>
      </div>
    );
  };

  const formatDateTime = (booking) => {
    const workDate = booking.schedule?.workDate
      ? new Date(booking.schedule.workDate).toLocaleDateString('vi-VN')
      : '---';
    const timeSlot = booking.schedule?.timeSlot?.label || '---';
    return `${workDate} ${timeSlot}`;
  };

  const renderTable = (rows, isPending) => {
    if (!rows?.length) {
      return (
        <table className="mp-table">
          <thead>
            <tr>
              <th>STT Khám</th>
              <th>Bệnh nhân</th>
              <th>Ngày giờ khám</th>
              <th>Lý do khám</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                Không có dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    const sortedRows = [...rows].sort((a, b) => {
      const dateA = new Date(a.schedule?.workDate || 0);
      const dateB = new Date(b.schedule?.workDate || 0);
      return dateB - dateA;
    });

    return (
      <table className="mp-table">
        <thead>
          <tr>
            <th>STT Khám</th>
            <th>Bệnh nhân</th>
            <th>Ngày giờ khám</th>
            <th>Lý do khám</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((b) => (
            <tr key={b.id}>
              <td>
                {b.queueNumber} / {b.schedule?.maxPatient}
              </td>
              <td>{b.patient?.user?.fullName}</td>
              <td>{formatDateTime(b)}</td>
              <td>{b.reason}</td>
              <td>
                {isPending ? (
                  <button
                    className="btn-primary"
                    onClick={() => openExamination(b)}
                  >
                    Kết quả
                  </button>
                ) : (
                  <button
                    className="btn-secondary"
                    onClick={() => openDetailModal(b)}
                  >
                    Chi tiết
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const getStepClassName = (stepNumber) => {
    if (step === stepNumber) return 'step active';
    if (step > stepNumber) return 'step done';
    return 'step';
  };

  const renderModal = () => {
    if (!showModal) return null;
    const hasMedicalRecord = Boolean(createdMedicalRecord?.id);
    const hasPrescription = Boolean(prescription?.id);
    const isReadOnlyMR = isHistoryMode || hasMedicalRecord;
    const isReadOnlyRx = isHistoryMode || hasPrescription;
    const totalFee = bill?.total ?? bookingDetail?.schedule?.doctor?.fee ?? 0;
    const patientUser = bookingDetail?.patient?.user;
    const timeLabel = bookingDetail?.schedule?.timeSlot?.label;
    const workDate = bookingDetail?.schedule?.workDate
      ? new Date(bookingDetail.schedule.workDate).toLocaleDateString()
      : '';
    return (
      <div className="mp-modal-overlay">
        <div className="mp-modal">
          <div className="mp-modal-header">
            <div className="mp-steps steps-4">
              <div
                className={getStepClassName(1)}
                onClick={() => handleStepClick(1)}
              >
                <span className="step-number">1</span>
                <span className="step-label">Thông tin</span>
              </div>
              <div
                className={getStepClassName(2)}
                onClick={() => handleStepClick(2)}
              >
                <span className="step-number">2</span>
                <span className="step-label">Khám bệnh</span>
              </div>
              <div
                className={getStepClassName(3)}
                onClick={() => handleStepClick(3)}
              >
                <span className="step-number">3</span>
                <span className="step-label">Đơn thuốc</span>
              </div>
              <div
                className={getStepClassName(4)}
                onClick={() => handleStepClick(4)}
              >
                <span className="step-number">4</span>
                <span className="step-label">Hóa đơn</span>
              </div>
            </div>
            <button className="close" onClick={closeModal}>
              ×
            </button>
          </div>

          <div className="mp-modal-body">
            {step === 1 && (
              <div className="step-1">
                <table className="info-table">
                  <tbody>
                    <tr>
                      <td className="label">Họ tên</td>
                      <td className="value">
                        {patientUser?.fullName || '---'}
                      </td>
                      <td className="label">Ngày khám</td>
                      <td className="value">{workDate || '---'}</td>
                    </tr>
                    <tr>
                      <td className="label">Số điện thoại</td>
                      <td className="value">
                        {patientUser?.phoneNumber || '---'}
                      </td>
                      <td className="label">Giờ khám</td>
                      <td className="value">{timeLabel || '---'}</td>
                    </tr>
                    <tr>
                      <td className="label">Email</td>
                      <td className="value">{patientUser?.email || '---'}</td>
                      <td className="label">Lý do khám</td>
                      <td className="value">
                        {bookingDetail?.reason || '---'}
                      </td>
                    </tr>
                    <tr>
                      <td className="label">Giới tính</td>
                      <td className="value">{patientUser?.gender || '---'}</td>
                      <td className="label">STT</td>
                      <td className="value">
                        {bookingDetail?.queueNumber || '---'}
                      </td>
                    </tr>
                    <tr>
                      <td className="label">Địa chỉ</td>
                      <td className="value">{patientUser?.address || '---'}</td>
                      <td className="label">Bác sĩ</td>
                      <td className="value">
                        {bookingDetail?.schedule?.doctor?.user?.fullName ||
                          '---'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {step === 2 && (
              <div className="step-1">
                <div className="form-row">
                  <label>Chẩn đoán</label>
                  <input
                    value={diagnosis}
                    disabled={isReadOnlyMR}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Kết luận</label>
                  <input
                    value={conclusion}
                    disabled={isReadOnlyMR}
                    onChange={(e) => setConclusion(e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <label>Ghi chú</label>
                  <textarea
                    value={note}
                    disabled={isReadOnlyMR}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-2">
                <div className="items">
                  <div className="items-header">
                    <div className="col-name">Tên thuốc *</div>
                    <div className="col-qty">Số lượng *</div>
                    <div className="col-usage">Cách dùng *</div>
                    <div className="col-duration">Số ngày *</div>
                    <div className="col-action"></div>
                  </div>
                  {items.map((it, idx) => (
                    <div className="item-row" key={idx}>
                      <div className="item-grid">
                        <div className="col-name">
                          <Select
                            className="item-select"
                            classNamePrefix="rs"
                            isDisabled={isReadOnlyRx}
                            placeholder="-- Chọn thuốc --"
                            options={medicines.map((m) => ({
                              value: m.id,
                              label: m.name,
                            }))}
                            value={
                              it.medicineId
                                ? {
                                    value: it.medicineId,
                                    label:
                                      medicines.find(
                                        (m) => m.id === it.medicineId
                                      )?.name || '',
                                  }
                                : null
                            }
                            onChange={(opt) =>
                              updateItem(
                                idx,
                                'medicineId',
                                opt ? opt.value : ''
                              )
                            }
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            menuPlacement="auto"
                          />
                        </div>
                        <div className="col-qty">
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            disabled={isReadOnlyRx}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                'quantity',
                                Number(e.target.value)
                              )
                            }
                            placeholder="30"
                          />
                        </div>
                        <div className="col-usage">
                          <input
                            value={it.usage}
                            disabled={isReadOnlyRx}
                            onChange={(e) =>
                              updateItem(idx, 'usage', e.target.value)
                            }
                            placeholder="Ví dụ: 2 viên/lần"
                          />
                        </div>
                        <div className="col-duration">
                          <input
                            type="number"
                            min={1}
                            value={it.duration}
                            disabled={isReadOnlyRx}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                'duration',
                                Number(e.target.value)
                              )
                            }
                            placeholder="7"
                          />
                        </div>
                        <div className="col-action">
                          {!isReadOnlyRx && (
                            <button
                              className="btn-danger btn-small"
                              onClick={() => removeItem(idx)}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!isReadOnlyRx && (
                  <div className="actions">
                    <button className="btn-secondary" onClick={addItemRow}>
                      Thêm thuốc
                    </button>
                  </div>
                )}
                <div className="form-row">
                  <label>Ghi chú đơn thuốc</label>
                  <textarea
                    value={prescriptionNote}
                    disabled={isReadOnlyRx}
                    onChange={(e) => setPrescriptionNote(e.target.value)}
                    placeholder="Ví dụ: Uống sau ăn, tránh dị ứng ..."
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="step-2">
                <div className="form-row">
                  <label>Phương thức thanh toán</label>
                  <select
                    value={payMethod}
                    onChange={(e) => {
                      const method = e.target.value;
                      setPayMethod(method);
                      setShowPaymentQR(method !== 'Tiền mặt');
                      setPaymentConfirmed(method === 'Tiền mặt');
                    }}
                    disabled={bill?.status === 'PAID' || isHistoryMode}
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Thanh toán online">
                      Thanh toán online (VNPay)
                    </option>
                  </select>
                </div>

                {showPaymentQR && (
                  <div className="payment-qr-section">
                    <div className="qr-container">
                      <h4>
                        <i className="fa-solid fa-qrcode"></i> Quét mã QR để thanh
                        toán
                      </h4>
                      {renderVNPayQR(totalFee, bookingDetail, bill)}
                      <div className="payment-info">
                        <div className="info-row">
                          <span>Ngân hàng:</span>
                          <strong>Vietcombank</strong>
                        </div>
                        <div className="info-row">
                          <span>Số tài khoản:</span>
                          <strong>9347581948</strong>
                        </div>
                        <div className="info-row">
                          <span>Chủ tài khoản:</span>
                          <strong>DINH VAN TOAN</strong>
                        </div>
                        <div className="info-row">
                          <span>Số tiền:</span>
                          <strong>{totalFee?.toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div className="info-row">
                          <span>Nội dung:</span>
                          <strong>
                            THANH TOAN HOA DON ID{bookingDetail?.id}{' '}
                            {bookingDetail?.patient?.user?.fullName}
                          </strong>
                        </div>
                      </div>
                      {!paymentConfirmed && (
                        <button
                          className="btn-confirm-payment"
                          onClick={() => setPaymentConfirmed(true)}
                        >
                          <i className="fa-solid fa-check" /> Xác nhận đã thanh toán
                        </button>
                      )}
                      {paymentConfirmed && (
                        <div className="payment-confirmed">
                          <i className="fa-solid fa-check-circle" /> Đã xác nhận
                          thanh toán
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="info">
                  <div className="bill-box">
                    <div className="bill-row">
                      <span>Phí khám (không bao gồm thuốc)</span>
                      <strong>{totalFee?.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    {bill && (
                      <div className="bill-row">
                        <span>Hóa đơn</span>
                        <strong>
                          #{bill.id} - {bill.status}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mp-modal-footer">
            {step > 1 && (
              <button className="btn-prev" onClick={prevStep}>
                <i className="fa-solid fa-arrow-left" /> Quay lại
              </button>
            )}

            {step < 4 && (
              <button className="btn-next" onClick={nextStep}>
                Tiếp tục <i className="fa-solid fa-arrow-right" />
              </button>
            )}

            {step === 4 && (
              <button
                className="btn-confirm"
                onClick={finalizeExamination}
                disabled={bill?.status === 'PAID' || isHistoryMode}
              >
                <i className="fa-solid fa-check-circle" />
                {bill?.status === 'PAID' ? ' Đã thanh toán' : ' Hoàn thành'}
              </button>
            )}

            <button className="btn-cancel" onClick={closeModal}>
              Hủy bỏ
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="manage-patient-wrapper">
      {loading && (
        <div className="loading-overlay">
          <ProgressSpinner />
        </div>
      )}
      <div className="manage-patient-container">
        {renderHeader()}
        <div className="mp-content">
          {activeTab === 'pending' && renderTable(bookingsPending, true)}
          {activeTab === 'history' && renderTable(bookingsHistory, false)}
        </div>
        {renderModal()}
        <ExaminationDetailModal
          isOpen={showDetailModal}
          bookingDetail={selectedDetailBooking}
          onClose={closeDetailModal}
        />
      </div>
    </div>
  );
};

export default ManagePatient;
