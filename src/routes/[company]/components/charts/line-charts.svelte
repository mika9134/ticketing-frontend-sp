<script>
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";
  import { get } from 'svelte/store';
  import { fetchSalesVolume } from "../../../../apis/api-utils.js";
  import { themeStore } from '../../../../stores/themeStore.js';

  export let timeline ="Daily"; // Default timeline
  export let span = 30; // Default span
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';
	export let employee = '';
	export let category = '';
	export let parentProduct = '';
  export let product = '';
  export let title = ["Sales Volume / Amount"];
  export let num_datasets = 1;
  export let fetchData = (() => {});
  export let updateChart = (() => {})
  export let fill = true;
  export let legend_container;

  let chartCanvas;
  let lineChart;
  
  let currentTheme = get(themeStore);
  themeStore.subscribe(async (value) => {
   currentTheme = value;
   if(lineChart)
   {
    await lineChart.destroy();
    await setupChart();
    fetchData(span, timeline, territory, route, point_of_sale, employee, category, parentProduct, product);
   }
  });

  let isFetching = false; // Prevent multiple fetches
  let datasets = [];
  
  const getOrCreateLegendList = (chart, id) => {
  const legendContainer = document.getElementById(legend_container);
  let listContainer = legendContainer.querySelector('ul');

  if (!listContainer) {
    listContainer = document.createElement('ul');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'row';
    listContainer.style.margin = 0;
    listContainer.style.padding = 0;

    legendContainer.appendChild(listContainer);
  }

  return listContainer;
};

const htmlLegendPlugin = {
  id: 'htmlLegend',
  afterUpdate(chart, args, options) {
    const ul = getOrCreateLegendList(chart, options.containerID);

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove();
    }

    // Reuse the built-in legendItems generator
    const items = chart.options.plugins.legend.labels.generateLabels(chart);

    items.forEach(item => {
      const li = document.createElement('li');
      li.style.alignItems = 'center';
      li.style.cursor = 'pointer';
      li.style.display = 'flex';
      li.style.flexDirection = 'row';
      li.style.marginLeft = '10px';

      li.onclick = () => {
        const {type} = chart.config;
        if (type === 'pie' || type === 'doughnut') {
          // Pie and doughnut charts only have a single dataset and visibility is per item
          chart.toggleDataVisibility(item.index);
        } else {
          chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
        }
        chart.update();
      };

      // Color box
      const boxSpan = document.createElement('span');
      boxSpan.style.background = currentTheme == "light" ? "#84c1f2" : "#84c1f2";
      boxSpan.style.borderWidth = '0px';
      boxSpan.style.display = 'inline-block';
      boxSpan.style.flexShrink = 0;
      boxSpan.style.height = '10px';
      boxSpan.style.marginRight = '10px';
      boxSpan.style.width = '20px';

      // Text
      const textContainer = document.createElement('p');
      textContainer.style.color = textContainer.style.color = currentTheme == "light" ? "#555555" : "white";
      textContainer.style.margin = 0;
      textContainer.style.padding = 0;
      textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

      const text = document.createTextNode(item.text);
      textContainer.appendChild(text);

      li.appendChild(boxSpan);
      li.appendChild(textContainer);
      ul.appendChild(li);
    });
  }
};
  
  async function setupChart() {
    if (typeof window !== "undefined") {
    datasets = [];
      for(let x = 0; x < num_datasets; x++)
      {
     datasets.push(
            {
              label: title[x],
              data: [], // Placeholder for y-axis data
              backgroundColor: currentTheme == "light" ? "#84c1f2" : "#84c1f2", // Light green fill
              borderColor: "#42A5F5", // Green line
              borderWidth: 2,
              tension: 0.4, // Smooth curve
              fill: fill, // Fill under the line
            });
      }
      datasets = datasets;
      const zoomPlugin = (await import("chartjs-plugin-zoom")).default;
      Chart.register(zoomPlugin);

      const ctx = chartCanvas.getContext("2d");
      lineChart = new Chart(ctx, {
        type: "line",
        data: {
          datasets: datasets,
        },
        plugins: [htmlLegendPlugin],
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
            htmlLegend: {
              containerID: legend_container ? legend_container : "legend_container",
            },
            legend: {
            display:false,
              position: "bottom",
            }, // Hide the legend
            tooltip: {
              enabled: true, // Enable tooltips on hover
               callbacks: {
                 label: function (tooltipItem) {
                  const value = tooltipItem.raw || 0;
                  return `${value.toLocaleString()}`; // Format the tooltip label
               },
              },
             },
            datalabels: {
              anchor: "end",
              align: "end",
              formatter: function (value) {
                return ""; 
              },
              color: currentTheme == "light"? "#555555" : "white",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                align: 'center',
                text: 'Period',
                color: currentTheme == "light"? "#555555" : "white",
                font: {
                  family: 'Arial',
                  size: 12,
                },
                padding: {
                  top: 10,
                  bottom: 5,
                  left: 0,
                  right: 0,
                },
              },
              display: true, // Hide the x-axis labels
              ticks: {
              color: currentTheme == "light"? "#555555" : "white",
              },
            },
            y: {
              title: {
                display: true,
                align: 'center',
                text: title,
                color: currentTheme == "light"? "#555555" : "white",
                font: {
                  family: 'Arial',
                  size: 12,
                },
                padding: {
                  top: 10,
                  bottom: 5,
                  left: 0,
                  right: 0,
                },
              },
              display: true,
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return value.toLocaleString(); // Format y-axis values with commas
                },
              color: currentTheme == "light"? "#555555" : "white",
              },
              grid: {
                color: currentTheme == "light"? "#555555" : "white",
                z: 0,
              }
            },
          },
        },
      });

      await fetchData(span, timeline, territory, route, point_of_sale, employee, category, parentProduct, product); 
      updateChart(lineChart);// Fetch data after chart setup
    }
  }


  onMount(setupChart);
</script>

<canvas bind:this={chartCanvas} class="w-[400px] grow-0" width="400" height="200"></canvas>


<div id="legend_container">

</div>
