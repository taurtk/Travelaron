<template>
  <div class="food-discovery-screen">
    <header class="header">
      <button class="back-button" @click="$emit('navigate', 'Home')">←</button>
      <h1>Food Discovery 🍽️</h1>
    </header>

    <!-- Setup Phase: Add Food Options -->
    <div v-if="!gameStarted" class="setup-section">
      <div class="add-food-section">
        <h3>Add Food Options</h3>
        <div class="add-food-form">
          <input type="text" v-model="newFoodName" placeholder="Food name (e.g., Pizza)" @keyup.enter="addFood" />
          <input type="text" v-model="newFoodEmoji" placeholder="Emoji (e.g., 🍕)" maxlength="2"
            @keyup.enter="addFood" />
          <button class="add-btn" @click="addFood" :disabled="!canAddFood">
            ➕ Add
          </button>
        </div>
        
        <!-- AI Food Analysis -->
        <div class="ai-food-section">
          <h4>🤖 AI Food Analysis</h4>
          <p>Upload a food photo for AI identification and insights</p>
          <div class="food-upload-area" @click="triggerFoodUpload" @dragover.prevent @drop.prevent="handleFoodDrop">
            <input 
              ref="foodFileInput" 
              type="file" 
              accept="image/*" 
              @change="handleFoodFileSelect" 
              style="display: none"
            />
            <div v-if="!selectedFoodImage" class="food-upload-placeholder">
              <div class="food-upload-icon">📷</div>
              <div class="food-upload-text">Upload food photo for AI analysis</div>
            </div>
            <div v-else class="food-image-preview">
              <img :src="foodImagePreview" alt="Food image" class="food-preview-image" />
              <button @click.stop="removeFoodImage" class="remove-food-image">✕</button>
            </div>
          </div>
          
          <div v-if="selectedFoodImage" class="food-analysis-actions">
            <button @click="analyzeFoodImage" class="analyze-food-btn" :disabled="analyzingFood">
              {{ analyzingFood ? '🔄 Analyzing...' : '🤖 Analyze Food' }}
            </button>
          </div>
          
          <div v-if="foodAnalysis" class="food-analysis-result">
            <h5>🧠 AI Analysis:</h5>
            <div class="analysis-text">{{ foodAnalysis }}</div>
          </div>
        </div>

        <div v-if="foodOptions.length > 0" class="food-preview">
          <h4>Food Options ({{ foodOptions.length }})</h4>
          <div class="food-grid">
            <div v-for="(food, index) in foodOptions" :key="index" class="food-item">
              <span class="food-display">{{ food.emoji }} {{ food.name }}</span>
              <button class="remove-btn" @click="removeFood(index)">❌</button>
            </div>
          </div>
        </div>

        <div class="quick-add-section">
          <h4>Quick Add Popular Foods</h4>
          <div class="quick-food-buttons">
            <button v-for="food in popularFoods" :key="food.name" class="quick-food-btn" @click="addQuickFood(food)">
              {{ food.emoji }} {{ food.name }}
            </button>
          </div>
        </div>

        <button class="btn-primary start-discovery" @click="startDiscovery" :disabled="foodOptions.length < 2">
          🎯 Start Food Discovery ({{ foodOptions.length }} options)
        </button>
      </div>
    </div>

    <!-- Discovery Phase: Swipe Cards -->
    <div v-else-if="currentCard" class="discovery-section">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <p class="progress-text">{{ currentIndex + 1 }} of {{ foodOptions.length }}</p>

      <div class="swipe-cards">
        <div class="card">
          <div class="food-emoji">{{ currentCard.emoji }}</div>
          <h2>{{ currentCard.name }}</h2>
          <p class="swipe-hint">Do you like this food?</p>
        </div>
      </div>

      <div class="actions">
        <button class="dislike-btn" @click="dislike">👎 Pass</button>
        <button class="like-btn" @click="like">👍 Like</button>
      </div>
    </div>

    <!-- Results Phase -->
    <div v-else class="results-section">
      <div class="completion-card">
        <h3>🎉 Discovery Complete!</h3>
        <div class="results-summary">
          <p><strong>{{ likedFoods.length }}</strong> foods you liked</p>
          <p><strong>{{ dislikedFoods.length }}</strong> foods you passed</p>
        </div>
      </div>

      <!-- Top Choice from Backend -->
      <div v-if="consensus && consensus.topFood" class="consensus-section">
        <h4>🏆 Your Top Choice</h4>
        <div class="top-food-card">
          <span class="top-food-emoji">{{ consensus.topFood.emoji }}</span>
          <span class="top-food-name">{{ consensus.topFood.name }}</span>
        </div>
      </div>

      <div class="liked-foods" v-if="likedFoods.length > 0">
        <h4>👍 All Foods You Liked</h4>
        <div class="food-grid">
          <div v-for="food in likedFoods" :key="food.name" class="liked-food-item">
            {{ food.emoji }} {{ food.name }}
          </div>
        </div>
      </div>

      <div class="actions-final">
        <button class="btn-secondary" @click="restartDiscovery">
          🔄 Try Again
        </button>
        <button class="btn-primary" @click="shareResults" v-if="likedFoods.length > 0">
          📤 Share Favorites
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchAPI } from '../services/api';
import aiService from '../services/aiService.js';

