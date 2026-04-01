/** @format */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../store/actions';
import Navigator from '../../components/Navigator';
import { adminMenu, doctorMenu } from './menuApp';
import './Header.scss';
import { LANGUAGES, USER_ROLE } from '../../utils';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';

const Header = () => {
  const dispatch = useDispatch();
  const { userInfo, language } = useSelector((state) => ({
    userInfo: state.user.userInfo,
    language: state.app.language,
  }));
  const [menuApp, setMenuApp] = useState([]);

  const handleChangeLanguage = (language) => {
    dispatch(actions.changeLanguageApp(language));
  };

  const processLogout = () => {
    dispatch(actions.processLogout());
  };

  const syncMenuFromUser = (userInfo) => {
    let menu = [];
    if (userInfo && !_.isEmpty(userInfo)) {
      const role = userInfo.role ? userInfo.role : USER_ROLE.ADMIN;
      if (role === USER_ROLE.ADMIN) menu = adminMenu;
      if (role === USER_ROLE.DOCTOR) menu = doctorMenu;
    }
    setMenuApp(menu);
  };

  useEffect(() => {
    syncMenuFromUser(userInfo);
  }, [userInfo]);

  return (
    <div className="header-container">
      {/* thanh navigator */}
      <div className="header-tabs-container">
        <Navigator menus={menuApp} />
      </div>

      <div className="languages">
        <span className="welcome">
          <FormattedMessage id="home-header.welcome" />
          {userInfo ? userInfo.fullName : ''}!
        </span>
        <span
          className={
            language === LANGUAGES.VI ? 'language-vi active' : 'language-vi'
          }
          onClick={() => {
            handleChangeLanguage(LANGUAGES.VI);
          }}
        >
          <i className="fa-solid fa-globe"></i> VN
        </span>
        <span
          className={
            language === LANGUAGES.EN ? 'language-en active' : 'language-en'
          }
          onClick={() => {
            handleChangeLanguage(LANGUAGES.EN);
          }}
        >
          <i className="fa-solid fa-globe"></i> EN
        </span>
        {/* nút logout */}
        <div className="btn btn-logout" onClick={processLogout} title="Log out">
          <i className="fa-solid fa-power-off"></i>
        </div>
      </div>
    </div>
  );
};

export default Header;
