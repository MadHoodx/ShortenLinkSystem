<template>
  <section class="card">
    <form class="wide-form" @submit.prevent="onSubmit">
      <div class="form-inputs">
        <input 
          class="wide-input" 
          v-model="fullUrl" 
          placeholder="Enter the link here" 
          required
        />
        <input 
          class="title-input" 
          v-model="title" 
          placeholder="Title (optional)" 
          maxlength="255"
        />
      </div>
      <button class="wide-btn" type="submit">Shorten URL</button>
    </form>

    <div v-if="result" class="result">
      <p class="center"><strong>Short URL:</strong></p>
      <p class="center short-url-display">
        <a :href="result.short_url" target="_blank">{{ result.short_url }}</a>
      </p>
      <div class="qr-section">
        <div class="qr center"><img :src="result.qr_code" alt="qr" /></div>
        <div class="qr-actions">
          <button class="action-btn" @click="copyLink(result.short_url)">📋 Copy Link</button>
          <button class="action-btn" @click="downloadQR(result.short_code, result.qr_code)">⬇️ Download QR</button>
        </div>
      </div>
    </div>

    <div class="history-section">
      <h3>Recent Links ({{ history.length }})</h3>
      <div v-if="history.length === 0" class="empty">
        <p>No links yet. Create your first short link!</p>
      </div>
      <ul v-else class="history-list">
        <li v-for="(item, index) in paginatedHistory" :key="item.id" class="history-item">
          <div class="link-info">
            <a :href="item.short_url" target="_blank" class="short-link">{{ item.short_url }}</a>
            <div class="muted small">{{ item.full_url }}</div>
          </div>
          <LinkActions :short-url="item.short_url" :short-code="item.short_code" />
        </li>
      </ul>
      <Pagination 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        @prev-page="prevPage" 
        @next-page="nextPage" 
      />
    </div>
    
  </section>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import LinkActions from './LinkActions.vue';
import Pagination from './Pagination.vue';

export default {
  components: { LinkActions, Pagination },
  props: ['token'],
  setup(props) {
    const fullUrl = ref('');
    const title = ref('');
    const result = ref(null);
    const history = ref([]);
    const currentPage = ref(1);
    const itemsPerPage = 5;

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const token = props.token || localStorage.getItem('token') || null;

    axios.defaults.baseURL = apiBase;
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.withCredentials = true;

    const totalPages = computed(() => Math.ceil(history.value.length / itemsPerPage));
    const paginatedHistory = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return history.value.slice(start, end);
    });

    function nextPage() {
      if (currentPage.value < totalPages.value) currentPage.value++;
    }

    function prevPage() {
      if (currentPage.value > 1) currentPage.value--;
    }

    async function loadHistory() {
      try {
        const res = await axios.get('/history');
        history.value = res.data.map(r => ({ 
          ...r, 
          short_url: r.short_code ? `${apiBase.replace('/api', '')}/${r.short_code}` : '' 
        }));
        // Reset to page 1 when history changes
        currentPage.value = 1;
      } catch (e) {
        console.error(e);
      }
    }

    async function onSubmit() {
      if (!fullUrl.value) return alert('Please enter a URL');
      try {
        const u = new URL(fullUrl.value);
        if (!['http:', 'https:'].includes(u.protocol)) return alert('URL must start with http:// or https://');
        if (fullUrl.value.length > 2000) return alert('URL is too long');
      } catch (err) {
        return alert('Invalid URL format');
      }
      try {
        const res = await axios.post('/shorten', { 
          full_url: fullUrl.value,
          title: title.value || null
        });
        result.value = res.data;
        fullUrl.value = '';
        await loadHistory();
      } catch (e) {
        console.error(e);
        const msg = e?.response?.data?.error || 'Error creating short url';
        alert(msg);
      }
    }

    async function copyLink(url) {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (e) {
        alert('Failed to copy link');
      }
    }

    function downloadQR(short_code, qrDataUrl) {
      try {
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `qr-${short_code}.png`;
        link.click();
      } catch (e) {
        console.error(e);
        alert('Failed to download QR code');
      }
    }

    onMounted(loadHistory);

    return { 
      fullUrl,
      title, 
      result, 
      history, 
      paginatedHistory,
      currentPage,
      totalPages,
      onSubmit, 
      copyLink, 
      downloadQR,
      nextPage,
      prevPage
    };
  }
};
</script>

<style scoped>
.form-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.title-input {
  padding: 12px 20px;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 0;
  font-size: 0.95rem;
  font-family: inherit;
}
.wide-input {
  border-radius: 8px 0 0 0 !important;
}
.result {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f0f8ff;
  border-radius: 8px;
  border: 1px solid #d0e8ff;
}
.short-url-display {
  font-size: 1.2rem;
  margin: 1rem 0;
}
.short-url-display a {
  color: #1a73e8;
  font-weight: 600;
  text-decoration: none;
}
.short-url-display a:hover {
  text-decoration: underline;
}
.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.qr {
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.qr img {
  display: block;
  max-width: 200px;
}
.qr-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.action-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.action-btn:hover {
  background: #1557b0;
}
.history-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #eee;
}
.history-section h3 {
  margin-bottom: 1rem;
  color: #333;
}
.empty {
  text-align: center;
  padding: 2rem;
  color: #999;
}
.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.history-item {
  padding: 1rem;
  border-bottom: 1px dashed #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.history-item:last-child {
  border-bottom: none;
}
.link-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}
.link-info .short-link {
  font-weight: 600;
  color: #1a73e8;
  text-decoration: none;
  font-size: 1rem;
}
.link-info .short-link:hover {
  text-decoration: underline;
}
.link-info .muted {
  color: #666;
  word-break: break-all;
}
.link-info .small {
  font-size: 0.85rem;
}
</style>
