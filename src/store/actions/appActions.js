import actionTypes from "./actionTypes";

export const changeLanguageApp = (language) => ({
    type: actionTypes.CHANGE_LANGUAGE,
    language: language,
});
