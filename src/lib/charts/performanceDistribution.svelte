<script>
    import { onMount } from 'svelte';
    import { Chart } from 'chart.js';
  
    let histogramChart;
  
    // Placeholder data for sales distribution
    let salesDistributionData = {
      labels: ['0-1000', '1000-2000', '2000-3000', '3000-4000', '4000-5000'], // Sales ranges
      datasets: [{
        label: 'Sales Distribution',
        data: [5, 10, 7, 3, 2], // Number of routes or outlets in each sales range
        backgroundColor: '#00acfa',
      }]
    };
  
    onMount(() => {
      // Create histogram chart
      const ctx = document.getElementById('salesHistogram').getContext('2d');
      histogramChart = new Chart(ctx, {
        type: 'bar', // Using bar chart to represent histogram
        data: salesDistributionData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  return `${tooltipItem.label}: ${tooltipItem.raw} outlets/routes`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Sales Range'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Number of Routes/Outlets'
              }
            }
          }
        }
      });
    });
  </script>
  
  <div>
    <h3 class="text-xl font-semibold">Sales Performance Distribution (Histogram)</h3>
    <canvas id="salesHistogram"></canvas>
  </div>
  