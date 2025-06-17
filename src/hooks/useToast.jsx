import { useDispatch } from 'react-redux';
import { showNotification } from '../redux/slices/uiSlice';

export const useToast = () => {
  const dispatch = useDispatch();

  const showToast = (message, type = 'info') => {
    dispatch(showNotification({ message, type }));
  };

  const success = (message) => showToast(message, 'success');
  const error = (message) => showToast(message, 'error');
  const warning = (message) => showToast(message, 'warning');
  const info = (message) => showToast(message, 'info');

  return {
    success,
    error,
    warning,
    info
  };
};