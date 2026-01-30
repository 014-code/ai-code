import request from '@/utils/request';

export async function addSpace(data: { spaceName: string; spaceType: number; description: string }) {
    return request.post<BaseResponse<number>>('/space/add', data);
}

export async function getSpaceById(id: string) {
    return request.get<BaseResponse<any>>('/space/get', {params: {id}});
}

export async function getSpaceList(data: {
    current?: number;
    pageSize?: number;
    spaceName?: string;
    spaceType?: number
}) {
    return request.post<BaseResponse<any>>('/space/list/page', data);
}

export async function listSpaceByPage(data: { pageNum: number; pageSize: number }) {
    return request.post<BaseResponse<any>>('/space/list/page', data);
}

export async function deleteSpace(data: { id: string }) {
    return request.post<BaseResponse<boolean>>('/space/delete', data);
}

export async function addMember(data: { spaceId: string; userId: string; role: string }) {
    return request.post<BaseResponse<boolean>>('/space/add/member', data);
}

export async function batchAddMembers(data: { spaceId: string; userIds: string[]; role: string }) {
    return request.post<BaseResponse<boolean>>('/space/add/members/batch', data);
}

export async function removeMember(data: { spaceId: string; userId: string }) {
    return request.post<BaseResponse<boolean>>('/space/remove/member', data);
}

export async function listSpaceMembers(spaceId: string) {
    return request.get<BaseResponse<any>>('/space/list/members', {params: {spaceId}});
}

export async function listSpaceAppsByPage(data: { spaceId: string; pageNum?: number; pageSize?: number }) {
    return request.post<BaseResponse<any>>('/space/apps/list/page', data);
}

export async function addAppToSpace(data: { appId: string; spaceId: string }) {
    return request.post<BaseResponse<boolean>>('/space/app/add', data);
}

export async function removeAppFromSpace(data: { appId: string; spaceId: string }) {
    return request.post<BaseResponse<boolean>>('/space/app/remove', data);
}