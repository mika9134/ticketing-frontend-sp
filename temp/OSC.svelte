<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import { fetchOrderSalesContribution } from "../../../apis/api-utils.js";
  
    let pieChartCanvas;
    let lineChartCanvas;
    let pieChart;
    let lineChart;
  
    export let timeline; // Default timeline
    export let span; // Default span
  
    let isFetching = false; // Prevent multiple fetches
  
    async function setupCharts() {
      if (typeof window !== "undefined") {
        const zoomPlugin = (await import("chartjs-plugin-zoom")).default;
        Chart.register(zoomPlugin);
  
        // Setup Pie Chart
        const pieCtx = pieChartCanvas.getContext("2d");
        pieChart = new Chart(pieCtx, {
          type: "pie",
          data: {
            labels: ["Presales Contribution", "Other Sales"],
            datasets: [
              {
                data: [0, 0], // Placeholder for presales and other sales data
                backgroundColor: ["#00d55c", "#3393ce"], // Green for presales, blue for other sales
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "Presales Contribution to Total Sales",
                color: "white",
              },
              legend: {
                labels: {
                  usePointStyle: true,
                  pointStyle: "circle",
                },
              },
            },
          },
        });
  
        // Setup Line Chart
        const lineCtx = lineChartCanvas.getContext("2d");
        lineChart = new Chart(lineCtx, {
          type: "line",
          data: {
            labels: [], // Placeholder for x-axis labels
            datasets: [
              {
                label: "Presales",
                data: [], // Placeholder for presales data
                backgroundColor: "rgba(75, 192, 192, 0.2)", // Light green fill
                borderColor: "#00d55c", // Green line
                borderWidth: 2,
                tension: 0.4, // Smooth curve
                fill: true, // Fill under the line
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "Presales Contribution Over Time",
                color: "white",
              },
              legend: {
                labels: {
                  usePointStyle: true,
                  pointStyle: "circle",
                },
              },
              zoom: {
                pan: {
                  enabled: true, // Enable panning
                  mode: "x", // Allow panning on the x-axis
                },
                zoom: {
                  wheel: {
                    enabled: true, // Enable zooming with the mouse wheel
                  },
                  pinch: {
                    enabled: true, // Enable pinch zooming
                  },
                  mode: "x", // Allow zooming on the x-axis
                },
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
                    if (ticks.length > 10) {
                      return label.split("-")[2]; // Show only the day if too many bars
                    }
                    return label; // Show full date if fewer bars
                  },
                },
              },
            },
          },
        });
  
        fetchData(); // Fetch data after chart setup
      }
    }
  
    async function fetchData(selectedSpan, selectedTimeline) {
      if (isFetching) return; // Prevent multiple fetches
      isFetching = true;
  
      try {
        const data = await fetchOrderSalesContribution(selectedSpan, selectedTimeline); // Fetch data from API
        if (!data || data.length === 0) {
          console.error("No data available to display the chart.");
          return;
        }
  
        const labels = data.map((item) => item.period); // Extract dates for x-axis
        const presales = data.map((item) => item.presales); // Extract presales values
        const sales = data.map((item) => item.sales); // Extract sales values
  
        // Calculate total sales and presales contribution
        const totalSales = sales.reduce((sum, value) => sum + value, 0);
        const totalPresales = presales.reduce((sum, value) => sum + value, 0);
        const presalesPercentage = ((totalPresales / totalSales) * 100).toFixed(2);
  
        updatePieChart(totalPresales, totalSales - totalPresales); // Update pie chart
        updateLineChart(labels, presales); // Update line chart
      } catch (error) {
        console.error("Error fetching order sales contribution:", error);
      } finally {
        isFetching = false;
      }
    }
  
    function updatePieChart(presales, otherSales) {
      if (pieChart) {
        pieChart.data.datasets[0].data = [presales, otherSales]; // Update pie chart data
        pieChart.update(); // Refresh the pie chart
      }
    }
  
    function updateLineChart(labels, presales) {
      if (lineChart) {
        lineChart.data.labels = labels; // Update x-axis labels
        lineChart.data.datasets[0].data = presales; // Update presales data
        lineChart.update(); // Refresh the line chart
      }
    }
  
    onMount(setupCharts);
    $: fetchData(span, timeline); // Fetch data when span or timeline changes
  </script>
  
  <div>
    <!-- Pie Chart -->
    <div>
      <canvas bind:this={pieChartCanvas} width="400" height="200"></canvas>
    </div>
  
    <!-- Line Chart -->
    <div>
      <canvas bind:this={lineChartCanvas} width="400" height="200"></canvas>
    </div>
  </div>