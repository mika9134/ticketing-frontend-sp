<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { fetchOrderSalesContribution } from '../../../../apis/api-utils.js'; // Adjust the path as needed

  export let span; // Default timeline
  export let timeline; // Default span

  let chartCanvas;
  let barChart;

  let isFetching = false; // Prevent multiple fetches
  const maxBars = 30; // Maximum number of bars to display at once

  // Fetch data from the API
  async function fetchData(selectedSpan, selectedTimeline) {
    if (isFetching) return; // Prevent multiple fetches
    isFetching = true;

    try {
      const data = await fetchOrderSalesContribution(selectedSpan, selectedTimeline); // Fetch data from API
      if (!data || data.length === 0) {
        console.error('No data available to display the chart.');
        return;
      }

      const labels = data.map((item) => item.period); // Extract dates for x-axis
      const presales = data.map((item) => item.presales); // Extract presales values
      const sales = data.map((item) => item.sales); // Extract sales values

      // Limit the number of bars to `maxBars`
      const limitedLabels = labels.slice(0, maxBars);
      const limitedPresales = presales.slice(0, maxBars);
      const limitedSales = sales.slice(0, maxBars);

      updateChart(limitedLabels, limitedPresales, limitedSales); // Update the chart with fetched data
    } catch (error) {
      console.error('Error fetching order sales contribution:', error);
    } finally {
      isFetching = false;
    }
  }

  // Update the chart with the fetched data
  function updateChart(labels, presales, sales) {
    if (barChart) {
      barChart.data.labels = labels; // Update x-axis labels
      barChart.data.datasets[0].data = presales; // Update PreSales data
      barChart.data.datasets[1].data = sales; // Update Sales data
      barChart.update(); // Refresh the chart
    }
  }

  // Fetch data and update the chart
  $: fetchData(span, timeline); // Reactive statement to fetch data when span or timeline changes

  onMount(async () => {
    if (typeof window !== 'undefined') {
      const zoomPlugin = (await import('chartjs-plugin-zoom')).default; // Dynamic import
      Chart.register(zoomPlugin);

      const ctx = chartCanvas.getContext('2d');

      // Initialize the chart
      barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [], // Placeholder for x-axis labels
          datasets: [
            {
              label: 'PreSales',
              data: [], // Placeholder for PreSales data
              backgroundColor: '#5ce8d0', // Light green
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
            {
              label: 'Sales',
              data: [], // Placeholder for Sales data
              backgroundColor: '#3393ce', // Blue
              borderColor: '#3393ce',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'PreSales vs Sales Contribution',
              color:'white',
            },
            legend: {
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
              },
            },
            zoom: {
              pan: {
                enabled: true, // Enable panning
                mode: 'x', // Allow panning on the x-axis
              },
              zoom: {
                wheel: {
                  enabled: true, // Enable zooming with the mouse wheel
                },
                pinch: {
                  enabled: true, // Enable pinch zooming
                },
                mode: 'x', // Allow zooming on the x-axis
              },
            },
            datalabels: {
              anchor: "end",
              align: "end",
              formatter: function (value) {
                return null; // Hide data labels
              },
              color: "green",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  if (value >= 1e9) {
                    return `${(value / 1e9).toFixed(1)}B`; // Format billions
                  } else if (value >= 1e6) {
                    return `${(value / 1e6).toFixed(1)}M`; // Format millions
                  } else if (value >= 1e3) {
                    return `${(value / 1e3).toFixed(1)}K`; // Format thousands
                  }
                  return value; // Return the value as is for smaller numbers
                },
              },
            },
            x: {
              ticks: {
                callback: function (value, index, ticks) {
                  const label = this.getLabelForValue(value);

                  if (timeline === "Daily") {
                    // For daily timeline, trim the date if there are too many bars
                    if (ticks.length > 10) {
                      return label.split("-")[2]; // Show only the day
                    }
                    return label; // Show full date if fewer bars
                  } else if (timeline === "Monthly") {
                    // For monthly timeline, show full month names
                    return label; // Example: "January", "February", etc.
                    
                  } else if (timeline === "Yearly") {
                    // For yearly timeline, show the year
                    return label; // Example: "2021", "2022", etc.
                  }

                  return label; // Default fallback
                },
              },
            },
          },
        },
      });
    }
  });

</script>

<div>
  <h1 class="flex justify-center font-semibold text-gray-900 dark:text-white">PreSales vs Sales Contribution</h1>
  <canvas bind:this={chartCanvas} width="400" height="200"></canvas>
</div>
