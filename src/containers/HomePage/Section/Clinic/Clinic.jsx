/** @format */

import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import { getAllClinic } from '../../../../services/userService';
import { Link, useNavigate } from 'react-router-dom';

const Clinic = ({ settings }) => {
  const navigate = useNavigate();
  const [dataClinics, setDataClinics] = useState([]);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await getAllClinic();
        if (res?.errCode === 0 && res.data) {
          setDataClinics(res.data);
        }
      } catch (error) {
        console.error('Error fetching clinics:', error);
      }
    };
    fetchClinics();
  }, []);

  const handleViewDetailClinic = (clinic) => {
    navigate(`/detail-clinic/${clinic.id}`);
  };

  return (
    <div className="section-share section-medical-facility">
      <div className="section-container">
        <div className="section-header">
          <span className="title-section">
            <FormattedMessage id="homepage.facilities" />
          </span>
          <Link className="btn-section" to="/all-directory?tab=clinic">
            <FormattedMessage id="homepage.more-Infor" />
          </Link>
        </div>
        <div className="section-body section-medical-facility">
          <Slider {...settings}>
            {dataClinics &&
              dataClinics.length > 0 &&
              dataClinics.map((item, index) => (
                <div
                  className="section-customize"
                  key={index}
                  onClick={() => handleViewDetailClinic(item)}
                >
                  <div className="customize-border">
                    <div className="outer-bg">
                      <div
                        className="bg-image section-medical-facility"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                    </div>
                    <div className="position text-center">
                      <div className="specialty-name">{item.name}</div>
                    </div>
                  </div>
                </div>
              ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Clinic;
