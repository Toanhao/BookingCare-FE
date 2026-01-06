import React, { Fragment, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import HomePage from './HomePage/HomePage.jsx';
import DetailDoctor from './Patient/Doctor/DetailDoctor.jsx';
import Doctor from '../routes/Doctor';
import DetailSpecialty from './HomePage/Section/Speciatly/DetailSpecialty.jsx';
import DetailClinic from './HomePage/Section/Clinic/DetailClinic';
import AllDirectory from './HomePage/AllSpecialties/AllDirectory';
import {
  userIsNotAuthenticated,
  userIsAdminOrDoctor,
} from '../hoc/authentication';
import CustomScrollbars from '../components/CustomScrollbars';
import NavigationInitializer from '../components/NavigationInitializer';
import ErrorBoundary from '../components/ErrorBoundary';
import { path } from '../utils';
import Home from '../routes/Home';
import Login from '../containers/Auth/Login';
import Register from '../containers/Auth/Register';
import System from '../routes/System';
import DetailHandbook from './HomePage/Section/HandBook/DetailHandbook.jsx';
import ConfirmBooking from './Patient/ConfirmBooking.jsx';
import CancelBooking from './Patient/CancelBooking.jsx';

const App = ({ persistor, onBeforeLift }) => {
  const routerBase = import.meta.env.VITE_ROUTER_BASE_NAME || undefined;

  useEffect(() => {
    if (persistor) {
      let { bootstrapped } = persistor.getState();
      if (bootstrapped) {
        if (onBeforeLift) {
          Promise.resolve(onBeforeLift()).catch(() => {});
        }
      }
    }
  }, [persistor, onBeforeLift]);

  return (
    <Fragment>
      <Router basename={routerBase}>
        <ErrorBoundary>
          <NavigationInitializer />
          <div className="main-container">
            <span className="content-container">
              <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                <Routes>
                  <Route path={path.HOME} element={<Home />} />
                  <Route
                    path={path.LOGIN}
                    element={React.createElement(userIsNotAuthenticated(Login))}
                  />
                  <Route
                    path={path.REGISTER}
                    element={React.createElement(
                      userIsNotAuthenticated(Register)
                    )}
                  />
                  <Route
                    path={path.SYSTEM + '/*'}
                    element={React.createElement(userIsAdminOrDoctor(System))}
                  />
                  <Route
                    path={'/doctor/*'}
                    element={React.createElement(userIsAdminOrDoctor(Doctor))}
                  />
                  <Route path={path.HOMEPAGE} element={<HomePage />} />
                  <Route path={path.ALL_DIRECTORY} element={<AllDirectory />} />
                  <Route
                    path={path.DETAIL_SPECIALTY}
                    element={<DetailSpecialty />}
                  />
                  <Route
                    path={path.DETAIL_HANDBOOK}
                    element={<DetailHandbook />}
                  />
                  <Route path={path.DETAIL_DOCTOR} element={<DetailDoctor />} />
                  <Route path={path.DETAIL_CLINIC} element={<DetailClinic />} />
                  <Route
                    path={path.CONFIRM_BOOKING}
                    element={<ConfirmBooking />}
                  />
                  <Route
                    path={path.CANCEL_BOOKING}
                    element={<CancelBooking />}
                  />
                </Routes>
              </CustomScrollbars>
            </span>

            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </ErrorBoundary>
      </Router>
    </Fragment>
  );
};

export default App;
