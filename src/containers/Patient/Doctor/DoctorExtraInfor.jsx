/** @format */

import React, { useState, useEffect } from 'react';
import './DoctorExtraInfor.scss';
import { useSelector } from 'react-redux';
import { LANGUAGES } from '../../../utils';
import { FormattedMessage } from 'react-intl';
import { NumericFormat } from 'react-number-format';
import { Link } from 'react-router-dom';
import { getDetailInforDoctor } from '../../../services/userService';

const DoctorExtraInfor = ({ doctorIdFromParent, detailDoctorFromParent }) => {
  const language = useSelector(state => state.app.language);
  const [extraInfor, setExtraInfor] = useState({});

  const updateExtraInfor = (doctor) => {
    if (doctor && doctor.clinicId) {
      const mappedData = {
        clinicId: doctor.clinicId,
        clinicData: doctor.clinic || {},
        priceTypeData: {
          valueVi: doctor.fee ? `${doctor.fee.toLocaleString('vi-VN')}` : '0',
          valueEn: doctor.fee ? `${doctor.fee}` : '0',
        },
      };
      setExtraInfor(mappedData);
    }
  };

  useEffect(() => {
    if (detailDoctorFromParent) {
      updateExtraInfor(detailDoctorFromParent);
    } 
    else if (doctorIdFromParent) {
      (async () => {
        let res = await getDetailInforDoctor(doctorIdFromParent);
        if (res && res.errCode === 0 && res.data) {
          updateExtraInfor(res.data);
        }
      })();
    }
  }, [doctorIdFromParent, detailDoctorFromParent]);

  return (
    <div className="doctor-extra-Infor-container">
      <div className="content-up">
        <div className="text-address">
          <FormattedMessage id="patient.extra-Infor-doctor.text-address" />
        </div>

        <div className="name-clinic">
          {extraInfor &&
          extraInfor.clinicData &&
          extraInfor.clinicData.name &&
          extraInfor.clinicId ? (
            <Link to={`/detail-clinic/${extraInfor.clinicId}`}>
              {extraInfor.clinicData.name}
            </Link>
          ) : (
            ''
          )}
        </div>
        <div className="detail-address">
          {extraInfor &&
          extraInfor.clinicData &&
          extraInfor.clinicData.address
            ? extraInfor.clinicData.address
            : ''}
        </div>
      </div>

      <div className="content-down">
        <div className="short-Infor">
          <FormattedMessage id="patient.extra-Infor-doctor.price" />
          {extraInfor &&
            extraInfor.priceTypeData &&
            language === LANGUAGES.VI && (
              <NumericFormat
                className="currency"
                value={extraInfor.priceTypeData.valueVi}
                displayType="text"
                thousandSeparator={true}
                suffix={'VND'}
              />
            )}

          {extraInfor &&
            extraInfor.priceTypeData &&
            language === LANGUAGES.EN && (
              <NumericFormat
                className="currency"
                value={extraInfor.priceTypeData.valueEn}
                displayType="text"
                thousandSeparator={true}
                suffix={'$'}
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default DoctorExtraInfor;
