<!-- 📁 파일: src/lib/components/MobileMenu.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';

  export let isOpen = false;

  const menuItems = [
    { href: '/main', label: '홈', icon: '🏠' },
    { href: '/parties', label: '파티', icon: '🎮' },
    { href: '/schedule', label: '스케줄', icon: '📅' },
    { href: '/settings', label: '설정', icon: '⚙️' },
    { href: '/profile', label: '프로필', icon: '👤' }
  ];

  function closeMenu() {
    isOpen = false;
  }

  // 외부 클릭시 메뉴 닫기
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeMenu();
    }
  }

  // ESC 키 처리
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      closeMenu();
    }
  }

  // 로그아웃 처리
  async function handleLogout() {
    try {
      // Discord OAuth 로그아웃 처리
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        // 로그아웃 성공 시 로그인 페이지로 이동
        goto('/auth/login');
      } else {
        console.error('로그아웃 실패');
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  }

  // ESC 키 이벤트 리스너
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if isOpen}
  <div
    class="mobile-menu-backdrop"
    on:click={handleBackdropClick}
    on:keydown={(e) => e.key === 'Escape' && closeMenu()}
    transition:fade={{ duration: 200 }}
    role="button"
    tabindex="-1"
    aria-label="메뉴 닫기"
  >
    <nav class="mobile-menu" transition:fly={{ x: -300, duration: 300 }} aria-label="모바일 메뉴">
      <div class="menu-header">
        <h2 class="menu-title">메뉴</h2>
        <button class="close-btn" on:click={closeMenu} aria-label="메뉴 닫기">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="menu-nav">
        <ul class="menu-list" role="list">
          {#each menuItems as item}
            <li>
              <a
                href={item.href}
                class="menu-link"
                class:active={$page.url.pathname === item.href}
                on:click={closeMenu}
                aria-current={$page.url.pathname === item.href ? 'page' : undefined}
              >
                <span class="menu-icon" aria-hidden="true">{item.icon}</span>
                <span class="menu-label">{item.label}</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <div class="menu-footer">
        <button class="logout-btn" on:click={handleLogout}>
          <span>🚪</span>
          <span>로그아웃</span>
        </button>
      </div>
    </nav>
  </div>
{/if}

<style>
  .mobile-menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    backdrop-filter: blur(5px);
  }

  .mobile-menu {
    position: absolute;
    top: 0;
    left: 0;
    width: 280px;
    height: 100%;
    background-color: #1a1a1a;
    border-right: 2px solid #36393f;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 2px solid #36393f;
  }

  .menu-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(45deg, #5865f2, #7289da);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .close-btn {
    background: none;
    border: none;
    color: #b0b0b0;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition:
      background-color 0.2s,
      color 0.2s;
  }

  .close-btn:hover {
    background-color: rgba(237, 66, 69, 0.1);
    color: #ed4245;
  }

  .menu-nav {
    flex: 1;
    padding: 1rem;
  }

  .menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .menu-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    text-decoration: none;
    color: #b0b0b0;
    font-weight: 500;
    border-radius: 0.5rem;
    transition:
      background-color 0.2s,
      color 0.2s,
      transform 0.2s;
  }

  .menu-link:hover {
    background-color: rgba(88, 101, 242, 0.1);
    color: #ffffff;
    transform: translateX(5px);
  }

  .menu-link.active {
    background-color: rgba(88, 101, 242, 0.2);
    color: #5865f2;
  }

  .menu-icon {
    font-size: 1.25rem;
  }

  .menu-label {
    font-size: 1rem;
  }

  .menu-footer {
    padding: 1rem;
    border-top: 2px solid #36393f;
  }

  .logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background-color: rgba(237, 66, 69, 0.1);
    border: 1px solid #ed4245;
    border-radius: 0.5rem;
    color: #ed4245;
    font-weight: 600;
    cursor: pointer;
    transition:
      background-color 0.2s,
      transform 0.2s;
  }

  .logout-btn:hover {
    background-color: rgba(237, 66, 69, 0.2);
    transform: translateY(-2px);
  }
</style>
