import { getUserInfo } from "@/api/user";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// 获取用户信息的异步 action
export const fetchUserInfo = createAsyncThunk(
    'user/fetchUserInfo',
    async () => {
        const response: any = await getUserInfo();
        return response.data; // 直接返回 data
    }
);

const userSlice = createSlice({
    name: "user-slice",

    //用户信息
    initialState: {
        id: undefined,
        userAccount: undefined,
        userName: undefined,
        userAvatar: undefined,
        userProfile: undefined,
        userRole: undefined,
        createTime: undefined,
        updateTime: undefined,

        loading: false
    },

    reducers: {
        // 更新用户信息
        updateUser(state, action) {
            return { ...state, ...action.payload };
        },

        // 清空用户信息
        clearUser(state) {
            return {
                id: undefined,
                userAccount: undefined,
                userName: undefined,
                userAvatar: undefined,
                userProfile: undefined,
                userRole: undefined,
                createTime: undefined,
                updateTime: undefined,
                loading: false
            };
        },
    },

    // 处理异步 action
    extraReducers: (builder) => {
        builder
            // 请求开始时
            .addCase(fetchUserInfo.pending, (state) => {
                state.loading = true;
            })
            // 请求成功时
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                // 将返回的数据存储到 state
                Object.assign(state, action.payload);
                state.loading = false;
            })
            // 请求失败时
            .addCase(fetchUserInfo.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default userSlice