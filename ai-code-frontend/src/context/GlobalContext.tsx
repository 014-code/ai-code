import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUserInfo } from '@/store/slices/userSlice';
import { fetchUserInfo } from '@/store/slices/userActions';

interface User {
  id: number;
  userName: string;
  userAvatar?: string;
  userRole?: string;
}

interface InitialState {
  currentUser?: User;
  loading: boolean;
  fetchUserInfo: () => Promise<void>;
  setUserInfo: (user: User | undefined) => void;
}

export const useGlobal = (): InitialState => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const loading = useAppSelector((state) => state.user.loading);

  const setUser = useCallback((user: User | undefined) => {
    dispatch(setUserInfo(user));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchUserInfo() as any);
  }, [dispatch]);

  return {
    currentUser,
    loading,
    fetchUserInfo: () => dispatch(fetchUserInfo() as any),
    setUserInfo: setUser,
  };
};

export { useGlobal as useGlobalContext };
