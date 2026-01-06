import { useState } from 'react';
import './ManageClinic.scss';
import MarkdownEditorWithPreview from '../../../../components/MarkdownEditorWithPreview';
import { CommonUtils } from '../../../../utils';
import { createNewClinic } from '../../../../services/userService';
import { toast } from 'react-toastify';

const ManageClinic = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [descriptionMarkdown, setDescriptionMarkdown] = useState('');
  const [descriptionHTML, setDescriptionHTML] = useState('');

  const handleOnChangeInput = (event, id) => {
    if (id === 'name') {
      setName(event.target.value);
    } else if (id === 'address') {
      setAddress(event.target.value);
    }
  };

  const handleOnChangeImage = async (event) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let base64 = await CommonUtils.getBase64(file);
      setImageBase64(base64);
    }
  };

  const handleSaveNewClinic = async () => {
    // Validate required fields
    if (!name || !name.trim()) {
      toast.error('Vui lòng nhập tên phòng khám');
      return;
    }
    if (!address || !address.trim()) {
      toast.error('Vui lòng nhập địa chỉ phòng khám');
      return;
    }
    if (!imageBase64) {
      toast.error('Vui lòng chọn ảnh phòng khám');
      return;
    }
    if (!descriptionHTML || !descriptionHTML.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }

    const data = {
      name: name,
      address: address,
      image: imageBase64,
      description: descriptionHTML,
    };

    try {
      let res = await createNewClinic(data);
      if (res && res.id) {
        toast.success('Thêm một cơ sở y tế mới thành công!');
        setName('');
        setImageBase64('');
        setAddress('');
        setDescriptionMarkdown('');
        setDescriptionHTML('');
      } else {
        toast.error('Thêm một cơ sở y tế mới thất bại!');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Thêm một cơ sở y tế mới thất bại!'
      );
    }
  };

  return (
    <div className="manage-specialty-container">
      <div className="ms-title">Quản lý phòng khám</div>
      <div className="add-new-specialty row">
        <div className="col-6 form-group">
          <label>Tên phòng khám</label>
          <input
            className="form-control"
            type="text"
            value={name}
            onChange={(event) => handleOnChangeInput(event, 'name')}
          />
        </div>

        <div className="col-6 form-group">
          <label>Địa chỉ phòng khám</label>
          <input
            className="form-control"
            type="text"
            value={address}
            onChange={(event) => handleOnChangeInput(event, 'address')}
          />
        </div>

        <div className="col-6 form-group">
          <label>Ảnh phòng khám</label>
          <input
            className="form-control-file"
            type="file"
            onChange={(event) => handleOnChangeImage(event)}
          />
        </div>

        <div className="col-12">
          <MarkdownEditorWithPreview
            value={descriptionMarkdown}
            onChange={(markdownValue, htmlValue) => {
              setDescriptionMarkdown(markdownValue);
              setDescriptionHTML(htmlValue || '');
            }}
            height={300}
            placeholder="Nhập mô tả chi tiết về phòng khám..."
          />
        </div>
        <div className="col-12">
          <button
            className="btn-save-specialty"
            onClick={() => handleSaveNewClinic()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageClinic;
