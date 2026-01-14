import { setUserInfo, setLoading } from './userSlice';
import request from '@/utils/request';

export const fetchUserInfo = () => (dispatch: any) => {
  if (window.location.pathname === '/user/login') {
    return;
  }
  dispatch(setLoading(true));
  request.get('/user/get/login')
    .then((res) => {
      dispatch(setUserInfo(res.data));
    })
    .finally(() => {
      dispatch(setLoading(false));
    });
};
