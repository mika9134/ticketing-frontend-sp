<script>
	import { onMount } from 'svelte';
	import { formatNumber } from '$lib/utils.js'; // Adjust the path as needed
	import { fetchYearsToDate } from '../../../../apis/api-utils.js';
	import LineCharts from '../charts/line-charts.svelte';
	import { exportCSV, fetchTable } from '../../../../apis/table.js'; // Adjust the path as needed
	import CategoryFilter from '../filter/category_filter.svelte';
	import { host } from '../../../../apis/config.js';
	import { getAccessToken } from '../../../../stores/tokenStore.js';

	// Props with default values
	export let timeline = 'Daily'; // Default timeline
	export let span = 30; // Default span is 1
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';
	export let employee = '';
	export let category = '';
	export let parentProduct = '';
	export let product = '';

	let labels = [];
	let ly_volumes = [];
	let cy_volumes = [];
	let legend_container = 'ytd';
	let lineChartRef;
	let maxItems = 10;
	let series = [];
	let showFilters = false;

	const categoryURL = `${host}dashboard-volume/get-categories`;
	const productURL = `${host}dashboard-volume/get-products-by-category/`;
	const parentProductURL = `${host}dashboard-volume/get-parent-products-by-category/`;
	let categories = [];
	let products = [];
	let parentProducts = [];

	async function loadCategories() {
		try {
			await ensureToken();
			const res = await fetchTable(categoryURL, token);
			categories = res?.succeed ? res.data : [];
		} catch (e) {
			categories = [];
			category = '';
		}
	}

	async function loadParentProducts(categoryId) {
		try {
			if (!categoryId) {
				parentProducts = [];
				return;
			}
			await ensureToken();
			const res = await fetchTable(`${parentProductURL}${categoryId}`, token);
			parentProducts = res?.succeed ? res.data : [];
		} catch (e) {
			parentProducts = [];
			parentProduct = '';
		}
	}

	async function loadProducts(parentProduct) {
		try {
			if (!parentProduct) {
				products = [];
				return;
			}
			await ensureToken();
			const res = await fetchTable(`${productURL}${parentProduct}`, token);
			products = res?.succeed ? res.data : [];
		} catch (e) {
			products = [];
			product = '';
		}
	}

	async function fetchData() {
		try {
			const data = await fetchYearsToDate(
				span,
				timeline,
				territory,
				route,
				point_of_sale,
				employee,
				category,
				parentProduct,
				product
			); // Fetch data from API
			if (!data || data.length === 0) {
				console.error('No data available to display the chart.');
				return;
			}
			series = data.currentYear;
			labels = data.currentYear.map((item) => item.period); // Extract dates for x-axis
			cy_volumes = data.currentYear.map((item) => item.volume);
			ly_volumes = data.lastYear.map((item) => item.volume);
			// Extract volumes for y-axis
		} catch (error) {
			console.error('Error fetching sales volume:', error);
		} finally {
		}
	}

	function updateChart(lineChart) {
		if (lineChart) {
			lineChartRef = lineChart;
			lineChart.data.labels = labels.reverse();
			lineChart.data.datasets[0].data = ly_volumes; // Update y-axis data
			lineChart.data.datasets[1].data = cy_volumes; // Update y-axis data
			lineChart.data.datasets[0].backgroundColor = '#0f172755';
			lineChart.data.datasets[0].borderColor = '#0f1727';
			lineChart.data.datasets[1].backgroundColor = '#42A5F555';
			lineChart.data.datasets[1].borderColor = '#42A5F5';
			lineChart.update(); // Refresh the chart
			lineChart.resetZoom();
		}
	}

	function applyFilters() {
		fetchData(span, timeline, territory, route, point_of_sale, employee, category, parentProduct, product);
	}

	async function load(
		span,
		timeline,
		territory,
		route,
		point_of_sale,
		employee,
		category,
		parentProduct,
		product
	) {
		await fetchData();
		updateChart(lineChartRef);
	}
	$: load(span, timeline, territory, route, point_of_sale, employee, category, parentProduct, product);
	$: if (category) {
		product = '';
		parentProduct = '';
		loadParentProducts(category);
	}
</script>

