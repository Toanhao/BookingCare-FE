import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';

import * as actions from '../../store/actions';
import { handleLoginApi } from '../../services/userService';
import { setAccessToken, setRefreshToken } from '../../utils/authToken';
import { getDefaultRouteByRole } from '../../utils';
import './Login.scss';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setErrMessage('');
    setIsLoading(true);
    try {
      const res = await handleLoginApi(email, password);
      if (!res || res.errCode !== 0) {
        setErrMessage(res?.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Trích xuất user và token từ response
      const userData = res.data || {};
      const { user: rawUser, accessToken, refreshToken } = userData;
      const user =
        rawUser && rawUser.dataValues ? { ...rawUser.dataValues } : rawUser;

      // ========== Lưu cả 2 tokens vào localStorage ==========
      if (accessToken) {
        setAccessToken(accessToken);
      }
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      // Nếu user có id thì đăng nhập thành công, lưu vào Redux
      if (user && user.id) {
        dispatch(actions.userLoginSuccess(user));
        navigate(getDefaultRouteByRole(user.role));
      } else {
        setErrMessage('Invalid user data');
        setIsLoading(false);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Login failed';
      setErrMessage(message);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      handleLogin();
    }
  };

  return (
    <div className="login-background">
      {isLoading && (
        <div className="loading-overlay">
          <ProgressSpinner />
        </div>
      )}
      <div className="login-container">
        <div className="login-content">
          <div className="login-content row">
            <div className="col-12 text-login">Login</div>
            <div className="col-12 form-group login-input">
              <label>Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="col-12 form-group login-input">
              <label>Password</label>
              <div className="custom-input-password">
                <input
                  type={isShowPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <span onClick={() => setIsShowPassword(!isShowPassword)}>
                  <i
                    className={
                      isShowPassword
                        ? 'fa-regular fa-eye'
                        : 'fa-regular fa-eye-slash'
                    }
                  >
                    {' '}
                  </i>
                </span>
              </div>
            </div>
            <div className="col-12" style={{ color: 'red' }}>
              {errMessage}
            </div>
            <div className="col-12 form-group">
              <button
                className="btn-login"
                onClick={handleLogin}
                disabled={isLoading}
              >
                Log in
              </button>
            </div>
            <div className="col-12">
              <span className="forgot-password">Forgot your password ?</span>
            </div>
            <div className="col-12 text-center register-signup">
              <span className="text-signup">
                Chưa có tài khoản?{' '}
                <a
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                >
                  Đăng ký ngay
                </a>
              </span>
            </div>
            <div className="col-12 text-center my-3">
              <span className="text-other-login">Or login with:</span>
            </div>
            <div className="col-12 social-login">
              <i className="fa-brands fa-google-plus-g google"></i>
              <i className="fa-brands fa-facebook-f facebook"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
