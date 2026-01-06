/** @format */

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './ManageSchedule.scss';
import { FormattedMessage } from 'react-intl';
import * as actions from '../../../store/actions';
import Select from 'react-select';
import { USER_ROLE } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import moment from 'moment';
import { toast } from 'react-toastify';
import { createScheduleBulkNew, getTimeSlots, getSchedules } from '../../../services/userService';

const ManageSchedule = () => {
  const [listDoctors, setListDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rangeTime, setRangeTime] = useState([]);
  const [maxPatient, setMaxPatient] = useState(2);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [minDate] = useState('today');

  const isLoggedIn = useSelector(state => state.user.isLoggedIn);
  const userInfo = useSelector(state => state.user.userInfo);
  const allDoctors = useSelector(state => state.admin.allDoctors);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.fetchAllDoctors());

    const loadTimeSlots = async () => {
      try {
        setLoadingSlots(true);
        const res = await getTimeSlots();
        const timeSlots = (res?.data) || res;
        const rangeTimeData = Array.isArray(timeSlots)
          ? timeSlots.map((t) => ({ ...t, isSelected: false }))
          : [];
        setRangeTime(rangeTimeData);
      } catch (e) {
        setRangeTime([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadTimeSlots();

    // Auto-select doctor for DOCTOR role
    if (userInfo?.role === 'DOCTOR') {
      const name = userInfo.fullName;
      setSelectedDoctor({
        label: name,
        value: userInfo.id,
      });
    }
  }, [dispatch, userInfo]);

  const buildDataInputSelect = (inputData) => {
    if (!inputData || inputData.length === 0) return [];

    return inputData.reduce((result, item) => {
      let object = {};
      if (item.user?.fullName) {
        object = {
          label: item.user.fullName,
          value: item.id,
        };
      }
      if (object.value) result.push(object);
      return result;
    }, []);
  };

  useEffect(() => {
    if (allDoctors) {
      let dataSelect = buildDataInputSelect(allDoctors);
      setListDoctors(dataSelect);
    }
  }, [allDoctors]);

  const refreshExistedSlots = async () => {
    if (!selectedDoctor?.value || !currentDate || !Array.isArray(rangeTime)) return;

    const workDate = moment(currentDate).format('YYYY-MM-DD');
    try {
      const res = await getSchedules(selectedDoctor.value, workDate);
      const schedules = (res?.data) || res;
      const existedSlotIds = Array.isArray(schedules)
        ? schedules.map((s) => s.timeSlotId)
        : [];

      const updated = rangeTime.map((t) => ({
        ...t,
        isSelected: existedSlotIds.includes(t.id),
      }));
      setRangeTime(updated);
    } catch (e) {
      const updated = rangeTime.map((t) => ({ ...t, isSelected: false }));
      setRangeTime(updated);
    }
  };

  useEffect(() => {
    if (selectedDoctor?.value && rangeTime.length > 0) {
      refreshExistedSlots();
    }
  }, [selectedDoctor, currentDate]);

  const handleChangeSelect = (selected) => {
    setSelectedDoctor(selected);
  };

  const handleOnChangeDatePicker = (date) => {
    setCurrentDate(date[0]);
  };

  const handleClickBtnTime = (time) => {
    if (rangeTime && rangeTime.length > 0) {
      const updatedRangeTime = rangeTime.map((item) => {
        if (item.id === time.id) item.isSelected = !item.isSelected;
        return item;
      });
      setRangeTime(updatedRangeTime);
    }
  };

  const handleSelectAll = () => {
    const updated = rangeTime.map((t) => ({
      ...t,
      isSelected: true,
    }));
    setRangeTime(updated);
  };

  const handleClear = () => {
    const updated = rangeTime.map((t) => ({
      ...t,
      isSelected: false,
    }));
    setRangeTime(updated);
  };

  const handleSaveSchedule = async () => {
    // Validation
    if (!currentDate) {
      toast.error('Ngày không hợp lệ!');
      return;
    }

    if (!selectedDoctor?.value) {
      toast.error('Bác sĩ được chọn không hợp lệ!');
      return;
    }

    if (!maxPatient || Number.isNaN(Number(maxPatient)) || Number(maxPatient) <= 0) {
      toast.error('Số bệnh nhân tối đa không hợp lệ!');
      return;
    }

    const selectedIds = rangeTime
      .filter((item) => item.isSelected)
      .map((s) => s.id);

    try {
      const payload = {
        doctorId: selectedDoctor.value,
        workDate: moment(currentDate).format('YYYY-MM-DD'),
        timeSlotIds: selectedIds,
        maxPatient: Number(maxPatient),
      };
      await createScheduleBulkNew(payload);

      const message = selectedIds.length === 0
        ? 'Đã xóa hết lịch của ngày này!'
        : 'Lưu thông tin thành công!';
      toast.success(message);

      await refreshExistedSlots();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Lưu thông tin thất bại!');
    }
  };

  return (
    <div className="manage-schedule-container">
      <div className="m-s-title">
        <FormattedMessage id="manage-schedule.title" />
      </div>

      <div className="container">
        <div className="row">
          {userInfo && userInfo.role === USER_ROLE.ADMIN && (
            <div className="col-6 form-group ">
              <label>
                <FormattedMessage id="manage-schedule.choose-doctor" />
              </label>
              <Select
                value={selectedDoctor}
                onChange={handleChangeSelect}
                options={listDoctors}
              />
            </div>
          )}
          <div className={userInfo && userInfo.role === USER_ROLE.DOCTOR ? "col-12 form-group" : "col-6 form-group"}>
            <label>
              <FormattedMessage id="manage-schedule.choose-date" />
            </label>
            <DatePicker
              onChange={handleOnChangeDatePicker}
              className="form-control"
              value={currentDate}
              minDate='today'
            />
          </div>
          <div className="col-6 form-group">
            <label>
              Số bệnh nhân tối đa/khung giờ
            </label>
            <input
              className="form-control"
              type="number"
              min={1}
              value={maxPatient}
              onChange={(e) => setMaxPatient(e.target.value)}
            />
          </div>
          <div className="col-12 pick-hour-container">
            <div className="mb-2 d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={handleSelectAll} disabled={loadingSlots || rangeTime.length === 0}>
                Chọn tất cả
              </button>
              <button className="btn btn-outline-secondary" onClick={handleClear} disabled={loadingSlots || rangeTime.length === 0}>
                Bỏ chọn
              </button>
            </div>
            {rangeTime &&
              rangeTime.length > 0 &&
              rangeTime.map((item, index) => {
                return (
                  <button
                    className={
                      item.isSelected === true
                        ? 'btn btn-schedule active'
                        : 'btn btn-schedule'
                    }
                    key={index}
                    onClick={() => handleClickBtnTime(item)}
                  >
                    {item.label}
                  </button>
                );
              })}
          </div>
          <div className="col-12">
            <button
              className="btn btn-primary btn-save-schedule"
              onClick={() => handleSaveSchedule()}
            >
              <FormattedMessage id="manage-schedule.save" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSchedule;
