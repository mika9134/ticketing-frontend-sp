<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";
  import { fetchSalesVsTarget } from "../../../../apis/api-utils.js";

  export let timeline = "Daily";
  export let span = 7;
  export let territory;
  export let route;
  export let user_id;

  let chartCanvas;
  let barChart;
  // const maxBars = 30; // Maximum number of bars to display at once
  const daysPerPage = 30; // Show 7 days per page

  let currentStartDay = span - daysPerPage; // Start with the last 7 days
  let currentEndDay = span; // End with the last day
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
              label: "Target",
              data: [], // Placeholder for target data
              backgroundColor: "rgba(75, 192, 192, 0.2)", // Light Green, more transparent
              borderColor: "#0f485f", // Solid green outline
              barPercentage: 1, // Wider bar for the target
              categoryPercentage: 0.8, // Adjust category width
              borderRadius: 30,
            },
            {
              label: "Sales",
              data: [], // Placeholder for sales data
              backgroundColor: "#00d55c", // Green
              borderWidth: 1,
              barPercentage: 0.8, // Slightly smaller bars to see target outline
              categoryPercentage: 0.8, // Align with target bar
              borderRadius: 50,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: false, text: "Sales vs Target", color:"white" },
            legend: {
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
              },
            },
            zoom: {
              pan: { enabled: true, mode: "x" },
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: "x",
              },
            },
            datalabels: {
              anchor: "end",
              align: "top",
              font: { weight: "semibold", size: 10 }, // Decreased font size
              formatter: (value, ctx) => {
                const datasetIndex = ctx.datasetIndex;
                if (datasetIndex === 1) {
                  const salesPercentage = ctx.chart.data.datasets[1].salesPercentage[ctx.dataIndex];
                  return `${Math.round(salesPercentage)}%`; // Remove decimal points
                }
                return null; // No label for the target dataset
              },
              color: (ctx) => {
                const datasetIndex = ctx.datasetIndex;
                if (datasetIndex === 1) {
                  const salesPercentage = ctx.chart.data.datasets[1].salesPercentage?.[ctx.dataIndex];
                  return salesPercentage >= 100 ? "green" : "red"; // Color for sales percentage label
                }
                return "black";
              },
            },
          },
          scales: {
            x: {
              stacked: true,
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
                    // For monthly timeline, show abbreviated month names (e.g., "Jan", "Feb", "Mar")
                    const date = new Date(label); // Assuming the label is a date string
                    const monthAbbreviation = date.toLocaleString('en-US', { month: 'short' }); // "Jan", "Feb", "Mar"
                    return monthAbbreviation; 
                  } else if (timeline === "Yearly") {
                    // For yearly timeline, show the year
                    return label; // Example: "2021", "2022", etc.
                  }

                  return label; // Default fallback
                }

              },
            },
            y: {
              stacked: false,
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
          },
        },
      });

      fetchData();
    }
  }

  async function fetchData() {
    if (isFetching) return;
    isFetching = true; // Set fetching state

    try {
      const data = await fetchSalesVsTarget(span, timeline, territory, route, user_id);
      if (!data || data.length === 0) {
        console.error("No data available to display the chart.");
        return;
      }

      // Slice the data to get only the selected range (currentStartDay to currentEndDay)
      const slicedData = data.slice(currentStartDay, currentEndDay);
      const labels = slicedData.map((item) => item.period); // Extract periods for x-axis
      const targetSales = slicedData.map((item) => item.target); // Extract target values
      const actualSales = slicedData.map((item) => item.sales); // Extract sales values
      const salesPercentage = slicedData.map((item) => item.salesPercentage); // Extract sales percentage

      updateChart(labels, targetSales, actualSales, salesPercentage);
    } catch (error) {
      console.error("Error fetching sales vs target data:", error);
    } finally {
      isFetching = false; // Reset fetching state
    }
  }

  function updateChart(labels, targetSales, actualSales, salesPercentage) {
    if (barChart) {
      barChart.data.labels = labels; // Update x-axis labels
      barChart.data.datasets[0].data = targetSales; // Target data
      barChart.data.datasets[1].data = actualSales; // Sales data
      barChart.data.datasets[1].salesPercentage = salesPercentage;
      barChart.update(); // Refresh the chart
      barChart.resetZoom();
    }
  }

  function goToPreviousPage() {
    if (currentStartDay - daysPerPage >= 0) {
      currentStartDay -= daysPerPage;
      currentEndDay -= daysPerPage;
      fetchData();
    }
  }

  function goToNextPage() {
    if (currentEndDay + daysPerPage <= span) {
      currentStartDay += daysPerPage;
      currentEndDay += daysPerPage;
      fetchData();
    }
  }

  onMount(setupChart);
  $: fetchData(span, timeline); 
</script>


<div class="overflow-x-auto">
  <div>
    <canvas bind:this={chartCanvas} width="400" height="200"></canvas>
  </div>

  <!-- Pagination controls -->
  <div class="flex justify-between mt-2">
    <button on:click={goToPreviousPage} class="btn btn-ghost px-2 py-2 bg-[#3393ce] text-xs text-white rounded-lg">
      <img src="/svgs/previous-arrow.svg" alt="Previous" class="w-4 h-4" />
    </button>
    <button on:click={goToNextPage} class="px-2 py-2 bg-[#3393ce] text-xs text-white rounded-lg">
      <img src="/svgs/next-arrow.svg" alt="Next" class="w-4 h-4" />
    </button>
  </div>
</div>
