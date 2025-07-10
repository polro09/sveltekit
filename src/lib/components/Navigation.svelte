<!-- 📁 파일: src/lib/components/Navigation.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  
  const navItems = [
    { href: '/main', label: '홈', icon: '🏠' },
    { href: '/parties', label: '파티', icon: '🎮' },
    { href: '/schedule', label: '스케줄', icon: '📅' },
    { href: '/settings', label: '설정', icon: '⚙️' }
  ];
  
  $: currentPath = $page.url.pathname;
</script>

<nav class="navigation">
  <ul class="nav-list">
    {#each navItems as item}
      <li class="nav-item">
        <a 
          href={item.href}
          class="nav-link"
          class:active={currentPath === item.href}
          aria-current={currentPath === item.href ? 'page' : undefined}
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .navigation {
    height: 100%;
  }
  
  .nav-list {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  
  .nav-item {
    height: 100%;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 100%;
    padding: 0 1.5rem;
    text-decoration: none;
    color: #B0B0B0;
    font-weight: 500;
    font-size: 0.95rem;
    position: relative;
    transition: color 0.2s, background-color 0.2s;
    border-radius: 0.5rem;
  }
  
  .nav-link:hover {
    color: #ffffff;
    background-color: rgba(88, 101, 242, 0.1);
  }
  
  .nav-link.active {
    color: #5865F2;
  }
  
  .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 2rem);
    height: 3px;
    background: linear-gradient(90deg, #5865F2, #7289DA);
    border-radius: 3px 3px 0 0;
  }
  
  .nav-icon {
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    .nav-label {
      display: none;
    }
    
    .nav-link {
      padding: 0 1rem;
    }
  }
</style>