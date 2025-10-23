<template>
  <div class="container">
    <Navbar :token="token" @open-auth="showAuth = true" @logout="logout" />

    <main>
      <router-view :token="token" @open-auth="showAuth = true" />
    </main>

    <AuthModal v-if="showAuth" :apiBase="apiBase" @close="showAuth=false" @login-success="onLoginSuccess" />

    <footer>
      <small>Made by MadHoodx</small>
    </footer>
  </div>
</template>

<script>
import AuthModal from './components/AuthModal.vue';
import Navbar from './components/Navbar.vue';
import { ref } from 'vue';

export default {
  components: { AuthModal, Navbar },
  setup() {
    const token = ref(localStorage.getItem('token') || null);
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
    const showAuth = ref(false);
    function onLoginSuccess(t){
      token.value = t;
      localStorage.setItem('token', t);
      showAuth.value = false;
      // reload to refresh history and UI state
      window.location.reload();
    }
    function logout(){
      token.value = null;
      localStorage.removeItem('token');
      
      // Clear device_id cookie to ensure privacy
      document.cookie = 'device_id=; Max-Age=0; path=/';
      
      // reload to refresh history and UI state (new device_id will be generated)
      window.location.reload();
    }
    return { token, apiBase, showAuth, onLoginSuccess, logout };
  }
};
</script>
