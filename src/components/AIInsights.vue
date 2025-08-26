<template>
  <div class="ai-insights">
    <div class="header">
      <h1>🤖 AI Insights</h1>
      <p>Smart analysis of your spending patterns</p>
    </div>

    <div class="insights-container">
      <!-- Image Upload Section -->
      <div class="upload-card">
        <h2>📸 AI Image Analysis</h2>
        <p>Upload receipts, food photos, or expense images for AI insights</p>
        
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="handleFileSelect" 
            style="display: none"
          />
          <div v-if="!selectedImage" class="upload-placeholder">
            <div class="upload-icon">📷</div>
            <div class="upload-text">
              <strong>Click to upload</strong> or drag & drop
            </div>
            <div class="upload-subtitle">Receipts, food photos, expense images</div>
          </div>
          <div v-else class="image-preview">
            <img :src="imagePreview" alt="Selected image" class="preview-image" />
            <button @click.stop="removeImage" class="remove-image">✕</button>
          </div>
        </div>
        
        <div v-if="selectedImage" class="analysis-options">
          <label>Analysis Type:</label>
          <select v-model="analysisType" class="analysis-select">
            <option value="general">General Expense</option>
            <option value="receipt">Receipt/Bill</option>
            <option value="food">Food & Dining</option>
            <option value="trip">Trip & Travel</option>
          </select>
          <button @click="analyzeImage" class="analyze-btn" :disabled="analyzingImage">
            {{ analyzingImage ? '🔄 Analyzing...' : '🤖 Analyze Image' }}
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-card">
        <h2>📊 Quick Stats</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ totalBills }}</div>
            <div class="stat-label">Bill Splits</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ totalTrips }}</div>
            <div class="stat-label">Trip Expenses</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">₹{{ totalSpent.toFixed(0) }}</div>
            <div class="stat-label">Total Tracked</div>
          </div>
        </div>
      </div>

      <!-- AI Analysis -->
      <div class="analysis-card">
        <div class="analysis-header">
          <h2>🧠 AI Analysis</h2>
          <button @click="refreshAnalysis" class="refresh-btn" :disabled="loading">
            {{ loading ? '🔄' : '🔄' }} {{ loading ? 'Analyzing...' : 'Refresh' }}
          </button>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>AI is analyzing your data...</p>
        </div>
        
        <div v-else-if="insights" class="insights-content">
          <div class="insight-text">{{ insights }}</div>
        </div>
        
        <div v-else class="no-insights">
          <p>No insights available. Add some data and try again!</p>
        </div>
      </div>

      <!-- Category Analysis -->
      <div class="category-analysis">
        <h2>📈 Spending Categories</h2>
        <div class="category-list">
          <div class="category-item">
            <div class="category-info">
              <span class="category-name">🍽️ Dining Out</span>
              <span class="category-amount">₹{{ diningTotal.toFixed(0) }}</span>
            </div>
            <div class="category-bar">
              <div class="category-fill" :style="{ width: diningPercentage + '%' }"></div>
            </div>
          </div>
          
          <div class="category-item">
            <div class="category-info">
              <span class="category-name">✈️ Travel</span>
              <span class="category-amount">₹{{ travelTotal.toFixed(0) }}</span>
            </div>
            <div class="category-bar">
              <div class="category-fill" :style="{ width: travelPercentage + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <div class="tips-card">
        <h2>💡 Smart Tips</h2>
        <div class="tips-list">
          <div class="tip-item">
            <span class="tip-icon">💰</span>
            <span class="tip-text">Set monthly dining budgets to track spending</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">👥</span>
            <span class="tip-text">Use group discounts for better savings</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">📱</span>
            <span class="tip-text">Split bills immediately to avoid confusion</span>
          </div>
          <div class="tip-item">
            <span class="tip-icon">🎯</span>
            <span class="tip-text">Plan group activities in advance</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import aiService from '../services/aiService.js';

