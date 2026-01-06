import { useState } from 'react';
import './ManageSpecialty.scss';
import MarkdownEditorWithPreview from '../../../../components/MarkdownEditorWithPreview';
import { CommonUtils } from '../../../../utils';
import { createNewSpecialty } from '../../../../services/userService';
import { toast } from 'react-toastify';

const ManageSpecialty = () => {
  const [name, setName] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [descriptionMarkdown, setDescriptionMarkdown] = useState('');
  const [descriptionHTML, setDescriptionHTML] = useState('');

  const handleOnChangeInput = (event, id) => {
    if (id === 'name') {
      setName(event.target.value);
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

  const handleSaveNewSpecialty = async () => {
    // Validate required fields
    if (!name || !name.trim()) {
      toast.error('Vui lòng nhập tên chuyên khoa');
      return;
    }
    if (!imageBase64) {
      toast.error('Vui lòng chọn ảnh chuyên khoa');
      return;
    }
    if (!descriptionHTML || !descriptionHTML.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }

    const payload = {
      name: name,
      image: imageBase64,
      description: descriptionHTML,
    };

    let res = await createNewSpecialty(payload);
    if (res && (res.success === true || res.errCode === 0)) {
      toast.success('Thêm chuyên khoa mới thành công!');
      setName('');
      setImageBase64('');
      setDescriptionMarkdown('');
      setDescriptionHTML('');
    } else {
      toast.error('Thêm chuyên khoa mới thất bại!');
    }
  };

  return (
    <div className="manage-specialty-container">
      <div className="ms-title">Quản lý chuyên khoa</div>
      <div className="add-new-specialty row">
        <div className="col-6 form-group">
          <label>Tên chuyên khoa</label>
          <input
            className="form-control"
            type="text"
            value={name}
            onChange={(event) => handleOnChangeInput(event, 'name')}
          />
        </div>
        <div className="col-6 form-group">
          <label>Ảnh chuyên khoa</label>
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
            placeholder="Nhập mô tả chi tiết về chuyên khoa..."
          />
        </div>
        <div className="col-12">
          <button
            className="btn-save-specialty"
            onClick={() => handleSaveNewSpecialty()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageSpecialty;
