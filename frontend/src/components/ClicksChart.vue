<template>
  <div class="chart-container">
    <h3>📈 Click Activity (Last 7 Days)</h3>
    <div v-if="loading" class="loading">Loading chart...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <canvas v-else ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  props: {
    shortCode: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    const loading = ref(true);
    const error = ref(null);
    let chartInstance = null;

    const analyticsBase = import.meta.env.VITE_ANALYTICS_API || 'http://localhost:4001';

    async function loadChartData() {
      loading.value = true;
      error.value = null;

      try {
        // Fetch click events from analytics service
        const response = await fetch(`${analyticsBase}/analytics/${props.shortCode}`);
        
        if (!response.ok) {
          throw new Error('Failed to load analytics data');
        }

        const events = await response.json();
        
        // Process data: group by date
        const clicksByDate = processClickData(events);
        
        // Create chart
        createChart(clicksByDate);
      } catch (e) {
        console.error('Chart error:', e);
        error.value = 'Unable to load chart data';
      } finally {
        loading.value = false;
      }
    }

    function processClickData(events) {
      // Get last 7 days
      const days = [];
      const clickCounts = {};
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        days.push(dateStr);
        clickCounts[dateStr] = 0;
      }

      // Count clicks per day
      events.forEach(event => {
        if (event.created_at) {
          const eventDate = new Date(event.created_at).toISOString().split('T')[0];
          if (clickCounts.hasOwnProperty(eventDate)) {
            clickCounts[eventDate]++;
          }
        }
      });

      return {
        labels: days.map(d => {
          const date = new Date(d);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        data: days.map(d => clickCounts[d])
      };
    }

    function createChart(clicksByDate) {
      if (!chartCanvas.value) return;

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
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14
              },
              bodyFont: {
                size: 13
              },
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
                precision: 0,
                font: {
                  size: 12
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              ticks: {
                font: {
                  size: 12
                }
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    onMounted(() => {
      loadChartData();
    });

    watch(() => props.shortCode, () => {
      loadChartData();
    });

    return {
      chartCanvas,
      loading,
      error
    };
  }
};
</script>

<style scoped>
.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-top: 1rem;
}
.chart-container h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}
.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}
.error {
  color: #d32f2f;
}
canvas {
  max-height: 300px;
}
</style>
