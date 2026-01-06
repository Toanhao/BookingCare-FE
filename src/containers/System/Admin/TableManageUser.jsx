import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './TableManageUser.scss';
import * as actions from '../../../store/actions';

const TableManageUser = ({ handleEditUserFromParentKey }) => {
  const dispatch = useDispatch();
  const listUsers = useSelector((state) => state.admin.users);

  useEffect(() => {
    dispatch(actions.fetchAllUsersStart());
  }, []);

  const handleDeleteUser = async (user) => {
    try {
      let res = await deleteUserService(user.id);
      if (res && res.errCode === 0) {
        toast.success('Xóa người dùng thành công');
        dispatch(actions.fetchAllUsersStart());
      } else {
        toast.error(res?.message || 'Xóa người dùng thất bại');
      }
    } catch (e) {
      console.log('handleDeleteUser error:', e);
      toast.error('Xóa người dùng thất bại');
    }
  };

  const handleEditUser = (user) => {
    handleEditUserFromParentKey(user);
  };

  return (
    <React.Fragment>
      <table id="TableManageUser">
        <tbody>
          <tr>
            <th>Email</th>
            <th>Full name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Gender</th>
            <th>Birthday</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
          {listUsers &&
            listUsers.length > 0 &&
            listUsers.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{item.email}</td>
                  <td>
                    {item.fullName ||
                      [item.firstName, item.lastName].filter(Boolean).join(' ')}
                  </td>
                  <td>{item.phoneNumber || item.phonenumber}</td>
                  <td>{item.address}</td>
                  <td>{item.gender}</td>
                  <td>
                    {item.birthday
                      ? new Date(item.birthday).toLocaleDateString('vi-VN')
                      : ''}
                  </td>
                  <td>{item.role || item.roleId || ''}</td>
                  <td>
                    <button
                      onClick={() => handleEditUser(item)}
                      className="btn-edit"
                    >
                      <i className="fa-solid fa-pencil-alt"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(item)}
                      className="btn-delete"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </React.Fragment>
  );
};

export default TableManageUser;
