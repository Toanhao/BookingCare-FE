/** @format */

import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import { getAllSpecialty } from '../../../../services/userService';
import { Link, useNavigate } from 'react-router-dom';

const Specialty = ({ settings }) => {
  const navigate = useNavigate();
  const [dataSpecialty, setDataSpecialty] = useState([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      const res = await getAllSpecialty();
      if (res && res.errCode === 0) {
        setDataSpecialty(res.data || []);
      }
    };
    fetchSpecialties();
  }, []);

  const handleViewDetailSpecialty = (item) => {
    navigate(`/detail-specialty/${item.id}`);
  };

  return (
    <div className="section-share section-specialty">
      <div className="section-container">
        <div className="section-header">
          <span className="title-section">
            <FormattedMessage id="homepage.specialty" />
          </span>
          <Link className="btn-section" to="/all-directory?tab=specialty">
            <FormattedMessage id="homepage.more-Infor" />
          </Link>
        </div>
        <div className="section-body">
          <Slider {...settings}>
            {dataSpecialty &&
              dataSpecialty.length > 0 &&
              dataSpecialty.map((item, index) => (
                <div
                  className="section-customize"
                  key={index}
                  onClick={() => handleViewDetailSpecialty(item)}
                >
                  <div className="customize-border">
                    <div className="outer-bg">
                      <div
                        className="bg-image section-specialty"
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

export default Specialty;
