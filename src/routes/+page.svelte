<!-- 📁 파일: src/routes/+page.svelte -->
<!-- 로딩 페이지 - 홈페이지 접속시 첫 화면 -->

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  
  let progress = 0;
  let messageIndex = 0;
  let logoUrl = '';
  
  // 4개의 로딩 메시지
  const loadingMessages = [
    "서버에 연결하는 중...",
    "사용자 정보 불러오는 중...", 
    "게임 데이터 로드 중...",
    "설정 적용 중..."
  ];
  
  // 로딩 완료 후 메인 페이지로 이동
  const handleComplete = () => {
    console.log('✅ 로딩 완료 - 메인 페이지로 이동');
    
    // 세션 스토리지에 로딩 완료 표시
    if (browser) {
      sessionStorage.setItem('aimdot_loading_completed', 'true');
    }
    
    // 부드러운 전환을 위한 약간의 지연
    setTimeout(() => {
      goto('/main', { replaceState: true });
    }, 300);
  };
  
  onMount(() => {
    // 이미 로딩을 완료한 경우 바로 메인으로 이동
    if (browser && sessionStorage.getItem('aimdot_loading_completed') === 'true') {
      goto('/main', { replaceState: true });
      return;
    }
    
    // 로고 URL 생성 (페이지 로드시 한 번만)
    logoUrl = `https://i.imgur.com/9MwyIGW.gif?t=${Date.now()}`;
    
    console.log('🔄 로딩 페이지 시작: 4초간 부드러운 진행');
    console.log('🖼️ 로고 URL:', logoUrl);
    
    let currentProgress = 0;
    let currentMessageIndex = 0;
    
    const updateProgress = () => {
      // 15~25% 랜덤 증가 (4초에 맞게 조정)
      const randomIncrement = Math.floor(Math.random() * 11) + 15; // 15-25
      currentProgress = Math.min(currentProgress + randomIncrement, 100);
      
      progress = currentProgress;
      console.log('📊 진행:', currentProgress + '%');
      
      // 메시지 변경 (진행률에 따라 - 4개 메시지에 맞게 조정)
      const newMessageIndex = Math.min(Math.floor(currentProgress / 25), 3); // 25%마다 변경, 최대 3
      if (newMessageIndex !== currentMessageIndex) {
        currentMessageIndex = newMessageIndex;
        messageIndex = currentMessageIndex;
        console.log('💬 메시지:', loadingMessages[currentMessageIndex]);
      }
      
      if (currentProgress >= 100) {
        console.log('✅ 로딩 완료!');
        handleComplete();
      } else {
        // 다음 업데이트 예약 (500ms 간격으로 약 8번 업데이트)
        setTimeout(updateProgress, 500);
      }
    };
    
    // 첫 업데이트 시작 (초기 지연 500ms)
    setTimeout(updateProgress, 500);
  });
</script>

<svelte:head>
  <title>Loading... | Aimdot.dev</title>
</svelte:head>

<div class="loading-container">
  <div class="loading-content">
    <!-- 로고 이미지 -->
    {#if logoUrl}
      <img 
        src={logoUrl} 
        alt="Aimdot Logo" 
        class="logo"
      />
    {/if}
    
    <!-- 로딩 메시지 -->
    <p class="loading-message">
      {loadingMessages[messageIndex]}
    </p>
    
    <!-- 프로그레스 바 -->
    <div class="progress-wrapper">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          style="width: {progress}%"
        ></div>
      </div>
      <span class="progress-text">{progress}%</span>
    </div>
  </div>
</div>

<style>
  .loading-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #0a0a0a;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
  }
  
  .loading-content {
    text-align: center;
    max-width: 400px;
    padding: 2rem;
  }
  
  .logo {
    width: 150px;
    height: 150px;
    margin-bottom: 2rem;
    border-radius: 1rem;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .loading-message {
    color: #ffffff;
    font-size: 1.125rem;
    margin-bottom: 2rem;
    font-weight: 500;
    min-height: 1.5em;
  }
  
  .progress-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .progress-bar {
    flex: 1;
    height: 8px;
    background-color: #1a1a1a;
    border: 1px solid #36393F;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #5865F2, #7289DA);
    transition: width 0.5s ease-out;
    border-radius: 3px;
    position: relative;
    overflow: hidden;
  }
  
  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  .progress-text {
    color: #5865F2;
    font-weight: 600;
    font-size: 0.875rem;
    min-width: 3rem;
    text-align: right;
  }
  
  @media (max-width: 768px) {
    .logo {
      width: 120px;
      height: 120px;
    }
    
    .loading-message {
      font-size: 1rem;
    }
  }
</style>