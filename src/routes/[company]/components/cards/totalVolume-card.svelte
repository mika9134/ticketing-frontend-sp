<script>
	import { onMount } from 'svelte';
	import { formatNumber } from '$lib/utils.js'; // Adjust the path as needed
	import { fetchSalesVolume, fetchMTM, fetchEmployees} from '../../../../apis/api-utils.js'; // Adjust the path as needed
	import { exportCSV, fetchTable } from '../../../../apis/table.js'; // Adjust the path as needed
	import LineCharts from '../charts/line-charts.svelte';
	import { getAccessToken } from '../../../../stores/tokenStore.js';
	import { host } from '../../../../apis/config.js';
	import CategoryFilter from '../filter/category_filter.svelte';

	// Props with default values
	export let updateTimeline = (() => {})
	export let timeline = 'Daily'; // Default timeline
	export let span = 30; // Default span is 1
	export let region = '';
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';
	export let employee = '';
	export let category = '';
	export let parentProduct = '';
	export let product = '';
	export let mtm_std = 0;
	export let mtm_non_std = 0;
	let mtm_std_total = 0;
	let mtm_nstd_total = 0;

	let activeTimeline = "DTD";

	let token = '';
	let sr = [];
	let maxItems = 10;
	let legend_container = 'volume';
	let showFilters = false;

	let labels = [];
	let volumes = [];

	let lineChartRef;

	const categoryURL = `${host}dashboard-volume/get-categories`;
	const productURL = `${host}dashboard-volume/get-products-by-category/`;
	const parentProductURL = `${host}dashboard-volume/get-parent-products-by-category/`;
	let categories = [];
	let products = [];
	let parentProducts = [];

	function updateActiveTimeline(timeline)
	{
		if(timeline == "Daily")
		{
			activeTimeline = "DTD";
		}
		else if (timeline == "Weekly"){
			activeTimeline = "WTW";
		}
		else if (timeline == "Monthly"){
			activeTimeline = "MTM";
		}
		else {
			activeTimeline = "YTY";
		}
	}

	$: updateActiveTimeline(timeline);

	$: updateTimeline(timeline);

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
			const data = await fetchSalesVolume(
				span,
				timeline,
				region,
				territory,
				route,
				point_of_sale,
				employee,
				category,
				parentProduct,
				product
			);
			if (!data || data.length === 0) {
				console.error('No data available to display the chart.');
				return;
			}

			labels = data.map((item) => item.period); // Extract dates for x-axis
			volumes = data.map((item) => item.volume); // Extract volumes for y-axis
		} catch (error) {
			console.error('Error fetching sales volume:', error);
		} finally {
		}

		try {
			const data = await fetchMTM(
				span,
				activeTimeline,
				region,
				territory,
				route,
				point_of_sale,
				employee,
			);

			mtm_std_total = data.std;
			mtm_nstd_total = data.nstd;
			mtm_std = data.std_growth;
			mtm_non_std = data.non_std_growth;
		} catch (error) {
			console.error('Error fetching mtm', error);
		}

		try {
			const data = await fetchEmployees(
				span,
				timeline,
				territory,
				route,
				point_of_sale,
				employee,
				category,
				parentProduct,
				product
			);

			sr = data;
		}
		catch(error) {
			console.error('Error fetching top sales', error);
		}
	}

	function updateChart(lineChart) {
		if (lineChart) {
			lineChartRef = lineChart;
			lineChart.data.labels = labels; // Update x-axis labels
			lineChart.data.datasets[0].data = volumes; // Update y-axis data
			lineChart.update(); // Refresh the chart
			lineChart.resetZoom();
		}
	}
	function applyFilters() {
		fetchData(span, timeline, region, territory, route, point_of_sale, employee, category, parentProduct, product);
	}

	async function load(
		activeTimeline,
		span,
		timeline,
		region,
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
	$: load(activeTimeline, span, region, timeline, region, territory, route, point_of_sale, employee, category, parentProduct, product);

	$: if (category) {
		product = '';
		parentProduct = '';
		loadParentProducts(category);
	}

</script>

<div class="grid grid-cols-2">
	<div>
		<div class="flex gap-x-4 items-center">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">Sales Volume</h3>
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

		<div class="relative mt-4">
			<LineCharts
				{span}
				{timeline}
				{territory}
				{route}
				{point_of_sale}
				{employee}
				{category}
				{parentProduct}
				{product}
				{fetchData}
				{updateChart}
				{legend_container}
			/>
			<div class="flex mt-10 hidden">
				<div id="volume"></div>
			</div>
		</div>
	</div>

        <div class="w-full">

		<div class="flex">
			
		<div class="stats shadow ml-2 mb-2">
			<div class="stat flex w-md border-gray-900 dark:border-gray-100 text-gray-300">
			<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100 ">Standard Products &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
				<div class="flex gap-20 justify-start w-fit">
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">
					{mtm_std_total} Pcs
				</div>

			</div>
			</div>

               <div>
               <div class="stat-title text-[#002a47] dark:text-gray-100 ">{timeline == "Daily"? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly"? "MTM" : "YTY"}</div>
               <div class="flex gap-2">

				<div class="flex self-center">
					<div>{@html

					mtm_std < 0 ?

					'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
				    :
				    mtm_std == 0 ?
                    
                    '<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
				    
				    :

					'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

					}</div>
					</div>
				<div class={mtm_std > 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : mtm_std == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
											{Math.abs(mtm_std)}%
										</div>
					
				</div>
			</div>
			</div>

			
		</div>

			<div class="stats shadow ml-2 mb-2">

	<div class="stat flex border-gray-900 dark:border-gray-100 text-gray-300">
			<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100 ">Non Standard Products</div>
				<div class="flex gap-20 justify-start w-fit">
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">
					{mtm_nstd_total} ETB
				</div>

			</div>
			</div>

               <div>
               <div class="stat-title text-[#002a47] dark:text-gray-100 ">{timeline == "Daily"? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly"? "MTM" : "YTY"}</div>
               <div class="flex gap-2">
				
				<div class="flex self-center">
					<div>{@html

					mtm_non_std < 0 ?

					'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
				    :
				    mtm_non_std == 0 ?
                    
                    '<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
				    
				    :

					'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

					}</div>
					</div>

					<div class={mtm_non_std > 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : mtm_non_std == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
											{Math.abs(mtm_non_std)}%
										</div>

				</div>
			</div>
			</div>

	</div>
		</div>


	<div class="flex col-span-2">
			<table class="table bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0">
				<!-- head -->
				<thead
					class="text-gray-700 bg-gray-100 dark:text-gray-100 dark:bg-[#0f1727] sticky top-0 z-0"
				>
					<tr class="rounded-full">
						<th>Period</th>
						<th>Full Name</th>
						<th>Sales Volume</th>
						<th>Sales Amount</th>
						<th
							><div
								onclick={() => {
									exportCSV(sr);
								}}
								class="flex justify-end rounded-sm cursor-pointer"
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
										></path>
									</g></svg
								>
							</div></th
						>
					</tr>
				</thead>
				<tbody>
					<!-- row 1 -->
					{#each sr as _, i}
						{#if i < maxItems}
							<tr
								onclick={() => {
									if (employee == _.id) employee = '';
									else employee = _.id;
								}}
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{_.period}</div></td>
								<td>{_.employee_name}</td>
								<td>{_.total_volume}</td>
								<td>{_.total_sales}</td>
								<td></td>
							</tr>
						{/if}
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
