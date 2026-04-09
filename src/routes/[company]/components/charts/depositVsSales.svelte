<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import ChartDataLabels from 'chartjs-plugin-datalabels';
  import { fetchTotalDeposit } from '../../../../apis/api-utils.js';
  import { themeStore } from '../../../../stores/themeStore.js';
  import { get } from 'svelte/store';

  export let span = 7;
  export let timeline = 'Daily';
  export let territory = '';
  export let route = '';
  export let point_of_sale = '';
  export let employee = '';

  let maxItems = 10;

  let chart;
  let chartInitialized = false;

  let currentTheme = get(themeStore);

  let totalSales = 0;
  let totalDeposit = 0;
  let remaining = 0;

  let depositPercentage = 0;
  let remainingPercentage = 100;

  let time_series = [];

  /* ===============================
     THEME HANDLING
  =============================== */
  themeStore.subscribe((value) => {
    currentTheme = value;

    if (chart) {
      chart.options.plugins.legend.labels.color =
        currentTheme === 'dark' ? '#fff' : '#111';
      chart.update();
    }
  });

 
  function initChart() {
    const canvas = document.getElementById('depositChart');
    if (!canvas) return;

    chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Deposit', 'Remaining'],
        datasets: [
          {
            data: [0, 100],
            borderWidth: 0,
            hoverOffset: 8,
            backgroundColor:['#177e89', "#084c61"],
            hoverBackgroundColor:['#177e89', "#084c61"],
            borderColor: [currentTheme == "light"? "white" : "#002a47",currentTheme == "light"? "white" : "#002a47"],
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: currentTheme === 'dark' ? '#fff' : '#111'
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw}%`
            }
          },
          datalabels: {
            color: '#fff',
            formatter: (value) => `${value}%`,
            font: {
              weight: 'bold',
              size: 12
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    chartInitialized = true;
  }

  function updateChart(depositPct, remainingPct) {
    if (!chartInitialized || !chart) return;

    if (!Number.isFinite(depositPct) || !Number.isFinite(remainingPct)) {
      depositPct = 0;
      remainingPct = 100;
    }

    chart.data.datasets[0].data = [depositPct, remainingPct];
    chart.update();
  }

  /* ===============================
     FETCH DATA
  =============================== */
  async function fetchData(span, timeline, territory, route, point_of_sale, employee) {
    try {
      const data = await fetchTotalDeposit(
        span,
        timeline,
        territory,
        route,
        point_of_sale,
        employee
      );

      time_series = data.timeseries ?? [];

      if (!time_series.length || !data.recent) {
        updateChart(0, 100);
        return;
      }

      const period = data.recent.period;

	  

      totalSales = Math.round(
        time_series.reduce(
          (sum, r) => r.period === period ? sum + r.sales : sum,
          0
        )
      );

      totalDeposit = Math.round(
        time_series.reduce(
          (sum, r) => r.period === period ? sum + r.deposit : sum,
          0
        )
      );

      remaining = Math.round(
        time_series.reduce(
          (sum, r) => r.period === period ? sum + r.remaining : sum,
          0
        )
      );

      depositPercentage =
        remaining > 0
          ? Math.round((totalDeposit * 100) / remaining)
          : 0;

      remainingPercentage = 100 - depositPercentage;

      updateChart(depositPercentage, remainingPercentage);

    } catch (err) {
      console.error('Sales vs Deposit fetch failed:', err);
      updateChart(0, 100);
    }
  }


  $: fetchData(span, timeline, territory, route, point_of_sale, employee);


  onMount(async () => {
    initChart();
    await fetchData(span, timeline, territory, route, point_of_sale, employee);
  });
</script>

<!-- ===============================
     UI
=============================== -->

<div class="grid grid-cols-2 gap-4">

  <!-- LEFT: CHART + STATS -->
  <div>
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">
      Deposit vs Remaining
    </h3>

<div>
  
  <div class="flex justify-around pl-2 pr-2">
<div class="stat text-gray-300 w-fit rounded-lg shadow-lg">
    <div class="stat-title text-[#002a47] dark:text-gray-100">Deposit</div>
    <div class="stat-value text-gray-900 dark:text-gray-200">{totalDeposit.toLocaleString()} ETB</div>
  </div>
<div class="stat text-gray-300 w-fit rounded-lg shadow-lg">
    <div class="stat-title text-[#002a47] dark:text-gray-100">Remaining</div>
    <div class="stat-value text-gray-900 dark:text-gray-200">{remaining.toLocaleString()} ETB</div>
  </div>    
  </div>
</div>

    <div class="h-[260px]">
      <canvas id="depositChart"></canvas>
    </div>
    
  </div>

  <!-- RIGHT: TABLE -->
  <div class="overflow-y-scroll rounded-xl bg-white dark:bg-[#002a47]">
    <table class="table text-gray-900 dark:text-gray-100">
      <thead class="bg-gray-200 dark:bg-[#0f1727] sticky top-0">
        <tr>
          <th>No.</th>
          <th>Period</th>
          <th>Employee</th>
          <th>Deposit</th>
          <th>Sales</th>
          <th>Remaining</th>
        </tr>
      </thead>
      <tbody>
        {#each time_series as row, i}
          {#if i < maxItems}
            <tr class={i % 2 ? 'bg-gray-100 dark:bg-gray-900' : ''}>
              <td>{i + 1}</td>
              <td>{row.period}</td>
              <td>{row.employee}</td>
              <td>{row.deposit.toLocaleString()} ETB</td>
              <td>{row.sales.toLocaleString()} ETB</td>
              <td>{row.remaining.toLocaleString()} ETB</td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>

</div>
