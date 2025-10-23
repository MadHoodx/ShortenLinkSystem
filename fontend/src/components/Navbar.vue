<template>
  <header class="navbar">
    <div class="brand">ShortenLink</div>
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
.navbar{ display:flex; justify-content:space-between; align-items:center; padding:0.5rem 1rem; background:#1a73e8; color:white }
.brand{ font-weight:700 }
.actions .auth-button{ background:transparent; border:1px solid rgba(255,255,255,0.2); color:white; padding:0.4rem 0.8rem; border-radius:6px }
</style>
