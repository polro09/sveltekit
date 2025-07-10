// 📁 파일: handlers/helpSelect.js
// 도움말 선택 메뉴 핸들러

import { EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

export default async function handleHelpSelect(interaction, action, params) {
    try {
        // 선택된 카테고리
        const category = interaction.values[0];
        const defaultThumbnail = process.env.DEFAULT_THUMBNAIL || 'https://i.imgur.com/Sd8qK9c.gif';
        
        let embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setThumbnail(defaultThumbnail)
            .setTimestamp()
            .setFooter({ 
                text: `${interaction.user.tag}님이 요청`, 
                iconURL: interaction.user.displayAvatarURL() 
            });
        
        // 카테고리별 상세 도움말
        switch (category) {
            case 'party':
                embed.setTitle('🎮 파티 명령어 상세 도움말')
                    .setDescription('게임 파티를 생성하고 관리하는 명령어들입니다.')
                    .addFields(
                        {
                            name: '/party create',
                            value: '새로운 파티를 생성합니다.\n• **게임**: 플레이할 게임 선택\n• **제목**: 파티 제목\n• **인원**: 최대 참가 인원 (2-10명)\n• **시작시간**: 파티 시작 시간',
                            inline: false
                        },
                        {
                            name: '/party list',
                            value: '현재 모집 중인 파티 목록을 확인합니다.\n• **게임**: 특정 게임으로 필터링 (선택)\n• **페이지**: 페이지 번호 (선택)',
                            inline: false
                        },
                        {
                            name: '/party info <파티ID>',
                            value: '특정 파티의 상세 정보를 확인합니다.\n• **파티ID**: 확인할 파티의 ID',
                            inline: false
                        },
                        {
                            name: '/party leave',
                            value: '현재 참가 중인 파티에서 나갑니다.',
                            inline: false
                        }
                    );
                break;
                
            case 'settings':
                embed.setTitle('⚙️ 설정 명령어 상세 도움말')
                    .setDescription('서버와 봇의 다양한 설정을 관리합니다.')
                    .addFields(
                        {
                            name: '/settings view',
                            value: '현재 서버의 모든 설정을 확인합니다.',
                            inline: false
                        },
                        {
                            name: '/settings party',
                            value: '파티 관련 설정을 변경합니다.\n• **채널**: 파티 알림 채널 설정\n• **역할**: 파티 참가자 역할 설정\n• **자동삭제**: 완료된 파티 자동 삭제 여부',
                            inline: false
                        },
                        {
                            name: '/settings notifications',
                            value: '알림 설정을 변경합니다.\n• **파티생성**: 새 파티 생성 알림\n• **파티시작**: 파티 시작 알림\n• **멘션**: 알림 시 멘션 여부',
                            inline: false
                        }
                    );
                break;
                
            case 'user':
                embed.setTitle('👤 사용자 명령어 상세 도움말')
                    .setDescription('사용자 프로필과 통계를 확인합니다.')
                    .addFields(
                        {
                            name: '/profile [사용자]',
                            value: '프로필을 확인합니다.\n• **사용자**: 확인할 사용자 (선택, 기본값: 본인)',
                            inline: false
                        },
                        {
                            name: '/stats [기간]',
                            value: '파티 참여 통계를 확인합니다.\n• **기간**: 통계 기간 (일주일/한달/전체)',
                            inline: false
                        }
                    );
                break;
                
            case 'utility':
                embed.setTitle('🛠️ 유틸리티 명령어 상세 도움말')
                    .setDescription('기타 유용한 명령어들입니다.')
                    .addFields(
                        {
                            name: '/help [명령어]',
                            value: '도움말을 확인합니다.\n• **명령어**: 특정 명령어 도움말 (선택)',
                            inline: false
                        },
                        {
                            name: '/ping',
                            value: '봇의 응답 속도와 API 지연시간을 확인합니다.',
                            inline: false
                        },
                        {
                            name: '/info',
                            value: '봇의 정보와 통계를 확인합니다.\n• 버전 정보\n• 서버 수\n• 사용자 수\n• 업타임',
                            inline: false
                        }
                    );
                break;
                
            default:
                embed.setTitle('❓ 알 수 없는 카테고리')
                    .setDescription('선택한 카테고리를 찾을 수 없습니다.');
        }
        
        // 상호작용 업데이트
        await interaction.update({
            embeds: [embed],
            components: interaction.message.components // 기존 컴포넌트 유지
        });
        
    } catch (error) {
        logger.error('도움말 선택 메뉴 처리 오류:', error);
        
        await interaction.reply({
            content: '도움말을 표시하는 중 오류가 발생했습니다.',
            ephemeral: true
        });
    }
}