export default {
  name: 'AIInsights',
  data() {
    return {
      insights: null,
      loading: false,
      totalBills: 0,
      totalTrips: 0,
      totalSpent: 0,
      diningTotal: 0,
      travelTotal: 0,
      selectedImage: null,
      imagePreview: null,
      analysisType: 'general',
      analyzingImage: false,
    };
  },
  computed: {
    diningPercentage() {
      return this.totalSpent > 0 ? (this.diningTotal / this.totalSpent) * 100 : 0;
    },
    travelPercentage() {
      return this.totalSpent > 0 ? (this.travelTotal / this.totalSpent) * 100 : 0;
    }
  },
  mounted() {
    this.loadData();
    this.getInsights();
  },
  methods: {
    loadData() {
      // Load data from localStorage or props
      const billData = JSON.parse(localStorage.getItem('billSplitHistory') || '[]');
      const tripData = JSON.parse(localStorage.getItem('tripExpenseHistory') || '[]');
      
      this.totalBills = billData.length;
      this.totalTrips = tripData.length;
      
      // Calculate totals
      this.diningTotal = billData.reduce((sum, bill) => sum + (bill.total || 0), 0);
      this.travelTotal = tripData.reduce((sum, trip) => {
        return sum + trip.participants.reduce((tripSum, person) => tripSum + person.spent, 0);
      }, 0);
      
      this.totalSpent = this.diningTotal + this.travelTotal;
    },
    
    async getInsights() {
      this.loading = true;
      
      try {
        const billData = JSON.parse(localStorage.getItem('billSplitHistory') || '[]');
        const tripData = JSON.parse(localStorage.getItem('tripExpenseHistory') || '[]');
        const foodData = JSON.parse(localStorage.getItem('foodDiscoveryData') || '[]');
        
        const allData = {
          bills: billData,
          trips: tripData,
          food: foodData
        };
        
        this.insights = await aiService.getSpendingInsights(allData);
      } catch (error) {
        console.error('Failed to get insights:', error);
        this.insights = 'Unable to generate insights at the moment. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    
    async refreshAnalysis() {
      this.loadData();
      await this.getInsights();
    },
    
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processImageFile(file);
      }
    },
    
    handleDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.processImageFile(file);
      }
    },
    
    processImageFile(file) {
      this.selectedImage = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    
    removeImage() {
      this.selectedImage = null;
      this.imagePreview = null;
      this.insights = null;
      this.$refs.fileInput.value = '';
    },
    
    async analyzeImage() {
      if (!this.selectedImage) return;
      
      this.analyzingImage = true;
      this.insights = null;
      
      try {
        let analysis;
        
        switch (this.analysisType) {
          case 'receipt':
            analysis = await aiService.analyzeReceiptImage(this.selectedImage);
            break;
          case 'food':
            analysis = await aiService.analyzeFoodImage(this.selectedImage);
            break;
          case 'trip':
            analysis = await aiService.analyzeTripImage(this.selectedImage);
            break;
          default:
            analysis = await aiService.analyzeExpenseImage(this.selectedImage, this.analysisType);
        }
        
        this.insights = analysis;
      } catch (error) {
        console.error('Image analysis failed:', error);
        this.insights = 'Failed to analyze image. Please try again with a clearer image.';
      } finally {
        this.analyzingImage = false;
      }
    }
  }
};
</script>

<style scoped>
.ai-insights {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.header p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.insights-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-card, .stats-card, .analysis-card, .category-analysis, .tips-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.upload-card h2 {
  font-size: 1.3rem;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.upload-card p {
  color: #666;
  margin: 0 0 1.5rem 0;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 3rem;
  color: #667eea;
}

.upload-text {
  font-size: 1.1rem;
  color: #333;
}

.upload-subtitle {
  font-size: 0.9rem;
  color: #666;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.8rem;
}

.analysis-options {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.analysis-options label {
  font-weight: 500;
  color: #333;
}

.analysis-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.analyze-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.analyze-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.analyze-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.stats-card h2, .analysis-card h2, .category-analysis h2, .tips-card h2 {
  font-size: 1.3rem;
  color: #333;
  margin: 0 0 1rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.insights-content {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.insight-text {
  white-space: pre-line;
  line-height: 1.6;
  color: #333;
}

.no-insights {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-weight: 500;
  color: #333;
}

.category-amount {
  font-weight: bold;
  color: #667eea;
}

.category-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.tip-icon {
  font-size: 1.2rem;
}

.tip-text {
  color: #555;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .ai-insights {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .analysis-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .refresh-btn {
    width: 100%;
  }
  
  .upload-area {
    padding: 1.5rem;
  }
  
  .preview-image {
    max-width: 250px;
    max-height: 150px;
  }
  
  .analysis-options {
    flex-direction: column;
    align-items: stretch;
  }
  
  .analyze-btn {
    width: 100%;
  }
}
</style>