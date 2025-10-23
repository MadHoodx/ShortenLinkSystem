<template>
  <header class="navbar">
    <router-link to="/" class="brand">ShortenLink</router-link>
    <div class="nav-links">
      <router-link to="/" class="nav-button">Shorten</router-link>
      <router-link to="/statistics" class="nav-button">Statistics</router-link>
    </div>
    <div class="actions">
      <button class="auth-button" v-if="!token" @click="$emit('open-auth')">Login / Sign up</button>
      <button class="auth-button" v-else @click="$emit('logout')">Logout</button>
    </div>
  </header>
</template>

<script>
export default {
  props: ['token'],
}
</script>

<style scoped>
.navbar{ 
  display:flex; 
  justify-content:space-between; 
  align-items:center; 
  padding:0.75rem 1.5rem; 
  background:#1a73e8; 
  color:white;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.brand{ 
  font-weight:700; 
  color:white; 
  text-decoration:none; 
  cursor:pointer;
  font-size: 1.1rem;
}
.brand:hover{ opacity:0.9; }
.nav-links{ display:flex; gap:0.5rem; flex-wrap: wrap; }
.nav-button{ 
  background:transparent; 
  border:none; 
  color:white; 
  padding:0.5rem 1rem; 
  cursor:pointer; 
  border-radius:6px; 
  text-decoration:none; 
  display:inline-block;
  font-size: 0.95rem;
  transition: all 0.2s;
}
.nav-button:hover{ background:rgba(255,255,255,0.15); }
.nav-button.router-link-active{ background:rgba(255,255,255,0.25); font-weight:600; }
.actions{ display:flex; gap:0.5rem; }
.actions .auth-button{ 
  background:transparent; 
  border:1px solid rgba(255,255,255,0.3); 
  color:white; 
  padding:0.5rem 1rem; 
  border-radius:6px; 
  cursor:pointer;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: all 0.2s;
}
.actions .auth-button:hover{ background:rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.5); }

@media (max-width: 768px) {
  .navbar {
    padding: 0.6rem 1rem;
  }
  
  .brand {
    font-size: 1rem;
  }
  
  .nav-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
  
  .actions .auth-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.5rem 0.75rem;
    gap: 0.4rem;
  }
  
  .brand {
    font-size: 0.95rem;
  }
  
  .nav-links {
    gap: 0.3rem;
  }
  
  .nav-button {
    padding: 0.35rem 0.7rem;
    font-size: 0.85rem;
  }
  
  .actions .auth-button {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
  }
}
</style>
