<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal card">
      <div class="tabs">
        <div :class="['tab', tab==='login' ? 'active' : '']" @click="tab='login'">Login</div>
        <div :class="['tab', tab==='signup' ? 'active' : '']" @click="tab='signup'">Sign up</div>
      </div>

      <div v-if="tab==='login'">
        <input v-model="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />
        <button @click="onLogin">Login</button>
      </div>

      <div v-else>
        <input v-model="regEmail" placeholder="Email" />
        <input v-model="regPassword" type="password" placeholder="Password" />
        <input v-model="regPasswordConfirm" type="password" placeholder="Confirm password" />
        <button @click="onRegister">Create account</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';

export default {
  props: ['apiBase'],
  emits: ['close','login-success'],
  setup(props, { emit }){
    const tab = ref('login');
    const email = ref('');
    const password = ref('');
    const regEmail = ref('');
  const regPassword = ref('');
  const regPasswordConfirm = ref('');

    async function onLogin(){
      // client-side validation
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.value)) return alert('Please enter a valid email');
      if (!password.value || password.value.length < 8) return alert('Password must be at least 8 characters');
      try{
        const res = await axios.post(`${props.apiBase}/login`, { email: email.value, password: password.value }, { withCredentials: true });
        const token = res.data.token;
        emit('login-success', token);
        emit('close');
      }catch(e){
        const msg = e?.response?.data?.error || e?.message || 'Login failed';
        alert(`Login failed: ${msg}`);
      }
    }

    async function onRegister(){
      // client-side validation
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(regEmail.value)) return alert('Please enter a valid email');
      if (regPassword.value !== regPasswordConfirm.value) return alert('Passwords do not match');
      if (typeof regPassword.value !== 'string' || regPassword.value.length < 8 || regPassword.value.length > 20) return alert('Password must be 8-20 characters');
      const pwdRe = /(?=.*[A-Za-z])(?=.*\d)/;
      if (!pwdRe.test(regPassword.value)) return alert('Password must include letters and numbers');
      try{
        const res = await axios.post(`${props.apiBase}/register`, { email: regEmail.value, password: regPassword.value }, { withCredentials: true });
        if (res.status === 201) {
          alert('Account created — please login');
          tab.value = 'login';
        } else {
          const msg = res.data?.error || 'Register failed';
          alert(`Register failed: ${msg}`);
        }
      }catch(e){
        const msg = e?.response?.data?.error || e?.message || 'Register failed';
        alert(`Register failed: ${msg}`);
      }
    }

    return { tab, email, password, regEmail, regPassword, regPasswordConfirm, onLogin, onRegister, close: () => emit('close') };
  }
}
</script>
