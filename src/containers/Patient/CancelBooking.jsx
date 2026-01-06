import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { postCancelBooking } from '../../services/userService';
import HomeHeader from '../HomePage/HomeHeader/HomeHeader';
import './CancelBooking.scss';

const CancelBooking = () => {
  const location = useLocation();
  const [statusCancel, setStatusCancel] = useState(false);
  const [errCode, setErrCode] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const cancelBooking = async () => {
      if (location && location.search) {
        let urlParams = new URLSearchParams(location.search);
        let token = urlParams.get('token');

        if (!token) {
          setStatusCancel(true);
          setErrCode(-1);
          setMessage('Token không hợp lệ');
          return;
        }

        try {
          let res = await postCancelBooking(token);

          if (res && res.booking) {
            setStatusCancel(true);
            setErrCode(0);
            setMessage(res?.message || 'Huỷ lịch hẹn thành công!');
          } else {
            setStatusCancel(true);
            setErrCode(-1);
            setMessage(res?.message || 'Lịch hẹn không tồn tại hoặc đã huỷ!');
          }
        } catch (error) {
          setStatusCancel(true);
          setErrCode(-1);
          setMessage('Lỗi huỷ lịch hẹn. Vui lòng thử lại!');
          console.error('Error canceling appointment:', error);
        }
      }
    };
    cancelBooking();
  }, [location]);

  return (
    <>
      <HomeHeader />
      <div className="cancel-booking-container">
        {statusCancel === false ? (
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

export default CancelBooking;
