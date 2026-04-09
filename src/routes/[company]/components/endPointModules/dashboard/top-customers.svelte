<script>
	import { host, token } from '../../../../../apis/config.js';
	import TopCustomers from '../../charts/top-customers.svelte';
	import TopCategories from '../../charts/top-categories.svelte';
	import TopProducts from '../../charts/top-products.svelte';

	import FilterSection from '../../filter/filter.svelte';
	import Sidebar from '../../sidebar/sidebar.svelte';
	import Header from '../../header/header.svelte';

	import { onMount } from 'svelte';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import Chart from 'chart.js/auto';
	import Table from '../../tables/table.svelte';
	import TopCustomersBar from '../../charts/top-customers-bar.svelte';
	import SubCategoriesTable from '../../charts/sub-categories-table.svelte';
	import {
		fetchTopProducts,
		fetchTopCategories,
		fetchTopCustomers
	} from '../../../../../apis/api-utils.js'; // Adjust the path as needed

	Chart.register(ChartDataLabels);

	let { onToggleSidebar } = $props();

	let sidebarToggle = $state(true);

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};

    let region = $state('');
	let timeline = $state('Daily');
	let span = $state(7);
	let territory = $state('');
	let route = $state('');
	let point_of_sale = $state('');
	let employee = $state('');
	let top_filter = $state(3);

	let topProductStd = $state('');
	let topCategory = $state('');
	let topCustomerStd = $state('');
	let topProductNonStd = $state('');
	let topCustomerNonStd = $state('');

	let topProductSalesStd = $state('');
	let topCategorySales = $state('');
	let topCustomerSalesStd = $state('');


	let topProductSalesNonStd = $state('');
	let topCustomerSalesNonStd = $state('');

	let topProductQuantityStd = $state('');
	let topCategoryQuantity = $state('');
	let topCustomerQuantityStd = $state('');


	let topProductQuantityNonStd = $state('');
	let topCustomerQuantityNonStd = $state('');

	let period = $state('');

	function handleFilterChange(event) {
		timeline = event.detail.timeline;
		span = event.detail.span;
		region = event.detail.region;
		territory = event.detail.territory;
		route = event.detail.route;
		point_of_sale = event.detail.point_of_sale;
		employee = event.detail.employee;
	}

	async function fetchData(
		selectedSpan,
		selectedTimeline,
		selectedRegion,
		selectedTerritory,
		selectedRoute,
		selectedPointOfSale,
		selectedEmployee
	) {
		try {
			const data_std = await fetchTopProducts(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				selectedTerritory,
				selectedRoute,
				selectedPointOfSale,
				top_filter,
				null,
				null,
				"Standard"
			);
			const data_non_std = await fetchTopProducts(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				selectedTerritory,
				selectedRoute,
				selectedPointOfSale,
				top_filter,
				null,
				null,
				"Non Standard"
			);

			// Extract the first key-value pair from the response
			if (data_std.length) {
				topProductStd = data_std[0].product_name;
				topProductSalesStd = data_std[0].total_sales;
				topProductQuantityStd = data_std[0].total_volume;
				period = data_std[0].period;
			}
			else {
				topProductStd = '';
				topProductSalesStd = '';
				topProductQuantityStd = '';
				period = '';
			}

			if (data_non_std.length) {
			    topProductNonStd = data_non_std[0].product_name;
				topProductSalesNonStd = data_non_std[0].total_sales;
				topProductQuantityNonStd = data_non_std[0].total_volume;
			}
			else {
				topProductNonStd = '';
				topProductSalesNonStd = '';
				topProductQuantityNonStd = '';
			}
		} catch (error) {
			console.error('Error fetching sales volume:', error);
		}

		try {
			const data = await fetchTopCategories(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				selectedTerritory,
				selectedRoute,
				selectedPointOfSale,
				top_filter,
				"Standard"
			);
			// Extract the first key-value pair from the response
			if (data.length) {
				topCategory = data[0].category_name;
				topCategorySales = data[0].total_sales;
				topCategoryQuantity = data[0].total_volume;
			}
			else {
				topCategory = '';
				topCategorySales = '';
				topCategoryQuantity = '';
			}
		} catch (error) {
			console.error('Error fetching ytd', error);
		}

		try {
			const data_std = await fetchTopCustomers(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				selectedTerritory,
				selectedRoute,
				top_filter,
				null,
				null,
				null,
				"Standard"
			);
			const data_non_std = await fetchTopCustomers(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				selectedTerritory,
				selectedRoute,
				top_filter,
				null,
				null,
			    null,
				"Non Standard"
			);
			// Extract the first key-value pair from the response

			if (data_std.length) {
				topCustomerStd = data_std[0].point_of_sale_name;
				topCustomerSalesStd = data_std[0].total_sales_suffix;
				topCustomerQuantityStd = data_std[0].total_volume;
			}
			else {
				topCustomerStd = '';
				topCustomerSalesStd = '';
				topCustomerQuantityStd = '';
			}
			if (data_non_std.length) {
		        topCustomerNonStd = data_non_std[0].point_of_sale_name;
				topCustomerSalesNonStd = data_non_std[0].total_sales_suffix;
				topCustomerQuantityNonStd = data_non_std[0].total_volume;
			}
			else {
				topCustomerNonStd = '';
				topCustomerSalesNonStd = '';
				topCustomerQuantityNonStd = '';
			}
		} catch (error) {
			console.error('Error fetching sales volume:', error);
		}
	}

	$effect(() => {
		fetchData(span, timeline, region, territory, route, point_of_sale, employee);
	});
</script>

<div>
	<div class="sticky top-36 bg-gray-100 dark:bg-[#0f1727] z-[4]">
		<FilterSection
			{span}
			{region}
			{timeline}
			{territory}
			{route}
			{point_of_sale}
			{employee}
			on:filterChange={handleFilterChange}
		/>
	</div>

	<div class="grid grid-cols-1 gap-4 mb-4 p-2">
		<div
			class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg p-4 md:p-6 self-center h-full"
		>
			<TopCategories {span} {region} {timeline} {territory} {route} {point_of_sale} top_n={top_filter} />
		</div>

		<!-- <div class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg p-4 md:p-6 self-center h-full">
			</div> -->
		<div
			class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg p-4 md:p-6 self-center h-full"
		>
			<TopCustomers
				{span}
				{region}
				{timeline}
				{territory}
				{route}
				top_n={top_filter}
				bind:point_of_sale_id={point_of_sale}
			/>
		</div>
	</div>
</div>
