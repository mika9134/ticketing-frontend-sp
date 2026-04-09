<script>
	import { onMount } from 'svelte';
	import { formatNumber } from '$lib/utils.js'; // Adjust the path as needed
	import { fetchTotalVolume } from '../../../../apis/api-utils.js'; // Adjust the path as needed
	import LineCharts from '../charts/line-charts.svelte';

	export let timeline = 'Daily';
	export let span = 1;
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';

	let totalVolume = 0;
	let currentDate = '';

	async function fetchData(selectedspan, selectedtimeline, selectedterritory, selectedroute, selectedpoint_of_sale) {
		try {
			const data = await fetchTotalVolume(selectedspan, selectedtimeline, selectedterritory, selectedroute, selectedpoint_of_sale);
			currentDate = data.period;
			totalVolume = data.volume;
		} catch (error) {
			console.error('Error fetching sales volume:', error);
		}
	}

	$: fetchData(timeline);
</script>

<div class="flex justify-between items-center">
	<h3 class="text-lg font-semibold">Total Sales</h3>
</div>
<div class="mt-4">
	<h4 class="text-2xl font-bold">{formatNumber(totalVolume)} ETB</h4>
	<p class="text-xs text-gray-500 dark:text-gray-400">Period: {currentDate}</p>
	<LineCharts {span} {timeline} {territory} {route} {point_of_sale} />
</div>
