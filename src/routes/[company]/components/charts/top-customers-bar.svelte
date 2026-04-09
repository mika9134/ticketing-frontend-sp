<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the datalabels plugin
	import { fetchTopCustomers } from '../../../../apis/api-utils.js'; // Adjust the path as needed
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';

	export let timeline = 'Daily';
	export let span = 7;
	export let territory = '';
	export let route = '';
	export let point_of_sale = [];

	let top_n = 5;
	let total = [];
	let pieChart4;

	let currentTheme = get(themeStore);
	themeStore.subscribe(async (value) => {
		currentTheme = value;
		if (pieChart4) {
			await pieChart4.destroy();
			await setupChart();
			fetchData(span, timeline, territory, route, top_n);
		}
	});

	// Fetch data from the API
	async function fetchData(selectedSpan, selectedTimeline, territory_id, route_id, top_n) {
		console.log('Territory from outside - ' + territory_id);
		try {
			const data = await fetchTopCustomers(
				selectedSpan,
				selectedTimeline,
				territory_id,
				route_id,
				top_n
			);
			point_of_sale = data.map((item) => item.point_of_sale_name);
			total = data.map((item) => parseFloat(item.total_sales.replace(/,/g, '')));
			updateChart(point_of_sale, total);
		} catch (error) {
			console.error('Error fetching Top Customers: ', error);
		}
	}

	async function setupChart() {
		const ctx = document.getElementById('pieChart4').getContext('2d');

		// Register the datalabels plugin
		Chart.register(ChartDataLabels);

		pieChart4 = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: point_of_sale,
				datasets: [
					{
						data: total,
						backgroundColor: [
							'#4CAF50', 
							'#2196F3', 
							'#FF9800', 
							'#E91E63', 
							'#9C27B0', 
							'#00BCD4', 
							'#FFC107', 
							'#FF5722', 
							'#8BC34A', 
							'#673AB7' 
						],
						hoverBackgroundColor: [
							'#4CAF50', 
							'#2196F3', 
							'#FF9800', 
							'#E91E63', 
							'#9C27B0', 
							'#00BCD4', 
							'#FFC107', 
							'#FF5722', 
							'#8BC34A', 
							'#673AB7' 
						],
						borderWidth: 1,
						datalabels: {
							color: 'white',
							datalabels: {
								color: 'white',
								formatter: (value, context) => {
									return value.toLocaleString();
								}
							}
						}
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					title: {
						display: true,
						text: 'Top Customers by Sales',
						color: 'white'
					},
					zoom: {
						pan: { enabled: true, mode: 'x' },
						zoom: {
							wheel: { enabled: true },
							pinch: { enabled: true },
							mode: 'x'
						}
					},
					legend: {
						display: false
					}
				}
			}
		});
	}

	$: fetchData(span, timeline, territory, route, top_n);

	onMount(() => {
		setupChart();
	});

	function updateChart(labels, values) {
		if (pieChart4) {
			pieChart4.data.labels = labels;
			pieChart4.data.datasets[0].data = values;
			pieChart4.update();
		}
	}
</script>

<div class="w-full h-full">
	<!-- <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">
		Top Customers Bar
	</h3> -->

	{#if point_of_sale.length <= 0}
		<p class="mt-2 italic text-gray-900 dark:text-gray-100">
			No Sale has been made in the given timeline.
		</p>
	{/if}
	<!-- <div class="flex justify-center items-center w-full h-[70%]"> -->
		<div class="py-auto w-full h-full">
			<canvas class="grow-0" id="pieChart4" height="180"></canvas>
		</div>
	<!-- </div> -->
</div>
