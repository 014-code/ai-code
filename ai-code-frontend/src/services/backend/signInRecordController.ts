import request from '@/utils/request';
import type { PageResponseVO } from '@/api/vo';
import type { SignInVO, SignInRecordVO } from '@/api/vo/pointsVO';

export interface SignInStatusVO {
  isSignedIn: boolean;
  consecutiveDays: number;
  lastSignInDate?: string;
  nextRewardPoints: number;
  totalRewardPoints: number;
}

/**
 * 每日签到
 */
export async function dailySignIn(options?: { [key: string]: unknown }) {
  return request.post<void, PageResponseVO<SignInVO>>('/signin/daily', {}, options);
}

/**
 * 获取签到状态
 */
export async function getSignInStatus(options?: { [key: string]: unknown }) {
  return request.get<void, PageResponseVO<SignInStatusVO>>('/signin/status', options);
}

/**
 * 获取签到记录
 */
export async function getSignInRecords(pageNum: number = 1, pageSize: number = 10) {
  return request.get<{ pageNum: number; pageSize: number }, PageResponseVO<SignInRecordVO[]>>('/signin/records', {
    params: { pageNum, pageSize }
  });
}

/**
 * 获取签到日历
 */
export async function getSignInCalendar(year: number, month: number) {
  return request.get<{ year: number; month: number }, PageResponseVO<SignInVO[]>>('/signin/calendar', {
    params: { year, month }
  });
}

/**
 * 获取签到统计
 */
export async function getSignInStatistics() {
  return request.get<void, PageResponseVO<{
    totalDays: number;
    consecutiveDays: number;
    maxConsecutiveDays: number;
    totalRewardPoints: number;
  }>>('/signin/statistics');
}
