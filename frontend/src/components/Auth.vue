<template>
  <section class="auth card">
    <div v-if="!token">
      <h3>Login</h3>
      <form @submit.prevent="onLogin">
        <input v-model="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>

      <h3>Or Sign up</h3>
      <form @submit.prevent="onRegister">
        <input v-model="regEmail" placeholder="Email" />
        <input v-model="regPassword" type="password" placeholder="Password" />
        <input v-model="regPasswordConfirm" type="password" placeholder="Confirm password" />
        <button type="submit">Sign up</button>
      </form>
    </div>

    <div v-else>
      <p>Logged in as <strong>{{ userEmail }}</strong></p>
      <button @click="logout">Logout</button>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';

export default {
  props: ['apiBase', 'token', 'setToken'],
  setup(props) {
    const email = ref('');
    const password = ref('');
    const regEmail = ref('');
  const regPassword = ref('');
  const regPasswordConfirm = ref('');

    const userEmail = ref('');

    async function onLogin() {
      // client-side validation
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value)) return alert('Please enter a valid email');
      if (!password.value || password.value.length < 8) return alert('Password must be at least 8 characters');
      try {
        const res = await axios.post(`${props.apiBase}/login`, { email: email.value, password: password.value }, { withCredentials: true });
        const t = res.data.token;
        props.setToken(t);
        localStorage.setItem('token', t);
        userEmail.value = email.value;
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || 'Login failed';
        alert(`Login failed: ${msg}`);
      }
    }

    async function onRegister() {
      // client-side validation
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(regEmail.value)) return alert('Please enter a valid email');
      if (regPassword.value !== regPasswordConfirm.value) return alert('Passwords do not match');
      if (typeof regPassword.value !== 'string' || regPassword.value.length < 8 || regPassword.value.length > 20) return alert('Password must be 8-20 characters');
      const pwdRe = /(?=.*[A-Za-z])(?=.*\d)/;
      if (!pwdRe.test(regPassword.value)) return alert('Password must include letters and numbers');
      try {
        const res = await axios.post(`${props.apiBase}/register`, { email: regEmail.value, password: regPassword.value }, { withCredentials: true });
        if (res.status === 201) {
          alert('Registered, you can now login');
        } else {
          const msg = res.data?.error || 'Register failed';
          alert(`Register failed: ${msg}`);
        }
      } catch (e) {
        const msg = e?.response?.data?.error || e?.message || 'Register failed';
        alert(`Register failed: ${msg}`);
      }
    }

    function logout() {
      props.setToken(null);
      localStorage.removeItem('token');
      userEmail.value = '';
    }

    return { email, password, regEmail, regPassword, onLogin, onRegister, logout, userEmail };
  }
};
</script>

<style scoped>
.auth { margin-bottom: 1rem; }
.auth input { display:block; margin:0.25rem 0; padding:0.5rem; width:100%; }
.auth button { margin-top:0.5rem; }
</style>
