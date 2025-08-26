<template>
  <div class="profile-screen">
    <header class="header">
      <h1>👤 Profile</h1>
    </header>

    <div class="main-content">
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar">
            <span>{{ profile.name ? profile.name.charAt(0).toUpperCase() : 'G' }}</span>
          </div>
          <div class="profile-info">
            <h2>{{ profile.name || 'Guest User' }}</h2>
            <p>{{ profile.email || 'No email provided' }}</p>
          </div>
        </div>

        <div class="profile-actions">
          <button class="edit-btn">✏️ Edit Profile</button>
          <button class="logout-btn">🚪 Logout</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-value">{{ bills.length }}</div>
            <div class="stat-label">Total Bills</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👍</div>
          <div class="stat-content">
            <div class="stat-value">{{ tastes.liked || 0 }}</div>
            <div class="stat-label">Foods Liked</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👎</div>
          <div class="stat-content">
            <div class="stat-value">{{ tastes.disliked || 0 }}</div>
            <div class="stat-label">Foods Disliked</div>
          </div>
        </div>
      </div>

      <div class="history-card">
        <div class="card-header">
          <h3>📋 Recent Bills</h3>
        </div>
        <div v-if="bills.length > 0" class="bills-list">
          <div v-for="bill in bills.slice(0, 5)" :key="bill.billId" class="bill-item">
            <div class="bill-info">
              <div class="bill-id">Bill #{{ bill.billId }}</div>
              <div class="bill-amount">{{ bill.currency }} {{ bill.totalAmount }}</div>
            </div>
            <div class="bill-date">{{ formatDate(bill.createdAt) }}</div>
          </div>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">📄</div>
          <p>No bills yet</p>
          <span>Start splitting bills to see your history</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  name: 'ProfileScreen',
  data() {
    return {
      profile: {},
      bills: [],
      tastes: {},
      sessionId: 'default-session', // Replace with actual session management
    };
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'Recently';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    },
    async fetchProfile() {
      try {
        const response = await api.get('/me', {
          params: { sessionId: this.sessionId },
        });
        this.profile = response.data;
        console.log('✅ Successfully fetched profile from backend');
      } catch (error) {
        console.error('❌ Error fetching profile:', error);
        // Use fallback profile
        this.profile = {
          name: 'Guest User',
          email: 'guest@Travelaron.com'
        };
        this.showNotification('Using offline profile - backend not available');
      }
    },
    async fetchBills() {
      try {
        const response = await api.get('/me/bills', {
          params: { sessionId: this.sessionId },
        });
        this.bills = response.data;
        console.log('✅ Successfully fetched bills from backend');
      } catch (error) {
        console.error('❌ Error fetching bills:', error);
        this.bills = [];
        this.showNotification('Could not load bill history - backend not available');
      }
    },
    async fetchTastes() {
      try {
        const response = await api.get('/me/tastes', {
          params: { sessionId: this.sessionId },
        });
        this.tastes = response.data;
        console.log('✅ Successfully fetched tastes from backend');
      } catch (error) {
        console.error('❌ Error fetching tastes:', error);
        this.tastes = { liked: 0, disliked: 0 };
        this.showNotification('Could not load taste preferences - backend not available');
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
  },
  created() {
    this.fetchProfile();
    this.fetchBills();
    this.fetchTastes();
  },
};
</script>

<style scoped>
.profile-screen {
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
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-card, .history-card {
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
  .profile-screen {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .profile-card, .history-card {
    padding: 1.5rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .avatar {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
  
  .profile-info h2 {
    font-size: 1.5rem;
  }
  
  .profile-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .edit-btn, .logout-btn {
    width: 100%;
    min-width: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1.5rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .bill-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .bill-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  
  .empty-state {
    padding: 2rem;
  }
  
  .empty-icon {
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .profile-screen {
    padding: 0.5rem;
  }
  
  .profile-card, .history-card {
    padding: 1rem;
  }
  
  .avatar {
    width: 70px;
    height: 70px;
    font-size: 1.8rem;
  }
  
  .profile-info h2 {
    font-size: 1.3rem;
  }
  
  .profile-info p {
    font-size: 1rem;
  }
  
  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .bill-item {
    padding: 1rem;
  }
  
  .bill-id, .bill-amount {
    font-size: 1rem;
  }
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: 700;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
}

.profile-info h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
}

.profile-info p {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
}

.profile-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.edit-btn, .logout-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.edit-btn {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
}

.edit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(66, 153, 225, 0.5);
}

.logout-btn {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
  box-shadow: 0 6px 20px rgba(245, 101, 101, 0.4);
}

.logout-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(245, 101, 101, 0.5);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  grid-column: 1 / -1;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.stat-icon {
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

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #718096;
  font-size: 1rem;
  font-weight: 500;
}

.card-header {
  margin-bottom: 2rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
}

.bills-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;
}

.bill-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

.bill-id {
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

.bill-amount {
  font-weight: 700;
  color: #48bb78;
  font-size: 1.2rem;
}

.bill-date {
  color: #718096;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #4a5568;
}

.empty-state span {
  font-size: 1rem;
  opacity: 0.8;
}
</style>