<template>
  <section class="card">
    <div class="header-with-refresh">
      <h2>📊 Link Statistics</h2>
      <button v-if="token" class="refresh-btn" @click="loadStatistics" :disabled="loading">
        {{ loading ? '⏳' : '🔄' }} Refresh
      </button>
    </div>
    
    <div v-if="!token" class="empty">
      <p>⚠️ Please log in to view your link statistics</p>
      <button class="auth-button" @click="$emit('open-auth')">Login / Sign up</button>
    </div>

    <div v-else>
      <div v-if="loading" class="loading">Loading statistics...</div>
      
      <div v-else-if="stats.length === 0" class="empty">
        <p>No statistics yet. Create some short links first!</p>
      </div>

      <div v-else class="stats-container">
        <div class="stats-summary">
          <p>Total Links: {{ stats.length }}</p>
        </div>
        <div v-for="stat in paginatedStats" :key="stat.short_code" class="stat-card">
          <div class="stat-header">
            <div class="link-info">
              <div class="title-section">
                <div v-if="editingId !== stat.id" class="title-display">
                  <div class="link-title" :class="{ 'no-title': !stat.title }">
                    {{ stat.title || 'No title' }}
                  </div>
                  <button class="edit-title-btn" @click="startEditTitle(stat)" title="Edit title">
                    ✏️
                  </button>
                </div>
                <div v-else class="title-edit">
                  <input 
                    type="text" 
                    v-model="editingTitle" 
                    @keyup.enter="saveTitle(stat)"
                    @keyup.esc="cancelEdit"
                    class="title-input"
                    placeholder="Enter title or note"
                    maxlength="255"
                    ref="titleInput"
                  />
                  <div class="title-edit-buttons">
                    <button class="save-btn" @click="saveTitle(stat)">💾 Save</button>
                    <button class="cancel-btn" @click="cancelEdit">✖️ Cancel</button>
                  </div>
                </div>
              </div>
              <a :href="stat.short_url" target="_blank" class="short-link">{{ stat.short_url }}</a>
              <div class="muted small">{{ stat.full_url }}</div>
            </div>
            <LinkActions :short-url="stat.short_url" :short-code="stat.short_code" />
          </div>
          
          <div class="stat-body">
            <div class="stat-item">
              <div class="stat-label">Total Clicks</div>
              <div class="stat-value">{{ stat.click_count || 0 }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Created</div>
              <div class="stat-value">{{ formatDate(stat.created_at) }}</div>
            </div>
          </div>

          <div class="stat-actions">
            <button class="trend-btn" @click="showChart(stat)">
              📈 Show Trend
            </button>
            <button class="delete-btn" @click="deleteLink(stat)" title="Delete this link">
              🗑️ Delete
            </button>
          </div>
        </div>
        <Pagination 
          :current-page="currentPage" 
          :total-pages="totalPages" 
          @prev-page="prevPage" 
          @next-page="nextPage" 
        />
      </div>
    </div>

    <ChartModal 
      :show="chartModalOpen" 
      :short-code="selectedStat?.short_code" 
      :short-url="selectedStat?.short_url"
      @close="chartModalOpen = false" 
    />
  </section>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, watch, computed } from 'vue';
import LinkActions from './LinkActions.vue';
import Pagination from './Pagination.vue';
import ChartModal from './ChartModal.vue';

