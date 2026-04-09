<script>
    import { onMount } from 'svelte';
    import { Chart } from 'chart.js/auto';
  
    let donutChart;
  
    // Placeholder data for outlet sales
    let outletSalesData = {
      labels: ['Shop A', 'Shop B', 'Shop C'], // Outlet names
      datasets: [{
        data: [1500, 2500, 1000], // Sales data for each outlet
        backgroundColor: ['#FF5733', '#33FF57', '#3357FF'],
      }]
    };
  
    onMount(() => {
      // Create donut chart
      const ctx = document.getElementById('outletDonutChart').getContext('2d');
      donutChart = new Chart(ctx, {
        type: 'doughnut', // Doughnut chart type
        data: outletSalesData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  return `${tooltipItem.label}: $${tooltipItem.raw}`;
                }
              }
            }
          }
        }
      });
    });
  </script>
  
  <div class="max-w-lg">
    <h3 class="text-xl font-semibold">Sales Share by Outlet</h3>
    <!-- <canvas id="outletDonutChart"></canvas> -->
     <canvas id="outletDonutChart" class="w-fit h-64" ></canvas>
  </div>
  