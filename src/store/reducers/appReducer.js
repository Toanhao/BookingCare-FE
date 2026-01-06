import actionTypes from '../actions/actionTypes';

const initialState = {
  started: true,
  language: 'vi',
  systemMenuPath: '/user-redux',
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.language,
      };
    default:
      return state;
  }
};

export default appReducer;
