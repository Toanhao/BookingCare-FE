/** @format */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './DoctorSchedule.scss';
import moment from 'moment';
import { getScheduleDoctorByDate } from '../../../services/userService';
import { FormattedMessage } from 'react-intl';
import BookingModal from './Modal/BookingModal';
import { LANGUAGES } from '../../../utils';
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getArrDays = (language) => {
  let allDays = [];
  for (let i = 0; i < 7; i++) {
    let object = {};
    if (language === LANGUAGES.VI) {
      if (i === 0) {
        let ddMM = moment(new Date()).format('DD/MM');
        let today = `Hôm nay - ${ddMM}`;
        object.label = today;
      } else {
        let labelVi = moment(new Date()).add(i, 'days').format('dddd - DD/MM');
        object.label = capitalizeFirstLetter(labelVi);
      }
    } else {
      if (i === 0) {
        let ddMM = moment(new Date()).format('DD/MM');
        let today = `Today - ${ddMM}`;
        object.label = today;
      } else {
        object.label = moment(new Date())
          .add(i, 'days')
          .locale('en')
          .format('ddd - DD/MM');
      }
    }
    object.value = moment(new Date()).add(i, 'days').format('YYYY-MM-DD');
    allDays.push(object);
  }
  return allDays;
};

const DoctorSchedule = ({ doctorIdFromParent }) => {
  const language = useSelector((state) => state.app.language);
  const [allDays, setAllDays] = useState([]);
  const [allAvailableTime, setAllAvailableTime] = useState([]);
  const [isOpenModalBooking, setIsOpenModalBooking] = useState(false);
  const [dataScheduleTimeModal, setDataScheduleTimeModal] = useState({});

  useEffect(() => {
    const days = getArrDays(language);
    setAllDays(days);

    // Chỉ gọi API nếu có doctorIdFromParent hợp lệ
    if (doctorIdFromParent && doctorIdFromParent !== -1) {
      (async () => {
        let res = await getScheduleDoctorByDate(
          doctorIdFromParent,
          days[0].value
        );
        setAllAvailableTime(res && Array.isArray(res) ? res : []);
      })();
    }
  }, [doctorIdFromParent, language]);

  const handelOnChangeSelect = async (event) => {
    if (doctorIdFromParent && doctorIdFromParent !== -1) {
      let doctorId = doctorIdFromParent;
      let date = event.target.value;
      let res = await getScheduleDoctorByDate(doctorId, date);
      setAllAvailableTime(res && Array.isArray(res) ? res : []);
    }
  };

  const handelClickScheduleTime = (time) => {
    setIsOpenModalBooking(true);
    setDataScheduleTimeModal(time);
  };

  const closeBookingClose = () => {
    setIsOpenModalBooking(false);
  };

  return (
    <>
      <div className="doctor-schedule-container">
        <div className="all-schedule">
          <select onChange={(event) => handelOnChangeSelect(event)}>
            {allDays &&
              allDays.length > 0 &&
              allDays.map((item, index) => {
                return (
                  <option value={item.value} key={index}>
                    {item.label}
                  </option>
                );
              })}
          </select>
        </div>
        <div className="all-available-time">
          <div className="text-calendar">
            <i className="fa-solid fa-calendar-alt"> </i>
            <span>
              <FormattedMessage id="patient.detail-doctor.schedule" />
            </span>
          </div>
          <div className="time-content">
            {allAvailableTime && allAvailableTime.length > 0 ? (
              <>
                <div className="time-content-btns">
                  {allAvailableTime.map((item, index) => {
                    // Prefer label from API for nicer display
                    const timeSlot = item.timeSlot || {};
                    const timeDisplay = timeSlot.label;

                    return (
                      <button
                        key={index}
                        className={
                          language === LANGUAGES.VI ? 'btn-vie' : 'btn-en'
                        }
                        onClick={() => handelClickScheduleTime(item)}
                      >
                        {timeDisplay}
                      </button>
                    );
                  })}
                </div>
                <div className="book-free">
                  <span>
                    <FormattedMessage id="patient.detail-doctor.choose" />
                    <i className="fa-regular fa-hand-point-up"></i>
                    <FormattedMessage id="patient.detail-doctor.book-free" />
                  </span>
                </div>
              </>
            ) : (
              <div className="no-schedule">
                <FormattedMessage id="patient.detail-doctor.no-schedule" />
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingModal
        isOpenModal={isOpenModalBooking}
        closeBookingClose={closeBookingClose}
        dataTime={dataScheduleTimeModal}
      />
    </>
  );
};
export default DoctorSchedule;
