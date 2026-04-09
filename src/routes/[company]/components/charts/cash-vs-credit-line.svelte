<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";
  import { fetchCashVsCreditVoid } from "../../../../apis/api-utils.js";

  let cashVsCreditLine;
  let lineChart;

  export let timeline ="Daily"; 
  export let span = 7; 

  let isFetching = false; 

  async function setupChart() {
    if (typeof window !== "undefined") {
      const zoomPlugin = (await import("chartjs-plugin-zoom")).default;
      Chart.register(zoomPlugin);

      const ctx = cashVsCreditLine.getContext("2d");
      lineChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [], 
          datasets: [
            {
              label: "Cash Vs Credit",
              data: [], 
              backgroundColor: "rgba(75, 192, 192, 0.2)", 
              borderColor: "#00d55c", 
              borderWidth: 2,
              tension: 0.4, 
              fill: true, 
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            zoom: {
              pan: { enabled: true, mode: "x" },
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: "x",
              },
            },
            legend: { display: false }, // Hide the legend
            // tooltip: {
            //   enabled: true, // Enable tooltips on hover
            //   callbacks: {
            //     label: function (tooltipItem) {
            //       const value = tooltipItem.raw || 0;
            //       return `Volume: ${value.toLocaleString()}`; // Format the tooltip label
            //     },
            //   },
            // },
            datalabels: {
              anchor: "end",
              align: "end",
              formatter: function (value) {
                return null; 
              },
              color: "green",
            },
          },
          scales: {
            x: {
              display: true, // Hide the x-axis labels
            },
            y: {
              display: true,
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return value.toLocaleString(); // Format y-axis values with commas
                },
              },
            },
          },
        },
      });

      fetchData(); 
    }
  }

  async function fetchData(selectedSpan, selectedTimeline) {
    if (isFetching) return; 
    isFetching = true;

    try {
      const data = await fetchCashVsCreditVoid(selectedSpan, selectedTimeline); 
      if (!data || data.length === 0) {
        console.error("No data available to display the chart.");
        return;
      }

      const labels = data.map((item) => item.period); // Extract dates for x-axis
      const cash = data.map((item) => item.cash); // Extract volumes for y-axis
      const credit = data.map((item) => item.credit); // Extract volumes for y-axis

      updateChart(labels, volumes); // Update the chart with fetched data
    } catch (error) {
      console.error("Error fetching cash vs credit:", error);
    } finally {
      isFetching = false;
    }
  }

  function updateChart(labels, cash, credit) {
    if (lineChart) {
      lineChart.data.labels = labels; // Update x-axis labels
      lineChart.data.datasets[0].data = cash; // Update y-axis data
      lineChart.data.datasets[0].data = credit; // Update y-axis data
      lineChart.update(); // Refresh the chart
      lineChart.resetZoom();
    }
  }

  onMount(setupChart);
  $: fetchData(span, timeline); // Fetch data when span or timeline changes
</script>

<canvas bind:this={cashVsCreditLine} width="400" height="200"></canvas>
