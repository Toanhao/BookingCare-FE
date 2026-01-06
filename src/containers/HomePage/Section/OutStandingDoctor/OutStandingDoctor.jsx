/** @format */

import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import computeImageUrl from '../../../../utils/imageUtils';
import userAvatar from '../../../../assets/images/user.svg';
import { Link, useNavigate } from 'react-router-dom';
import { getAllDoctors } from '../../../../services/userService';

const OutStandingDoctor = ({ settings }) => {
  const navigate = useNavigate();
  const [arrDoctors, setArrDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await getAllDoctors();
        const raw = res?.data || res;
        const list = raw?.data || raw || [];

        const normalized = (list || []).map((doc) => {
          const user = doc.user || {};
          return {
            id: doc.id,
            fullName: user.fullName,
            image: user.image,
            title: doc.title,
            specialtyName: doc.specialty?.name,
            clinicName: doc.clinic?.name,
          };
        });

        setArrDoctors(normalized);
      } catch (e) {
        console.error('fetchDoctors error:', e);
        setArrDoctors([]);
      }
    };

    fetchDoctors();
  }, []);

  const handleViewDetailDoctor = (doctor) => {
    navigate(`/detail-doctor/${doctor.id}`);
  };

  return (
    <div className="section-share section-outstanding-doctor">
      <div className="section-container">
        <div className="section-header">
          <span className="title-section">
            <FormattedMessage id="homepage.outstanding-doctor" />
          </span>
          <Link className="btn-section" to="/all-directory?tab=doctor">
            <FormattedMessage id="homepage.more-Infor" />
          </Link>
        </div>
        <div className="section-body section-outstanding-doctor">
          <Slider {...settings}>
            {arrDoctors &&
              arrDoctors.length > 0 &&
              arrDoctors.map((item, index) => {
                const imageUrl = computeImageUrl(item.image) || userAvatar;
                const displayName = item.fullName ;
                return (
                  <div
                    className="section-customize"
                    key={index}
                    onClick={() => handleViewDetailDoctor(item)}
                  >
                    <div className="customize-border">
                      <div className="outer-bg">
                        <div
                          className="bg-image section-outstanding-doctor"
                          style={{ backgroundImage: `url(${imageUrl})` }}
                        />
                      </div>
                      <div className="position text-center">
                        <div>{displayName}</div>
                        <div>
                          Chuyên khoa : {item.specialtyName ? item.specialtyName : ''}
                        </div>
                        {item.clinicName && <div>{item.clinicName}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default OutStandingDoctor;
