// 📁 파일: api/middleware/errorHandler.js
// 전역 에러 핸들러 미들웨어

import { logger } from '../../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
    // 이미 응답이 전송된 경우
    if (res.headersSent) {
        return next(err);
    }
    
    // 에러 로깅
    logger.error('API 에러:', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        user: req.user?.id || 'anonymous'
    });
    
    // 에러 타입별 처리
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = null;
    
    // Validation 에러
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
    }
    
    // JWT 에러
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    
    // JWT 만료 에러
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    
    // Prisma 에러
    else if (err.name === 'PrismaClientKnownRequestError') {
        if (err.code === 'P2002') {
            statusCode = 409;
            message = 'Duplicate entry';
        } else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        }
    }
    
    // Rate limit 에러
    else if (err.statusCode === 429) {
        message = 'Too many requests';
    }
    
    // 프로덕션 환경에서는 상세 에러 정보 숨김
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(statusCode).json({
        success: false,
        message,
        errors,
        ...(isDevelopment && {
            stack: err.stack,
            details: err
        })
    });
};