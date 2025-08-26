<template>
  <div class="split-bill-screen">
    <header class="header">
      <button class="back-button" @click="$emit('navigate', 'Home')">←</button>
      <h1 class="title">Bill Split</h1>
    </header>

    <main class="content">
      <div class="bill-summary">
        <h3>Total Bill: ₹{{ billTotal.toFixed(2) }}</h3>
        <p>Split among {{ localPeople.length }} people</p>
      </div>
      
      <div class="participants">
        <div v-for="(person, index) in localPeople" :key="person.id" class="participant-item">
          <div class="participant-info">
            <input 
              type="text" 
              v-model="person.name" 
              :placeholder="'Person ' + (index + 1) + ' Name'"
              @blur="recalculate"
            />
            <div class="amount-display">
              <span class="currency">₹</span>
              <span class="amount">{{ person.amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="actions">
      <button class="btn-primary" @click="recalculate">
        🔄 Recalculate
      </button>
      <button class="btn-secondary" @click="shareResults">
        📤 Share Results
      </button>
      <button class="btn-qr" @click="showQRShare">
        📱 QR Share
      </button>
    </footer>
    
    <!-- QR Share Modal -->
    <QRShare 
      :show="showQR" 
      :data="shareData" 
      type="bill_split" 
      @close="showQR = false" 
    />
  </div>
</template>

<script>
import { fetchAPI } from '../services/api';
import QRShare from './QRShare.vue';

export default {
  name: 'SplitBillScreen',
  components: {
    QRShare
  },
  props: ['billTotal', 'people'],
  emits: ['navigate'],
  data() {
    return {
      localPeople: JSON.parse(JSON.stringify(this.people)),
      showQR: false,
    };
  },
  computed: {
    shareData() {
      return {
        total: this.billTotal,
        people: this.localPeople,
        perPerson: this.billTotal / this.localPeople.length
      };
    }
  },
  created() {
    this.splitBill();
  },
  methods: {
    async splitBill() {
      if (this.localPeople.length === 0) return;

      // Ensure all people have names before splitting
      const names = this.localPeople.map((p, index) => 
        p.name.trim() || `Person ${index + 1}`
      );

      // Update names in local people first
      this.localPeople.forEach((person, index) => {
        if (!person.name.trim()) {
          person.name = names[index];
        }
      });

      try {
        const params = new URLSearchParams({
          totalAmount: this.billTotal,
          numberOfPeople: this.localPeople.length,
          names: names.join(','),
          currency: 'INR'
        });
        
        // Use the centralized API service
        const data = await fetchAPI(`/bills/split?${params}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
        
        // Update local people with the response
        this.localPeople = data.participants.map((participant, index) => ({
          id: index,
          name: participant.name,
          amount: participant.amount
        }));
        
        console.log('✅ Successfully split bill using backend');
      } catch (error) {
        console.error('❌ Backend not available, using local calculation:', error.message);
        // Fallback to manual calculation
        this.manualSplit(names);
      }
    },
    manualSplit(names) {
      const perPerson = this.billTotal / this.localPeople.length;
      this.localPeople.forEach((person, index) => {
        person.name = names ? names[index] : person.name;
        person.amount = perPerson;
      });
      
      // Show a notification that we're using local calculation
      this.showNotification('Using offline calculation - backend not available');
    },
    showNotification(message) {
      // Simple notification - you could replace this with a toast library
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
    recalculate() {
      this.splitBill();
    },
    shareResults() {
      const results = this.localPeople
        .map(p => `${p.name}: ₹${p.amount.toFixed(2)}`)
        .join('\n');
      
      const shareText = `Bill Split Results:\nTotal: ₹${this.billTotal.toFixed(2)}\n\n${results}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Bill Split Results',
          text: shareText
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          alert('Results copied to clipboard!');
        });
      }
    },
    showQRShare() {
      this.showQR = true;
    },
  },
};
</script>

<style scoped>
.split-bill-screen {
  font-family: sans-serif;
  padding: 2rem;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
.header {
  text-align: center;
  margin-bottom: 3rem;
}
.back-button {
  display: none;
}
.title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}
.content {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}
.bill-summary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 2rem;
}
.bill-summary h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}
.bill-summary p {
  margin: 0;
  opacity: 0.9;
}
.participants {
  margin-bottom: 2rem;
}
.participant-item {
  margin-bottom: 1rem;
}
.participant-info {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.2s;
}
.participant-info:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.participant-info input {
  border: none;
  padding: 0.5rem;
  font-size: 1.1rem;
  flex-grow: 1;
  background: transparent;
  outline: none;
}
.participant-info input:focus {
  background: #f8f9fa;
  border-radius: 6px;
}
.amount-display {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: #28a745;
}
.currency {
  margin-right: 0.25rem;
}
.actions {
  display: flex;
  gap: 1rem;
}
button {
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 123, 255, 0.4);
}
.btn-secondary {
  background: linear-gradient(135deg, #6c757d, #545b62);
  color: white;
}
.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(108, 117, 125, 0.4);
}
.btn-qr {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}
.btn-qr:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
}

@media (max-width: 768px) {
  .split-bill-screen {
    padding: 1rem;
  }
  
  .header {
    margin-bottom: 2rem;
  }
  
  .content {
    padding: 1.5rem;
  }
  
  .actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .bill-summary h3 {
    font-size: 1.6rem;
  }
  
  .participant-info {
    padding: 1.2rem;
  }
  
  .participant-info input {
    font-size: 1.2rem;
    padding: 0.75rem;
  }
  
  .amount-display {
    font-size: 1.3rem;
  }
  
  button {
    padding: 1.2rem;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .split-bill-screen {
    padding: 0.5rem;
  }
  
  .header {
    margin-bottom: 1.5rem;
  }
  
  .content {
    padding: 1rem;
  }
  
  .title {
    font-size: 1.7rem;
  }
  
  .bill-summary {
    padding: 1.25rem;
  }
  
  .bill-summary h3 {
    font-size: 1.4rem;
  }
  
  .participant-info {
    padding: 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .participant-info input {
    font-size: 1.1rem;
    padding: 0.75rem;
    text-align: center;
  }
  
  .amount-display {
    font-size: 1.4rem;
    justify-content: center;
  }
  
  .actions {
    gap: 0.5rem;
  }
  
  button {
    padding: 1.1rem;
    font-size: 1rem;
  }
}
</style>