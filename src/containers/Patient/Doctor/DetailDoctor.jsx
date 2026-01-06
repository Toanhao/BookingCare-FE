import { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HomeHeader from '../../HomePage/HomeHeader/HomeHeader';
import './DetailDoctor.scss';
import { getDetailInforDoctor } from '../../../services/userService';
import { LANGUAGES } from '../../../utils';
import DoctorSchedule from './DoctorSchedule';
import DoctorExtraInfor from './DoctorExtraInfor';
import HomeFooter from '../../HomePage/HomeFooter/HomeFooter';

const DetailDoctor = () => {
  const { id } = useParams();
  const [detailDoctor, setDetailDoctor] = useState({});
  const [currentDoctorId, setCurrentDoctorId] = useState(-1);
  const language = useSelector((state) => state.app.language);

  useEffect(() => {
    if (id) {
      setCurrentDoctorId(id);
      const fetchDoctor = async () => {
        try {
          let res = await getDetailInforDoctor(id);
          if (res && res.errCode === 0 && res.data) {
            setDetailDoctor(res.data);
          }
        } catch (error) {
          console.log('Error fetching doctor:', error);
        }
      };
      fetchDoctor();
    }
  }, [id]);

  // Extract data from new API structure
  const user = detailDoctor?.user || {};
  const clinic = detailDoctor?.clinic || {};
  const specialty = detailDoctor?.specialty || {};

  let name = user.fullName || '';
  let nameVi = `Bác sĩ ${name}`;
  let nameEn = `Doctor ${name}`;

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <div className="doctor-detail-container">
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
              {detailDoctor.title && <span>{detailDoctor.title}</span>}
            </div>
            {specialty.name && (
              <div className="specialty-info">
                <i className="fa-solid fa-stethoscope"></i>
                <span> Chuyên khoa: {specialty.name}</span>
              </div>
            )}
            {clinic.name && (
              <div className="clinic-info">
                <i className="fa-solid fa-hospital"></i>
                <span> Phòng khám: {clinic.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="schedule-doctor">
          <div className="content-left">
            <DoctorSchedule doctorIdFromParent={currentDoctorId} />
          </div>
          <div className="content-right">
            <DoctorExtraInfor
              doctorIdFromParent={currentDoctorId}
              detailDoctorFromParent={detailDoctor}
            />
          </div>
        </div>

        <div className="detail-Infor-doctor">
          {detailDoctor.bio && (
            <div>
              <h3>Thông tin chi tiết</h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: detailDoctor.bio,
                }}
              ></div>
            </div>
          )}
        </div>

        <HomeFooter />
      </div>
    </>
  );
};

export default DetailDoctor;
