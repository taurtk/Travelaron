<template>
  <div class="settings-screen">
    <header class="header">
      <h1>⚙️ Settings</h1>
    </header>

    <div class="main-content">
      <div class="settings-card">
        <div class="card-header">
          <h2>💰 Financial Settings</h2>
          <p>Configure your default preferences</p>
        </div>

        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">💱</div>
              <div class="setting-details">
                <label>Currency Preference</label>
                <span>Choose your default currency</span>
              </div>
            </div>
            <select v-model="settings.currency" @change="updateSettings" class="setting-control">
              <option value="INR">₹ (INR)</option>
              <option value="USD">$ (USD)</option>
              <option value="EUR">€ (EUR)</option>
            </select>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">🧾</div>
              <div class="setting-details">
                <label>Tax Rate (%)</label>
                <span>Default tax percentage</span>
              </div>
            </div>
            <div class="input-wrapper">
              <input 
                type="number" 
                v-model.number="settings.taxRate" 
                @change="updateSettings" 
                step="0.1" 
                min="0" 
                max="100"
                class="setting-control"
              />
              <span class="input-suffix">%</span>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">💸</div>
              <div class="setting-details">
                <label>Tip Rate (%)</label>
                <span>Default tip percentage</span>
              </div>
            </div>
            <div class="input-wrapper">
              <input 
                type="number" 
                v-model.number="settings.tipRate" 
                @change="updateSettings" 
                step="0.1" 
                min="0" 
                max="100"
                class="setting-control"
              />
              <span class="input-suffix">%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <h2>🎨 Appearance</h2>
          <p>Customize your app experience</p>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-icon">{{ settings.darkMode ? '🌙' : '☀️' }}</div>
            <div class="setting-details">
              <label>Dark Mode</label>
              <span>{{ settings.darkMode ? 'Dark theme enabled' : 'Light theme enabled' }}</span>
            </div>
          </div>
          <button @click="toggleDarkMode" class="toggle-btn" :class="{ active: settings.darkMode }">
            <div class="toggle-slider"></div>
          </button>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <h2>📱 About</h2>
          <p>App information and support</p>
        </div>

        <div class="about-grid">
          <div class="about-item">
            <div class="about-icon">🍽️</div>
            <div class="about-details">
              <h3>Travelaron</h3>
              <p>Version 1.0.0</p>
            </div>
          </div>
          <div class="about-item">
            <div class="about-icon">💡</div>
            <div class="about-details">
              <h3>Features</h3>
              <p>Bill splitting, food discovery, trip expenses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'SettingsScreen',
  data() {
    return {
      sessionId: 'default-session', // Replace with actual session management
      settings: {
        currency: 'INR',
        taxRate: 0,
        tipRate: 0,
        darkMode: false,
      },
    };
  },
  methods: {
    async fetchSettings() {
      try {
        const response = await api.get('/me/settings', {
          params: { sessionId: this.sessionId },
        });
        const data = response.data;
        
        // Map backend field names to frontend field names
        this.settings = {
          currency: data.currency || 'INR',
          taxRate: data.taxPercent || 0,
          tipRate: data.tipPercent || 0,
          darkMode: data.darkMode || false,
        };
        console.log('✅ Successfully fetched settings from backend');
      } catch (error) {
        console.error('❌ Error fetching settings:', error);
        // Use default settings
        this.settings = {
          currency: 'INR',
          taxRate: 0,
          tipRate: 0,
          darkMode: false,
        };
        this.showNotification('Using default settings - backend not available');
      }
    },
    async updateSettings() {
      try {
        await api.put('/me/settings', this.settings, {
          params: { sessionId: this.sessionId },
        });
        console.log('✅ Successfully updated settings');
        this.showNotification('Settings saved successfully!', 'success');
      } catch (error) {
        console.error('❌ Error updating settings:', error);
        this.showNotification('Could not save settings - backend not available');
      }
    },
    toggleDarkMode() {
      this.settings.darkMode = !this.settings.darkMode;
      this.updateSettings();
    },
    showNotification(message, type = 'warning') {
      const notification = document.createElement('div');
      notification.textContent = message;
      const bgColor = type === 'success' ? '#4CAF50' : '#ff9800';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
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
  },
  created() {
    this.fetchSettings();
  },
};
</script>

<style scoped>
.settings-screen {
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

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.settings-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .settings-screen {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .settings-card {
    padding: 1.5rem;
  }
  
  .card-header {
    margin-bottom: 2rem;
  }
  
  .card-header h2 {
    font-size: 1.5rem;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .setting-info {
    gap: 1rem;
  }
  
  .setting-icon {
    width: 45px;
    height: 45px;
    font-size: 1.8rem;
  }
  
  .setting-details label {
    font-size: 1.1rem;
  }
  
  .setting-control {
    width: 100%;
    min-width: auto;
    padding: 1.2rem;
    font-size: 1.1rem;
  }
  
  .toggle-btn {
    align-self: center;
  }
  
  .about-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .about-item {
    padding: 1.5rem;
  }
  
  .about-icon {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .settings-screen {
    padding: 0.5rem;
  }
  
  .settings-card {
    padding: 1rem;
  }
  
  .card-header h2 {
    font-size: 1.3rem;
  }
  
  .card-header p {
    font-size: 1rem;
  }
  
  .setting-item {
    padding: 1rem;
  }
  
  .setting-info {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .setting-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
    align-self: center;
  }
  
  .setting-details {
    text-align: center;
  }
  
  .setting-details label {
    font-size: 1rem;
  }
  
  .setting-details span {
    font-size: 0.9rem;
  }
  
  .setting-control {
    padding: 1rem;
    font-size: 1rem;
  }
  
  .about-item {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }
  
  .about-icon {
    align-self: center;
  }
  
  .about-details {
    text-align: center;
  }
}

.card-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.card-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
}

.card-header p {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.setting-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.setting-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.setting-details label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.setting-details span {
  color: #718096;
  font-size: 0.95rem;
}

.setting-control {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  min-width: 140px;
  transition: all 0.3s ease;
  background: #f7fafc;
}

.setting-control:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-suffix {
  position: absolute;
  right: 1rem;
  color: #718096;
  font-weight: 600;
  pointer-events: none;
}

.input-wrapper input {
  padding-right: 2.5rem;
  width: 100%;
}

.toggle-btn {
  width: 60px;
  height: 30px;
  background: #e2e8f0;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.toggle-slider {
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%);
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-btn.active .toggle-slider {
  transform: translateY(-50%) translateX(30px);
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.about-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.about-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.about-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.about-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
}

.about-details p {
  margin: 0;
  color: #718096;
  font-size: 1rem;
}
</style>