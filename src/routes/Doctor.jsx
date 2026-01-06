import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import ManageSchedule from '../containers/System/Doctor/ManageSchedule';
import Header from '../containers/Header/Header';
import ManagePatient from '../containers/System/Doctor/ManagePatient';
import ManageHandbook from '../containers/System/Doctor/HandBook/ManageHandbook';

const Doctor = () => {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  return (
    <React.Fragment>
      {isLoggedIn && <Header />}
      <div className="system-container">
        <div className="system-list">
          <Routes>
            <Route path="/manage-patient" element={<ManagePatient />} />
            <Route path="/manage-schedule" element={<ManageSchedule />} />
            <Route path="/manage-handbook" element={<ManageHandbook />} />
          </Routes>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Doctor;
