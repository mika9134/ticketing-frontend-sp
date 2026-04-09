<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
  
    let chartCanvas;
    let currentSalesData = [500, 700, 900, 1100, 1300]; // Placeholder for current sales trajectory
    let predictedSalesData = [550, 750, 1000, 1250, 1500]; // Placeholder for predicted trajectory
    let labels = ["January", "February", "March", "April", "May"]; // Placeholder labels
  
    onMount(() => {
      const ctx = chartCanvas.getContext("2d");
  
      new Chart(ctx, {
        type: "line", // Mixed chart type
        data: {
          labels: labels,
          datasets: [
            {
              label: "Current Sales Trajectory",
              data: currentSalesData,
              borderColor: "#4CAF50", // Green for current sales
              backgroundColor: "rgba(76, 175, 80, 0.2)",
              fill: true,
              tension: 0.4, // Smooth curve
            },
            {
              label: "AI Predicted Sales Trajectory",
              data: predictedSalesData,
              borderColor: "#FF9800", // Orange for predicted sales
              backgroundColor: "rgba(255, 152, 0, 0.2)",
              fill: true,
              tension: 0.4, // Smooth curve
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Sales Trajectory: Current vs Predicted",
            },
            legend: {
              display: true,
              position: "top",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Months",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Sales Volume",
              },
            },
          },
        },
      });
    });
  </script>
  
  <canvas bind:this={chartCanvas} width="800" height="450"></canvas>