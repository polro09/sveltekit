// 📁 파일: commands/help.js
// 도움말 명령어 - 전체 코드

import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setNameLocalizations({
            ko: '도움말'
        })
        .setDescription('봇의 명령어와 사용법을 확인합니다')
        .setDescriptionLocalizations({
            ko: '봇의 명령어와 사용법을 확인합니다'
        })
        .addStringOption(option =>
            option.setName('command')
                .setNameLocalizations({ ko: '명령어' })
                .setDescription('특정 명령어의 상세 정보를 확인합니다')
                .setDescriptionLocalizations({ ko: '특정 명령어의 상세 정보를 확인합니다' })
                .setRequired(false)
                .setAutocomplete(true)
        ),
    
    cooldown: 3,
    
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const commands = interaction.client.commands;
        
        const choices = commands
            .filter(cmd => cmd.data.name.includes(focusedValue.toLowerCase()))
            .map(cmd => ({
                name: `/${cmd.data.name} - ${cmd.data.description}`,
                value: cmd.data.name
            }))
            .slice(0, 25);
        
        await interaction.respond(choices);
    },
    
    async execute(interaction) {
        const commandName = interaction.options.getString('command');
        
        if (commandName) {
            // 특정 명령어 도움말
            await showCommandHelp(interaction, commandName);
        } else {
            // 전체 도움말
            await showGeneralHelp(interaction);
        }
    }
};

// 전체 도움말 표시
async function showGeneralHelp(interaction) {
    const defaultThumbnail = process.env.DEFAULT_THUMBNAIL || 'https://i.imgur.com/Sd8qK9c.gif';
    
    // 카테고리별 명령어 정리
    const categories = {
        '🎮 파티': [
            '`/party create` - 새로운 파티를 생성합니다',
            '`/party list` - 활성 파티 목록을 확인합니다',
            '`/party info` - 파티 정보를 확인합니다',
            '`/party leave` - 파티에서 나갑니다'
        ],
        '⚙️ 설정': [
            '`/settings view` - 서버 설정을 확인합니다',
            '`/settings party` - 파티 설정을 변경합니다',
            '`/settings notifications` - 알림 설정을 변경합니다'
        ],
        '👤 사용자': [
            '`/profile` - 프로필을 확인합니다',
            '`/stats` - 통계를 확인합니다'
        ],
        '🛠️ 유틸리티': [
            '`/help` - 도움말을 확인합니다',
            '`/ping` - 봇의 응답 속도를 확인합니다',
            '`/info` - 봇 정보를 확인합니다'
        ]
    };
    
    const embed = new EmbedBuilder()
        .setTitle('📚 Aimdot Bot 도움말')
        .setDescription('Aimdot Bot은 게임 파티 생성과 관리를 도와주는 Discord 봇입니다.\n\n**[웹 대시보드](https://aimdot.dev)** | **[지원 서버](https://discord.gg/your-support-server)** | **[봇 초대하기](https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID)**')
        .setColor(0x5865F2)
        .setThumbnail(defaultThumbnail)
        .setTimestamp()
        .setFooter({ 
            text: `${interaction.user.tag}님이 요청`, 
            iconURL: interaction.user.displayAvatarURL() 
        });
    
    // 카테고리별 필드 추가
    for (const [category, commands] of Object.entries(categories)) {
        embed.addFields({
            name: category,
            value: commands.join('\n'),
            inline: false
        });
    }
    
    // 선택 메뉴 생성
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('persistent_help_category_select')
        .setPlaceholder('카테고리를 선택하세요')
        .addOptions([
            {
                label: '🎮 파티 명령어',
                description: '파티 생성 및 관리 명령어',
                value: 'party'
            },
            {
                label: '⚙️ 설정 명령어',
                description: '서버 설정 관련 명령어',
                value: 'settings'
            },
            {
                label: '👤 사용자 명령어',
                description: '프로필 및 통계 명령어',
                value: 'user'
            },
            {
                label: '🛠️ 유틸리티 명령어',
                description: '기타 유용한 명령어',
                value: 'utility'
            }
        ]);
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await interaction.reply({
        embeds: [embed],
        components: [row]
    });
}

// 특정 명령어 도움말 표시
async function showCommandHelp(interaction, commandName) {
    const command = interaction.client.commands.get(commandName);
    
    if (!command) {
        await interaction.reply({
            content: `❌ \`${commandName}\` 명령어를 찾을 수 없습니다.`,
            ephemeral: true
        });
        return;
    }
    
    const defaultThumbnail = process.env.DEFAULT_THUMBNAIL || 'https://i.imgur.com/Sd8qK9c.gif';
    
    const embed = new EmbedBuilder()
        .setTitle(`📖 /${command.data.name} 명령어 정보`)
        .setColor(0x5865F2)
        .setThumbnail(defaultThumbnail)
        .addFields(
            {
                name: '설명',
                value: command.data.description || '설명이 없습니다.',
                inline: false
            },
            {
                name: '사용법',
                value: `\`/${command.data.name}${getCommandUsage(command)}\``,
                inline: false
            }
        );
    
    // 옵션 정보 추가
    if (command.data.options && command.data.options.length > 0) {
        const optionsText = command.data.options.map(option => {
            const required = option.required ? '(필수)' : '(선택)';
            return `• **${option.name}** ${required} - ${option.description}`;
        }).join('\n');
        
        embed.addFields({
            name: '옵션',
            value: optionsText,
            inline: false
        });
    }
    
    // 쿨다운 정보
    if (command.cooldown) {
        embed.addFields({
            name: '쿨다운',
            value: `${command.cooldown}초`,
            inline: true
        });
    }
    
    // 권한 정보
    if (command.data.default_member_permissions) {
        embed.addFields({
            name: '필요 권한',
            value: getPermissionNames(command.data.default_member_permissions),
            inline: true
        });
    }
    
    // 예시 추가
    if (command.examples) {
        embed.addFields({
            name: '예시',
            value: command.examples.map(ex => `\`${ex}\``).join('\n'),
            inline: false
        });
    }
    
    await interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

// 명령어 사용법 문자열 생성
function getCommandUsage(command) {
    if (!command.data.options || command.data.options.length === 0) {
        return '';
    }
    
    return ' ' + command.data.options.map(option => {
        const optionName = option.name;
        return option.required ? `<${optionName}>` : `[${optionName}]`;
    }).join(' ');
}

// 권한 이름 변환
function getPermissionNames(permissions) {
    const permissionNames = {
        'Administrator': '관리자',
        'ManageGuild': '서버 관리',
        'ManageRoles': '역할 관리',
        'ManageChannels': '채널 관리',
        'KickMembers': '멤버 추방',
        'BanMembers': '멤버 차단',
        'ManageMessages': '메시지 관리'
    };
    
    // BigInt를 문자열로 변환하여 처리
    const permissionBits = BigInt(permissions);
    const names = [];
    
    for (const [perm, bit] of Object.entries({
        'Administrator': 8n,
        'ManageGuild': 32n,
        'ManageRoles': 268435456n,
        'ManageChannels': 16n,
        'KickMembers': 2n,
        'BanMembers': 4n,
        'ManageMessages': 8192n
    })) {
        if ((permissionBits & bit) === bit) {
            names.push(permissionNames[perm] || perm);
        }
    }
    
    return names.length > 0 ? names.join(', ') : '없음';
}