<div class="grid grid-cols-2">
	<div>
		<div class="flex gap-x-4 items-center">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">YTD vs LY</h3>
			<div class="">
				<button
					onclick={() => (showFilters = !showFilters)}
					class="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg
					bg-gray-100 dark:bg-[#0f1727]
					text-gray-900 dark:text-gray-100"
				>
					<svg
						width="26px"
						height="30px"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						stroke="#42A5F5"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier">
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M3 7C3 6.44772 3.44772 6 4 6H20C20.5523 6 21 6.44772 21 7C21 7.55228 20.5523 8 20 8H4C3.44772 8 3 7.55228 3 7ZM6 12C6 11.4477 6.44772 11 7 11H17C17.5523 11 18 11.4477 18 12C18 12.5523 17.5523 13 17 13H7C6.44772 13 6 12.5523 6 12ZM9 17C9 16.4477 9.44772 16 10 16H14C14.5523 16 15 16.4477 15 17C15 17.5523 14.5523 18 14 18H10C9.44772 18 9 17.5523 9 17Z"
								fill="#42A5F5"
							></path>
						</g></svg
					>
				</button>
				{#if showFilters}
					<div
						class="absolute mt-2 w-[400px] p-4 rounded-xl shadow-lg
		       				bg-white dark:bg-[#002a47] z-[3]"
					>
						<CategoryFilter bind:category bind:product bind:parentProduct on:change={() => applyFilters()} />
					</div>
				{/if}
			</div>
		</div>
		<div class="mt-4">
			<LineCharts
				title={['Last Year', 'Current Year']}
				{span}
				{timeline}
				{territory}
				{route}
				{point_of_sale}
				{employee}
				{fetchData}
				{updateChart}
				num_datasets={2}
				{legend_container}
				fill={false}
			/>
			<div class="flex mt-10" hidden={series.length == 0}>
				<div id="ytd"></div>
			</div>
		</div>
	</div>
	<div class="overflow-y-scroll rounded-xl bg-white dark:bg-[#002a47]">
		<div>
			<table class="table bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0">
				<!-- head -->
				<thead
					class="text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-[#0f1727] sticky top-0 z-0"
				>
					<tr>
						<th>No.</th>
						<th>Period</th>
						<th>Current Year</th>
						<th>Last Year</th>
						<th>Percentage (%)</th>
						<th
							><div
								onclick={() => {
									exportCSV(series);
								}}
								class="flex justify-end rounded-sm cursor-pointer bg-gray-200 dark:bg-[#0f1727]"
							>
								<svg
									fill="#42A5F5"
									width="24px"
									height="24px"
									viewBox="0 0 36 36"
									version="1.1"
									preserveAspectRatio="xMidYMid meet"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									stroke="#42A5F5"
									><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
										id="SVGRepo_tracerCarrier"
										stroke-linecap="round"
										stroke-linejoin="round"
									></g><g id="SVGRepo_iconCarrier">
										<title>export-line</title>
										<path
											d="M6,13.61h7.61V6H24v8.38h2V6a2,2,0,0,0-2-2H10.87L4,10.87V30a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2H6Zm0-1.92L11.69,6H12v6H6Z"
											class="clr-i-outline clr-i-outline-path-1"
										></path><path
											d="M28.32,16.35a1,1,0,0,0-1.41,1.41L30.16,21H18a1,1,0,0,0,0,2H30.19l-3.28,3.28a1,1,0,1,0,1.41,1.41L34,22Z"
											class="clr-i-outline clr-i-outline-path-2"
										></path> <rect x="0" y="0" width="36" height="36" fill-opacity="0"></rect>
									</g></svg
								>
							</div></th
						>
					</tr>
				</thead>
				<tbody>
					<!-- row 1 -->
					{#each ly_volumes as _, i}
						{#if i < maxItems}
							<tr
								class={i % 2 > 0 == true
									? 'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer'
									: 'bg-white dark:bg-[#002a47] dark:text-gray-100 cursor-pointer'}
							>
								<th>{i + 1}</th>
								<td>{labels[ly_volumes.length - i - 1]}</td>
								<td>{cy_volumes[ly_volumes.length - i - 1].toLocaleString()} ETB</td>
								<td>{ly_volumes[ly_volumes.length - i - 1].toLocaleString()} ETB</td>
								<td
									>{ly_volumes[ly_volumes.length - i - 1] == 0
										? '-'
										: (cy_volumes[ly_volumes.length - i - 1] * 100) /
											ly_volumes[ly_volumes.length - i - 1]}{ly_volumes[
										ly_volumes.length - i - 1
									] == 0
										? ''
										: '%'}</td
								>
								<td></td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
