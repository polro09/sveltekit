// 📁 파일: events/interactionCreate.js
// 인터랙션 생성 이벤트 (명령어, 버튼, 모달 등)

import { logger, logCommand } from '../utils/logger.js';
import { logs } from '../utils/database.js';
import { Collection } from 'discord.js';

export default {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            // 슬래시 명령어 처리
            if (interaction.isChatInputCommand()) {
                await handleSlashCommand(interaction, client);
            }
            // 버튼 인터랙션 처리
            else if (interaction.isButton()) {
                await handleButtonInteraction(interaction, client);
            }
            // 선택 메뉴 처리
            else if (interaction.isSelectMenu()) {
                await handleSelectMenuInteraction(interaction, client);
            }
            // 모달 제출 처리
            else if (interaction.isModalSubmit()) {
                await handleModalSubmit(interaction, client);
            }
            // 자동완성 처리
            else if (interaction.isAutocomplete()) {
                await handleAutocomplete(interaction, client);
            }
        } catch (error) {
            logger.error('인터랙션 처리 중 오류:', error);
            
            // 사용자에게 에러 메시지 전송
            const errorMessage = '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: errorMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true });
            }
        }
    }
};

// 슬래시 명령어 처리
async function handleSlashCommand(interaction, client) {
    const command = client.commands.get(interaction.commandName);
    
    if (!command) {
        logger.warn(`존재하지 않는 명령어: ${interaction.commandName}`);
        await interaction.reply({ 
            content: '해당 명령어를 찾을 수 없습니다.', 
            ephemeral: true 
        });
        return;
    }
    
    // 쿨다운 체크
    if (!client.cooldowns.has(command.data.name)) {
        client.cooldowns.set(command.data.name, new Collection());
    }
    
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.data.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            await interaction.reply({ 
                content: `⏱️ 잠시만요! \`${command.data.name}\` 명령어를 다시 사용하려면 ${timeLeft.toFixed(1)}초를 기다려주세요.`, 
                ephemeral: true 
            });
            return;
        }
    }
    
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    
    // 명령어 실행
    try {
        await command.execute(interaction);
        
        // 성공 로그
        logCommand(interaction, true);
        
        // 데이터베이스에 로그 저장
        await logs.logCommand({
            command: interaction.commandName,
            userId: interaction.user.id,
            guildId: interaction.guild?.id || null,
            channelId: interaction.channel?.id || null,
            success: true
        });
    } catch (error) {
        logger.error(`명령어 실행 오류 - ${command.data.name}:`, error);
        
        // 실패 로그
        logCommand(interaction, false);
        
        // 데이터베이스에 에러 로그 저장
        await logs.logCommand({
            command: interaction.commandName,
            userId: interaction.user.id,
            guildId: interaction.guild?.id || null,
            channelId: interaction.channel?.id || null,
            success: false,
            errorMessage: error.message
        });
        
        // 에러 메시지 전송
        const errorMessage = '명령어 실행 중 오류가 발생했습니다.';
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
}

// 버튼 인터랙션 처리
async function handleButtonInteraction(interaction, client) {
    // customId 파싱 (예: persistent_party_join_12345)
    const [persistent, type, action, ...params] = interaction.customId.split('_');
    
    logger.debug('버튼 인터랙션:', {
        customId: interaction.customId,
        type,
        action,
        params,
        user: interaction.user.tag
    });
    
    // 타입별 처리
    switch (type) {
        case 'party':
            // 파티 관련 버튼은 별도 핸들러에서 처리
            const partyHandler = await import('../handlers/partyButtons.js');
            await partyHandler.default(interaction, action, params);
            break;
            
        case 'verify':
            // 인증 관련 버튼
            const verifyHandler = await import('../handlers/verifyButtons.js');
            await verifyHandler.default(interaction, action, params);
            break;
            
        default:
            await interaction.reply({ 
                content: '알 수 없는 버튼입니다.', 
                ephemeral: true 
            });
    }
}

// 선택 메뉴 인터랙션 처리
async function handleSelectMenuInteraction(interaction, client) {
    const [persistent, type, action, ...params] = interaction.customId.split('_');
    
    logger.debug('선택 메뉴 인터랙션:', {
        customId: interaction.customId,
        type,
        action,
        params,
        values: interaction.values,
        user: interaction.user.tag
    });
    
    // 타입별 처리
    switch (type) {
        case 'role':
            // 역할 선택 메뉴
            const roleHandler = await import('../handlers/roleSelect.js');
            await roleHandler.default(interaction, action, params);
            break;
            
        case 'help':
            // 도움말 선택 메뉴
            const helpHandler = await import('../handlers/helpSelect.js');
            await helpHandler.default(interaction, action, params);
            break;
            
        default:
            await interaction.reply({ 
                content: '알 수 없는 선택 메뉴입니다.', 
                ephemeral: true 
            });
    }
}

// 모달 제출 처리
async function handleModalSubmit(interaction, client) {
    const [persistent, type, action, ...params] = interaction.customId.split('_');
    
    logger.debug('모달 제출:', {
        customId: interaction.customId,
        type,
        action,
        params,
        user: interaction.user.tag
    });
    
    // 타입별 처리
    switch (type) {
        case 'party':
            // 파티 생성 모달
            const partyModalHandler = await import('../handlers/partyModals.js');
            await partyModalHandler.default(interaction, action, params);
            break;
            
        case 'report':
            // 신고 모달
            const reportModalHandler = await import('../handlers/reportModals.js');
            await reportModalHandler.default(interaction, action, params);
            break;
            
        default:
            await interaction.reply({ 
                content: '알 수 없는 모달입니다.', 
                ephemeral: true 
            });
    }
}

// 자동완성 처리
async function handleAutocomplete(interaction, client) {
    const command = client.commands.get(interaction.commandName);
    
    if (!command || !command.autocomplete) {
        return;
    }
    
    try {
        await command.autocomplete(interaction);
    } catch (error) {
        logger.error(`자동완성 오류 - ${command.data.name}:`, error);
    }
}