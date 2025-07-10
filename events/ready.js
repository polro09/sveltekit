// 📁 파일: events/ready.js
// 봇 준비 완료 이벤트

import { logger } from '../utils/logger.js';
import { ActivityType } from 'discord.js';
import { guilds } from '../utils/database.js';

export default {
    name: 'ready',
    once: true,
    async execute(client) {
        logger.info(`✅ ${client.user.tag}로 로그인했습니다!`);
        logger.info(`📊 ${client.guilds.cache.size}개의 서버에서 활동 중`);
        logger.info(`👥 ${client.users.cache.size}명의 사용자와 연결됨`);
        
        // 봇 상태 설정
        try {
            await updateBotPresence(client);
            
            // 30분마다 상태 업데이트
            setInterval(() => updateBotPresence(client), 30 * 60 * 1000);
        } catch (error) {
            logger.error('봇 상태 설정 실패:', error);
        }
        
        // 모든 길드 정보 동기화
        try {
            await syncGuilds(client);
        } catch (error) {
            logger.error('길드 동기화 실패:', error);
        }
        
        // 웹훅 URL을 콘솔에 출력 (개발용)
        if (process.env.NODE_ENV === 'development') {
            logger.info(`🌐 웹훅 URL: ${process.env.WEB_URL || 'http://localhost:3000'}/api/webhook`);
        }
    }
};

// 봇 상태 업데이트
async function updateBotPresence(client) {
    const activities = [
        { name: '도움말: /help', type: ActivityType.Playing },
        { name: `${client.guilds.cache.size}개 서버`, type: ActivityType.Watching },
        { name: '파티 모집 중', type: ActivityType.Competing },
        { name: 'aimdot.dev', type: ActivityType.Watching }
    ];
    
    // 랜덤 활동 선택
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    client.user.setPresence({
        activities: [activity],
        status: 'online'
    });
    
    logger.debug(`봇 상태 업데이트: ${activity.name}`);
}

// 길드 정보 동기화
async function syncGuilds(client) {
    const guildCount = client.guilds.cache.size;
    let syncedCount = 0;
    
    for (const [guildId, guild] of client.guilds.cache) {
        try {
            await guilds.upsert(guildId, {
                name: guild.name,
                icon: guild.iconURL(),
                memberCount: guild.memberCount,
                ownerId: guild.ownerId,
                joinedAt: guild.joinedAt,
                features: guild.features,
                preferredLocale: guild.preferredLocale
            });
            
            syncedCount++;
        } catch (error) {
            logger.error(`길드 동기화 실패 - ${guild.name} (${guildId}):`, error);
        }
    }
    
    logger.info(`✅ ${syncedCount}/${guildCount}개 길드 동기화 완료`);
}