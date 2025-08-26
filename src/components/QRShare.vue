<template>
  <div v-if="show" class="qr-modal-overlay" @click="closeModal">
    <div class="qr-modal" @click.stop>
      <div class="modal-header">
        <h2>📱 Share via QR Code</h2>
        <button @click="closeModal" class="close-btn">✕</button>
      </div>
      
      <div class="modal-content">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Generating QR code...</p>
        </div>
        
        <div v-else-if="qrData" class="qr-content">
          <div class="qr-code-container">
            <img :src="qrData.qrCode" alt="QR Code" class="qr-image" />
          </div>
          
          <div class="share-text">
            <h3>Share Details</h3>
            <div class="text-content">{{ qrData.shareText }}</div>
          </div>
          
          <div class="action-buttons">
            <button @click="shareViaWebAPI" class="share-btn">
              📤 Share
            </button>
            <button @click="copyToClipboard" class="copy-btn">
              📋 Copy Text
            </button>
            <button @click="downloadQR" class="download-btn">
              💾 Download QR
            </button>
          </div>
          
          <div v-if="message" class="message" :class="messageType">
            {{ message }}
          </div>
        </div>
        
        <div v-else class="error">
          <p>Failed to generate QR code. Please try again.</p>
          <button @click="generateQR" class="retry-btn">🔄 Retry</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import qrService from '../services/qrService.js';

export default {
  name: 'QRShare',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      required: true
    },
    type: {
      type: String,
      required: true,
      validator: value => ['bill_split', 'trip_expenses', 'gamble_result'].includes(value)
    }
  },
  emits: ['close'],
  data() {
    return {
      qrData: null,
      loading: false,
      message: '',
      messageType: 'success'
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.generateQR();
      }
    }
  },
  methods: {
    async generateQR() {
      this.loading = true;
      this.qrData = null;
      this.message = '';
      
      try {
        let result;
        
        switch (this.type) {
          case 'bill_split':
            result = await qrService.generateBillSplitQR(this.data);
            break;
          case 'trip_expenses':
            result = await qrService.generateTripExpenseQR(this.data);
            break;
          case 'gamble_result':
            result = await qrService.generateGambleResultQR(this.data);
            break;
          default:
            throw new Error('Invalid share type');
        }
        
        this.qrData = result;
      } catch (error) {
        console.error('QR generation failed:', error);
        this.showMessage('Failed to generate QR code', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async shareViaWebAPI() {
      if (!this.qrData) return;
      
      const shared = await qrService.shareViaWebAPI(this.qrData);
      if (shared) {
        this.showMessage('Shared successfully!', 'success');
      } else {
        this.showMessage('Web Share not supported. Try copy or download.', 'info');
      }
    },
    
    async copyToClipboard() {
      if (!this.qrData) return;
      
      const copied = await qrService.copyToClipboard(this.qrData.shareText);
      if (copied) {
        this.showMessage('Copied to clipboard!', 'success');
      } else {
        this.showMessage('Failed to copy. Please select and copy manually.', 'error');
      }
    },
    
    downloadQR() {
      if (!this.qrData || !this.qrData.qrCode) return;
      
      const filename = `${this.type}_${Date.now()}.png`;
      qrService.downloadQR(this.qrData.qrCode, filename);
      this.showMessage('QR code downloaded!', 'success');
    },
    
    showMessage(text, type = 'success') {
      this.message = text;
      this.messageType = type;
      setTimeout(() => {
        this.message = '';
      }, 3000);
    },
    
    closeModal() {
      this.$emit('close');
      this.qrData = null;
      this.message = '';
    }
  }
};
</script>

<style scoped>
.qr-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.qr-modal {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-content {
  padding: 1.5rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.qr-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qr-code-container {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.qr-image {
  max-width: 250px;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.share-text h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
}

.text-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  white-space: pre-line;
  font-family: monospace;
  font-size: 0.9rem;
  color: #555;
  max-height: 200px;
  overflow-y: auto;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.share-btn, .copy-btn, .download-btn, .retry-btn {
  flex: 1;
  min-width: 120px;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.share-btn {
  background: #28a745;
  color: white;
}

.share-btn:hover {
  background: #218838;
}

.copy-btn {
  background: #17a2b8;
  color: white;
}

.copy-btn:hover {
  background: #138496;
}

.download-btn {
  background: #6c757d;
  color: white;
}

.download-btn:hover {
  background: #545b62;
}

.retry-btn {
  background: #667eea;
  color: white;
}

.retry-btn:hover {
  background: #5a67d8;
}

.message {
  text-align: center;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .qr-modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .share-btn, .copy-btn, .download-btn {
    min-width: auto;
  }
  
  .qr-image {
    max-width: 200px;
  }
}
</style>