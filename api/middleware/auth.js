// 📁 파일: api/middleware/auth.js
// API 인증 미들웨어 - JWT 기반 인증

import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger.js';
import { sendError } from '../server.js';

// JWT 시크릿 키
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// API 키 인증 (선택적)
const API_KEYS = new Map();
if (process.env.API_KEYS) {
    const keys = process.env.API_KEYS.split(',');
    keys.forEach(key => {
        const [name, value] = key.split(':');
        API_KEYS.set(value, name);
    });
}

// 인증 미들웨어
export const authenticateRequest = async (req, res, next) => {
    try {
        // Authorization 헤더 확인
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return sendError(res, 401, 'Authorization header is required');
        }
        
        // Bearer 토큰 확인
        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            
            try {
                // JWT 검증
                const decoded = jwt.verify(token, JWT_SECRET);
                
                // 토큰 만료 확인
                if (decoded.exp && decoded.exp < Date.now() / 1000) {
                    return sendError(res, 401, 'Token has expired');
                }
                
                // 사용자 정보를 요청 객체에 추가
                req.user = {
                    id: decoded.userId,
                    discordId: decoded.discordId,
                    username: decoded.username,
                    avatar: decoded.avatar,
                    permissions: decoded.permissions || []
                };
                
                next();
            } catch (error) {
                logger.error('JWT 검증 실패:', error);
                return sendError(res, 401, 'Invalid token');
            }
        }
        // API 키 인증
        else if (authHeader.startsWith('ApiKey ')) {
            const apiKey = authHeader.substring(7);
            
            if (!API_KEYS.has(apiKey)) {
                return sendError(res, 401, 'Invalid API key');
            }
            
            // API 키 사용자 정보
            req.user = {
                type: 'api_key',
                name: API_KEYS.get(apiKey),
                permissions: ['read'] // API 키는 읽기 권한만
            };
            
            next();
        } else {
            return sendError(res, 401, 'Invalid authorization format');
        }
    } catch (error) {
        logger.error('인증 미들웨어 오류:', error);
        return sendError(res, 500, 'Authentication error');
    }
};

// 권한 확인 미들웨어
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, 'Authentication required');
        }
        
        // API 키는 읽기 권한만 허용
        if (req.user.type === 'api_key' && permission !== 'read') {
            return sendError(res, 403, 'API keys only have read permissions');
        }
        
        // 권한 확인
        if (!req.user.permissions || !req.user.permissions.includes(permission)) {
            return sendError(res, 403, `Permission denied: ${permission} required`);
        }
        
        next();
    };
};

// 길드 멤버 확인 미들웨어
export const requireGuildMember = async (req, res, next) => {
    try {
        const { guildId } = req.params;
        const client = req.app.locals.client;
        
        if (!guildId) {
            return sendError(res, 400, 'Guild ID is required');
        }
        
        // 길드 존재 확인
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return sendError(res, 404, 'Guild not found');
        }
        
        // 사용자가 길드 멤버인지 확인
        try {
            const member = await guild.members.fetch(req.user.discordId);
            if (!member) {
                return sendError(res, 403, 'You are not a member of this guild');
            }
            
            req.guildMember = member;
            req.guild = guild;
            next();
        } catch (error) {
            return sendError(res, 403, 'You are not a member of this guild');
        }
    } catch (error) {
        logger.error('길드 멤버 확인 오류:', error);
        return sendError(res, 500, 'Failed to verify guild membership');
    }
};

// 길드 관리자 확인 미들웨어
export const requireGuildAdmin = async (req, res, next) => {
    try {
        // 먼저 길드 멤버인지 확인
        await requireGuildMember(req, res, () => {
            // 관리자 권한 확인
            if (!req.guildMember.permissions.has('Administrator') && 
                !req.guildMember.permissions.has('ManageGuild')) {
                return sendError(res, 403, 'Administrator permissions required');
            }
            
            next();
        });
    } catch (error) {
        logger.error('길드 관리자 확인 오류:', error);
        return sendError(res, 500, 'Failed to verify admin permissions');
    }
};

// JWT 토큰 생성 함수
export const generateToken = (user) => {
    const payload = {
        userId: user.id,
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
        permissions: user.permissions || []
    };
    
    const options = {
        expiresIn: '7d' // 7일 만료
    };
    
    return jwt.sign(payload, JWT_SECRET, options);
};

// 토큰 갱신 함수
export const refreshToken = (oldToken) => {
    try {
        const decoded = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true });
        
        // 새 토큰 생성
        const newToken = generateToken({
            id: decoded.userId,
            discordId: decoded.discordId,
            username: decoded.username,
            avatar: decoded.avatar,
            permissions: decoded.permissions
        });
        
        return newToken;
    } catch (error) {
        logger.error('토큰 갱신 실패:', error);
        throw new Error('Failed to refresh token');
    }
};