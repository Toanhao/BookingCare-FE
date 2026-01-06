import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Slider from 'react-slick';
import { Link, useNavigate } from 'react-router-dom';
import { getAllHandbook } from '../../../../services/userService';

const HandBook = ({ settings }) => {
  const navigate = useNavigate();
  const [dataHandbook, setDataHandbook] = useState([]);

  useEffect(() => {
    const fetchHandbooks = async () => {
      const res = await getAllHandbook();
      const data = Array.isArray(res) ? res : res?.data;
      setDataHandbook(data || []);
    };
    fetchHandbooks();
  }, []);

  const handleViewDetailHandbook = (item) => {
    navigate(`/detail-handbook/${item.id}`);
  };

  return (
    <div className="section-share section-handbook">
      <div className="section-container">
        <div className="section-header">
          <span className="title-section">
            {' '}
            <FormattedMessage id="homepage.handbook" />
          </span>
          <Link className="btn-section" to="/all-directory?tab=handbook">
            <FormattedMessage id="homepage.more-Infor" />
          </Link>
        </div>
        <div className="section-body">
          <Slider {...settings}>
            {dataHandbook &&
              dataHandbook.length > 0 &&
              dataHandbook.map((item, index) => {
                const cover = item.image ? `url(${item.image})` : undefined;
                return (
                  <div
                    className="section-customize"
                    key={index}
                    onClick={() => handleViewDetailHandbook(item)}
                  >
                    <div className="customize-border">
                      <div className="outer-bg">
                        <div
                          className="bg-image section-handbook"
                          style={cover ? { backgroundImage: cover } : {}}
                        />
                      </div>
                      <div className="position text-center">
                        <div className="specialty-name">{item.title}</div>
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

export default HandBook;
