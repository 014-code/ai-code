package com.mashang.aicode.web.mapper;

import com.mashang.aicode.web.model.entity.FriendRequest;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 好友请求Mapper
 */
@Mapper
public interface FriendRequestMapper extends BaseMapper<FriendRequest> {

    /**
     * 查询用户收到的好友请求
     *
     * @param addresseeId 接收方用户ID
     * @param status      请求状态
     * @param offset      偏移量
     * @param limit       限制数量
     * @return 好友请求列表
     */
    @Select("SELECT * FROM friend_request WHERE addresseeId = #{addresseeId} AND status = #{status} AND isDelete = 0 ORDER BY createTime DESC LIMIT #{offset}, #{limit}")
    List<FriendRequest> selectRequestsByAddresseeId(@Param("addresseeId") Long addresseeId,
                                                  @Param("status") String status,
                                                  @Param("offset") Integer offset,
                                                  @Param("limit") Integer limit);

    /**
     * 查询用户收到的好友请求数量
     *
     * @param addresseeId 接收方用户ID
     * @param status      请求状态
     * @return 请求数量
     */
    @Select("SELECT COUNT(*) FROM friend_request WHERE addresseeId = #{addresseeId} AND status = #{status} AND isDelete = 0")
    Integer countRequestsByAddresseeId(@Param("addresseeId") Long addresseeId,
                                      @Param("status") String status);

    /**
     * 查询用户之间的好友请求
     *
     * @param requesterId 请求方用户ID
     * @param addresseeId 接收方用户ID
     * @param status      请求状态
     * @return 好友请求
     */
    @Select("SELECT * FROM friend_request WHERE requesterId = #{requesterId} AND addresseeId = #{addresseeId} AND status = #{status} AND isDelete = 0 LIMIT 1")
    FriendRequest selectByRequesterAndAddressee(@Param("requesterId") Long requesterId,
                                               @Param("addresseeId") Long addresseeId,
                                               @Param("status") String status);

    /**
     * 根据ID更新好友请求
     *
     * @param friendRequest 好友请求
     * @return 更新结果
     */
    @Update("UPDATE friend_request SET status = #{status}, message = #{message}, updateTime = NOW() WHERE id = #{id} AND isdelete = 0")
    int updateById(FriendRequest friendRequest);
}