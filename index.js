// 📁 파일: index.js
// Discord.js 봇 메인 엔트리 포인트

import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { startWebServer } from './api/server.js';
import { initializeDatabase } from './utils/database.js';

// ES 모듈 환경에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
dotenv.config();

// Discord 클라이언트 생성
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

// 명령어 컬렉션
client.commands = new Collection();
client.cooldowns = new Collection();

// 명령어 로드 함수
async function loadCommands() {
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        try {
            const filePath = join(commandsPath, file);
            const command = await import(`file://${filePath}`);
            
            if ('data' in command.default && 'execute' in command.default) {
                client.commands.set(command.default.data.name, command.default);
                logger.info(`명령어 로드 성공: ${command.default.data.name}`);
            } else {
                logger.warn(`[경고] ${file}에 필수 "data" 또는 "execute" 속성이 없습니다.`);
            }
        } catch (error) {
            logger.error(`명령어 로드 실패 - ${file}:`, error);
        }
    }
}

// 이벤트 로드 함수
async function loadEvents() {
    const eventsPath = join(__dirname, 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        try {
            const filePath = join(eventsPath, file);
            const event = await import(`file://${filePath}`);
            
            if (event.default.once) {
                client.once(event.default.name, (...args) => event.default.execute(...args, client));
            } else {
                client.on(event.default.name, (...args) => event.default.execute(...args, client));
            }
            
            logger.info(`이벤트 로드 성공: ${event.default.name}`);
        } catch (error) {
            logger.error(`이벤트 로드 실패 - ${file}:`, error);
        }
    }
}

// 명령어 등록 함수
async function registerCommands() {
    const commands = [];
    client.commands.forEach(command => {
        commands.push(command.data.toJSON());
    });
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    try {
        logger.info(`${commands.length}개의 슬래시 명령어 등록 시작...`);
        
        // 글로벌 명령어 등록
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        logger.info(`${data.length}개의 슬래시 명령어 등록 완료!`);
    } catch (error) {
        logger.error('명령어 등록 중 오류:', error);
    }
}

// 봇 초기화 함수
async function initializeBot() {
    try {
        logger.info('봇 초기화 시작...');
        
        // 데이터베이스 초기화
        await initializeDatabase();
        
        // 명령어 및 이벤트 로드
        await loadCommands();
        await loadEvents();
        
        // Discord 로그인
        await client.login(process.env.DISCORD_TOKEN);
        
        // 명령어 등록 (프로덕션 환경에서만)
        if (process.env.NODE_ENV === 'production') {
            await registerCommands();
        }
        
        // API 서버 시작
        const apiPort = process.env.API_PORT || 3000;
        await startWebServer(client, apiPort);
        
        logger.info('봇 초기화 완료!');
    } catch (error) {
        logger.error('봇 초기화 실패:', error);
        process.exit(1);
    }
}

// 프로세스 에러 핸들링
process.on('unhandledRejection', error => {
    logger.error('처리되지 않은 Promise 거부:', error);
});

process.on('uncaughtException', error => {
    logger.error('처리되지 않은 예외:', error);
    process.exit(1);
});

// 프로세스 종료 처리
process.on('SIGINT', async () => {
    logger.info('봇 종료 중...');
    
    // 클라이언트 종료
    if (client) {
        await client.destroy();
    }
    
    process.exit(0);
});

// 봇 시작
initializeBot();

// 클라이언트 내보내기 (다른 모듈에서 사용)
export { client };