/** @format */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './DetailClinic.scss';
import HomeHeader from '../../HomeHeader/HomeHeader';
import ProfileDoctor from '../../../Patient/Doctor/ProfileDoctor';
import DoctorSchedule from '../../../Patient/Doctor/DoctorSchedule';
import DoctorExtraInfor from '../../../Patient/Doctor/DoctorExtraInfor';
import { getAllDetailClinicById } from '../../../../services/userService';
import _ from 'lodash';
import HomeFooter from '../../HomeFooter/HomeFooter';

const DetailClinic = () => {
  const { id } = useParams();
  const [arrDoctorId, setArrDoctorId] = useState([]);
  const [dataDetailClinic, setDataDetailClinic] = useState({});

  useEffect(() => {
    if (id) {
      // axios interceptor returns response.data directly
      const fetchClinic = async () => {
        try {
          let clinic = await getAllDetailClinicById(id);

          if (clinic) {
            const arrDoctorId = Array.isArray(clinic.doctors)
              ? clinic.doctors.map((d) => d.id)
              : [];

            setDataDetailClinic(clinic);
            setArrDoctorId(arrDoctorId);
          }
        } catch (error) {
          console.log('Error fetching clinic:', error);
        }
      };
      fetchClinic();
    }
  }, [id]);

  return (
    <div className="detail-clinic-container">
      <HomeHeader />
      <div className="detail-clinic-body">
        <div className="description-clinic">
          {dataDetailClinic && !_.isEmpty(dataDetailClinic) && (
            <>
              <div>
                <h2 style={{ margin: 0 }}>{dataDetailClinic.name}</h2>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: dataDetailClinic.description,
                }}
              ></div>
            </>
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
                  <div className="doctor-extra-Infor">
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
export default DetailClinic
