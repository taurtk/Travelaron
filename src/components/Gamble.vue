<template>
  <div class="gamble-split">
    <div class="header">
      <h1>🎲 Gamble Split</h1>
      <p>Who pays the bill? Let luck decide!</p>
    </div>

    <!-- Data Source Selection -->
    <div v-if="!winner && !showManualSetup" class="source-selection">
      <div class="source-card">
        <h2>Choose Data Source</h2>
        
        <!-- Use Existing Data -->
        <div v-if="hasExistingData" class="existing-data">
          <h3>Use Existing Data</h3>
          
          <button v-if="billTotal && people.length > 0" 
                  class="data-option" 
                  @click="useExistingData('bill')">
            <div class="option-icon">💰</div>
            <div class="option-text">
              <div class="option-title">Split Bill Data</div>
              <div class="option-subtitle">₹{{ billTotal.toFixed(0) }} • {{ people.length }} people</div>
            </div>
          </button>
          
          <button v-if="hasTripData" 
                  class="data-option" 
                  @click="useExistingData('trip')">
            <div class="option-icon">✈️</div>
            <div class="option-text">
              <div class="option-title">Trip Expenses</div>
              <div class="option-subtitle">Use trip expense data</div>
            </div>
          </button>
        </div>

        <!-- Manual Setup -->
        <div class="manual-setup">
          <h3>Manual Setup</h3>
          <button class="data-option" @click="startManualSetup">
            <div class="option-icon">➕</div>
            <div class="option-text">
              <div class="option-title">Add Manually</div>
              <div class="option-subtitle">Create custom gamble</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Manual Setup Section -->
    <div v-if="showManualSetup && !winner" class="setup-section">
      <div class="setup-card">
        <h2>Manual Setup</h2>
        
        <!-- Amount Input -->
        <div class="amount-input">
          <label>Total Amount</label>
          <div class="input-field">
            <span>₹</span>
            <input 
              type="number" 
              v-model.number="localBillTotal" 
              placeholder="Enter amount"
            />
          </div>
        </div>

        <!-- Participants -->
        <div class="participants-section">
          <label>Add People</label>
          <div class="add-person">
            <input 
              type="text" 
              v-model="newPersonName" 
              placeholder="Enter name"
              @keyup.enter="addPerson"
            />
            <button @click="addPerson" :disabled="!newPersonName.trim()">
              Add
            </button>
          </div>
          
          <div v-if="localParticipants.length > 0" class="people-list">
            <div v-for="(person, index) in localParticipants" :key="index" class="person-item">
              <span>{{ person.name }}</span>
              <button @click="removePerson(index)" class="remove-btn">✕</button>
            </div>
          </div>

          <div class="quick-add">
            <p>Quick add:</p>
            <button @click="quickAdd(2)">2 People</button>
            <button @click="quickAdd(3)">3 People</button>
            <button @click="quickAdd(4)">4 People</button>
          </div>
        </div>

        <div class="setup-actions">
          <button @click="backToSourceSelection" class="back-btn">← Back</button>
          <button 
            @click="startGamble" 
            class="gamble-btn"
            :disabled="localParticipants.length < 2 || !localBillTotal || localBillTotal <= 0"
          >
            🎲 Start Gamble
          </button>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="winner" class="results-section">
      <div class="winner-card">
        <div class="dice">🎲</div>
        <h2>{{ winner.name }} Pays!</h2>
        <div class="amount">₹{{ currentBillTotal.toFixed(0) }}</div>
        <p>Better luck next time! 😄</p>
        
        <div class="all-participants">
          <div v-for="participant in participants" :key="participant.name" 
               class="participant" :class="{ winner: !participant.lucky }">
            <span class="name">{{ participant.name }}</span>
            <span class="status">{{ participant.lucky ? '😊 Lucky' : '💸 Pays' }}</span>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="rollAgain" class="roll-btn">🎲 Roll Again</button>
        <button @click="resetGamble" class="new-btn">🔄 New Gamble</button>
        <button @click="showQRShare" class="qr-btn">📱 QR Share</button>
      </div>
    </div>
    
    <!-- QR Share Modal -->
    <QRShare 
      :show="showQR" 
      :data="shareData" 
      type="gamble_result" 
      @close="showQR = false" 
    />
  </div>
</template>

<script>
import { fetchAPI } from '../services/api';
import QRShare from './QRShare.vue';

