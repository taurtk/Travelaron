<script setup>
import { ref, computed } from 'vue';
import HomeScreen from './components/Home.vue';
import SplitScreen from './components/Split.vue';
import GambleScreen from './components/Gamble.vue';
import FoodDiscoveryScreen from './components/Fooddiscovery.vue';
import ProfileScreen from './components/Profile.vue';
import SettingsScreen from './components/Settings.vue';
import TripScreen from './components/Trip.vue';
import AIInsightsScreen from './components/AIInsights.vue';

// App State
const billTotal = ref(0);
const people = ref([]);
const currentScreen = ref('Home'); // Home, Split, Gamble, FoodDiscovery, Profile, Settings, Trip

// Navigation
const navigateTo = (screen) => {
  console.log(`Navigating to: ${screen}`);
  currentScreen.value = screen;
};

// Computed property to get the current component
const activeComponent = computed(() => {
  switch (currentScreen.value) {
    case 'Split':
      return SplitScreen;
    case 'Gamble':
      return GambleScreen;
    case 'FoodDiscovery':
      return FoodDiscoveryScreen;
    case 'Profile':
      return ProfileScreen;
    case 'Settings':
      return SettingsScreen;
    case 'Trip':
      return TripScreen;
    case 'AIInsights':
      return AIInsightsScreen;
    default:
      return HomeScreen;
  }
});

// Function to start the split process
const startSplit = (total, numPeople) => {
  billTotal.value = total;
  // Create an array of people with empty names
  people.value = Array.from({ length: numPeople }, (_, i) => ({
    id: i,
    name: `Person ${i + 1}`,
    amount: 0,
  }));
  navigateTo('Split');
};
</script>

<template>
  <div id="app">
    <!-- Sidebar Navigation -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <h1 class="app-title">🍽️ Travelaron</h1>
        <p class="app-subtitle">Smart Bill Splitting</p>
      </div>
      
      <div class="nav-menu">
        <button @click="navigateTo('Home')" :class="{ active: currentScreen === 'Home' }" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Home</span>
        </button>
        <button @click="navigateTo('Split')" :class="{ active: currentScreen === 'Split' }" class="nav-item">
          <span class="nav-icon">💰</span>
          <span class="nav-text">Split Bill</span>
        </button>
        <button @click="navigateTo('Trip')" :class="{ active: currentScreen === 'Trip' }" class="nav-item">
          <span class="nav-icon">✈️</span>
          <span class="nav-text">Trip Expenses</span>
        </button>
        <button @click="navigateTo('Gamble')" :class="{ active: currentScreen === 'Gamble' }" class="nav-item">
          <span class="nav-icon">🎲</span>
          <span class="nav-text">Gamble Split</span>
        </button>
        <button @click="navigateTo('FoodDiscovery')" :class="{ active: currentScreen === 'FoodDiscovery' }" class="nav-item">
          <span class="nav-icon">🔍</span>
          <span class="nav-text">Food Discovery</span>
        </button>
        <button @click="navigateTo('Profile')" :class="{ active: currentScreen === 'Profile' }" class="nav-item">
          <span class="nav-icon">👤</span>
          <span class="nav-text">Profile</span>
        </button>
        <button @click="navigateTo('AIInsights')" :class="{ active: currentScreen === 'AIInsights' }" class="nav-item">
          <span class="nav-icon">🤖</span>
          <span class="nav-text">AI Insights</span>
        </button>
        <button @click="navigateTo('Settings')" :class="{ active: currentScreen === 'Settings' }" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text">Settings</span>
        </button>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content">
      <component
        :is="activeComponent"
        :billTotal="billTotal"
        :people="people"
        @navigate="navigateTo"
        @startSplit="startSplit"
      />
    </main>
  </div>
</template>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  color: #2d3748;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

