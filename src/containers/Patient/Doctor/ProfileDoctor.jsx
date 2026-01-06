/** @format */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import './ProfileDoctor.scss';
import { getProfileDoctorById } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import { NumericFormat } from 'react-number-format';
import _ from 'lodash';
import moment from 'moment';
import { Link } from 'react-router-dom';

const ProfileDoctor = ({
  doctorId,
  isShowDescriptionDoctor,
  dataTime,
  isShowPrice,
  isShowLinkDetail,
}) => {
  const language = useSelector(state => state.app.language);
  const [dataProfile, setDataProfile] = useState({});

  useEffect(() => {
    const getInforDoctor = async (id) => {
      let result = {};
      if (id) {
        let res = await getProfileDoctorById(id);
        if (res && res.errCode === 0) {
          result = res.data;
        }
      }
      return result;
    };

    (async () => {
      let data = await getInforDoctor(doctorId);
      setDataProfile(data);
    })();
  }, [doctorId]);

  const renderTimeBooking = (dataTime) => {
    if (dataTime && !_.isEmpty(dataTime)) {
      // Prefer label from API for nicer display
      const timeSlot = dataTime.timeSlot || {};
      const time = timeSlot.label;

      const date =
        language === LANGUAGES.VI
          ? moment(dataTime.workDate).format('dddd - DD/MM/YYYY')
          : moment(dataTime.workDate).locale('en').format('ddd - MM/DD/YYYY');
      return (
        <>
          <div>
            {time} - {date}{' '}
          </div>
          <div>
            <FormattedMessage id="patient.booking-modal.priceBooking" />
          </div>
        </>
      );
    }
    return <></>;
  };

  // Extract data from new API structure
  const user = dataProfile?.user || dataProfile || {};
  const name = user.fullName || '';
  const nameVi = `Bác sĩ ${name}`;
  const nameEn = `Doctor ${name}`;
  const fee = dataProfile?.fee || 0;

  return (
    <div className="profile-doctor-container">
      <div className="intro-doctor">
        <div
          className="content-left"
          style={{
            backgroundImage: `url(${user.image || ''})`,
          }}
        ></div>
        <div className="content-right">
          <div className="up">
            {language === LANGUAGES.VI ? nameVi : nameEn}
          </div>

          <div className="down">
            {isShowDescriptionDoctor === true ? (
              <>
                {dataProfile?.title && (
                  <span>{dataProfile.title}</span>
                )}
              </>
            ) : (
              <>{renderTimeBooking(dataTime)}</>
            )}
          </div>
        </div>
      </div>
      {isShowLinkDetail === true && (
        <div className="view-detail-doctor">
          <Link to={`/detail-doctor/${doctorId}`}>Xem thêm</Link>
        </div>
      )}

      {isShowPrice === true && (
        <div className="price">
          <FormattedMessage id="patient.booking-modal.price" />
          {language === LANGUAGES.VI && (
            <NumericFormat
              className="currency"
              value={fee}
              displayType="text"
              thousandSeparator={true}
              suffix={' VND'}
            />
          )}

          {language === LANGUAGES.EN && (
            <NumericFormat
              className="currency"
              value={fee}
              displayType="text"
              thousandSeparator={true}
              suffix={'$'}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDoctor;