export default {
  name: 'FoodDiscoveryScreen',
  emits: ['navigate'],
  data() {
    return {
      gameStarted: false,
      currentIndex: 0,
      foodOptions: [],
      newFoodName: '',
      newFoodEmoji: '',
      likedFoods: [],
      dislikedFoods: [],
      sessionId: 'food-discovery-' + Date.now(), // Unique session ID
      swipes: [], // Store all swipes for backend
      consensus: null,
      selectedFoodImage: null,
      foodImagePreview: null,
      analyzingFood: false,
      foodAnalysis: null,
      popularFoods: [
        { name: 'Pizza', emoji: '🍕' },
        { name: 'Burger', emoji: '🍔' },
        { name: 'Sushi', emoji: '🍣' },
        { name: 'Tacos', emoji: '🌮' },
        { name: 'Pasta', emoji: '🍝' },
        { name: 'Ramen', emoji: '🍜' },
        { name: 'Ice Cream', emoji: '🍦' },
        { name: 'Salad', emoji: '🥗' },
        { name: 'Sandwich', emoji: '🥪' },
        { name: 'Fried Rice', emoji: '🍛' },
        { name: 'Dumplings', emoji: '🥟' },
        { name: 'Biryani', emoji: '🍚' }
      ]
    };
  },
  computed: {
    currentCard() {
      return this.foodOptions[this.currentIndex];
    },
    canAddFood() {
      return this.newFoodName.trim() && this.newFoodEmoji.trim();
    },
    progressPercentage() {
      return this.foodOptions.length > 0 ? ((this.currentIndex) / this.foodOptions.length) * 100 : 0;
    }
  },
  methods: {
    addFood() {
      if (this.canAddFood) {
        const newFood = {
          id: Date.now().toString(), // Backend expects string ID
          name: this.newFoodName.trim(),
          emoji: this.newFoodEmoji.trim(),
          imageUrl: '' // Backend expects imageUrl field
        };

        // Check if food already exists
        const exists = this.foodOptions.some(food =>
          food.name.toLowerCase() === newFood.name.toLowerCase()
        );

        if (!exists) {
          this.foodOptions.push(newFood);
          this.newFoodName = '';
          this.newFoodEmoji = '';
        } else {
          this.showNotification('This food is already in your list!');
        }
      }
    },
    removeFood(index) {
      this.foodOptions.splice(index, 1);
    },
    addQuickFood(food) {
      // Check if food already exists
      const exists = this.foodOptions.some(existing =>
        existing.name.toLowerCase() === food.name.toLowerCase()
      );

      if (!exists) {
        this.foodOptions.push({
          id: Date.now().toString(), // Backend expects string ID
          name: food.name,
          emoji: food.emoji,
          imageUrl: '' // Backend expects imageUrl field
        });
      } else {
        this.showNotification(`${food.name} is already in your list!`);
      }
    },
    async startDiscovery() {
      if (this.foodOptions.length >= 2) {
        try {
          // Send cards to backend
          await fetchAPI('/foods/cards', {
            method: 'POST',
            body: JSON.stringify({
              sessionId: this.sessionId,
              cards: this.foodOptions
            })
          });
          console.log('✅ Cards saved to backend');
        } catch (error) {
          console.log('❌ Backend not available, using local storage');
          this.showNotification('Using offline mode - backend not available');
        }

        this.gameStarted = true;
        this.currentIndex = 0;
        this.likedFoods = [];
        this.dislikedFoods = [];
        this.swipes = [];
      }
    },
    nextCard() {
      this.currentIndex++;
      // If we've finished all cards, fetch consensus
      if (this.currentIndex >= this.foodOptions.length) {
        this.fetchConsensus();
      }
    },
    async fetchConsensus() {
      try {
        const data = await fetchAPI(`/foods/consensus?sessionId=${this.sessionId}`);
        this.consensus = data;
        console.log('✅ Consensus fetched from backend:', data);
      } catch (error) {
        console.log('❌ Backend not available for consensus');
        // Use local consensus
        this.consensus = this.calculateLocalConsensus();
      }
    },
    calculateLocalConsensus() {
      if (this.likedFoods.length === 0) return null;

      // For local calculation, just pick the first liked food as "top choice"
      return {
        topFood: this.likedFoods[0],
        likes: {},
        dislikes: {}
      };
    },
    async like() {
      if (this.currentCard) {
        await this.submitSwipe(true);
        this.likedFoods.push(this.currentCard);
        this.nextCard();
      }
    },
    async dislike() {
      if (this.currentCard) {
        await this.submitSwipe(false);
        this.dislikedFoods.push(this.currentCard);
        this.nextCard();
      }
    },
    async submitSwipe(liked) {
      if (!this.currentCard) return;

      const swipe = {
        foodId: this.currentCard.id,
        liked: liked
      };

      // Store swipe locally
      this.swipes.push(swipe);

      try {
        // Send swipe to backend
        await fetchAPI('/foods/swipes', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: this.sessionId,
            swipes: [swipe]
          })
        });
        console.log('✅ Swipe saved to backend');
      } catch (error) {
        console.log('❌ Backend not available, swipe saved locally');
      }
    },
    restartDiscovery() {
      this.gameStarted = false;
      this.currentIndex = 0;
      this.likedFoods = [];
      this.dislikedFoods = [];
      this.swipes = [];
      this.consensus = null;
      // Generate new session ID for fresh start
      this.sessionId = 'food-discovery-' + Date.now();
    },
    shareResults() {
      if (this.likedFoods.length === 0) return;

      const favorites = this.likedFoods
        .map(food => `${food.emoji} ${food.name}`)
        .join('\n');

      const shareText = `🍽️ My Food Favorites:\n\n${favorites}\n\nDiscovered using Travelaron!`;

      if (navigator.share) {
        navigator.share({
          title: 'My Food Favorites',
          text: shareText
        });
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          this.showNotification('Favorites copied to clipboard!');
        });
      }
    },
    showNotification(message) {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff9800;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 1000;
        max-width: 300px;
        font-size: 0.9rem;
      `;
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    },
    
    // AI Food Analysis Methods
    triggerFoodUpload() {
      this.$refs.foodFileInput.click();
    },
    
    handleFoodFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processFoodImageFile(file);
      }
    },
    
    handleFoodDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.processFoodImageFile(file);
      }
    },
    
    processFoodImageFile(file) {
      this.selectedFoodImage = file;
      this.foodAnalysis = null;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.foodImagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    
    removeFoodImage() {
      this.selectedFoodImage = null;
      this.foodImagePreview = null;
      this.foodAnalysis = null;
      this.$refs.foodFileInput.value = '';
    },
    
    async analyzeFoodImage() {
      if (!this.selectedFoodImage) return;
      
      this.analyzingFood = true;
      this.foodAnalysis = null;
      
      try {
        const analysis = await aiService.analyzeFoodImage(this.selectedFoodImage);
        this.foodAnalysis = analysis;
      } catch (error) {
        console.error('Food analysis failed:', error);
        this.foodAnalysis = 'Failed to analyze food image. Please try again with a clearer image.';
      } finally {
        this.analyzingFood = false;
      }
    }
  },
};
</script>

<style scoped>
.food-discovery-screen {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  color: #2d3748;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.back-button {
  display: none;
}

/* Setup Section */
.setup-section {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.add-food-section h3 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.add-food-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.add-food-form input {
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  background: #f7fafc;
  transition: all 0.3s ease;
  font-weight: 500;
}

.add-food-form input:first-child {
  flex: 2;
}

.add-food-form input:nth-child(2) {
  flex: 1;
  text-align: center;
  font-size: 1.2rem;
}

.add-food-form input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.add-btn {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}

.add-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.food-preview {
  margin-bottom: 2rem;
}

.food-preview h4 {
  margin-bottom: 1.5rem;
  color: #4a5568;
  font-weight: 600;
  text-align: center;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border: 2px solid transparent;
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.food-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.food-display {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.liked-food-item {
  background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
  border: 2px solid #48bb78;
  justify-content: center;
  font-weight: 600;
  color: #22543d;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
}

.remove-btn {
  background: rgba(245, 101, 101, 0.1);
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #e53e3e;
}

.remove-btn:hover {
  background: rgba(245, 101, 101, 0.2);
  transform: scale(1.1);
}

.quick-add-section {
  margin-bottom: 2.5rem;
}

.quick-add-section h4 {
  margin-bottom: 1.5rem;
  color: #4a5568;
  font-weight: 600;
  text-align: center;
}

.quick-food-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.quick-food-btn {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #4a5568;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.quick-food-btn:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.start-discovery {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.start-discovery:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.start-discovery:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Discovery Section */
.discovery-section {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  text-align: center;
}

.progress-bar {
  width: 100%;
  max-width: 500px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 20px;
  margin: 0 auto 1rem;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.5s ease;
  border-radius: 20px;
}

.progress-text {
  margin-bottom: 2rem;
  color: #4a5568;
  font-size: 1rem;
  font-weight: 600;
}

.swipe-cards {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  min-height: 350px;
}

.card {
  background: white;
  color: #2d3748;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  min-width: 320px;
  max-width: 400px;
  transform: scale(1);
  transition: all 0.4s ease;
  border: 1px solid #e2e8f0;
  margin: 0 auto;
}

.card:hover {
  transform: scale(1.05) rotateY(5deg);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
}

.food-emoji {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

.card h2 {
  margin: 0 0 1.5rem 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: #2d3748;
}

.swipe-hint {
  margin: 0;
  opacity: 0.8;
  font-size: 1.1rem;
  color: #718096;
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.actions button {
  padding: 1.25rem 2.5rem;
  font-size: 1.3rem;
  cursor: pointer;
  border-radius: 50px;
  border: none;
  font-weight: 700;
  transition: all 0.3s ease;
  min-width: 140px;
  position: relative;
  overflow: hidden;
}

.actions button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.actions button:hover::before {
  left: 100%;
}

.like-btn {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}

.like-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.5);
}

.dislike-btn {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
  box-shadow: 0 6px 20px rgba(245, 101, 101, 0.4);
}

.dislike-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(245, 101, 101, 0.5);
}

/* Results Section */
.results-section {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.completion-card {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  padding: 2.5rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
}

.completion-card h3 {
  margin: 0 0 1.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.results-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
  gap: 1rem;
}

.results-summary p {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  flex: 1;
  text-align: center;
}

.consensus-section {
  margin-bottom: 2rem;
  text-align: center;
}

.consensus-section h4 {
  margin-bottom: 1.5rem;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.top-food-card {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #2d3748;
  padding: 2rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  transform: scale(1);
  transition: all 0.3s ease;
}

.top-food-card:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.5);
}

.top-food-emoji {
  font-size: 3rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.top-food-name {
  font-size: 1.8rem;
  font-weight: 700;
}

.liked-foods {
  margin-bottom: 2rem;
}

.liked-foods h4 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2d3748;
  font-size: 1.3rem;
  font-weight: 600;
}

.actions-final {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 1.25rem 2rem;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.btn-primary {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(66, 153, 225, 0.5);
}

.btn-secondary {
  background: linear-gradient(135deg, #a0aec0, #718096);
  color: white;
  box-shadow: 0 6px 20px rgba(160, 174, 192, 0.4);
}

.btn-secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(160, 174, 192, 0.5);
}

/* AI Food Analysis Styles */
.ai-food-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.ai-food-section h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 600;
}

.ai-food-section p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
}

.food-upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.food-upload-area:hover {
  border-color: #667eea;
  background: white;
}

.food-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.food-upload-icon {
  font-size: 2rem;
  color: #667eea;
}

.food-upload-text {
  color: #666;
  font-size: 0.9rem;
}

.food-image-preview {
  position: relative;
  display: inline-block;
}

.food-preview-image {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.remove-food-image {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 0.7rem;
}

.food-analysis-actions {
  text-align: center;
  margin-bottom: 1rem;
}

.analyze-food-btn {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.analyze-food-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.analyze-food-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.food-analysis-result {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.food-analysis-result h5 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1rem;
}

.analysis-text {
  white-space: pre-line;
  line-height: 1.5;
  color: #555;
  font-size: 0.9rem;
}
</style>