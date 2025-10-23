<template>
  <div v-if="totalPages > 1" class="pagination">
    <button @click="$emit('prev-page')" :disabled="currentPage === 1" class="page-btn">
      ← Previous
    </button>
    <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
    <button @click="$emit('next-page')" :disabled="currentPage === totalPages" class="page-btn">
      Next →
    </button>
  </div>
</template>

<script>
export default {
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  emits: ['prev-page', 'next-page']
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
.page-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.page-btn:hover:not(:disabled) {
  background: #1557b0;
}
.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.page-info {
  color: #666;
  font-size: 0.9rem;
}
</style>
