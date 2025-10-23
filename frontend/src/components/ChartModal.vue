<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>📊 Click Trend - {{ shortCode }}</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-controls">
        <div class="period-toggle">
          <button 
            :class="['period-btn', { active: period === '7days' }]" 
            @click="changePeriod('7days')"
          >
            7 Days
          </button>
          <button 
            :class="['period-btn', { active: period === '24hours' }]" 
            @click="changePeriod('24hours')"
          >
            24 Hours
          </button>
        </div>
      </div>
      <div class="modal-body">
        <div v-if="loading" class="loading">Loading chart data...</div>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="noData" class="no-data">
          <p>📉 No click data yet</p>
          <p class="muted">Share this link to start collecting analytics!</p>
        </div>
        <div v-show="!loading && !error && !noData" class="chart-wrapper">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  props: {
    show: Boolean,
    shortCode: String,
    shortUrl: String
  },
  emits: ['close'],
  setup(props) {
    const chartCanvas = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const noData = ref(false);
    const period = ref('7days'); // '7days' or '24hours'
    let chartInstance = null;

    const analyticsBase = import.meta.env.VITE_ANALYTICS_API || 'http://localhost:4001';

    watch(() => props.show, async (newVal) => {
      console.log('Modal show changed:', newVal, 'shortCode:', props.shortCode);
      if (newVal && props.shortCode) {
        period.value = '7days'; // Reset to 7 days when opening
        await loadChartData();
      }
    });

    function changePeriod(newPeriod) {
      period.value = newPeriod;
      loadChartData();
    }

    async function loadChartData() {
      loading.value = true;
      error.value = null;
      noData.value = false;

      try {
        console.log(`Fetching analytics for: ${props.shortCode}`);
        const response = await fetch(`${analyticsBase}/analytics/${props.shortCode}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to load analytics data`);
        }

        const events = await response.json();
        console.log('Events received:', events);
        
        if (!events || events.length === 0) {
          noData.value = true;
          loading.value = false;
          return;
        }

        // Process data based on selected period
        const clicksByDate = period.value === '24hours' 
          ? processClickDataByHour(events) 
          : processClickDataByDay(events);
        
        // Wait for canvas to be available
        await nextTick();
        
        // Create chart
        createChart(clicksByDate);
      } catch (e) {
        console.error('Chart error:', e);
        error.value = `Unable to load chart data: ${e.message}`;
      } finally {
        loading.value = false;
      }
    }

    function processClickDataByDay(events) {
      // Get last 7 days in local timezone
      const days = [];
      const clickCounts = {};
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        // local date string instead of ISO
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        days.push(dateStr);
        clickCounts[dateStr] = 0;
      }

      // Count clicks per day 
      events.forEach(event => {
        if (event.created_at) {
          // Convert UTC string to local Date object
          const eventDate = new Date(event.created_at);
          const year = eventDate.getFullYear();
          const month = String(eventDate.getMonth() + 1).padStart(2, '0');
          const day = String(eventDate.getDate()).padStart(2, '0');
          const localDateStr = `${year}-${month}-${day}`;
          
          if (clickCounts.hasOwnProperty(localDateStr)) {
            clickCounts[localDateStr]++;
          }
        }
      });

      console.log('Processed click data (7 days):', { days, clickCounts });

      return {
        labels: days.map(d => {
          const [year, month, day] = d.split('-');
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        data: days.map(d => clickCounts[d])
      };
    }

    function processClickDataByHour(events) {
      // Get last 24 hours in local timezone
      const hours = [];
      const clickCounts = {};
      
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const hourDate = new Date(now.getTime() - (i * 60 * 60 * 1000));
        hourDate.setMinutes(0, 0, 0);
        hourDate.setSeconds(0, 0);
        
        // create key as local time string
        const year = hourDate.getFullYear();
        const month = String(hourDate.getMonth() + 1).padStart(2, '0');
        const day = String(hourDate.getDate()).padStart(2, '0');
        const hour = String(hourDate.getHours()).padStart(2, '0');
        const hourKey = `${year}-${month}-${day}T${hour}`;
        
        hours.push(hourKey);
        clickCounts[hourKey] = 0;
      }

      // Count clicks per hour
      events.forEach(event => {
        if (event.created_at) {
          const eventDate = new Date(event.created_at);
          const year = eventDate.getFullYear();
          const month = String(eventDate.getMonth() + 1).padStart(2, '0');
          const day = String(eventDate.getDate()).padStart(2, '0');
          const hour = String(eventDate.getHours()).padStart(2, '0');
          const hourKey = `${year}-${month}-${day}T${hour}`;
          
          console.log(`UTC: ${event.created_at} -> Local: ${eventDate.toString()} -> Key: ${hourKey}`);
          
          if (clickCounts.hasOwnProperty(hourKey)) {
            clickCounts[hourKey]++;
          } else {
            console.warn(`Key ${hourKey} not in range. First key: ${hours[0]}, Last key: ${hours[hours.length-1]}`);
          }
        }
      });

      console.log('Processed click data (24 hours):', { hours: hours.slice(0, 5), clickCounts });

      return {
        labels: hours.map(h => {
          const [datePart, hourPart] = h.split('T');
          const [year, month, day] = datePart.split('-');
          const date = new Date(year, month - 1, day, hourPart);
          return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            hour12: true 
          });
        }),
        data: hours.map(h => clickCounts[h])
      };
    }

    function createChart(clicksByDate) {
      if (!chartCanvas.value) {
        console.error('Canvas not found');
        return;
      }

      // Destroy existing chart
      if (chartInstance) {
        chartInstance.destroy();
      }

      const ctx = chartCanvas.value.getContext('2d');
      
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: clicksByDate.labels,
          datasets: [{
            label: 'Clicks',
            data: clicksByDate.data,
            borderColor: '#1a73e8',
            backgroundColor: 'rgba(26, 115, 232, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#1a73e8',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2.5,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleColor: '#fff',
              bodyColor: '#fff',
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `Clicks: ${context.parsed.y}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });

      console.log('Chart created successfully');
    }

    return {
      chartCanvas,
      loading,
      error,
      noData,
      period,
      changePeriod
    };
  }
};
</script>

<style scoped>
.modal-overlay {
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

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-controls {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
}

.period-toggle {
  display: inline-flex;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.period-btn {
  background: white;
  color: #666;
  border: none;
  border-right: 1px solid #ddd;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.period-btn:last-child {
  border-right: none;
}

.period-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.period-btn.active {
  background: #1a73e8;
  color: white;
}

.period-btn.active:hover {
  background: #1557b0;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.chart-wrapper {
  min-height: 280px;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
}

.error {
  color: #d32f2f;
}

.no-data {
  color: #333;
}

.no-data p {
  margin: 0.5rem 0;
}

.no-data .muted {
  font-size: 0.9rem;
  color: #888;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  max-height: 380px;
}

canvas {
  display: block;
  max-width: 100%;
  max-height: 380px;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
  }
  
  .modal-header h3 {
    font-size: 1.1rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  canvas {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1rem;
  }
  
  .close-btn {
    width: 28px;
    height: 28px;
    font-size: 1.3rem;
  }
  
  .modal-controls {
    padding: 0.75rem 1rem;
  }
  
  .period-btn {
    padding: 0.35rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  canvas {
    max-height: 250px;
  }
  
  .chart-wrapper {
    min-height: 220px;
  }
}
</style>
