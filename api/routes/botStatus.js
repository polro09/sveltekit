// 📁 파일: api/routes/botStatus.js
// 봇 상태 관련 API 라우트

import { Router } from 'express';
import { sendSuccess, sendError } from '../server.js';
import { logger } from '../../utils/logger.js';

const router = Router();

// 봇 상태 조회
router.get('/', async (req, res) => {
    try {
        const client = req.app.locals.client;
        
        if (!client || !client.isReady()) {
            return sendError(res, 503, 'Bot is not ready');
        }
        
        const status = {
            online: true,
            user: {
                id: client.user.id,
                tag: client.user.tag,
                avatar: client.user.displayAvatarURL()
            },
            statistics: {
                guilds: client.guilds.cache.size,
                users: client.users.cache.size,
                channels: client.channels.cache.size,
                commands: client.commands.size,
                uptime: process.uptime()
            },
            presence: {
                status: client.user.presence?.status || 'online',
                activities: client.user.presence?.activities || []
            },
            system: {
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            }
        };
        
        sendSuccess(res, status, 'Bot status retrieved successfully');
    } catch (error) {
        logger.error('봇 상태 조회 오류:', error);
        sendError(res, 500, 'Failed to retrieve bot status');
    }
});

// 봇 통계 조회
router.get('/stats', async (req, res) => {
    try {
        const client = req.app.locals.client;
        
        // 기간별 통계 (기본값: 7일)
        const days = parseInt(req.query.days) || 7;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // 여기서는 실제 데이터베이스에서 통계를 가져와야 합니다
        // 예시 데이터:
        const stats = {
            period: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                days: days
            },
            commands: {
                total: 1234,
                daily: 176,
                popular: [
                    { name: 'party', count: 423 },
                    { name: 'help', count: 312 },
                    { name: 'profile', count: 234 }
                ]
            },
            parties: {
                created: 89,
                completed: 67,
                cancelled: 12,
                averageSize: 3.4
            },
            users: {
                active: 456,
                new: 23
            },
            guilds: {
                joined: 5,
                left: 1,
                current: client.guilds.cache.size
            }
        };
        
        sendSuccess(res, stats, 'Bot statistics retrieved successfully');
    } catch (error) {
        logger.error('봇 통계 조회 오류:', error);
        sendError(res, 500, 'Failed to retrieve bot statistics');
    }
});

// 샤드 정보 조회 (멀티 샤딩 사용 시)
router.get('/shards', async (req, res) => {
    try {
        const client = req.app.locals.client;
        
        if (!client.shard) {
            return sendSuccess(res, {
                sharded: false,
                message: 'Bot is not using sharding'
            });
        }
        
        const shards = await client.shard.fetchClientValues('guilds.cache.size');
        const totalGuilds = shards.reduce((acc, guildCount) => acc + guildCount, 0);
        
        const shardInfo = {
            sharded: true,
            count: client.shard.count,
            ids: client.shard.ids,
            totalGuilds: totalGuilds,
            shards: shards.map((guilds, index) => ({
                id: index,
                guilds: guilds,
                status: 'online' // 실제로는 각 샤드의 상태를 확인해야 함
            }))
        };
        
        sendSuccess(res, shardInfo, 'Shard information retrieved successfully');
    } catch (error) {
        logger.error('샤드 정보 조회 오류:', error);
        sendError(res, 500, 'Failed to retrieve shard information');
    }
});

// 봇 상태 메시지 업데이트
router.patch('/presence', async (req, res) => {
    try {
        const client = req.app.locals.client;
        const { status, activity } = req.body;
        
        // 유효성 검사
        const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
        if (status && !validStatuses.includes(status)) {
            return sendError(res, 400, 'Invalid status value');
        }
        
        // 프레즌스 업데이트
        const presenceData = {};
        
        if (status) {
            presenceData.status = status;
        }
        
        if (activity) {
            presenceData.activities = [{
                name: activity.name,
                type: activity.type || 0
            }];
        }
        
        await client.user.setPresence(presenceData);
        
        sendSuccess(res, {
            status: client.user.presence?.status,
            activities: client.user.presence?.activities
        }, 'Bot presence updated successfully');
    } catch (error) {
        logger.error('봇 프레즌스 업데이트 오류:', error);
        sendError(res, 500, 'Failed to update bot presence');
    }
});

export default router;