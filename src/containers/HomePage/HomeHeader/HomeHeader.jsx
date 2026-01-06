/** @format */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './HomeHeader.scss';
import logo from '../../../assets/logo.svg';
import computeImageUrl from '../../../utils/imageUtils';
import userAvatar from '../../../assets/images/user.svg';
import { FormattedMessage } from 'react-intl';
import { LANGUAGES } from '../../../utils';
import { changeLanguageApp, processLogout } from '../../../store/actions';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from 'primereact/sidebar';
import QuickBookingModal from '../../Patient/Doctor/Modal/QuickBookingModal';
import BookingHistoryModal from '../../Patient/BookingHistory/BookingHistoryModal';

const HomeHeader = (props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.app.language);
  const isLoggedIn = useSelector(
    (state) => state.user && state.user.isLoggedIn
  );
  const userInfo = useSelector((state) => state.user && state.user.userInfo);
  const [visible, setVisible] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isOpenQuickBookingModal, setIsOpenQuickBookingModal] = useState(false);
  const [isOpenBookingHistoryModal, setIsOpenBookingHistoryModal] =
    useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const changeLanguage = (lang) => {
    dispatch(changeLanguageApp(lang));
  };

  const toggleUserMenu = (e) => {
    e?.stopPropagation?.();
    setShowUserMenu((prev) => !prev);
  };

  const handleLogoutFromMenu = () => {
    setShowUserMenu(false);
    dispatch(processLogout());
  };

  const toggleQuickBookingModal = () => {
    setIsOpenQuickBookingModal((prev) => !prev);
  };

  const toggleBookingHistoryModal = () => {
    setIsOpenBookingHistoryModal((prev) => !prev);
    setShowUserMenu(false);
  };

  const goToAllDirectory = (tab) => {
    const t = tab ? `?tab=${tab}` : '';
    navigate(`/all-directory${t}`);
  };

  const handleSupportClick = () => {
    const message = `Nền tảng Đặt khám BookingCare\nĐT:0347581948\nEmail: support@bookingcare.vn\nTrực thuộc: Công ty CP Công nghệ BookingCare\nĐịa chỉ: PTIT Hà Nội`;
    window.alert(message);
  };

  const placeHolder =
    language === LANGUAGES.VI
      ? 'Tìm tất cả chuyên khoa, bác sĩ, cơ sở y tế '
      : 'Find specialty, doctor, clinic';

  return (
    <React.Fragment>
      <div className="home-header-container">
        <div className="home-header-content">
          <div className="left-content">
            <Sidebar
              visible={visible}
              onHide={() => setVisible(false)}
              style={{ width: '260px' }}
            >
              <div className="sidebar-menu">
                <ul>
                  <li>
                    <Link
                      to="/home"
                      onClick={() => setVisible(false)}
                      className="sidebar-link"
                    >
                      <i className="fa-solid fa-home" />
                      <span style={{ marginLeft: 8 }}>Trang chủ</span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/all-directory?tab=specialty"
                      onClick={() => setVisible(false)}
                      className="sidebar-link"
                    >
                      <i className="fa-solid fa-microscope" />
                      <span style={{ marginLeft: 8 }}>
                        {' '}
                        <FormattedMessage id="home-header.speciality" />
                      </span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/all-directory?tab=doctor"
                      onClick={() => setVisible(false)}
                      className="sidebar-link"
                    >
                      <i className="fa-solid fa-user-md" />
                      <span style={{ marginLeft: 8 }}>
                        {' '}
                        <FormattedMessage id="home-header.doctor" />
                      </span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/all-directory?tab=clinic"
                      onClick={() => setVisible(false)}
                      className="sidebar-link"
                    >
                      <i className="fa-solid fa-hospital" />
                      <span style={{ marginLeft: 8 }}>
                        {' '}
                        <FormattedMessage id="home-header.health-facility" />
                      </span>
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/all-directory?tab=handbook"
                      onClick={() => setVisible(false)}
                      className="sidebar-link"
                    >
                      <i className="fa-solid fa-book" />
                      <span style={{ marginLeft: 8 }}>
                        {' '}
                        <FormattedMessage id="home-header.fee" />
                      </span>
                    </Link>
                  </li>

                  <li>
                    <i className="fa-solid fa-question-circle" />
                    <span
                      onClick={() => {
                        handleSupportClick();
                        setVisible(false);
                      }}
                      style={{ marginLeft: 8 }}
                    >
                      <FormattedMessage id="home-header.support" />
                    </span>
                  </li>
                </ul>
              </div>
            </Sidebar>
            <i
              className="fa-solid fa-bars"
              onClick={() => setVisible(true)}
            ></i>
            <Link to="/home">
              <img className="header-logo" src={logo} alt="BookingCare logo" />
            </Link>
          </div>
          <div className="center-content">
            <Link
              to="/all-directory?tab=specialty"
              className="child-content"
              style={{
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div>
                <b>
                  <i className="fa-solid fa-microscope" />
                  <FormattedMessage id="home-header.speciality" />
                </b>
              </div>
              <div className="subs-title">
                <FormattedMessage id="home-header.searchdoctor" />
              </div>
            </Link>

            <Link
              to="/all-directory?tab=clinic"
              className="child-content"
              style={{
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div>
                <b>
                  <i className="fa-solid fa-hospital" />
                  <FormattedMessage id="home-header.health-facility" />
                </b>
              </div>
              <div className="subs-title">
                <FormattedMessage id="home-header.select-room" />
              </div>
            </Link>
            <Link
              to="/all-directory?tab=doctor"
              className="child-content"
              style={{
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div>
                <b>
                  <i className="fa-solid fa-user-doctor" />
                  <FormattedMessage id="home-header.doctor" />
                </b>
              </div>
              <div className="subs-title">
                <FormattedMessage id="home-header.select-doctor" />
              </div>
            </Link>

            <Link
              to="/all-directory?tab=handbook"
              className="child-content"
              style={{
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div>
                <b>
                  <i className="fa-solid fa-book" />
                  <FormattedMessage id="home-header.fee" />
                </b>
              </div>
              <div className="subs-title">
                <FormattedMessage id="home-header.check-health" />
              </div>
            </Link>
          </div>
          <div className="right-content">
            <button
              className="quick-booking-header-btn"
              onClick={toggleQuickBookingModal}
              title="Đặt lịch khám nhanh"
            >
              <i className="fa-solid fa-calendar-plus"></i>
              <span>Đặt lịch nhanh</span>
            </button>

            {/* User Menu */}
            {isLoggedIn ? (
              <div
                className="user-section"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 12,
                  position: 'relative',
                }}
                ref={userMenuRef}
              >
                <div
                  className="user-Info"
                  title={userInfo && userInfo.email}
                  onClick={toggleUserMenu}
                  role="button"
                >
                  {(() => {
                    const avatarUrl =
                      (userInfo && userInfo.image
                        ? computeImageUrl(userInfo.image)
                        : null) || userAvatar;
                    return (
                      <div
                        className="user-avatar"
                        style={{ backgroundImage: `url(${avatarUrl})` }}
                        role="img"
                        aria-label="user avatar"
                      />
                    );
                  })()}
                  <span className="user-name">{userInfo?.fullName}</span>
                </div>

                {showUserMenu && (
                  <div className="user-dropdown">
                    {/* Language Settings */}
                    <div className="user-dropdown-item language-item">
                      <span className="label">
                        <i className="fa-solid fa-globe"></i> Ngôn ngữ:
                      </span>
                      <div className="language-buttons">
                        <button
                          className={`lang-btn ${
                            language === LANGUAGES.VI ? 'active' : ''
                          }`}
                          onClick={() => {
                            changeLanguage(LANGUAGES.VI);
                          }}
                        >
                          VN
                        </button>
                        <button
                          className={`lang-btn ${
                            language === LANGUAGES.EN ? 'active' : ''
                          }`}
                          onClick={() => {
                            changeLanguage(LANGUAGES.EN);
                          }}
                        >
                          EN
                        </button>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Booking History */}
                    <div
                      className="user-dropdown-item"
                      onClick={toggleBookingHistoryModal}
                    >
                      <i className="fa-solid fa-history"></i>
                      <span>Lịch sử khám</span>
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Support */}
                    <div
                      className="user-dropdown-item"
                      onClick={() => {
                        handleSupportClick();
                        setShowUserMenu(false);
                      }}
                    >
                      <i className="fa-solid fa-question-circle"></i>
                      <span>
                        <FormattedMessage id="home-header.support" />
                      </span>
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Logout */}
                    <div
                      className="user-dropdown-item"
                      onClick={handleLogoutFromMenu}
                      role="button"
                    >
                      <i
                        className="fa-solid fa-sign-out-alt"
                        style={{ marginRight: 8 }}
                      ></i>
                      <FormattedMessage
                        id="home-header.logout"
                        defaultMessage="Logout"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-button">
                <i className="fa-solid fa-sign-in-alt"></i>
                <FormattedMessage
                  id="home-header.login"
                  defaultMessage="Login"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
      {props.isShowBanner && (
        <div className="home-header-banner">
          <div className="content-up">
            <div className="title1">
              <FormattedMessage id="banner.title1" />
            </div>
            <div className="title2">
              <FormattedMessage id="banner.title2" />
            </div>
            <div className="search" onClick={() => goToAllDirectory('all')}>
              <i className="fa-solid fa-search"></i>
              <input type="text" placeholder={placeHolder}></input>
            </div>
          </div>
          <div className="content-down">
            <div className="options">
              <div className="option-child">
                <div className="icon-child">
                  <i className="fa-regular fa-hospital"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child1" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fa-solid fa-mobile-alt"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child2" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fa-solid fa-procedures"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child3" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fa-solid fa-flask"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child4" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fa-solid fa-user-md"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child5" />
                </div>
              </div>
              <div className="option-child">
                <div className="icon-child">
                  <i className="fa-solid fa-briefcase-medical"></i>
                </div>
                <div className="text-child">
                  <FormattedMessage id="banner.child6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Booking Modal */}
      <QuickBookingModal
        isOpenModal={isOpenQuickBookingModal}
        closeModal={toggleQuickBookingModal}
      />

      {/* Booking History Modal */}
      <BookingHistoryModal
        isOpen={isOpenBookingHistoryModal}
        closeModal={toggleBookingHistoryModal}
      />
    </React.Fragment>
  );
};

export default HomeHeader;
