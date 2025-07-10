// 📁 파일: utils/database.js
// 데이터베이스 연결 및 유틸리티 함수

import { PrismaClient } from '@prisma/client';
import { logger, logDatabase } from './logger.js';

// Prisma 클라이언트 인스턴스
let prisma;

// 데이터베이스 초기화
export async function initializeDatabase() {
    try {
        prisma = new PrismaClient({
            log: [
                {
                    emit: 'event',
                    level: 'query'
                },
                {
                    emit: 'event',
                    level: 'error'
                },
                {
                    emit: 'event',
                    level: 'warn'
                }
            ]
        });
        
        // 쿼리 로깅
        if (process.env.LOG_LEVEL === 'debug') {
            prisma.$on('query', (e) => {
                logger.debug('Prisma Query', {
                    query: e.query,
                    params: e.params,
                    duration: e.duration
                });
            });
        }
        
        // 에러 로깅
        prisma.$on('error', (e) => {
            logger.error('Prisma Error', { message: e.message });
        });
        
        // 경고 로깅
        prisma.$on('warn', (e) => {
            logger.warn('Prisma Warning', { message: e.message });
        });
        
        // 연결 테스트
        await prisma.$connect();
        logger.info('데이터베이스 연결 성공');
        
        // 기본 데이터 시드 (필요한 경우)
        await seedDatabase();
        
    } catch (error) {
        logger.error('데이터베이스 초기화 실패:', error);
        throw error;
    }
}

// 기본 데이터 시드
async function seedDatabase() {
    try {
        // 기본 설정이나 필수 데이터가 있다면 여기서 생성
        // 예: 기본 역할, 시스템 설정 등
        
        logger.info('데이터베이스 시드 완료');
    } catch (error) {
        logger.error('데이터베이스 시드 실패:', error);
    }
}

// 트랜잭션 헬퍼
export async function withTransaction(callback) {
    try {
        const result = await prisma.$transaction(callback);
        logDatabase('transaction', 'multiple', true);
        return result;
    } catch (error) {
        logDatabase('transaction', 'multiple', false, { error: error.message });
        throw error;
    }
}

// 사용자 관련 함수들
export const users = {
    // 사용자 생성 또는 업데이트
    async upsert(discordId, data) {
        try {
            // SQLite를 위한 권한 배열 처리
            if (data.permissions && Array.isArray(data.permissions)) {
                data.permissions = JSON.stringify(data.permissions);
            }
            
            const user = await prisma.user.upsert({
                where: { discordId },
                update: data,
                create: {
                    discordId,
                    ...data
                }
            });
            
            // 권한 배열 파싱
            if (user.permissions) {
                user.permissions = JSON.parse(user.permissions);
            }
            
            logDatabase('upsert', 'User', true, { discordId });
            return user;
        } catch (error) {
            logDatabase('upsert', 'User', false, { error: error.message });
            throw error;
        }
    },
    
    // 사용자 조회
    async findByDiscordId(discordId) {
        try {
            const user = await prisma.user.findUnique({
                where: { discordId }
            });
            
            // 권한 배열 파싱
            if (user && user.permissions) {
                user.permissions = JSON.parse(user.permissions);
            }
            
            logDatabase('findUnique', 'User', true, { discordId });
            return user;
        } catch (error) {
            logDatabase('findUnique', 'User', false, { error: error.message });
            throw error;
        }
    },
    
    // 사용자 권한 업데이트
    async updatePermissions(discordId, permissions) {
        try {
            const user = await prisma.user.update({
                where: { discordId },
                data: { 
                    permissions: JSON.stringify(permissions)
                }
            });
            
            // 권한 배열 파싱
            user.permissions = JSON.parse(user.permissions);
            
            logDatabase('update', 'User', true, { discordId, permissions });
            return user;
        } catch (error) {
            logDatabase('update', 'User', false, { error: error.message });
            throw error;
        }
    }
};

