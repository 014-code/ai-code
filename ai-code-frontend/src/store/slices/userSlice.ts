import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  userName: string;
  userAvatar?: string;
  userRole?: string;
}

interface UserState {
  currentUser?: User;
  loading: boolean;
}

const initialState: UserState = {
  currentUser: undefined,
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<User | undefined>) => {
      state.currentUser = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setUserInfo, setLoading } = userSlice.actions;
export default userSlice.reducer;
