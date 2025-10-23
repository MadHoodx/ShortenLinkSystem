<template>
  <div class="container">
    <Navbar :token="token" @open-auth="showAuth = true" @logout="logout" />

    <main>
      <Shortener :token="token" />
    </main>

    <AuthModal v-if="showAuth" :apiBase="apiBase" @close="showAuth=false" @login-success="onLoginSuccess" />

    <footer>
      <small>Made by MadHoodx</small>
    </footer>
  </div>
</template>

<script>
import Shortener from './components/Shortener.vue';
import AuthModal from './components/AuthModal.vue';
import Navbar from './components/Navbar.vue';
import { ref } from 'vue';

export default {
  components: { Shortener, AuthModal, Navbar },
  setup() {
    const token = ref(localStorage.getItem('token') || null);
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
    function setToken(t) { token.value = t; }
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
      // reload to refresh history and UI state
      window.location.reload();
    }
    return { token, setToken, apiBase, showAuth, onLoginSuccess, logout };
  }
};
</script>
