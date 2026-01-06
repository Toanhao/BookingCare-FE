import { useState } from 'react';
import { useSelector } from 'react-redux';
import './ManageHandbook.scss';
import MarkdownEditorWithPreview from '../../../../components/MarkdownEditorWithPreview';
import { CommonUtils } from '../../../../utils';
import { createNewHandbook } from '../../../../services/userService';
import { toast } from 'react-toastify';

const ManageHandbook = () => {
  const [title, setTitle] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [contentHTML, setContentHTML] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');

  const userInfo = useSelector((state) => state.user.userInfo);

  const handleOnChangeInput = (event, id) => {
    if (id === 'title') {
      setTitle(event.target.value);
    }
  };

  const handleOnChangeImage = async (event) => {
    const data = event.target.files;
    const file = data?.[0];
    if (file) {
      const base64 = await CommonUtils.getBase64(file);
      setImageBase64(base64);
    }
  };

  const handleSaveNewHandbook = async () => {
    const doctorId = userInfo?.id;

    if (!doctorId || userInfo?.role !== 'DOCTOR') {
      toast.error('Vui lòng đăng nhập bằng tài khoản bác sĩ để tạo bài viết');
      return;
    }

    if (!title || !contentHTML || !imageBase64) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề, ảnh và nội dung');
      return;
    }

    try {
      const res = await createNewHandbook({
        title: title,
        content: contentHTML,
        image: imageBase64,
        doctorId,
      });

      if (res && res.id) {
        toast.success('Thêm bài viết mới thành công');
        setTitle('');
        setImageBase64('');
        setContentHTML('');
        setContentMarkdown('');
        return;
      }

      toast.error('Thêm bài viết mới thất bại!');
    } catch (error) {
      const message = error?.message || 'Thêm bài viết mới thất bại!';
      toast.error(message);
    }
  };

  return (
    <div className="manage-handbook-container">
      <div className="ms-title">Quản lý bài viết</div>
      <div className="add-new-handbook row">
        <div className="col-6 form-group">
          <label>Tên bài viết</label>
          <input
            className="form-control"
            type="text"
            value={title}
            onChange={(event) => handleOnChangeInput(event, 'title')}
          />
        </div>
        <div className="col-6 form-group">
          <label>Ảnh bài viết</label>
          <input
            className="form-control-file"
            type="file"
            onChange={(event) => handleOnChangeImage(event)}
          />
        </div>
        <div className="col-12">
          <MarkdownEditorWithPreview
            value={contentMarkdown}
            onChange={(markdownValue, htmlValue) => {
              setContentMarkdown(markdownValue);
              setContentHTML(htmlValue || '');
            }}
            height={300}
            placeholder="Nhập nội dung bài viết..."
          />
        </div>
        <div className="col-12">
          <button
            className="btn-save-handbook"
            onClick={() => handleSaveNewHandbook()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageHandbook;
