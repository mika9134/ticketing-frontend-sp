<!-- Add this to your Svelte component where you want the chart -->
<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
  
    let pieChart;
  
    // Placeholder data
    let territoriesData = {
      labels: ["North", "South", "East", "West"], // Territory names
      datasets: [{
        data: [5000, 4500, 4000, 3500], // Sales data for each territory
        backgroundColor: ['#079d6d', '#33FF57', '#3357FF', '#00acfa'],
        hoverOffset: 4
      }]
    };
  
    onMount(() => {
      // Create pie chart
      const ctx = document.getElementById('territoryPieChart').getContext('2d');
      pieChart = new Chart(ctx, {
        type: 'pie', // Pie chart type
        data: territoriesData,
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
  
  <div class="flex flex-1  max-w-[400px] max-h-[400px]">
    <h3 class="text-xl font-semibold">Sales by Territory</h3>
    <canvas id="territoryPieChart"></canvas>
  </div>
  