/* Improve touch targets - mobile first */
@media (max-width: 768px) {
  button, input, select, textarea {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Prevent zoom on input focus on iOS */
  input, select, textarea {
    font-size: 16px;
  }
}

/* Desktop styles */
@media (min-width: 769px) {
  button {
    min-height: 40px;
    min-width: 40px;
  }
  
  input, select, textarea {
    min-height: 40px;
    font-size: 14px;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Better button styles */
button {
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;
  outline: none;
}

/* Only scale on mobile */
@media (max-width: 768px) {
  button:active {
    transform: scale(0.98);
  }
}

/* Hover effects for desktop */
@media (min-width: 769px) {
  button:hover {
    transform: translateY(-1px);
  }
}

/* Better input styles for mobile */
input, select, textarea {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 8px;
  outline: none;
}

/* Loading states and animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 2s infinite;
}

/* Utility classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }

.p-1 { padding: 0.5rem; }
.p-2 { padding: 1rem; }
.p-3 { padding: 1.5rem; }

.hidden { display: none; }
.block { display: block; }
.flex { display: flex; }
.grid { display: grid; }

.w-full { width: 100%; }
.h-full { height: 100%; }

/* Mobile-specific styles */
@media (max-width: 768px) {
  /* Larger touch targets on mobile */
  button {
    min-height: 48px !important;
    min-width: 48px !important;
  }
  
  input, select, textarea {
    font-size: 16px !important;
    min-height: 48px !important;
  }
  
  /* Better spacing for mobile */
  .nav-item, button, input {
    margin: 2px 0;
  }
  
  /* Mobile utility classes */
  .mobile-hidden { display: none !important; }
  .mobile-block { display: block !important; }
  .mobile-flex { display: flex !important; }
  
  .mobile-text-center { text-align: center !important; }
  .mobile-text-left { text-align: left !important; }
  
  .mobile-p-1 { padding: 0.5rem !important; }
  .mobile-p-2 { padding: 1rem !important; }
  
  .mobile-mb-1 { margin-bottom: 0.5rem !important; }
  .mobile-mb-2 { margin-bottom: 1rem !important; }
}

/* Desktop utility classes */
@media (min-width: 769px) {
  .desktop-hidden { display: none !important; }
  .desktop-block { display: block !important; }
  .desktop-flex { display: flex !important; }
}

#app {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* Sidebar Navigation */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0,0,0,0.1);
  position: fixed;
  height: 100vh;
  z-index: 1000;
}

.sidebar-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  text-align: center;
}

.app-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.app-subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 500;
}

.nav-menu {
  flex: 1;
  padding: 1.5rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 2rem;
  background: none;
  border: none;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  text-align: left;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255,255,255,0.1);
  color: white;
  border-left-color: rgba(255,255,255,0.3);
}

.nav-item.active {
  background: rgba(255,255,255,0.15);
  color: white;
  border-left-color: white;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  flex: 1;
}

/* Main Content Area */
.main-content {
  flex: 1;
  margin-left: 280px;
  background: #f8fafc;
  min-height: 100vh;
  overflow-x: auto;
  width: calc(100vw - 280px);
  padding: 1rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }
  
  .main-content {
    margin-left: 240px;
    width: calc(100vw - 240px);
  }
  
  .sidebar-header {
    padding: 1.5rem;
  }
  
  .app-title {
    font-size: 1.5rem;
  }
  
  .nav-item {
    padding: 0.875rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  
  .app-title {
    font-size: 1.3rem;
    margin-bottom: 0.25rem;
  }
  
  .app-subtitle {
    font-size: 0.8rem;
  }
  
  .main-content {
    margin-left: 0;
    margin-top: 120px;
    width: 100vw;
    padding: 1rem;
    min-height: calc(100vh - 120px);
  }
  
  .nav-menu {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
    gap: 0.25rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .nav-menu::-webkit-scrollbar {
    display: none;
  }
  
  .nav-item {
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    min-width: 70px;
    text-align: center;
    border-left: none;
    border-bottom: 3px solid transparent;
    border-radius: 8px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .nav-item:hover,
  .nav-item.active {
    border-left: none;
    border-bottom-color: white;
    background: rgba(255,255,255,0.2);
  }
  
  .nav-icon {
    font-size: 1.1rem;
  }
  
  .nav-text {
    font-size: 0.7rem;
    font-weight: 500;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.5rem;
    margin-top: 110px;
    min-height: calc(100vh - 110px);
  }
  
  .sidebar-header {
    padding: 0.75rem;
  }
  
  .nav-item {
    min-width: 60px;
    padding: 0.5rem 0.25rem;
  }
  
  .nav-icon {
    font-size: 1rem;
  }
  
  .nav-text {
    font-size: 0.65rem;
  }
  
  .app-title {
    font-size: 1.1rem;
  }
}
</style>
