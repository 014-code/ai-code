import request from '@/utils/request';
import type {
  SpaceAddParams,
  SpaceQueryParams,
  DeleteParams,
  SpaceInviteParams,
  SpaceAddMemberParams,
  BatchAddMembersParams,
  SpaceRemoveMemberParams,
  ListSpaceMembersParams,
  SpaceAppsListParams,
  SpaceAddAppParams,
  SpaceRemoveAppParams,
} from '@/api/params/spaceParams';
import type {
  SpaceVO,
  SpaceDetailVO,
  SpaceMemberVO,
  SpaceFileVO,
  SpaceInviteVO,
  MySpaceVO,
} from '@/api/vo/spaceVO';
import type { PageResponseVO } from '@/api/vo';

/**
 * 创建空间
 */
export async function addSpace(data: SpaceAddParams) {
  return request.post<SpaceAddParams, PageResponseVO<number>>('/space/add', data);
}

/**
 * 根据ID获取空间
 */
export async function getSpaceById(id: string) {
  return request.get<string, PageResponseVO<SpaceVO>>('/space/get', { params: { id } });
}

/**
 * 获取空间列表
 */
export async function getSpaceList(data: SpaceQueryParams) {
  return request.post<SpaceQueryParams, PageResponseVO<PageResponseVO<SpaceVO>>>('/space/list/page', data);
}

/**
 * 分页查询空间列表
 */
export async function listSpaceByPage(data: SpaceQueryParams) {
  return request.post<SpaceQueryParams, PageResponseVO<PageResponseVO<SpaceVO>>>('/space/list/page', data);
}

/**
 * 删除空间
 */
export async function deleteSpace(data: DeleteParams) {
  return request.post<DeleteParams, PageResponseVO<boolean>>('/space/delete', data);
}

/**
 * 添加空间成员
 */
export async function addMember(data: SpaceAddMemberParams) {
  return request.post<SpaceAddMemberParams, PageResponseVO<boolean>>('/space/add/member', data);
}

/**
 * 批量添加空间成员
 */
export async function batchAddMembers(data: BatchAddMembersParams) {
  return request.post<BatchAddMembersParams, PageResponseVO<boolean>>('/space/add/members/batch', data);
}

/**
 * 移除空间成员
 */
export async function removeMember(data: SpaceRemoveMemberParams) {
  return request.post<SpaceRemoveMemberParams, PageResponseVO<boolean>>('/space/remove/member', data);
}

/**
 * 获取空间成员列表
 */
export async function listSpaceMembers(spaceId: string) {
  return request.get<string, PageResponseVO<SpaceMemberVO[]>>('/space/list/members', { params: { spaceId } });
}

/**
 * 分页查询空间应用
 */
export async function listSpaceAppsByPage(data: SpaceAppsListParams) {
  return request.post<SpaceAppsListParams, PageResponseVO<PageResponseVO<SpaceVO>>>('/space/apps/list/page', data);
}

/**
 * 添加应用到空间
 */
export async function addAppToSpace(data: SpaceAddAppParams) {
  return request.post<SpaceAddAppParams, PageResponseVO<boolean>>('/space/app/add', data);
}

/**
 * 从空间移除应用
 */
export async function removeAppFromSpace(data: SpaceRemoveAppParams) {
  return request.post<SpaceRemoveAppParams, PageResponseVO<boolean>>('/space/app/remove', data);
}

/**
 * 获取空间详情
 */
export async function getSpaceDetail(id: string) {
  return request.get<string, PageResponseVO<SpaceDetailVO>>('/space/detail', { params: { id } });
}

/**
 * 获取我的空间列表
 */
export async function listMySpaces() {
  return request.get<void, PageResponseVO<MySpaceVO[]>>('/space/my/list');
}

/**
 * 创建空间邀请
 */
export async function createSpaceInvite(data: SpaceInviteParams) {
  return request.post<SpaceInviteParams, PageResponseVO<SpaceInviteVO>>('/space/invite/create', data);
}
