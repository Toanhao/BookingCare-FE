/** @format */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './DetailSpecialty.scss';
import HomeHeader from '../../HomeHeader/HomeHeader';
import ProfileDoctor from '../../../Patient/Doctor/ProfileDoctor';
import DoctorSchedule from '../../../Patient/Doctor/DoctorSchedule';
import DoctorExtraInfor from '../../../Patient/Doctor/DoctorExtraInfor';
import { getAllDetailSpecialtyById } from '../../../../services/userService';
import _ from 'lodash';
import HomeFooter from '../../HomeFooter/HomeFooter';

const DetailSpecialty = () => {
  const { id } = useParams();
  const [arrDoctorId, setArrDoctorId] = useState([]);
  const [dataDetailSpecialty, setDataDetailSpecialty] = useState({});

  useEffect(() => {
    if (id) {
      const fetchSpecialty = async () => {
        try {
          let res = await getAllDetailSpecialtyById({
            id: id,
          });

          if (res && res.success === true) {
            let data = res.data;
            let arrDoctorId = [];
            if (data && !_.isEmpty(res.data)) {
              let arr = data.doctors;
              if (arr && arr.length > 0) {
                arr.map((item) => {
                  return arrDoctorId.push(item.id);
                });
              }
            }

            setDataDetailSpecialty(res.data);
            setArrDoctorId(arrDoctorId);
          }
        } catch (error) {
          console.log('Error fetching specialty:', error);
        }
      };
      fetchSpecialty();
    }
  }, [id]);

  return (
    <div className="detail-specialty-container">
      <HomeHeader />
      <div className="detail-specialty-body">
        <div className="description-specialty">
          {dataDetailSpecialty && !_.isEmpty(dataDetailSpecialty) && (
            <div
              dangerouslySetInnerHTML={{
                __html: dataDetailSpecialty.description,
              }}
            ></div>
          )}
        </div>

        {arrDoctorId &&
          arrDoctorId.length > 0 &&
          arrDoctorId.map((item, index) => {
            return (
              <div className="each-doctor" key={index}>
                <div className="dt-content-left">
                  <div className="profile-doctor">
                    <ProfileDoctor
                      doctorId={item}
                      isShowDescriptionDoctor={true}
                      isShowLinkDetail={true}
                      isShowPrice={false}
                    />
                  </div>
                </div>
                <div className="dt-content-right">
                  <div className="doctor-schedule">
                    <DoctorSchedule doctorIdFromParent={item} />
                  </div>
                  <div className="doctor-extra-Info">
                    <DoctorExtraInfor doctorIdFromParent={item} />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      <HomeFooter />
    </div>
  );
};

export default DetailSpecialty;
