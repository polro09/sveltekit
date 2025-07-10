// 📁 파일: utils/logger.js
// 로거 시스템 - winston 기반 구조화된 로깅

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 로그 디렉토리 생성
const logDir = join(__dirname, '..', 'logs');
if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
}

// 커스텀 로그 포맷
const customFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
        let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        // 메타데이터가 있으면 추가
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }
        
        // 스택 트레이스가 있으면 추가
        if (stack) {
            msg += `\n${stack}`;
        }
        
        return msg;
    })
);

// Discord 웹훅 전송을 위한 커스텀 transport
class DiscordWebhookTransport extends winston.Transport {
    constructor(opts) {
        super(opts);
        this.webhookUrl = opts.webhookUrl;
        this.minimumLevel = opts.minimumLevel || 'error';
    }
    
    async log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        
        // 지정된 레벨 이상의 로그만 Discord로 전송
        const levels = ['error', 'warn', 'info', 'debug'];
        const currentLevelIndex = levels.indexOf(info.level);
        const minimumLevelIndex = levels.indexOf(this.minimumLevel);
        
        if (currentLevelIndex > minimumLevelIndex) {
            callback();
            return;
        }
        
        try {
            const embed = {
                title: `🚨 ${info.level.toUpperCase()} 로그`,
                description: info.message,
                color: this.getColorByLevel(info.level),
                timestamp: new Date().toISOString(),
                fields: []
            };
            
            // 메타데이터 추가
            const metadata = { ...info };
            delete metadata.level;
            delete metadata.message;
            delete metadata.timestamp;
            
            if (Object.keys(metadata).length > 0) {
                embed.fields.push({
                    name: '추가 정보',
                    value: `\`\`\`json\n${JSON.stringify(metadata, null, 2)}\`\`\``,
                    inline: false
                });
            }
            
            // 스택 트레이스 추가
            if (info.stack) {
                embed.fields.push({
                    name: '스택 트레이스',
                    value: `\`\`\`${info.stack.substring(0, 1000)}\`\`\``,
                    inline: false
                });
            }
            
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    embeds: [embed]
                })
            });
        } catch (error) {
            console.error('Discord 웹훅 전송 실패:', error);
        }
        
        callback();
    }
    
    getColorByLevel(level) {
        const colors = {
            error: 0xFF0000,    // 빨강
            warn: 0xFFFF00,     // 노랑
            info: 0x0099FF,     // 파랑
            debug: 0x808080     // 회색
        };
        return colors[level] || 0x000000;
    }
}

// 로거 인스턴스 생성
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: [
        // 콘솔 출력
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            )
        }),
        
        // 파일 출력 (일별 로테이션)
        new DailyRotateFile({
            filename: join(logDir, 'bot-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: customFormat
        }),
        
        // 에러 전용 파일
        new DailyRotateFile({
            filename: join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error',
            format: customFormat
        })
    ]
});

// Discord 웹훅이 설정되어 있으면 추가
if (process.env.DISCORD_LOG_WEBHOOK) {
    logger.add(new DiscordWebhookTransport({
        webhookUrl: process.env.DISCORD_LOG_WEBHOOK,
        minimumLevel: process.env.DISCORD_LOG_LEVEL || 'error'
    }));
}

// 로거 헬퍼 함수들
export const logCommand = (interaction, success = true) => {
    const logData = {
        command: interaction.commandName,
        user: `${interaction.user.tag} (${interaction.user.id})`,
        guild: interaction.guild ? `${interaction.guild.name} (${interaction.guild.id})` : 'DM',
        channel: interaction.channel ? `${interaction.channel.name} (${interaction.channel.id})` : 'Unknown',
        success: success
    };
    
    if (success) {
        logger.info('명령어 실행', logData);
    } else {
        logger.error('명령어 실행 실패', logData);
    }
};

export const logAPI = (method, path, statusCode, duration, userId = null) => {
    const logData = {
        method,
        path,
        statusCode,
        duration: `${duration}ms`,
        userId
    };
    
    if (statusCode >= 400) {
        logger.error('API 요청 실패', logData);
    } else {
        logger.info('API 요청', logData);
    }
};

export const logDatabase = (operation, model, success = true, details = {}) => {
    const logData = {
        operation,
        model,
        success,
        ...details
    };
    
    if (success) {
        logger.debug('데이터베이스 작업', logData);
    } else {
        logger.error('데이터베이스 작업 실패', logData);
    }
};

export { logger };