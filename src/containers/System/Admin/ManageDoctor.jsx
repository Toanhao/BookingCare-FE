/** @format */

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './TableManageUser.scss';
import * as actions from '../../../store/actions';
import './ManageDoctor.scss';
import MarkdownEditorWithPreview from '../../../components/MarkdownEditorWithPreview';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import { getDetailInforDoctor, saveDetailDoctorService } from '../../../services/userService';
import { CRUD_ACTIONS } from '../../../utils';
import { toast } from 'react-toastify';
import TurndownService from 'turndown';

const turndown = new TurndownService();

const ManageDoctor = () => {
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [contentHTML, setContentHTML] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [description, setDescription] = useState('');
  const [listDoctors, setListDoctors] = useState([]);
  const [hasOldData, setHasOldData] = useState(false);
  const [listClinic, setListClinic] = useState([]);
  const [listSpecialty, setListSpecialty] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [fee, setFee] = useState('');

  const allDoctors = useSelector((state) => state.admin.allDoctors);
  const allRequiredDoctorInfor = useSelector(
    (state) => state.admin.allRequiredDoctorInfor
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.getRequiredDoctorInfor());
    dispatch(actions.fetchAllDoctorsUser());
  }, [dispatch]);

  const buildDataInputSelect = (inputData, type) => {
    if (!Array.isArray(inputData) || inputData.length === 0) return [];

    switch (type) {
      case 'DOCTORS':
        return inputData
          .filter((item) => item.fullName || (item.user && item.user.fullName))
          .map((item) => ({
            label: item.fullName || item.user.fullName,
            value: item.id,
          }));
      case 'SPECIALTY':
        return inputData.map((item) => ({
          label: item.name,
          value: item.id,
        }));
      case 'CLINIC':
        return inputData.map((item) => ({
          label: item.name,
          value: item.id,
        }));
      default:
        return [];
    }
  };

  useEffect(() => {
    if (allDoctors) {
      let dataSelect = buildDataInputSelect(allDoctors, 'DOCTORS');
      setListDoctors(dataSelect);
    }
  }, [allDoctors]);

  useEffect(() => {
    if (allRequiredDoctorInfor) {
      let { resSpecialty, resClinic } = allRequiredDoctorInfor;

      let dataSelectSpecialty = buildDataInputSelect(resSpecialty, 'SPECIALTY');
      let dataSelectClinic = buildDataInputSelect(resClinic, 'CLINIC');

      setListSpecialty(dataSelectSpecialty);
      setListClinic(dataSelectClinic);
    }
  }, [allRequiredDoctorInfor]);

  const handleSaveContentMarkdown = async () => {
    // Validate
    if (!selectedDoctor || !selectedDoctor.value) {
      toast.error('Vui lòng chọn bác sĩ!');
      return;
    }
    if (!selectedClinic || !selectedClinic.value) {
      toast.error('Vui lòng chọn phòng khám!');
      return;
    }
    if (!selectedSpecialty || !selectedSpecialty.value) {
      toast.error('Vui lòng chọn chuyên khoa!');
      return;
    }
    if (!fee || parseFloat(fee) <= 0) {
      toast.error('Vui lòng nhập giá khám hợp lệ!');
      return;
    }
    if (!contentHTML || !contentHTML.trim()) {
      toast.error('Vui lòng nhập tiểu sử bác sĩ!');
      return;
    }

    const dataToSend = {
      id: selectedDoctor.value,
      title: description || 'Bác sĩ',
      bio: contentHTML || '',
      fee: parseFloat(fee),
      clinicId: selectedClinic.value,
      specialtyId: selectedSpecialty.value,
      action: hasOldData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,
    };

    try {
      let res = await saveDetailDoctorService(dataToSend);
      if (res && res.errCode === 0) {
        toast.success('Lưu thông tin bác sĩ thành công!');
      } else {
        toast.error(res?.message || 'Lưu thông tin bác sĩ thất bại!');
      }
    } catch (e) {
      toast.error('Lưu thông tin bác sĩ thất bại!');
    }
  };

  const handleChangeSelect = async (selected) => {
    setSelectedDoctor(selected);

    // Reset all fields first
    setContentHTML('');
    setContentMarkdown('');
    setDescription('');
    setHasOldData(false);
    setFee('');
    setSelectedSpecialty('');
    setSelectedClinic('');

    // Try to load existing doctor info
    try {
      let res = await getDetailInforDoctor(selected.value);
      if (res && res.errCode === 0 && res.data) {
        const doctor = res.data;

        let selectedSpec = listSpecialty.find(
          (item) => item && item.value === doctor.specialtyId
        );
        let selectedClin = listClinic.find(
          (item) => item && item.value === doctor.clinicId
        );

        const markdown = turndown.turndown(doctor.bio || '');
        setContentMarkdown(markdown);
        setContentHTML(doctor.bio || markdown || '');
        setDescription(doctor.title || '');
        setHasOldData(true);
        setFee(doctor.fee ? doctor.fee.toString() : '');
        setSelectedSpecialty(selectedSpec);
        setSelectedClinic(selectedClin);
      } else {
        console.log('User mới, chưa tạo doctor record');
      }
    } catch (error) {
      console.log('User mới, tạo doctor mới');
    }
  };

  const handleChangeSelectDoctorInfor = async (selected, name) => {
    let stateName = name.name;
    if (stateName === 'selectedSpecialty') {
      setSelectedSpecialty(selected);
    } else if (stateName === 'selectedClinic') {
      setSelectedClinic(selected);
    }
  };

  const handleOnChangeDesc = (event, id) => {
    if (id === 'description') {
      setDescription(event.target.value);
    }
  };

  const handleOnChangeFee = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setFee(value);
    }
  };

  return (
    <div className="manage-doctor-container">
      <div className="manage-doctor-title">
        <FormattedMessage id="admin.manage-doctor.title" />
      </div>
      <div className="more-Infor">
        <div className="content-left form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.select-doctor" />
          </label>
          <Select
            value={selectedDoctor}
            onChange={handleChangeSelect}
            options={listDoctors}
            placeholder={
              <FormattedMessage id="admin.manage-doctor.select-doctor" />
            }
          />
        </div>
        <div className="content-right ">
          <label>
            <FormattedMessage id="admin.manage-doctor.intro" />
          </label>
          <textarea
            onChange={(event) => handleOnChangeDesc(event, 'description')}
            value={description}
            className="form-control"
            rows="4"
          ></textarea>
        </div>
      </div>
      <div className="more-Infor-extra row">
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.specialty" />
          </label>
          <Select
            value={selectedSpecialty}
            onChange={handleChangeSelectDoctorInfor}
            options={listSpecialty}
            placeholder={
              <FormattedMessage id="admin.manage-doctor.specialty" />
            }
            name="selectedSpecialty"
          />
        </div>
        <div className="col-4 form-group">
          <label>
            <FormattedMessage id="admin.manage-doctor.select-clinic" />
          </label>
          <Select
            value={selectedClinic}
            onChange={handleChangeSelectDoctorInfor}
            options={listClinic}
            placeholder={
              <FormattedMessage id="admin.manage-doctor.select-clinic" />
            }
            name="selectedClinic"
          />
        </div>
        <div className="col-4 form-group">
          <label>Giá khám (VNĐ)</label>
          <input
            className="form-control"
            type="text"
            onChange={handleOnChangeFee}
            value={fee}
            placeholder="Ví dụ: 500000"
          />
        </div>
      </div>

      <MarkdownEditorWithPreview
        value={contentMarkdown}
        htmlValue={contentHTML}
        onChange={(markdownValue, htmlValue) => {
          setContentMarkdown(markdownValue);
          setContentHTML(htmlValue || '');
        }}
        height={500}
        placeholder="Nhập thông tin chi tiết về bác sĩ..."
      />

      <button
        onClick={() => handleSaveContentMarkdown()}
        className={
          hasOldData === true ? 'save-content-doctor' : 'create-content-doctor'
        }
      >
        {hasOldData === true ? (
          <span>
            <FormattedMessage id="admin.manage-doctor.save" />
          </span>
        ) : (
          <span>
            <FormattedMessage id="admin.manage-doctor.add" />
          </span>
        )}
      </button>
    </div>
  );
};

export default ManageDoctor;
