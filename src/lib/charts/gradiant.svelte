<script>
    import { onMount } from 'svelte';
    import * as am5 from '@amcharts/amcharts5';
    import * as am5xy from '@amcharts/amcharts5/xy';
    import * as am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
  
    let chartdiv;
  
    onMount(() => {
      // Create root element
      const root = am5.Root.new(chartdiv);
  
      // Set themes
      root.setThemes([am5themes_Animated.new(root)]);
  
      // Create chart
      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
          pinchZoomX: true,
          paddingLeft: 0,
          layout: root.verticalLayout,
        })
      );
  
      chart.set("colors", am5.ColorSet.new(root, {
        colors: [
          am5.color(0x73556E),
          am5.color(0x9FA1A6),
          am5.color(0xF2AA6B),
          am5.color(0xF28F6B),
          am5.color(0xA95A52),
          am5.color(0xE35B5D),
          am5.color(0xFFA446)
        ]
      }));
  
      // Create axes
      const xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 50,
        minorGridEnabled: true,
      });
  
      xRenderer.grid.template.setAll({
        location: 1,
      });
  
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          maxDeviation: 0.3,
          categoryField: "country",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );
  
      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          maxDeviation: 0.3,
          min: 0,
          renderer: am5xy.AxisRendererY.new(root, {
            strokeOpacity: 0.1,
          }),
        })
      );
  
      // Create series
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Series 1",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          categoryXField: "country",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{valueY}",
          }),
        })
      );
  
      series.columns.template.setAll({
        tooltipY: 0,
        tooltipText: "{categoryX}: {valueY}",
        shadowOpacity: 0.1,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 1,
        strokeWidth: 2,
        stroke: am5.color(0xffffff),
        shadowColor: am5.color(0x000000),
        cornerRadiusTL: 50,
        cornerRadiusTR: 50,
        fillGradient: am5.LinearGradient.new(root, {
          stops: [{}, { color: am5.color(0x000000) }],
        }),
        fillPattern: am5.GrainPattern.new(root, {
          maxOpacity: 0.15,
          density: 0.5,
          colors: [am5.color(0x000000), am5.color(0x000000), am5.color(0xffffff)],
        }),
      });
  
      series.columns.template.states.create("hover", {
        shadowOpacity: 1,
        shadowBlur: 10,
        cornerRadiusTL: 10,
        cornerRadiusTR: 10,
      });
  
      series.columns.template.adapters.add("fill", function (fill, target) {
        return chart.get("colors").getIndex(series.columns.indexOf(target));
      });
  
      // Set data
      const data = [
        { country: "USA", value: 2025 },
        { country: "China", value: 1282 },
        { country: "Japan", value: 909 },
        { country: "Germany", value: 752 },
        { country: "UK", value: 652 },
        { country: "Italy", value: 452 },
      ];
  
      xAxis.data.setAll(data);
      series.data.setAll(data);
  
      // Make stuff animate on load
      series.appear(1000);
      chart.appear(1000, 100);
  
      // Cleanup when component is destroyed
      return () => {
        root.dispose();
      };
    });
  </script>
  
  <style>
    #chartdiv {
      width: 100%;
      height: 500px;
    }
  </style>
  
  <div id="chartdiv" bind:this={chartdiv}></div>
  