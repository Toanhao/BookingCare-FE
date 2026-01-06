import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { LANGUAGES, CRUD_ACTIONS, CommonUtils } from '../../../utils';
import * as actions from '../../../store/actions';
import { createNewUserService, editUserService } from '../../../services/userService';
import { toast } from 'react-toastify';
import './UserRedux.scss';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import TableManageUser from './TableManageUser';

const UserRedux = () => {
  const [genderArr, setGenderArr] = useState([]);
  const [roleArr, setRoleArr] = useState([]);
  const [previewImgURL, setPreviewImgURL] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('');
  const [image, setImage] = useState('');
  const [action, setAction] = useState('');
  const [userEditId, setUserEditId] = useState('');

  const language = useSelector((state) => state.app.language);
  const listUsers = useSelector((state) => state.admin.users);
  const dispatch = useDispatch();

  useEffect(() => {
    const genders = [
      { keyMap: 'Nam', valueVi: 'Nam', valueEn: 'Male' },
      { keyMap: 'Nữ', valueVi: 'Nữ', valueEn: 'Female' },
      { keyMap: 'Khác', valueVi: 'Khác', valueEn: 'Other' },
    ];
    const roles = [
      { keyMap: 'PATIENT', valueVi: 'Bệnh nhân', valueEn: 'Patient' },
      { keyMap: 'DOCTOR', valueVi: 'Bác sĩ', valueEn: 'Doctor' },
    ];
    setGenderArr(genders);
    setRoleArr(roles);
    setGender(genders[0].keyMap);
    setRole(roles[0].keyMap);
  }, []);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhoneNumber('');
    setAddress('');
    setBirthday('');
    setRole(roleArr && roleArr.length > 0 ? roleArr[0].keyMap : '');
    setGender(genderArr && genderArr.length > 0 ? genderArr[0].keyMap : '');
    setImage('');
    setAction(CRUD_ACTIONS.CREATE);
    setPreviewImgURL('');
  }, [listUsers, genderArr, roleArr]);

  const handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let base64 = await CommonUtils.getBase64(file);
      let objectUrl = URL.createObjectURL(file);
      setPreviewImgURL(objectUrl);
      setImage(base64);
    }
  };

  const openPreviewImage = () => {
    if (!previewImgURL) return;
    setIsOpen(true);
  };

  const handleSaveUser = async () => {
    let isValid = checkValidateInput();
    if (isValid === false) return;

    const userData = {
      email: email,
      password: password,
      fullName: fullName,
      address: address,
      phoneNumber: phoneNumber,
      birthday: birthday,
      gender: gender,
      role: role,
      image: image,
    };

    try {
      let res;
      if (action === CRUD_ACTIONS.CREATE) {
        res = await createNewUserService(userData);
        if (res && res.errCode === 0) {
          toast.success('Tạo người dùng thành công');
          dispatch(actions.fetchAllUsersStart());
        } else {
          toast.error(res?.message || 'Tạo người dùng thất bại');
        }
      }
      if (action === CRUD_ACTIONS.EDIT) {
        res = await editUserService({ id: userEditId, ...userData });
        if (res && res.errCode === 0) {
          toast.success('Cập nhật người dùng thành công');
          dispatch(actions.fetchAllUsersStart());
        } else {
          toast.error(res?.message || 'Cập nhật người dùng thất bại');
        }
      }
    } catch (e) {
      console.log('handleSaveUser error:', e);
      toast.error('Có lỗi xảy ra');
    }
  };

  const checkValidateInput = () => {
    let isValid = true;
    let arrCheck = ['email', 'password', 'fullName', 'phoneNumber', 'address'];
    const stateValues = {
      email,
      password,
      fullName,
      phoneNumber,
      address,
    };
    for (let i = 0; i < arrCheck.length; i++) {
      if (!stateValues[arrCheck[i]]) {
        isValid = false;
        alert('This input is required: ' + arrCheck[i]);
        break;
      }
    }
    return isValid;
  };

  const onChangeInput = (event, id) => {
    const value = event.target.value;
    const setters = {
      email: setEmail,
      password: setPassword,
      fullName: setFullName,
      phoneNumber: setPhoneNumber,
      address: setAddress,
      birthday: setBirthday,
      gender: setGender,
      role: setRole,
    };
    if (setters[id]) {
      setters[id](value);
    }
  };

  const handleEditUserFromParent = (user) => {
    let imageBase64 = '';
    if (user.image) {
      if (user.image.startsWith('data:')) {
        imageBase64 = user.image;
      } else {
        imageBase64 = `data:image/jpeg;base64,${user.image}`;
      }
    }

    // Convert birthday to YYYY-MM-DD format for input type="date"
    let birthdayFormatted = '';
    if (user.birthday) {
      const date = new Date(user.birthday);
      birthdayFormatted = date.toISOString().split('T')[0];
    }

    setEmail(user.email);
    setPassword('HARDCODE');
    setFullName(user.fullName);
    setPhoneNumber(user.phoneNumber);
    setAddress(user.address);
    setBirthday(birthdayFormatted);
    setRole(user.role);
    setGender(user.gender);
    setImage('');
    setPreviewImgURL(imageBase64);
    setAction(CRUD_ACTIONS.EDIT);
    setUserEditId(user.id);
  };

  const genders = genderArr;
  const roles = roleArr;
  const isGetGenders = false;

  return (
    <div className="user-redux-container">
      <div className="title">Quản lý người dùng</div>
      <div className="use-redux-body">
        <div className="container">
          <div className="row">
            <div className="col-12 my-3 heading">
              <FormattedMessage id="manage-user.add" />
            </div>
            <div className="col-12">
              {isGetGenders === true ? 'Loading gender' : ''}
            </div>
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.email" />
              </label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(event) => {
                  onChangeInput(event, 'email');
                }}
                disabled={action === CRUD_ACTIONS.EDIT ? true : false}
              />
            </div>
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.password" />
              </label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(event) => {
                  onChangeInput(event, 'password');
                }}
                disabled={action === CRUD_ACTIONS.EDIT ? true : false}
              />
            </div>
            <div className="col-6">
              <label>Họ tên</label>
              <input
                className="form-control"
                type="text"
                value={fullName}
                onChange={(event) => {
                  onChangeInput(event, 'fullName');
                }}
              />
            </div>
            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.phone-number" />
              </label>
              <input
                className="form-control"
                type="text"
                value={phoneNumber}
                onChange={(event) => {
                  onChangeInput(event, 'phoneNumber');
                }}
              />
            </div>
            <div className="col-9">
              <label>
                <FormattedMessage id="manage-user.address" />
              </label>
              <input
                className="form-control"
                type="text"
                value={address}
                onChange={(event) => {
                  onChangeInput(event, 'address');
                }}
              />
            </div>

            <div className="col-3">
              <label>Ngày sinh</label>
              <input
                className="form-control"
                type="date"
                value={birthday}
                onChange={(event) => {
                  onChangeInput(event, 'birthday');
                }}
              />
            </div>

            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.gender" />
              </label>
              <select
                className="form-control"
                onChange={(event) => {
                  onChangeInput(event, 'gender');
                }}
                value={gender}
              >
                {genders &&
                  genders.length > 0 &&
                  genders.map((item, index) => {
                    return (
                      <option key={index} value={item.keyMap}>
                        {language === LANGUAGES.VI
                          ? item.valueVi
                          : item.valueEn}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Position removed in new backend schema */}

            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.role" />
              </label>
              <select
                className="form-control"
                onChange={(event) => {
                  onChangeInput(event, 'role');
                }}
                value={role}
              >
                {roles &&
                  roles.length > 0 &&
                  roles.map((item, index) => {
                    return (
                      <option key={index} value={item.keyMap}>
                        {language === LANGUAGES.VI
                          ? item.valueVi
                          : item.valueEn}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="col-3">
              <label>
                <FormattedMessage id="manage-user.image" />
              </label>
              <div className="preview-img-container">
                <input
                  id="previewImg"
                  type="file"
                  hidden
                  onChange={(event) => handleOnChangeImage(event)}
                />
                <label className="label-upload" htmlFor="previewImg">
                  Tải ảnh <i className="fa-solid fa-upload"></i>{' '}
                </label>
                <div
                  className="preview-image"
                  style={{
                    backgroundImage: `url(${previewImgURL})`,
                  }}
                  onClick={() => openPreviewImage()}
                ></div>
              </div>
            </div>

            <div className="col-12 my-3">
              <button
                className={
                  action === CRUD_ACTIONS.EDIT
                    ? 'btn btn-warning'
                    : 'btn btn-primary'
                }
                onClick={() => handleSaveUser()}
              >
                {action === CRUD_ACTIONS.EDIT ? (
                  <FormattedMessage id="manage-user.edit" />
                ) : (
                  <FormattedMessage id="manage-user.save" />
                )}
              </button>
            </div>

            <div className="col-12 mb-5">
              <TableManageUser
                handleEditUserFromParentKey={handleEditUserFromParent}
                action={action}
              />
            </div>
          </div>
        </div>
      </div>

      {isOpen === true && (
        <Lightbox
          open={isOpen}
          close={() => setIsOpen(false)}
          slides={[{ src: previewImgURL }]}
        />
      )}
    </div>
  );
};

export default UserRedux;
