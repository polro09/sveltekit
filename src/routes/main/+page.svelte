<!-- 📁 파일: src/routes/main/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  
  let currentTime = new Date().toLocaleTimeString('ko-KR');
  
  onMount(() => {
    const interval = setInterval(() => {
      currentTime = new Date().toLocaleTimeString('ko-KR');
    }, 1000);
    
    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>홈 | Aimdot.dev</title>
</svelte:head>

<div class="main-content">
  <header class="page-header">
    <h1 class="page-title">홈페이지 영역</h1>
    <p class="page-subtitle">Aimdot.dev 대시보드에 오신 것을 환영합니다</p>
  </header>
  
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">🎮</div>
      <div class="stat-content">
        <h3 class="stat-value">0</h3>
        <p class="stat-label">활성 파티</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">👥</div>
      <div class="stat-content">
        <h3 class="stat-value">0</h3>
        <p class="stat-label">온라인 유저</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">📅</div>
      <div class="stat-content">
        <h3 class="stat-value">0</h3>
        <p class="stat-label">예정된 이벤트</p>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-content">
        <h3 class="stat-value">0</h3>
        <p class="stat-label">완료된 매치</p>
      </div>
    </div>
  </div>
  
  <div class="content-grid">
    <section class="recent-activity">
      <h2 class="section-title">최근 활동</h2>
      <div class="activity-list">
        <div class="activity-item">
          <span class="activity-time">{currentTime}</span>
          <span class="activity-text">대시보드에 접속했습니다</span>
        </div>
      </div>
    </section>
    
    <section class="quick-actions">
      <h2 class="section-title">빠른 작업</h2>
      <div class="action-grid">
        <button class="action-btn">
          <span class="action-icon">➕</span>
          <span class="action-label">파티 생성</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">📋</span>
          <span class="action-label">스케줄 관리</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">⚙️</span>
          <span class="action-label">서버 설정</span>
        </button>
        <button class="action-btn">
          <span class="action-icon">📊</span>
          <span class="action-label">통계 보기</span>
        </button>
      </div>
    </section>
  </div>
</div>

<style>
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .page-header {
    margin-bottom: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    background: linear-gradient(45deg, #5865F2, #7289DA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .page-subtitle {
    color: #B0B0B0;
    font-size: 1.125rem;
    margin: 0;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background-color: #0a0a0a;
    border: 2px solid #36393F;
    border-radius: 0.75rem;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: border-color 0.2s, transform 0.2s;
  }
  
  .stat-card:hover {
    border-color: #5865F2;
    transform: translateY(-2px);
  }
  
  .stat-icon {
    font-size: 2rem;
    background-color: rgba(88, 101, 242, 0.1);
    width: 3.5rem;
    height: 3.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #B0B0B0;
    margin: 0;
  }
  
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #ffffff;
  }
  
  .recent-activity {
    background-color: #0a0a0a;
    border: 2px solid #36393F;
    border-radius: 0.75rem;
    padding: 1.5rem;
  }
  
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background-color: #1a1a1a;
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }
  
  .activity-time {
    color: #5865F2;
    font-weight: 500;
    min-width: 80px;
  }
  
  .activity-text {
    color: #B0B0B0;
  }
  
  .quick-actions {
    background-color: #0a0a0a;
    border: 2px solid #36393F;
    border-radius: 0.75rem;
    padding: 1.5rem;
  }
  
  .action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  .action-btn {
    background: linear-gradient(135deg, rgba(88, 101, 242, 0.1), rgba(114, 137, 218, 0.1));
    border: 2px solid #5865F2;
    border-radius: 0.5rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    color: #ffffff;
  }
  
  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(88, 101, 242, 0.3);
  }
  
  .action-icon {
    font-size: 1.5rem;
  }
  
  .action-label {
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }
    
    .content-grid {
      grid-template-columns: 1fr;
    }
    
    .action-grid {
      grid-template-columns: 1fr;
    }
  }
</style>