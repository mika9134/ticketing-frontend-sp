<script>
  import { onMount, afterUpdate } from "svelte";
  import Chart from "chart.js/auto";

  export let routeChartData;

  let barChart;

  onMount(() => {
    const ctx = document.getElementById("routeBarChart").getContext("2d");
    barChart = new Chart(ctx, {
      type: "bar",
      data: routeChartData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return `${tooltipItem.dataset.label}: $${tooltipItem.raw}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      },
    });
  });

  afterUpdate(() => {
    if (barChart) {
      barChart.data = routeChartData;
      barChart.update();
    }
  });
</script>

<div class="flex-1 max-w-[400px] max-h-[400px]">
  <h3 class="text-xl font-semibold">Sales by Route</h3>
  <canvas id="routeBarChart"></canvas>
</div>