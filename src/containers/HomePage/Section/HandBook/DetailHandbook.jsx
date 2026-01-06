/** @format */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './DetailHandbook.scss';
import HomeHeader from '../../HomeHeader/HomeHeader';
import {
  getDetailHandbookById,
  getAllHandbook,
} from '../../../../services/userService';
import _ from 'lodash';
import HomeFooter from '../../HomeFooter/HomeFooter';

const DetailHandbook = () => {
  const { id } = useParams();
  const [dataDetailHandbook, setDataDetailHandbook] = useState({});
  const [allHandbooks, setAllHandbooks] = useState([]);

  const fetchHandbooks = useCallback(async () => {
    if (id) {
      try {
        const detailRes = await getDetailHandbookById(id);
        setDataDetailHandbook(detailRes?.data ? detailRes.data : detailRes || {});

        const allRes = await getAllHandbook();
        setAllHandbooks(Array.isArray(allRes) ? allRes : allRes?.data || []);
      } catch (error) {
        console.log('Error fetching handbooks:', error);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchHandbooks();
  }, [fetchHandbooks]);

  const handleSelectHandbook = (handbookId) => {
    window.location.href = `/detail-handbook/${handbookId}`;
  };

  const handleSelectDoctor = (doctorId) => {
    window.location.href = `/detail-doctor/${doctorId}`;
  };

  let otherHandbooks = allHandbooks.filter(
    (handbook) => handbook.id !== parseInt(id)
  );

  return (
    <div className="detail-handbook-container">
      <HomeHeader />
      <div className="detail-handbook-body">
        <div className="detail-handbook-wrapper">
          <div className="handbook-content">
            {dataDetailHandbook && !_.isEmpty(dataDetailHandbook) && (
              <div>
                <div className="handbook-header">
                  {dataDetailHandbook.image && (
                    <div
                      className="handbook-image"
                      style={{
                        backgroundImage: `url(${dataDetailHandbook.image})`,
                      }}
                    ></div>
                  )}
                  <div className="handbook-header-content">
                    <h1 className="handbook-title">
                      {dataDetailHandbook.title}
                    </h1>
                    {dataDetailHandbook.doctor &&
                      dataDetailHandbook.doctor.user && (
                        <div
                          className="handbook-author"
                          onClick={() =>
                            handleSelectDoctor(dataDetailHandbook.doctor.id)
                          }
                        >
                          {dataDetailHandbook.doctor.user.image && (
                            <img
                              src={dataDetailHandbook.doctor.user.image}
                              alt="author"
                              className="author-avatar"
                            />
                          )}
                          <div className="author-info">
                            <p className="author-name">
                              Tác giả bài viết : {dataDetailHandbook.doctor.user.fullName}
                            </p>
                            {dataDetailHandbook.doctor.title && (
                              <p className="author-title">
                                {dataDetailHandbook.doctor.title}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
                <div
                  className="handbook-html"
                  dangerouslySetInnerHTML={{
                    __html: dataDetailHandbook.content,
                  }}
                ></div>
              </div>
            )}
          </div>

          <div className="handbook-sidebar">
            <div className="sidebar-card">
              <h3 className="sidebar-title">Bài viết khác</h3>
              <div className="sidebar-list">
                {otherHandbooks && otherHandbooks.length > 0 ? (
                  otherHandbooks.map((handbook, index) => (
                    <div
                      key={index}
                      className="sidebar-item"
                      onClick={() => handleSelectHandbook(handbook.id)}
                    >
                      <div className="sidebar-item-image">
                        {handbook.image ? (
                          <img src={handbook.image} alt={handbook.title} />
                        ) : (
                          <div className="sidebar-placeholder" />
                        )}
                      </div>
                      <div className="sidebar-item-info">
                        <h4 className="sidebar-item-title">
                          {handbook.title}
                        </h4>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-items">Không có bài viết khác</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <HomeFooter />
    </div>
  );
};
export default DetailHandbook
