<script>
  import { onMount } from "svelte";
  import { fetchSalesVolume } from "../../apis/api-utils.js"; // Adjust the path as needed

  let chartDiv;
  let chart;
  let timeline = "Daily"; // Default timeline
  let span = 9; // Default span
	let territory = '';
	let route = '';
	let point_of_sale = '';
  let isFetching = false; // Prevent multiple fetches

  // Fetch data from the API and update the chart
  async function fetchData() {
    if (isFetching) return;
    isFetching = true;

    try {
      const data = await fetchSalesVolume(span, timeline, territory, route, point_of_sale); // Fetch data from the API
      if (!data || data.length === 0) {
        console.error("No data available to display the chart.");
        return;
      }

      // Map the API response to the chart's data format
      const chartData = data.map((item) => ({
        period: item.period, // Use the "period" field for the x-axis
        volume: item.volume, // Use the "volume" field for the y-axis
      }));

      // Update the chart with the fetched data
      updateChart(chartData);
    } catch (error) {
      console.error("Error fetching sales volume data:", error);
    } finally {
      isFetching = false;
    }
  }

  // Update the chart with new data
  function updateChart(data) {
    if (chart) {
      chart.data = data; // Set the new data
    }
  }

  // Setup the cylindrical bar chart
  onMount(() => {
    const am4core = window.am4core;
    const am4charts = window.am4charts;
    const am4themes_animated = window.am4themes_animated;

    // Apply theme
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    chart = am4core.create(chartDiv, am4charts.XYChart3D);
    chart.paddingBottom = 30;
    chart.angle = 35;

    // Create axes
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "period"; // Use "period" for the x-axis
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.inside = true;
    categoryAxis.renderer.grid.template.disabled = true;

    const labelTemplate = categoryAxis.renderer.labels.template;
    labelTemplate.rotation = -90;
    labelTemplate.horizontalCenter = "left";
    labelTemplate.verticalCenter = "middle";
    labelTemplate.dy = 10; // Moves it a bit down
    labelTemplate.inside = false;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.grid.template.disabled = true;

    // Create series
    const series = chart.series.push(new am4charts.ConeSeries());
    series.dataFields.valueY = "volume"; // Use "volume" for the y-axis
    series.dataFields.categoryX = "period"; // Use "period" for the x-axis

    const columnTemplate = series.columns.template;
    columnTemplate.adapter.add("fill", function (fill, target) {
      return chart.colors.getIndex(target.dataItem.index);
    });

    columnTemplate.adapter.add("stroke", function (stroke, target) {
      return chart.colors.getIndex(target.dataItem.index);
    });

    // Fetch data and update the chart
    fetchData();

    return () => {
      // Cleanup chart when the component is destroyed
      chart.dispose();
    };
  });
</script>

<style>
  #chartdiv {
    width: 100%;
    height: 500px;
  }
</style>

<!-- External CDN Scripts -->
<header>
  <script src="https://cdn.amcharts.com/lib/4/core.js"></script>
  <script src="https://cdn.amcharts.com/lib/4/charts.js"></script>
  <script src="https://cdn.amcharts.com/lib/4/themes/animated.js"></script>
</header>


<!-- HTML -->
<div class="ml-2 bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg p-4 md:p-6 mb-4">
  <div id="chartdiv" bind:this={chartDiv}></div>
</div>