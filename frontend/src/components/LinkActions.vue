<template>
  <div class="link-actions">
    <button class="action-btn" @click="handleShowQR">Show QR</button>
    <button class="action-btn" @click="handleCopyLink">Copy Link</button>
  </div>

  <!-- QR Modal -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>QR Code</h3>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      <div class="modal-body">
        <div class="qr-display">
          <img :src="qrCodeUrl" alt="QR Code" />
        </div>
        <p class="qr-url">{{ shortUrl }}</p>
        <div class="modal-actions">
          <button class="action-btn" @click="handleCopyLink">📋 Copy Link</button>
          <button class="action-btn" @click="handleDownloadQR">⬇️ Download QR</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import QRCode from 'qrcode';

export default {
  props: {
    shortUrl: {
      type: String,
      required: true
    },
    shortCode: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const showModal = ref(false);
    const qrCodeUrl = ref('');

    async function handleShowQR() {
      try {
        qrCodeUrl.value = await QRCode.toDataURL(props.shortUrl);
        showModal.value = true;
      } catch (e) {
        console.error(e);
        alert('Failed to generate QR code');
      }
    }

    function closeModal() {
      showModal.value = false;
    }

    async function handleCopyLink() {
      try {
        await navigator.clipboard.writeText(props.shortUrl);
        alert('Link copied to clipboard!');
      } catch (e) {
        alert('Failed to copy link');
      }
    }

    function handleDownloadQR() {
      try {
        const link = document.createElement('a');
        link.href = qrCodeUrl.value;
        link.download = `qr-${props.shortCode}.png`;
        link.click();
      } catch (e) {
        console.error(e);
        alert('Failed to download QR code');
      }
    }

    return {
      showModal,
      qrCodeUrl,
      handleShowQR,
      closeModal,
      handleCopyLink,
      handleDownloadQR
    };
  }
};
</script>

<style scoped>
.link-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.action-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
  white-space: nowrap;
}
.action-btn:hover {
  background: #1557b0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}
.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}
.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}
.close-btn:hover {
  background: #f0f0f0;
}
.modal-body {
  padding: 2rem;
  text-align: center;
}
.qr-display {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 1rem;
  border: 1px solid #eee;
}
.qr-display img {
  display: block;
  max-width: 250px;
  width: 100%;
}
.qr-url {
  font-size: 0.95rem;
  color: #1a73e8;
  font-weight: 600;
  word-break: break-all;
  margin: 1rem 0;
}
.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}
</style>
