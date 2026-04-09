<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";
  import { fetchSalesVolume } from "../../../../apis/api-utils"; // Adjust the path as needed
  let chartCanvas;
  let barChart;

  export let timeline = "Daily"; // Default timeline
  export let span = 7; // Default span
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';

  let isFetching = false; // Prevent multiple fetches

  async function setupChart() {
    if (typeof window !== "undefined") {
      const zoomPlugin = (await import("chartjs-plugin-zoom")).default; // Dynamic import
      Chart.register(zoomPlugin);

      const ctx = chartCanvas.getContext("2d");
      barChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [], // Placeholder for x-axis labels
          datasets: [
            {
              label: "Sales Volume",
              data: [], // Placeholder for y-axis data
              backgroundColor: "#3393ce",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              borderRadius: 50,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            zoom: {
              pan: { enabled: true, mode: "x" },
              zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
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
            x: { stacked: true,
              ticks: {
                callback: function (value, index, ticks) {
                  const label = this.getLabelForValue(value);
                  if (ticks.length > 10) {
                    return label.split('-')[2]; // Show only the day
                  }
                  return label; // Show full date if fewer bars
                },
              },
            },
            y: { beginAtZero: true },
          },
        },
      });

      fetchData(); // Fetch data after chart setup
    }
  }

  async function fetchData(selectedspan, selectedtimeline, selectedterritory, selectedroute, selectedpoint_of_sale) {
    if (isFetching) return; // Prevent multiple fetches
    isFetching = true;

    try {
      const data = await fetchSalesVolume(selectedspan, selectedtimeline, selectedterritory, selectedroute, selectedpoint_of_sale); // Fetch data from API
      if (!data || data.length === 0) {
        console.error("No data available to display the chart.");
        return;
      }

      const labels = data.map((item) => item.date); // Extract dates for x-axis
      const volumes = data.map((item) => item.volume); // Extract volumes for y-axis

      updateChart(labels, volumes); // Update the chart with fetched data
    } catch (error) {
      console.error("Error fetching sales volume:", error);
    } finally {
      isFetching = false;
    }
  }

  function updateChart(labels, volumes) {
    if (barChart) {
      barChart.data.labels = labels; // Update x-axis labels
      barChart.data.datasets[0].data = volumes; // Update y-axis data
      barChart.update(); // Refresh the chart
      barChart.resetZoom();
    }
  }

  onMount(setupChart);
  $: fetchData(span, timeline, territory, route, point_of_sale); // Fetch data after chart setup

</script>

<canvas bind:this={chartCanvas} width="400" height="200"></canvas>
