import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from '../containers/Header/Header';
import UserRedux from '../containers/System/Admin/UserRedux';
import ManageDoctor from '../containers/System/Admin/ManageDoctor';
import ManageSpecialty from '../containers/System/Admin/Specialty/ManageSpecialty';
import ManageClinic from '../containers/System/Admin/Clinic/ManageClinic';
import Statistics from '../containers/System/Admin/Statistics/Statistics';
import DoctorStatistic from '../containers/System/Admin/Statistics/DoctorStatistic';
import SpecialtyClinicStatistics from '../containers/System/Admin/Statistics/SpecialtyClinicStatistics';

const System = () => {
  const { systemMenuPath, isLoggedIn } = useSelector((state) => ({
    systemMenuPath: state.app.systemMenuPath,
    isLoggedIn: state.user.isLoggedIn,
  }));

  return (
    <>
      {isLoggedIn && <Header />}
      <div className="system-container">
        <div className="system-list">
          <Routes>
            <Route path="/user-redux" element={<UserRedux />} />
            <Route path="/manage-doctor" element={<ManageDoctor />} />
            <Route path="/manage-specialty" element={<ManageSpecialty />} />
            <Route path="/view-statistics" element={<Statistics />} />
            <Route path="/doctor-statistic" element={<DoctorStatistic />} />
            <Route
              path="/speciality-clinic-statistic"
              element={<SpecialtyClinicStatistics />}
            />
            <Route path="/manage-clinic" element={<ManageClinic />} />
            <Route
              path="*"
              element={<Navigate to={systemMenuPath} replace />}
            />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default System;
