import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as actions from '../store/actions';

const AuthSessionInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.initializeAuthSession());
  }, [dispatch]);

  return null;
};

export default AuthSessionInitializer;
