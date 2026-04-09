<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import { fetchTopCategories } from '../../../../apis/api-utils.js';
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';
	import SubCategoriesTable from './sub-categories-table.svelte';

   	export let region = '';
	export let timeline = 'Daily';
	export let span = 7;
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';
	// export let category = '';
	export let parentProduct = '';
	export let product = '';

	let top_n = 5;
	let categories = [];
	let total = [];
	let pieChart2;
	let showFilters = false;

	let currentTheme = get(themeStore);
	themeStore.subscribe(async (value) => {
		currentTheme = value;
		if (pieChart2) {
			await pieChart2.destroy();
			await setupChart();
			fetchData(span, timeline, region, territory, route, point_of_sale, top_n, parentProduct, product);
		}
	});

	// Fetch data from the API
	async function fetchData(
		selectedSpan,
		selectedTimeline,
		selectedRegion,
		territory_id,
		route_id,
		point_of_sale_id,
		top_n
	) {
		try {
			const data = await fetchTopCategories(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				territory_id,
				route_id,
				point_of_sale_id,
				top_n
			);
			categories = data.map((item) => item.category_name);
			total = data.map((item) => parseFloat(item.percentage * 100));
		} catch (error) {
			console.error('Error fetching Top Categories: ', error);
		}
	}

	$: fetchData(span, timeline, region, territory, route, point_of_sale, top_n);
	
</script>

<SubCategoriesTable transactions={categories} {region} {span} {timeline} {territory} {route} {point_of_sale} {top_n} />

