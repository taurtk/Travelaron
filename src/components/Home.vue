<template>
  <div class="home-screen">
    <header class="header">
      <h1 class="app-name">Travelaron</h1>
      <div class="profile-icon" @click="$emit('navigate', 'Profile')">
        <span>👤</span>
      </div>
    </header>

    <main class="content">
      <div class="inputs" @click.stop>
        <div class="input-group">
          <label for="bill-total">Bill Total</label>
          <input type="number" id="bill-total" v-model.number="total" placeholder="Enter total amount" />
        </div>
        <div class="input-group">
          <label for="num-people">Number of People</label>
          <input type="number" id="num-people" v-model.number="numPeople" placeholder="Enter number of people" />
        </div>
      </div>
      <div class="actions">
        <button class="btn-primary" @click="handleSplit">
          💰 Split Bill
        </button>
      </div>
      
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="quick-buttons">
          <button class="quick-btn" @click="quickSplit(500, 2)">₹500 / 2 people</button>
          <button class="quick-btn" @click="quickSplit(1000, 4)">₹1000 / 4 people</button>
          <button class="quick-btn" @click="quickSplit(1500, 3)">₹1500 / 3 people</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HomeScreen',
  emits: ['navigate', 'startSplit'],
  data() {
    return {
      total: null,
      numPeople: null,
    };
  },
  methods: {
    handleSplit() {
      if (this.total > 0 && this.numPeople > 0) {
        this.$emit('startSplit', this.total, this.numPeople);
      } else {
        alert('Please enter a valid bill total and number of people.');
      }
    },
    quickSplit(amount, people) {
      this.total = amount;
      this.numPeople = people;
      this.handleSplit();
    },
  },
};
</script>

<style scoped>
.home-screen {
  font-family: sans-serif;
  padding: 2rem;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
.header {
  text-align: center;
  margin-bottom: 3rem;
}
.app-name {
  font-weight: bold;
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.inputs {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}
.input-group {
  margin-bottom: 1.5rem;
}
.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 600;
  font-size: 1.1rem;
}
.input-group input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  box-sizing: border-box;
  font-size: 1.1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.actions {
  margin-bottom: 2rem;
}
.quick-actions {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}
.quick-actions h3 {
  margin: 0 0 1rem 0;
  color: #333;
  text-align: center;
}
.quick-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.quick-btn {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.quick-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-1px);
}
button {
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

@media (max-width: 768px) {
  .home-screen {
    padding: 1rem;
  }
  
  .inputs, .quick-actions {
    padding: 1.5rem;
  }
  
  .app-name {
    font-size: 1.5rem;
  }
}
</style>
