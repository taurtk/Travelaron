<template>
  <div class="trip-calculator">
    <div class="simple-header">
      <h1>✈️ Trip Expenses</h1>
      <p>Who spent what? Let's settle up!</p>
    </div>

    <!-- Input Section -->
    <div class="input-section">
      <h2>Add People & Expenses</h2>
      
      <div class="people-list">
        <div v-for="(person, index) in people" :key="index" class="person-row">
          <input 
            v-model="person.name" 
            placeholder="Name" 
            class="name-field"
          />
          <div class="amount-field">
            <span>₹</span>
            <input 
              type="number" 
              v-model.number="person.spent" 
              placeholder="0" 
              class="amount-input"
            />
          </div>
          <button @click="removePerson(index)" class="remove-btn" v-if="people.length > 1">
            ✕
          </button>
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="addPerson" class="add-btn">+ Add Person</button>
        <button @click="calculate" class="calculate-btn" :disabled="!canCalculate">
          Calculate Split
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="showResults" class="results-section">
      <div class="summary">
        <div class="summary-item">
          <div class="big-number">₹{{ totalAmount.toFixed(0) }}</div>
          <div class="label">Total Spent</div>
        </div>
        <div class="summary-item">
          <div class="big-number">₹{{ perPersonShare.toFixed(0) }}</div>
          <div class="label">Per Person</div>
        </div>
      </div>
      
      <div class="settlements">
        <h3>Who Owes What</h3>
        <div v-if="transactions.length === 0" class="all-settled">
          <div class="emoji">🎉</div>
          <div>Everyone's even!</div>
        </div>
        <div v-else class="settlement-list">
          <div v-for="(transaction, index) in transactions" :key="index" class="settlement">
            <div class="settlement-text">
              <strong>{{ transaction.from }}</strong> pays <strong>{{ transaction.to }}</strong>
            </div>
            <div class="settlement-amount">₹{{ transaction.amount.toFixed(0) }}</div>
          </div>
        </div>
      </div>
      
      <div class="trip-share-actions">
        <button @click="showQRShare" class="qr-btn">📱 QR Share</button>
      </div>
    </div>
    
    <!-- QR Share Modal -->
    <QRShare 
      :show="showQR" 
      :data="shareData" 
      type="trip_expenses" 
      @close="showQR = false" 
    />
  </div>
</template>

<script>
import QRShare from './QRShare.vue';

export default {
  components: {
    QRShare
  },
  data() {
    return {
      people: [{ name: '', spent: 0 }],
      transactions: [],
      totalAmount: 0,
      perPersonShare: 0,
      showResults: false,
      showQR: false,
    };
  },
  computed: {
    canCalculate() {
      const validPeople = this.people.filter(p => p.name.trim() && p.spent > 0);
      return validPeople.length >= 2;
    },
    shareData() {
      return this.people.filter(p => p.name.trim() && p.spent > 0);
    }
  },
  async mounted() {
    // Import API service
    const api = await import('../services/api.js');
    this.$api = api.default;
  },
  methods: {
    addPerson() {
      this.people.push({ name: '', spent: 0 });
    },
    removePerson(index) {
      this.people.splice(index, 1);
    },
    async calculate() {
      if (!this.canCalculate) return;

      const validPeople = this.people.filter(p => p.name.trim() && p.spent > 0);

      try {
        // Use the backend settlement API
        const expenses = validPeople.map(person => ({
          paidBy: person.name.trim(),
          amount: person.spent
        }));

        const response = await this.$api.post('/settlements/compute', {
          names: validPeople.map(p => p.name.trim()),
          expenses: expenses,
          currency: 'INR'
        });

        this.transactions = response.data.settlements;
        this.totalAmount = response.data.total;
        this.perPersonShare = response.data.perPersonShare;
        this.showResults = true;
      } catch (error) {
        console.error('Error calculating settlements:', error);
        // Fallback to local calculation
        this.localCalculate();
        this.showResults = true;
      }
    },
    localCalculate() {
      const validPeople = this.people.filter(p => p.name.trim() && p.spent > 0);
      const totalSpent = validPeople.reduce((sum, person) => sum + person.spent, 0);
      const averageSpent = totalSpent / validPeople.length;

      const balances = validPeople.map(person => ({
        name: person.name.trim(),
        balance: person.spent - averageSpent,
      }));

      const debtors = balances.filter(p => p.balance < 0);
      const creditors = balances.filter(p => p.balance > 0);

      const transactions = [];
      let i = 0, j = 0;

      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amount = Math.min(-debtor.balance, creditor.balance);

        transactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: amount,
        });

        debtor.balance += amount;
        creditor.balance -= amount;

        if (debtor.balance === 0) i++;
        if (creditor.balance === 0) j++;
      }

      this.transactions = transactions;
      this.totalAmount = totalSpent;
      this.perPersonShare = averageSpent;
    },
    showQRShare() {
      this.showQR = true;
    },
  },
};
</script>

<style scoped>
.trip-calculator {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  font-family: sans-serif;
}

.simple-header {
  text-align: center;
  margin-bottom: 2rem;
}

.simple-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.simple-header p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.input-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.input-section h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.people-list {
  margin-bottom: 1.5rem;
}

.person-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.name-field {
  flex: 2;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.name-field:focus {
  outline: none;
  border-color: #667eea;
}

.amount-field {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
}

.amount-field span {
  margin-right: 0.5rem;
  font-weight: bold;
  color: #666;
}

.amount-input {
  border: none;
  outline: none;
  font-size: 1rem;
  width: 100%;
}

.remove-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 0.9rem;
}

.remove-btn:hover {
  background: #ff3742;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.add-btn {
  flex: 1;
  padding: 1rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}

.add-btn:hover {
  background: #38a169;
}

.calculate-btn {
  flex: 2;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
}

.calculate-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.calculate-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.results-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.summary {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  text-align: center;
}

.big-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.label {
  color: #666;
  font-size: 1rem;
}

.settlements h3 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 1rem 0;
  text-align: center;
}

.all-settled {
  text-align: center;
  padding: 2rem;
  background: #d4edda;
  border-radius: 8px;
  color: #155724;
}

.all-settled .emoji {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.settlement-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settlement {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.settlement-text {
  font-size: 1.1rem;
  color: #333;
}

.settlement-amount {
  font-size: 1.3rem;
  font-weight: bold;
  color: #e53e3e;
}

@media (max-width: 768px) {
  .trip-calculator {
    padding: 1rem;
  }
  
  .person-row {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .name-field, .amount-field {
    width: 100%;
  }
  
  .summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .big-number {
    font-size: 2rem;
  }
  
  .settlement {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}

.trip-share-actions {
  text-align: center;
  margin-top: 1.5rem;
}

.qr-btn {
  padding: 1rem 2rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}

.qr-btn:hover {
  background: #218838;
}
</style>