<template>
  <div class="container">
    <header class="hero">
      <h1>Paste the URL to be shortened</h1>
    </header>

    <main>
      <Shortener />

      
    </main>

    <footer>
      <small>Made by MadHoodx</small>
    </footer>
  </div>
</template>

<script>
import Shortener from './components/Shortener.vue';
export default { components: { Shortener } };
</script>