export default {
  name: 'GambleSplitScreen',
  components: {
    QRShare
  },
  props: ['billTotal', 'people'],
  emits: ['navigate'],
  data() {
    return {
      winner: null,
      participants: [],
      localParticipants: [],
      localBillTotal: null,
      newPersonName: '',
      currentBillTotal: 0,
      showManualSetup: false,
      showQR: false,
    };
  },
  computed: {
    hasExistingData() {
      return (this.billTotal && this.people && this.people.length > 0) || this.hasTripData;
    },
    hasTripData() {
      // Check if there's trip data in localStorage or other source
      const tripData = localStorage.getItem('tripExpenseData');
      return tripData && JSON.parse(tripData).length > 0;
    },
    shareData() {
      return {
        winner: this.winner,
        participants: this.participants,
        amount: this.currentBillTotal
      };
    }
  },
  methods: {
    useExistingData(source) {
      if (source === 'bill' && this.billTotal && this.people) {
        this.currentBillTotal = this.billTotal;
        this.localParticipants = this.people.map(p => ({ 
          name: p.name, 
          id: Date.now() + Math.random() 
        }));
        this.gamble();
      } else if (source === 'trip') {
        // Load trip data from localStorage or other source
        const tripData = JSON.parse(localStorage.getItem('tripExpenseData') || '[]');
        if (tripData.length > 0) {
          this.currentBillTotal = tripData.reduce((sum, person) => sum + person.spent, 0);
          this.localParticipants = tripData.map(p => ({ 
            name: p.name, 
            id: Date.now() + Math.random() 
          }));
          this.gamble();
        }
      }
    },
    startManualSetup() {
      this.showManualSetup = true;
    },
    backToSourceSelection() {
      this.showManualSetup = false;
      this.localParticipants = [];
      this.localBillTotal = null;
      this.newPersonName = '';
    },
    addPerson() {
      if (this.newPersonName.trim()) {
        this.localParticipants.push({
          name: this.newPersonName.trim(),
          id: Date.now()
        });
        this.newPersonName = '';
      }
    },
    removePerson(index) {
      this.localParticipants.splice(index, 1);
    },
    quickAdd(count) {
      this.localParticipants = [];
      for (let i = 1; i <= count; i++) {
        this.localParticipants.push({
          name: `Person ${i}`,
          id: Date.now() + i
        });
      }
    },
    startGamble() {
      if (this.localParticipants.length >= 2 && this.localBillTotal > 0) {
        this.currentBillTotal = this.localBillTotal;
        this.gamble();
      }
    },
    async gamble() {
      const names = this.localParticipants.map(p => p.name.trim());
      
      try {
        const params = new URLSearchParams({
          totalAmount: this.currentBillTotal,
          numberOfPeople: names.length,
          names: names.join(','),
        });
        
        const data = await fetchAPI(`/gambles/split?${params}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
        
        this.participants = data.participants;
        this.winner = this.participants.find(p => !p.lucky);
      } catch (error) {
        console.error('Backend not available, using local gamble');
        this.localGamble(names);
      }
    },
    localGamble(names) {
      const unluckyIndex = Math.floor(Math.random() * names.length);
      this.participants = names.map((name, index) => ({
        name,
        lucky: index !== unluckyIndex
      }));
      this.winner = this.participants[unluckyIndex];
    },
    rollAgain() {
      this.gamble();
    },
    resetGamble() {
      this.winner = null;
      this.participants = [];
      this.localParticipants = [];
      this.localBillTotal = null;
      this.newPersonName = '';
      this.currentBillTotal = 0;
      this.showManualSetup = false;
    },
    showQRShare() {
      this.showQR = true;
    },
  },
};
</script>

<style scoped>
.gamble-split {
  padding: 1.5rem;
  max-width: 600px;
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

.source-selection {
  margin-bottom: 2rem;
}

.source-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.source-card h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.existing-data, .manual-setup {
  margin-bottom: 1.5rem;
}

.existing-data h3, .manual-setup h3 {
  font-size: 1.2rem;
  color: #555;
  margin: 0 0 1rem 0;
}

.data-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
}

.data-option:hover {
  background: #e9ecef;
  border-color: #667eea;
  transform: translateY(-1px);
}

.option-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
}

.option-text {
  flex: 1;
}

.option-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 0.25rem;
}

.option-subtitle {
  color: #666;
  font-size: 0.9rem;
}

.setup-section {
  margin-bottom: 2rem;
}

.setup-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.setup-card h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.amount-input {
  margin-bottom: 1.5rem;
}

.amount-input label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 600;
}

.input-field {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.75rem;
}

.input-field span {
  margin-right: 0.5rem;
  font-weight: bold;
  color: #666;
}

.input-field input {
  border: none;
  outline: none;
  font-size: 1rem;
  width: 100%;
}

.participants-section {
  margin-bottom: 1.5rem;
}

.participants-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 600;
}

.add-person {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.add-person input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.add-person button {
  padding: 0.75rem 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.add-person button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.people-list {
  margin-bottom: 1rem;
}

.person-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.remove-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 0.8rem;
}

.quick-add {
  text-align: center;
  margin-bottom: 1rem;
}

.quick-add p {
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.quick-add button {
  margin: 0 0.25rem;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
}

.quick-add button:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.gamble-btn {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
}

.gamble-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.gamble-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.setup-actions {
  display: flex;
  gap: 1rem;
}

.back-btn {
  flex: 1;
  padding: 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.back-btn:hover {
  background: #545b62;
}

.setup-actions .gamble-btn {
  flex: 2;
}

.results-section {
  text-align: center;
}

.winner-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.dice {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.winner-card h2 {
  font-size: 2rem;
  color: #e53e3e;
  margin: 0 0 1rem 0;
}

.amount {
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  margin: 1rem 0;
}

.winner-card p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.all-participants {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.participant {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.participant.winner {
  background: #ffe6e6;
  border-left: 4px solid #e53e3e;
}

.participant .name {
  font-weight: bold;
}

.participant .status {
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.roll-btn, .new-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.roll-btn {
  background: #667eea;
  color: white;
}

.roll-btn:hover {
  background: #5a67d8;
}

.new-btn {
  background: #6c757d;
  color: white;
}

.new-btn:hover {
  background: #545b62;
}

.qr-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  background: #28a745;
  color: white;
}

.qr-btn:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .gamble-split {
    padding: 1rem;
  }
  
  .setup-card {
    padding: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .roll-btn, .new-btn {
    width: 100%;
  }
}
</style>