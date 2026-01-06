import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { postConfirmBooking } from '../../services/userService';
import HomeHeader from '../HomePage/HomeHeader/HomeHeader';
import './ConfirmBooking.scss';

const ConfirmBooking = () => {
  const location = useLocation();
  const [statusConfirm, setStatusConfirm] = useState(false);
  const [errCode, setErrCode] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmBooking = async () => {
      if (location && location.search) {
        let urlParams = new URLSearchParams(location.search);
        let token = urlParams.get('token');

        if (!token) {
          setStatusConfirm(true);
          setErrCode(-1);
          setMessage('Token không hợp lệ');
          return;
        }

        try {
          let res = await postConfirmBooking(token);

          if (res && res.booking) {
            setStatusConfirm(true);
            setErrCode(0);
            setMessage(res?.message || 'Xác nhận lịch hẹn thành công!');
          } else {
            setStatusConfirm(true);
            setErrCode(-1);
            setMessage(res?.message || 'Lịch hẹn không tồn tại hoặc đã xác nhận!');
          }
        } catch (error) {
          setStatusConfirm(true);
          setErrCode(-1);
          setMessage('Lỗi xác nhận lịch hẹn. Vui lòng thử lại!');
          console.error('Error confirming appointment:', error);
        }
      }
    };
    confirmBooking();
  }, [location]);

  return (
    <>
      <HomeHeader />
      <div className="confirm-booking-container">
        {statusConfirm === false ? (
          <div className="loading-message">Đang xử lý...</div>
        ) : (
          <div>
            {+errCode === 0 ? (
              <div className="success-message">✅ {message}</div>
            ) : (
              <div className="error-message">❌ {message}</div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ConfirmBooking;
