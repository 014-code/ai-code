package com.mashang.aicode.web.mapper;

import com.mashang.aicode.web.model.entity.FriendRelation;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * 好友关系Mapper
 */
@Mapper
public interface FriendRelationMapper extends BaseMapper<FriendRelation> {

    /**
     * 查询用户的好友列表
     *
     * @param userId   用户ID
     * @param status   关系状态
     * @param offset   偏移量
     * @param limit    限制数量
     * @return 好友关系列表
     */
    @Select("SELECT * FROM friend_relation WHERE userId = #{userId} AND status = #{status} AND isDelete = 0 ORDER BY createTime DESC LIMIT #{offset}, #{limit}")
    List<FriendRelation> selectFriendsByUserId(@Param("userId") Long userId,
                                             @Param("status") String status,
                                             @Param("offset") Integer offset,
                                             @Param("limit") Integer limit);

    /**
     * 查询用户好友数量
     *
     * @param userId 用户ID
     * @param status 关系状态
     * @return 好友数量
     */
    @Select("SELECT COUNT(*) FROM friend_relation WHERE userId = #{userId} AND status = #{status} AND isDelete = 0")
    Integer countFriendsByUserId(@Param("userId") Long userId,
                                @Param("status") String status);

    /**
     * 查询用户与指定好友的关系
     *
     * @param userId   用户ID
     * @param friendId 好友ID
     * @return 好友关系
     */
    @Select("SELECT * FROM friend_relation WHERE userId = #{userId} AND friendId = #{friendId} AND isDelete = 0 LIMIT 1")
    FriendRelation selectByUserIdAndFriendId(@Param("userId") Long userId,
                                            @Param("friendId") Long friendId);

    /**
     * 根据ID更新好友关系
     *
     * @param friendRelation 好友关系
     * @return 更新结果
     */
    @Update("UPDATE friend_relation SET status = #{status}, updateTime = NOW() WHERE id = #{id} AND isDelete = 0")
    boolean updateById(FriendRelation friendRelation);
}