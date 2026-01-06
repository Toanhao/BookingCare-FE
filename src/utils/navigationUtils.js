// Navigation utility for React Router v6
// Use this in redux actions/thunks where hooks are not available

let navigate = null;

export const setNavigate = (navigateFunction) => {
  navigate = navigateFunction;
};

export const getNavigate = () => navigate;

export const navigateTo = (path, options = {}) => {
  if (navigate) {
    navigate(path, options);
  } else {
    console.warn('Navigate function not initialized');
  }
};
