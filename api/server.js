// 📁 파일: api/server.js
// Express 기반 API 서버 - 웹 대시보드와의 연동

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger, logAPI } from '../utils/logger.js';
import { authenticateRequest } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import botStatusRouter from './routes/botStatus.js';
import guildsRouter from './routes/guilds.js';
import usersRouter from './routes/users.js';
import webhookRouter from './routes/webhook.js';

// Express 앱 생성
const app = express();

// 기본 미들웨어
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 설정
app.use(cors({
    origin: process.env.WEB_URL || 'https://aimdot.dev',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // 최대 100개 요청
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api', limiter);

// 요청 로깅 미들웨어
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const userId = req.user?.id || null;
        logAPI(req.method, req.originalUrl, res.statusCode, duration, userId);
    });
    
    next();
});

// API 서버 시작 함수
export async function startWebServer(client, port) {
    // 봇 클라이언트를 모든 요청에서 사용할 수 있도록 설정
    app.locals.client = client;
    
    // 헬스체크 엔드포인트
    app.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            bot: {
                ready: client.isReady(),
                user: client.user ? client.user.tag : null,
                guilds: client.guilds.cache.size,
                users: client.users.cache.size
            }
        });
    });
    
    // API 라우트
    app.use('/api/bot-status', authenticateRequest, botStatusRouter);
    app.use('/api/guilds', authenticateRequest, guildsRouter);
    app.use('/api/users', authenticateRequest, usersRouter);
    app.use('/api/webhook', webhookRouter); // 웹훅은 인증 불필요
    
    // 404 핸들러
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: 'The requested endpoint does not exist',
            path: req.originalUrl
        });
    });
    
    // 에러 핸들러
    app.use(errorHandler);
    
    // 서버 시작
    app.listen(port, () => {
        logger.info(`API 서버가 포트 ${port}에서 시작되었습니다`);
    });
}

// API 응답 헬퍼 함수들
export const sendSuccess = (res, data = null, message = 'Success') => {
    res.json({
        success: true,
        message,
        data
    });
};

export const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
    res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};

export const sendPaginated = (res, data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    
    res.json({
        success: true,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    });
};