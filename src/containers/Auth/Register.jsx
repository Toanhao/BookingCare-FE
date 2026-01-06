import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewUserService } from '../../services/userService';
import { CommonUtils } from '../../utils';
import { toast } from 'react-toastify';
import { ProgressSpinner } from 'primereact/progressspinner';
import './Register.scss';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    birthday: '',
    gender: '',
    previewImgURL: '',
    image: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleOnChangeInput = (event, id) => {
    setFormData({
      ...formData,
      [id]: event.target.value,
    });
  };

  const handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let base64 = await CommonUtils.getBase64(file);
      let objectUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        previewImgURL: objectUrl,
        image: base64,
      });
    }
  };

  const checkValidateInput = () => {
    let isValid = true;
    let arrCheck = [
      'email',
      'password',
      'confirmPassword',
      'fullName',
      'phoneNumber',
      'address',
      'birthday',
      'gender',
    ];

    for (let i = 0; i < arrCheck.length; i++) {
      if (!formData[arrCheck[i]]) {
        isValid = false;
        toast.error(`Vui lòng nhập đầy đủ: ${arrCheck[i]}`);
        return isValid;
      }
    }

    // Check email format
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email không hợp lệ');
      return false;
    }

    // Check password length
    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    // Check confirm password
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return false;
    }

    // Check phone number
    let phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error('Số điện thoại không hợp lệ');
      return false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    setIsLoading(true);

    let isValid = checkValidateInput();
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    try {
      let res = await createNewUserService({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        birthday: formData.birthday,
        gender: formData.gender,
        image: formData.image,
      });

      setIsLoading(false);

      if (res && res.errCode === 0) {
        toast.success(
          'Đăng ký tài khoản thành công! Chuyển hướng đến trang đăng nhập...'
        );
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(res.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg =
        error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(errorMsg);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      handleRegister();
    }
  };

  const {
    email,
    password,
    confirmPassword,
    fullName,
    phoneNumber,
    address,
    birthday,
    gender,
  } = formData;

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <ProgressSpinner />
        </div>
      )}
      <div className="register-background">
        <div className="register-container">
          <div className="register-content row">
            <div className="col-12 text-register">Đăng Ký Tài Khoản</div>

            <div className="col-md-6 col-sm-12 form-group register-input">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(event) => handleOnChangeInput(event, 'email')}
                disabled={isLoading}
              />
            </div>

            <div className="col-md-6 col-sm-12 form-group register-input">
              <label>Số Điện Thoại</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChange={(event) => handleOnChangeInput(event, 'phoneNumber')}
                disabled={isLoading}
              />
            </div>

            <div className="col-md-6 col-sm-12 form-group register-input">
              <label>Họ Tên</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập họ tên của bạn"
                value={fullName}
                onChange={(event) => handleOnChangeInput(event, 'fullName')}
                disabled={isLoading}
              />
            </div>

            <div className="col-md-6 col-sm-12 form-group register-input">
              <label>Mật Khẩu</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChange={(event) => handleOnChangeInput(event, 'password')}
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="col-md-6 col-sm-12 form-group register-input">
              <label>Xác Nhận Mật Khẩu</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(event) =>
                  handleOnChangeInput(event, 'confirmPassword')
                }
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="col-md-6 col-sm-12 form-group register-input">
              <label>Ngày Sinh</label>
              <input
                type="date"
                className="form-control"
                value={birthday}
                onChange={(event) => handleOnChangeInput(event, 'birthday')}
                disabled={isLoading}
              />
            </div>

            <div className="col-md-6 col-sm-12 form-group register-input">
              <label>Giới Tính</label>
              <select
                className="form-control"
                value={gender}
                onChange={(event) => handleOnChangeInput(event, 'gender')}
                disabled={isLoading}
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="col-md-6 col-sm-12 form-group register-input">
              <label>Ảnh Đại Diện</label>
              <div className="preview-img-container">
                <input
                  id="previewImg"
                  type="file"
                  hidden
                  onChange={handleOnChangeImage}
                  disabled={isLoading}
                />
                <label className="label-upload" htmlFor="previewImg">
                  Tải ảnh <i className="fa-solid fa-upload"></i>
                </label>
                <div
                  className="preview-image"
                  style={{
                    backgroundImage: `url(${formData.previewImgURL})`,
                  }}
                ></div>
              </div>
            </div>

            <div className="col-12 form-group register-input">
              <label>Địa Chỉ</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập địa chỉ của bạn"
                value={address}
                onChange={(event) => handleOnChangeInput(event, 'address')}
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="col-12 form-group">
              <button
                className="btn-register"
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
              </button>
            </div>

            <div className="col-12 text-center my-3">
              <span className="login-link">
                Đã có tài khoản?{' '}
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                >
                  Đăng Nhập
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
