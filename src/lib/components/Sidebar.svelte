<!-- 📁 파일: src/lib/components/Sidebar.svelte -->
<script>
  import { page } from '$app/stores';

  // 사용자 프로필 (추후 실제 데이터로 교체)
  const userProfile = {
    name: '사용자',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    status: 'online'
  };

  // 접속자 리스트 (추후 실제 데이터로 교체)
  const onlineUsers = [
    { id: 1, name: '플레이어1', status: 'online' },
    { id: 2, name: '플레이어2', status: 'idle' },
    { id: 3, name: '플레이어3', status: 'dnd' },
    { id: 4, name: '플레이어4', status: 'online' }
  ];

  const statusColors = {
    online: '#57F287',
    idle: '#FEE75C',
    dnd: '#ED4245',
    offline: '#747F8D'
  };
</script>

<div class="sidebar-content">
  <!-- 사용자 프로필 섹션 -->
  <section class="profile-section">
    <h2 class="section-title">사용자 프로필</h2>
    <div class="profile-card">
      <img src={userProfile.avatar} alt={userProfile.name} class="profile-avatar" />
      <div class="profile-info">
        <h3 class="profile-name">{userProfile.name}</h3>
        <div class="profile-status">
          <span
            class="status-indicator"
            style="background-color: {statusColors[userProfile.status]}"
          ></span>
          <span class="status-text">온라인</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 접속자 리스트 섹션 -->
  <section class="users-section">
    <h2 class="section-title">접속자 리스트</h2>
    <div class="users-list">
      {#each onlineUsers as user}
        <div class="user-item">
          <span class="status-dot" style="background-color: {statusColors[user.status]}"></span>
          <span class="user-name">{user.name}</span>
        </div>
      {/each}
      <div class="users-count">
        총 {onlineUsers.length}명 접속 중
      </div>
    </div>
  </section>

  <!-- 좌측 사이드바 추가 정보 -->
  <section class="info-section">
    <h2 class="section-title">좌측 사이드바</h2>
    <div class="info-content">
      <p>서버 정보나 통계를 여기에 표시할 수 있습니다.</p>
    </div>
  </section>
</div>

<style>
  .sidebar-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #b0b0b0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
  }

  /* 프로필 섹션 */
  .profile-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: #0a0a0a;
    border: 1px solid #36393f;
    border-radius: 0.5rem;
    transition:
      border-color 0.2s,
      transform 0.2s;
  }

  .profile-card:hover {
    border-color: #5865f2;
    transform: translateY(-2px);
  }

  .profile-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
  }

  .profile-info {
    flex: 1;
  }

  .profile-name {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }

  .profile-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .status-text {
    font-size: 0.875rem;
    color: #b0b0b0;
  }

  /* 접속자 리스트 */
  .users-list {
    background-color: #0a0a0a;
    border: 1px solid #36393f;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
    cursor: pointer;
  }

  .user-item:hover {
    background-color: rgba(88, 101, 242, 0.1);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .user-name {
    font-size: 0.875rem;
    color: #ffffff;
  }

  .users-count {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #36393f;
    font-size: 0.75rem;
    color: #b0b0b0;
    text-align: center;
  }

  /* 정보 섹션 */
  .info-content {
    padding: 1rem;
    background-color: #0a0a0a;
    border: 1px solid #36393f;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #b0b0b0;
    line-height: 1.5;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(87, 242, 135, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(87, 242, 135, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(87, 242, 135, 0);
    }
  }
</style>
