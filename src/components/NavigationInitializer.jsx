import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setNavigate } from '../utils/navigationUtils';

// Component to initialize navigation utility for Redux actions
const NavigationInitializer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return null;
};

export default NavigationInitializer;
