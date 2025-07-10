<!-- 📁 파일: src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import MobileMenu from '$lib/components/MobileMenu.svelte';
  
  let isMobileMenuOpen = false;
  let showLayout = false;
  
  // 페이지별 레이아웃 표시 여부 결정
  $: {
    const path = $page.url.pathname;
    showLayout = path !== '/' && !path.startsWith('/auth');
  }
  
  onMount(() => {
    // 메타 태그 동적 설정
    const metaTags = {
      'theme-color': '#5865F2',
      'color-scheme': 'dark'
    };
    
    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });
    
    // Preconnect 링크 추가
    const preconnectUrls = [
      'https://cdn.discordapp.com',
      'https://i.imgur.com'
    ];
    
    preconnectUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      document.head.appendChild(link);
    });
  });
  
  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

<svelte:head>
  <title>Aimdot.dev - Discord Bot & 관리 시스템</title>
  <meta name="description" content="디스코드 서버 관리를 위한 올인원 솔루션. 게임 파티 생성, 스케줄 관리, 사용자 권한 관리까지." />
  <meta name="keywords" content="Discord, Bot, 디스코드, 봇, 게임, 파티, 관리, Aimdot" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Aimdot.dev - Discord Bot & 관리 시스템" />
  <meta property="og:description" content="디스코드 서버 관리를 위한 올인원 솔루션" />
  <meta property="og:image" content="https://i.imgur.com/Sd8qK9c.gif" />
  <meta property="og:url" content="https://aimdot.dev" />
  <meta property="og:type" content="website" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Aimdot.dev - Discord Bot & 관리 시스템" />
  <meta name="twitter:description" content="디스코드 서버 관리를 위한 올인원 솔루션" />
  <meta name="twitter:image" content="https://i.imgur.com/Sd8qK9c.gif" />
</svelte:head>

{#if showLayout}
  <div class="app-container">
    <!-- 상단 네비게이션 바 -->
    <header class="header">
      <div class="header-left">
        <button class="mobile-menu-btn" on:click={toggleMobileMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <a href="/main" class="logo">
          <span class="logo-icon">🎯</span>
          <span class="logo-text">Aimdot</span>
        </a>
      </div>
      
      <nav class="header-center">
        <Navigation />
      </nav>
      
      <div class="header-right">
        <button class="menu-btn">메뉴</button>
      </div>
    </header>
    
    <!-- 메인 콘텐츠 영역 -->
    <div class="main-container">
      <!-- 좌측 사이드바 -->
      <aside class="sidebar">
        <Sidebar />
      </aside>
      
      <!-- 중앙 콘텐츠 -->
      <main class="content">
        <div class="content-inner">
          <slot />
        </div>
      </main>
      
      <!-- 우측 사이드바 -->
      <aside class="right-sidebar">
        <div class="widget">
          <h3>메뉴 영역</h3>
          <div class="widget-content">
            <p>메뉴 내용이 여기에 표시됩니다.</p>
          </div>
        </div>
        
        <div class="widget">
          <h3>홈페이지 로고</h3>
          <div class="widget-content logo-widget">
            <img src="https://i.imgur.com/Sd8qK9c.gif" alt="Aimdot Logo" />
          </div>
        </div>
        
        <div class="widget">
          <h3>우측 사이드바</h3>
          <div class="widget-content">
            <p>추가 정보가 여기에 표시됩니다.</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
  
  <!-- 모바일 메뉴 -->
  <MobileMenu bind:isOpen={isMobileMenuOpen} />
{:else}
  <!-- 레이아웃이 없는 페이지 (로딩, 인증 등) -->
  <slot />
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #0a0a0a;
    color: #ffffff;
    min-height: 100vh;
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  /* 헤더 스타일 */
  .header {
    background-color: #1a1a1a;
    border-bottom: 2px solid #36393F;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
    background-color: rgba(26, 26, 26, 0.95);
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    color: #ffffff;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
  }
  
  .mobile-menu-btn:hover {
    background-color: rgba(88, 101, 242, 0.1);
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 1.25rem;
    transition: color 0.2s;
  }
  
  .logo:hover {
    color: #5865F2;
  }
  
  .logo-icon {
    font-size: 1.5rem;
  }
  
  .logo-text {
    background: linear-gradient(45deg, #5865F2, #7289DA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .menu-btn {
    background: linear-gradient(45deg, #5865F2, #7289DA);
    border: none;
    color: #ffffff;
    padding: 0.5rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .menu-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(88, 101, 242, 0.3);
  }
  
  /* 메인 컨테이너 */
  .main-container {
    flex: 1;
    display: flex;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    gap: 1rem;
    padding: 1rem;
  }
  
  /* 사이드바 공통 스타일 */
  .sidebar, .right-sidebar {
    width: 250px;
    background-color: #1a1a1a;
    border: 2px solid #36393F;
    border-radius: 1rem;
    padding: 1.5rem;
    height: fit-content;
    position: sticky;
    top: 76px;
  }
  
  /* 중앙 콘텐츠 */
  .content {
    flex: 1;
    min-width: 0;
  }
  
  .content-inner {
    background-color: #1a1a1a;
    border: 2px solid #36393F;
    border-radius: 1rem;
    padding: 2rem;
    min-height: calc(100vh - 108px);
  }
  
  /* 우측 사이드바 위젯 */
  .widget {
    margin-bottom: 1.5rem;
  }
  
  .widget:last-child {
    margin-bottom: 0;
  }
  
  .widget h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #B0B0B0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .widget-content {
    background-color: #0a0a0a;
    border: 1px solid #36393F;
    border-radius: 0.5rem;
    padding: 1rem;
    color: #B0B0B0;
    font-size: 0.875rem;
    transition: border-color 0.2s;
  }
  
  .widget-content:hover {
    border-color: #5865F2;
  }
  
  .logo-widget {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }
  
  .logo-widget img {
    width: 100%;
    max-width: 150px;
    height: auto;
    border-radius: 0.5rem;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 1200px) {
    .right-sidebar {
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: block;
    }
    
    .header-center {
      display: none;
    }
    
    .main-container {
      padding: 0.5rem;
    }
    
    .sidebar {
      display: none;
    }
    
    .content-inner {
      padding: 1rem;
    }
  }
</style>