// 길드 관련 함수들
export const guilds = {
    // 길드 생성 또는 업데이트
    async upsert(guildId, data) {
        try {
            // SQLite를 위한 배열/객체 처리
            if (data.features && Array.isArray(data.features)) {
                data.features = JSON.stringify(data.features);
            }
            if (data.settings && typeof data.settings === 'object') {
                data.settings = JSON.stringify(data.settings);
            }
            
            const guild = await prisma.guild.upsert({
                where: { guildId },
                update: data,
                create: {
                    guildId,
                    ...data
                }
            });
            
            // 배열/객체 파싱
            if (guild.features) {
                guild.features = JSON.parse(guild.features);
            }
            if (guild.settings) {
                guild.settings = JSON.parse(guild.settings);
            }
            
            logDatabase('upsert', 'Guild', true, { guildId });
            return guild;
        } catch (error) {
            logDatabase('upsert', 'Guild', false, { error: error.message });
            throw error;
        }
    },
    
    // 길드 설정 업데이트
    async updateSettings(guildId, settings) {
        try {
            const guild = await prisma.guild.update({
                where: { guildId },
                data: { 
                    settings: JSON.stringify(settings)
                }
            });
            
            // 설정 객체 파싱
            guild.settings = JSON.parse(guild.settings);
            
            logDatabase('update', 'Guild', true, { guildId });
            return guild;
        } catch (error) {
            logDatabase('update', 'Guild', false, { error: error.message });
            throw error;
        }
    },
    
    // 길드 삭제
    async delete(guildId) {
        try {
            await prisma.guild.delete({
                where: { guildId }
            });
            
            logDatabase('delete', 'Guild', true, { guildId });
        } catch (error) {
            logDatabase('delete', 'Guild', false, { error: error.message });
            throw error;
        }
    }
};

// 파티 관련 함수들 (게임 파티 시스템용)
export const parties = {
    // 파티 생성
    async create(data) {
        try {
            const party = await prisma.party.create({
                data
            });
            
            logDatabase('create', 'Party', true, { partyId: party.id });
            return party;
        } catch (error) {
            logDatabase('create', 'Party', false, { error: error.message });
            throw error;
        }
    },
    
    // 활성 파티 조회
    async findActive(guildId) {
        try {
            const parties = await prisma.party.findMany({
                where: {
                    guildId,
                    status: 'active',
                    endTime: {
                        gt: new Date()
                    }
                },
                include: {
                    members: true
                }
            });
            
            logDatabase('findMany', 'Party', true, { guildId, count: parties.length });
            return parties;
        } catch (error) {
            logDatabase('findMany', 'Party', false, { error: error.message });
            throw error;
        }
    },
    
    // 파티 멤버 추가
    async addMember(partyId, userId) {
        try {
            const member = await prisma.partyMember.create({
                data: {
                    partyId,
                    userId
                }
            });
            
            logDatabase('create', 'PartyMember', true, { partyId, userId });
            return member;
        } catch (error) {
            logDatabase('create', 'PartyMember', false, { error: error.message });
            throw error;
        }
    },
    
    // 파티 멤버 제거
    async removeMember(partyId, userId) {
        try {
            await prisma.partyMember.delete({
                where: {
                    partyId_userId: {
                        partyId,
                        userId
                    }
                }
            });
            
            logDatabase('delete', 'PartyMember', true, { partyId, userId });
        } catch (error) {
            logDatabase('delete', 'PartyMember', false, { error: error.message });
            throw error;
        }
    }
};

// 로그 관련 함수들
export const logs = {
    // 명령어 로그 저장
    async logCommand(data) {
        try {
            const log = await prisma.commandLog.create({
                data: {
                    command: data.command,
                    userId: data.userId,
                    guildId: data.guildId,
                    channelId: data.channelId,
                    success: data.success,
                    errorMessage: data.errorMessage,
                    executedAt: new Date()
                }
            });
            
            logDatabase('create', 'CommandLog', true);
            return log;
        } catch (error) {
            logDatabase('create', 'CommandLog', false, { error: error.message });
            throw error;
        }
    },
    
    // API 로그 저장
    async logAPI(data) {
        try {
            const log = await prisma.apiLog.create({
                data: {
                    method: data.method,
                    path: data.path,
                    statusCode: data.statusCode,
                    userId: data.userId,
                    duration: data.duration,
                    timestamp: new Date()
                }
            });
            
            logDatabase('create', 'APILog', true);
            return log;
        } catch (error) {
            logDatabase('create', 'APILog', false, { error: error.message });
            throw error;
        }
    }
};

// Prisma 클라이언트 export
export { prisma };