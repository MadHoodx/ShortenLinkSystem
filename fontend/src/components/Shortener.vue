<template>
  <section class="card">
    <form class="wide-form" @submit.prevent="onSubmit">
      <input class="wide-input" v-model="fullUrl" placeholder="Enter the link here" />
      <button class="wide-btn" type="submit">Shorten URL</button>
    </form>

    <div v-if="result" class="result">
      <p class="center"><strong>Short URL:</strong></p>
      <p class="center"><a :href="result.short_url" target="_blank">{{ result.short_url }}</a></p>
      <div class="qr center"><img :src="result.qr_code" alt="qr" /></div>
    </div>

    <div class="history">
      <h3>Shortened Links</h3>
      <ul>
        <li v-for="item in history" :key="item.id">
          <a :href="item.short_url" target="_blank">{{ item.short_url }}</a>
          <div class="muted small">{{ item.full_url }}</div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const fullUrl = ref('');
    const result = ref(null);
    const history = ref([]);

    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

    async function loadHistory() {
      try {
        const res = await axios.get(`${apiBase}/api/history`);
        // normalize short_url for UI (if not present)
        history.value = res.data.map(r => ({ ...r, short_url: r.short_code ? `${apiBase}/${r.short_code}` : '' }));
      } catch (e) {
        console.error(e);
      }
    }

    async function onSubmit() {
      if (!fullUrl.value) return alert('Please enter a URL');
      try {
        const res = await axios.post(`${apiBase}/api/shorten`, { full_url: fullUrl.value });
        result.value = res.data;
        await loadHistory();
      } catch (e) {
        console.error(e);
        alert('Error creating short url');
      }
    }

    onMounted(loadHistory);

    return { fullUrl, result, history, onSubmit };
  }
};
</script>
