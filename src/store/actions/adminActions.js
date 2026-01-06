import actionTypes from './actionTypes';
import {
  getAllUsers,
  getAllDoctors,
  getAllDoctorsUser,
  getAllSpecialty,
  getAllClinic,
} from '../../services/userService';
import { toast } from 'react-toastify';

// Allcode endpoints removed in new backend; gender/role/position are managed locally in components.


export const fetchAllUsersStart = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllUsers('ALL');
      if (res && res.errCode === 0) {
        dispatch(fetchAllUsersSuccess(res.users.reverse()));
      } else {
        toast.error('Lấy danh sách người dùng thất bại');
        dispatch(fetchAllUsersFailed());
      }
    } catch (e) {
      toast.error('Lấy danh sách người dùng thất bại');
      dispatch(fetchAllUsersFailed());
      console.log('fetchAllUsersFailed error', e);
    }
  };
};

export const fetchAllUsersSuccess = (data) => ({
  type: actionTypes.FETCH_ALL_USERS_SUCCESS,
  users: data,
});

export const fetchAllUsersFailed = () => ({
  type: actionTypes.FETCH_ALL_USERS_FAILED,
});

export const fetchAllDoctors = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllDoctors();
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_SUCCESS,
          dataDr: res.data,
        });
      } else {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
        });
      }
    } catch (e) {
      console.log('FETCH_ALL_DOCTORS_FAILED', e);
      dispatch({
        type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
      });
    }
  };
};

export const fetchAllDoctorsUser = () => {
  return async (dispatch, getState) => {
    try {
      let res = await getAllDoctorsUser();
      if (res && res.errCode === 0) {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_SUCCESS,
          dataDr: res.data,
        });
      } else {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
        });
      }
    } catch (e) {
      console.log('FETCH_ALL_DOCTORS_USER_FAILED', e);
      dispatch({
        type: actionTypes.FETCH_ALL_DOCTORS_FAILED,
      });
    }
  };
};

// Schedule time now handled via /api/time-slots in components; remove allcode schedule fetch.

export const getRequiredDoctorInfor = () => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: actionTypes.FETCH_REQUIRED_DOCTOR_Infor_START });
      let resSpecialty = await getAllSpecialty();
      let resClinic = await getAllClinic();
      if (
        resSpecialty &&
        resSpecialty.errCode === 0 &&
        resClinic &&
        resClinic.errCode === 0
      ) {
        // Since allcode is removed, provide minimal placeholders for price/payment/province
        const data = {
          resPrice: [],
          resPayment: [],
          resProvince: [],
          resSpecialty: resSpecialty.data,
          resClinic: resClinic.data,
        };
        dispatch(fetchRequiredDoctorInforSuccess(data));
      } else {
        dispatch(fetchRequiredDoctorInforFailed());
      }
    } catch (e) {
      console.log('getRequiredDoctorInfor', e);
      dispatch(fetchRequiredDoctorInforFailed());
    }
  };
};

export const fetchRequiredDoctorInforSuccess = (allRequiredData) => ({
  type: actionTypes.FETCH_REQUIRED_DOCTOR_Infor_SUCCESS,
  data: allRequiredData,
});

export const fetchRequiredDoctorInforFailed = () => ({
  type: actionTypes.FETCH_REQUIRED_DOCTOR_Infor_FAILED,
});
