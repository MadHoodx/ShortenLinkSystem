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
  props: ['token'],
  setup(props) {
    const fullUrl = ref('');
    const result = ref(null);
    const history = ref([]);

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
  // read token from props (if passed) or localStorage
  const token = props.token || localStorage.getItem('token') || null;

  // axios defaults
  axios.defaults.baseURL = apiBase;
  // send JWT if available
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  // allow cookies for device_id
  axios.defaults.withCredentials = true;

    async function loadHistory() {
      try {
        const res = await axios.get('/api/history');
        // normalize short_url for UI (if not present)
        history.value = res.data.map(r => ({ ...r, short_url: r.short_code ? `${apiBase}/${r.short_code}` : '' }));
      } catch (e) {
        console.error(e);
      }
    }

    async function onSubmit() {
      if (!fullUrl.value) return alert('Please enter a URL');
      // client-side URL validation
      try {
        const u = new URL(fullUrl.value);
        if (!['http:', 'https:'].includes(u.protocol)) return alert('URL must start with http:// or https://');
        if (fullUrl.value.length > 2000) return alert('URL is too long');
      } catch (err) {
        return alert('Invalid URL format');
      }
      try {
        const res = await axios.post('/api/shorten', { full_url: fullUrl.value });
        result.value = res.data;
        await loadHistory();
      } catch (e) {
        console.error(e);
        const msg = e?.response?.data?.error || 'Error creating short url';
        alert(msg);
      }
    }

    onMounted(loadHistory);

    return { fullUrl, result, history, onSubmit };
  }
};
</script>
