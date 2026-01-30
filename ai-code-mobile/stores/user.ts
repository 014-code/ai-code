import {getUserInfo} from "@/api/user";

import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

/**
 * 获取用户信息的异步 action
 * 从服务器获取当前登录用户的详细信息
 */
export const fetchUserInfo = createAsyncThunk(
    'user/fetchUserInfo',
    async () => {
        const response: any = await getUserInfo();
        return response.data;
    }
);

const userSlice = createSlice({
    name: "user-slice",

    /**
     * 用户信息初始状态
     * 包含用户的基本信息和加载状态
     */
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

    /**
     * 同步 reducer
     * 处理用户信息的更新和清空操作
     */
    reducers: {
        /**
         * 更新用户信息
         * 将传入的用户信息合并到当前状态中
         */
        updateUser(state, action) {
            return {...state, ...action.payload};
        },

        /**
         * 清空用户信息
         * 将用户状态重置为初始值，用于退出登录场景
         */
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

    /**
     * 异步 action 处理器
     * 处理 fetchUserInfo 的不同状态
     */
    extraReducers: (builder) => {
        builder
            /**
             * 请求开始时
             * 设置 loading 为 true，表示正在加载
             */
            .addCase(fetchUserInfo.pending, (state) => {
                state.loading = true;
            })
            /**
             * 请求成功时
             * 将返回的用户数据存储到 state，并设置 loading 为 false
             */
            .addCase(fetchUserInfo.fulfilled, (state, action) => {
                Object.assign(state, action.payload);
                state.loading = false;
            })
            /**
             * 请求失败时
             * 设置 loading 为 false，表示加载结束
             */
            .addCase(fetchUserInfo.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default userSlice
