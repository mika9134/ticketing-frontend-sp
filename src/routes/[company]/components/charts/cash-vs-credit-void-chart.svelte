<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import { fetchCashVsCreditVoid } from '../../../../apis/api-utils.js';
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';

	export let span = 7;
	export let timeline = 'Daily';
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';

	let cash_vs_credit_void;
	let chartCanvas; // bind:this target for the canvas

	let cash_void = 0;
	let credit_void = 0;
	let cashVolume = 0;
	let creditVolume = 0;
	let cashPercentage = 0;
	let creditPercentage = 0;
	let total = 0;
	let total_void = 0;

	let currentTheme = get(themeStore);

	themeStore.subscribe(async (value) => {
		currentTheme = value;
		if (cash_vs_credit_void) {
			await cash_vs_credit_void.destroy();
			await setupChart(chartCanvas);
			fetchData(span, timeline, territory, route, point_of_sale);
		}
	});

	// Fetch data from the API
	async function fetchData(span, timeline, territory, route, point_of_sale) {
		try {
			const data = await fetchCashVsCreditVoid(span, timeline, territory, route, point_of_sale);
			console.log(data);

			cashVolume = data.cash;
			creditVolume = data.credit;
			cash_void = data.cash_void;
			credit_void = data.credit_void;

			total = cashVolume + creditVolume;
			total_void = credit_void + cash_void;

			cashPercentage = total > 0 ? Math.round((cashVolume / total) * 100.0) : 0;
			creditPercentage = total > 0 ? Math.round((creditVolume / total) * 100.0) : 0;

			updateChart(cashPercentage, creditPercentage);
		} catch (error) {
			console.error('Error fetching cash vs credit:', error);
		}
	}

	async function setupChart(canvas) {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');

		Chart.register(ChartDataLabels);

		cash_vs_credit_void = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: ['Cash', 'Credit'],
				datasets: [
					{
						data: [0, 0],
						backgroundColor: ['#0fd070', '#3393ce'],
						hoverBackgroundColor: ['#0fd070', '#3393ce'],
						borderWidth: 1,
						datalabels: {
							color: 'white'
						}
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
				plugins: {
					title: {
						display: false,
						text: 'Cash vs Credit',
						color: 'white'
					},
					legend: {
						position: 'bottom',
						labels: {
							usePointStyle: true,
							pointStyle: 'circle',
							color: currentTheme === 'light' ? 'black' : 'white'
						}
					}
				}
			}
		});
	}

	onMount(() => {
		setupChart(chartCanvas);
		fetchData(span, timeline, territory, route, point_of_sale);
	});

	function updateChart(cashPercentage, creditPercentage) {
		if (cash_vs_credit_void) {
			cash_vs_credit_void.data.datasets[0].data = [cashPercentage, creditPercentage];
			cash_vs_credit_void.update();
		}
	}
</script>

<div class="flex-1">
	<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">Cash vs Credit</h3>

	<!-- Compact layout for Cash, Void and Credit volumes -->
	<div class="flex justify-around items-center gap-4 mb-4">
		<!-- Cash Volume -->
		<div class="text-center">
			<h5 class="text-xl font-bold text-gray-900 dark:text-white">
				{cashVolume.toLocaleString()} <span>ETB</span>
			</h5>
			<p class="text-sm font-normal text-gray-700 dark:text-gray-100">Cash Volume</p>
			<span class="text-sm font-semibold text-gray-700 dark:text-gray-100">{cashPercentage}%</span>
		</div>

		<!-- Total Void -->
		<div class="text-center">
			<h5 class="text-xl font-bold text-gray-900 dark:text-white">
				{total_void.toLocaleString()} <span>ETB</span>
			</h5>
			<p class="text-sm font-normal text-gray-700 dark:text-gray-100">Void</p>
			<span class="text-sm font-semibold text-gray-700 dark:text-gray-100">-</span>
		</div>

		<!-- Credit Volume -->
		<div class="text-center">
			<h5 class="text-xl font-bold text-gray-900 dark:text-white">
				{creditVolume.toLocaleString()} <span>ETB</span>
			</h5>
			<p class="text-sm font-normal text-gray-700 dark:text-gray-100">Credit Volume</p>
			<span class="text-sm font-semibold text-gray-700 dark:text-gray-100">{creditPercentage}%</span>
		</div>
	</div>

	<!-- Pie chart -->
	<div class="flex justify-center w-full">
		<div class="flex justify-center w-fit">
			<canvas class="w-[400px] grow-0" bind:this={chartCanvas} width="150" height="150"></canvas>
		</div>
	</div>
</div>
