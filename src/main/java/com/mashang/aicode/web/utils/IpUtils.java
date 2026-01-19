package com.mashang.aicode.web.utils;

import com.mashang.aicode.web.constant.PointsConstants;
import com.mashang.aicode.web.exception.BusinessException;
import com.mashang.aicode.web.exception.ErrorCode;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class IpUtils {

    @Resource
    private RedissonClient redissonClient;

    /**
     * IP级别限流检查（每分钟10次）
     * Redis故障时降级允许通过，避免服务不可用
     */
    public void checkIpRateLimit(HttpServletRequest request) {
        String ip = getClientIP(request);
        String key = "rate_limit:ip:app_gen:" + ip;
        String lockKey = "lock:rate_limit:init:" + ip;

        try {
            // 使用 Redisson 的分布式限流器
            org.redisson.api.RRateLimiter rateLimiter = redissonClient.getRateLimiter(key);

            // 使用分布式锁避免并发重复设置限流参数
            if (!rateLimiter.isExists()) {
                org.redisson.api.RLock lock = redissonClient.getLock(lockKey);
                try {
                    // 尝试获取锁，最多等待1秒
                    if (lock.tryLock(1, 5, java.util.concurrent.TimeUnit.SECONDS)) {
                        try {
                            // 双重检查，防止重复设置
                            if (!rateLimiter.isExists()) {
                                // 设置限流器参数：每分钟最多10次请求
                                rateLimiter.trySetRate(
                                        org.redisson.api.RateType.OVERALL,
                                        PointsConstants.IP_RATE_LIMIT_PER_MINUTE,
                                        PointsConstants.IP_RATE_LIMIT_WINDOW_SECONDS,
                                        org.redisson.api.RateIntervalUnit.SECONDS
                                );
                            }
                        } finally {
                            lock.unlock();
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("IP限流器初始化获取锁被中断: {}", ip);
                }
            }

            // 设置1小时过期时间
            rateLimiter.expire(java.time.Duration.ofHours(1));

            // 尝试获取一个令牌，如果获取失败则限流
            if (!rateLimiter.tryAcquire(1)) {
                log.warn("IP {} 请求过于频繁，已限流", ip);
                throw new BusinessException(ErrorCode.TOO_MANY_REQUEST, "该IP请求过于频繁，请稍后再试");
            }
        } catch (BusinessException e) {
            // 业务异常直接抛出（限流异常）
            throw e;
        } catch (Exception e) {
            // Redis故障或其他异常，记录日志后降级允许通过
            log.error("IP限流检查失败，降级允许通过。IP: {}, 错误: {}", ip, e.getMessage());
        }
    }

    /**
     * 获取客户端IP（标准化处理，支持IPv6）
     */
    private String getClientIP(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 处理多级代理的情况
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        // 标准化IPv6地址
        ip = normalizeIP(ip != null ? ip : "unknown");
        return ip;
    }

    /**
     * 标准化IP地址（IPv6转标准格式）
     */
    private String normalizeIP(String ip) {
        if (ip == null || ip.isEmpty()) {
            return "unknown";
        }
        // 标准化IPv6本地地址
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }
        return ip;
    }

}
