<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import ChartDataLabels from 'chartjs-plugin-datalabels'; 
  import { fetchPurchasedVssold } from '../../../../apis/api-utils'; 
  import { themeStore } from '../../../../stores/themeStore.js';
  import { get } from 'svelte/store';

  export let timeline = "Daily"; 
  export let span = 7; 

  let pieChart;
  let totalSold = 0;
  let totalStockIn = 0;

  let soldPercentage = 0;
  let stockInPercentage = 0;

  let canvasEl; // bound canvas reference

  let currentTheme = get(themeStore);
  themeStore.subscribe(async (value) => {
    currentTheme = value;
    if (pieChart) {
      await pieChart.destroy();
      await setupChart();
      fetchData(span, timeline);
    }
  });

  // Fetch data from backend
  async function fetchData(selectedSpan, selectedTimeline) {
    try {
      const data = await fetchPurchasedVssold(selectedSpan, selectedTimeline);

      // Extract totals
      totalSold = data.reduce((sum, r) => sum + (r.sold ?? 0), 0);
      totalStockIn = data.reduce((sum, r) => sum + (r.stock_in ?? 0), 0);

      const grandTotal = totalSold + totalStockIn;

      // Percentages
      soldPercentage = grandTotal ? Math.round((totalSold / grandTotal) * 100) : 0;
      stockInPercentage = grandTotal ? Math.round((totalStockIn / grandTotal) * 100) : 0;

      updateChart(soldPercentage, stockInPercentage);
    } catch (error) {
      console.error('Error fetching Sold vs Purchased:', error);
    }
  }

  async function setupChart() {
    if (!canvasEl) return; // Guard to avoid null

    const ctx = canvasEl.getContext('2d');
    Chart.register(ChartDataLabels);

    pieChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sold', 'Purchased'],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ['#80ed99', '#46B1F7'], 
            hoverBackgroundColor: ['#0fd070', '#3b82f6'], 
            borderWidth: 1,
            datalabels: {
              color: 'white'
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "bottom",
            display: false,
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              color: currentTheme == "light" ? "black" : "white",
            },
          },
        },
      },
    });
  }

  $: fetchData(span, timeline);

  onMount(() => {
    setupChart();
  });

  function updateChart(sold, stockIn) {
    if (pieChart) {
      pieChart.data.datasets[0].data = [sold, stockIn];
      pieChart.update();
    }
  }
</script>

<div class="flex-1">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">
    Stock
  </h3>

  <!-- Compact layout -->
  <div class="flex justify-around items-center gap-4 mb-4">
    <!-- Sold -->
    <div class="text-center">
      <h5 class="text-xl font-bold text-gray-900 dark:text-white">{totalSold}</h5>
      <p class="text-sm font-normal text-gray-700 dark:text-gray-100">Sold</p>
      <span class="text-sm font-semibold text-gray-700 dark:text-gray-100">{soldPercentage}%</span>
    </div>

    <!-- StockIn -->
    <div class="text-center">
      <h5 class="text-xl font-bold text-gray-900 dark:text-white">{totalStockIn}</h5>
      <p class="text-sm font-normal text-gray-700 dark:text-gray-100">Purchased</p>
      <span class="text-sm font-semibold text-gray-700 dark:text-gray-100">{stockInPercentage}%</span>
    </div>
  </div>

  <!-- Pie chart -->
  <div class="flex justify-center w-full">
    <div class="flex justify-center w-fit">
      <canvas bind:this={canvasEl} class="w-[400px] grow-0" width="150" height="150"></canvas>
    </div>
  </div>
</div>