export default {
  components: { LinkActions, Pagination, ChartModal },
  props: ['token'],
  emits: ['open-auth'],
  setup(props) {
    const stats = ref([]);
    const loading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = 5;
    const chartModalOpen = ref(false);
    const selectedStat = ref(null);
    const editingId = ref(null);
    const editingTitle = ref('');
    const titleInput = ref(null);
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const analyticsBase = import.meta.env.VITE_ANALYTICS_API || 'http://localhost:4001';

    const totalPages = computed(() => Math.ceil(stats.value.length / itemsPerPage));
    const paginatedStats = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return stats.value.slice(start, end);
    });

    function nextPage() {
      if (currentPage.value < totalPages.value) currentPage.value++;
    }

    function prevPage() {
      if (currentPage.value > 1) currentPage.value--;
    }

    async function loadStatistics() {
      if (!props.token) {
        stats.value = [];
        return;
      }

      loading.value = true;
      try {
        // First get user's links from urlst-service
        const res = await axios.get(`${apiBase}/api/history`, {
          headers: { 'Authorization': `Bearer ${props.token}` },
          withCredentials: true
        });

        const links = res.data;

        // Then fetch click count for each link from analytics-service
        const statsPromises = links.map(async (link) => {
          try {
            const analyticsRes = await axios.get(`${analyticsBase}/stats/${link.short_code}`);
            return {
              ...link,
              short_url: `${apiBase.replace('/api', '')}/${link.short_code}`,
              click_count: analyticsRes.data.click_count || 0
            };
          } catch (e) {
            // If stats not available, return 0
            return {
              ...link,
              short_url: `${apiBase.replace('/api', '')}/${link.short_code}`,
              click_count: 0
            };
          }
        });
              ...link,
              short_url: `${apiBase}/${link.short_code}`,
              click_count: 0
            };
          }
        });

        stats.value = await Promise.all(statsPromises);
        // Reset to page 1 when stats change
        currentPage.value = 1;
      } catch (e) {
        console.error('Failed to load statistics:', e);
        stats.value = [];
      } finally {
        loading.value = false;
      }
    }

    function formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const now = new Date();
      const date = new Date(dateString);
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);
      
      if (diffSecs < 60) {
        return 'Just now';
      } else if (diffMins < 60) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays < 30) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffMonths < 12) {
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
      } else {
        return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
      }
    }

    function showChart(stat) {
      selectedStat.value = stat;
      chartModalOpen.value = true;
    }

    async function deleteLink(stat) {
      const confirmed = confirm(`Are you sure you want to delete "${stat.title || stat.short_url}"?\n\nThis action cannot be undone.`);
      if (!confirmed) return;

      try {
        await axios.delete(`${apiBase}/api/urls/${stat.id}`, {
          headers: { 'Authorization': `Bearer ${props.token}` }
        });
        
        alert('Link deleted successfully!');
        await loadStatistics(); // Reload the list
      } catch (e) {
        console.error('Failed to delete link:', e);
        const errorMsg = e.response?.data?.error || 'Failed to delete link';
        alert(`Error: ${errorMsg}`);
      }
    }

    function startEditTitle(stat) {
      editingId.value = stat.id;
      editingTitle.value = stat.title || '';
      // Focus input after Vue updates DOM
      setTimeout(() => {
        if (titleInput.value) {
          titleInput.value.focus();
        }
      }, 50);
    }

    function cancelEdit() {
      editingId.value = null;
      editingTitle.value = '';
    }

    async function saveTitle(stat) {
      try {
        await axios.patch(`${apiBase}/api/urls/${stat.id}`, 
          { title: editingTitle.value || null },
          { headers: { 'Authorization': `Bearer ${props.token}` } }
        );
        
        // Update local state
        stat.title = editingTitle.value || null;
        cancelEdit();
      } catch (e) {
        console.error('Failed to update title:', e);
        const errorMsg = e.response?.data?.error || 'Failed to update title';
        alert(`Error: ${errorMsg}`);
      }
    }

    onMounted(loadStatistics);
    watch(() => props.token, loadStatistics);

    return { 
      stats, 
      loading, 
      token: props.token, 
      formatDate, 
      loadStatistics,
      paginatedStats,
      currentPage,
      totalPages,
      nextPage,
      prevPage,
      chartModalOpen,
      selectedStat,
      showChart,
      deleteLink,
      editingId,
      editingTitle,
      titleInput,
      startEditTitle,
      cancelEdit,
      saveTitle
    };
  }
};
</script>

<style scoped>
.header-with-refresh {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.header-with-refresh h2 {
  margin: 0;
}
.refresh-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.refresh-btn:hover:not(:disabled) {
  background: #1557b0;
}
.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.empty {
  text-align: center; 
  padding: 2rem; 
  color: var(--muted); 
}
.empty .auth-button {
  margin-top: 1rem;
  background: #1a73e8;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}
.empty .auth-button:hover {
  background: #1557b0;
}
.loading {
  text-align: center;
  padding: 2rem;
  color: var(--muted);
}
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.stat-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1.5rem;
  background: #fafafa;
}
.stat-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed #ddd;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.link-info {
  flex: 1;
  min-width: 0;
}
.link-info .short-link {
  font-weight: 600;
  color: #1a73e8;
  text-decoration: none;
  font-size: 1.1rem;
}
.link-info .short-link:hover {
  text-decoration: underline;
}
.link-info .muted {
  color: #666;
  margin-top: 0.3rem;
  word-break: break-all;
}
.link-info .small {
  font-size: 0.9rem;
}
.title-section {
  margin-bottom: 0.5rem;
}
.title-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.link-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  flex: 1;
}
.link-title.no-title {
  color: #999;
  font-style: italic;
  font-weight: 500;
}
.edit-title-btn {
  background: transparent;
  border: 1px solid #ddd;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  opacity: 0.6;
}
.edit-title-btn:hover {
  opacity: 1;
  border-color: #1a73e8;
  background: #f0f8ff;
}
.title-edit {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.title-input {
  padding: 0.6rem;
  border: 2px solid #1a73e8;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  width: 100%;
}
.title-input:focus {
  border-color: #0d47a1;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}
.title-edit-buttons {
  display: flex;
  gap: 0.5rem;
}
.save-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.save-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}
.cancel-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.cancel-btn:hover {
  background: #4b5563;
  transform: translateY(-1px);
}
.stat-body {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}
.stat-item {
  flex: 1;
  min-width: 120px;
}
.stat-label {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}
.stats-summary {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: #f0f8ff;
  border-radius: 6px;
  border: 1px solid #d0e8ff;
}
.stats-summary p {
  margin: 0;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}
.stat-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #ddd;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.trend-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.trend-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
.trend-btn:active {
  transform: translateY(0);
}
.delete-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.delete-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}
.delete-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;
  }
  
  .stat-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .link-info .short-link {
    font-size: 1rem;
  }
  
  .stat-body {
    gap: 1rem;
  }
  
  .stat-value {
    font-size: 1.3rem;
  }
  
  .trend-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 0.875rem;
  }
  
  .stat-header {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
  }
  
  .link-info .short-link {
    font-size: 0.95rem;
  }
  
  .link-info .small {
    font-size: 0.8rem;
  }
  
  .link-title {
    font-size: 1.1rem;
  }
  
  .title-input {
    font-size: 0.9rem;
    padding: 0.5rem;
  }
  
  .title-edit-buttons {
    flex-direction: column;
  }
  
  .save-btn, .cancel-btn {
    width: 100%;
    justify-content: center;
    padding: 0.6rem;
  }
  
  .stat-body {
    gap: 0.75rem;
  }
  
  .stat-item {
    min-width: 100px;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
  
  .trend-btn, .delete-btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.8rem;
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>
