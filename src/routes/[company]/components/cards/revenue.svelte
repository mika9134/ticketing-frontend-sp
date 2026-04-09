<script>
	import { onMount } from 'svelte';
	import { formatNumber } from '$lib/utils.js'; // Adjust the path as needed
	import { fetchTopRevenue } from '../../../../apis/api-utils.js'; // Adjust the path as needed
	import { exportCSV, fetchTable } from '../../../../apis/table.js'; // Adjust the path as needed
	import LineCharts from '../charts/line-charts.svelte';
	import { getAccessToken } from '../../../../stores/tokenStore.js';
	import { host } from '../../../../apis/config.js';
	import CategoryFilter from '../filter/category_filter.svelte';


	// Props with default values
	export let timeline = 'Daily'; // Default timeline
	export let span = 30; // Default span is 1
	export let territory = '';
	export let region = '';
	export let route = '';
	export let point_of_sale = '';
	export let employee = '';
	export let mtm_std = 0;
	export let mtm_non_std = 0;

	let token = '';
	let category = '';
	let parent_product = '';

	let showFilters = false;

	let topSTDProducts = [];
	let topNSTDProducts = [];
	let totalSTDRevenue = 0;
	let totalNSTDRevenue = 0;
	let totalSTDProfit = 0;
	let totalNSTDProfit = 0;
	let totalSTDProfitMargin = 0;
	let totalNSTDProfitMargin = 0;
	let STDRevenueGrowth = 0;
	let NSTDRevenueGrowth = 0;
	let STDProfitGrowth = 0;
	let NSTDProfitGrowth = 0;
	

	async function fetchData() {
		try {
			const data = await fetchTopRevenue(
				span,
				timeline,
				region,
				territory,
				route,
				point_of_sale,
				employee,
				category,
				parent_product
			);
			if (!data) {
				console.error('No data available to display the chart.');
				return;
			}

			topSTDProducts = data.top_revenue_std;
			topNSTDProducts = data.top_revenue_non_std;
			totalSTDProfit = data.total_std_profit;
			totalNSTDProfit = data.total_non_std_profit;
			totalSTDRevenue = data.total_revenue_std;
			totalNSTDRevenue = data.total_revenue_non_std;
			totalSTDProfitMargin = data.total_profit_margin_std;
			totalNSTDProfitMargin = data.total_profit_margin_non_std;
			STDRevenueGrowth = data.total_revenue_std_increase;
			NSTDRevenueGrowth = data.total_revenue_non_std_increase;
			STDProfitGrowth = data.total_profit_margin_std_increase;
			NSTDProfitGrowth = data.total_profit_margin_non_std_increase;
		} catch (error) {
			console.error('Error fetching sales volume:', error);
		} finally {
		}
	}

	function applyFilters() {
		fetchData(span, timeline, region, territory, route, point_of_sale, employee);
	}

	async function load(
		span,
		timeline,
		demarcation,
		territory,
		route,
		point_of_sale,
		employee
	) {
		await fetchData();
	}
	$: load(span, timeline, region, territory, route, point_of_sale, employee);


</script>

<div>
	<div>
		<div class="flex gap-x-4 items-center">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">Gross Revenue & Gross Profit</h3>
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
						<CategoryFilter bind:category bind:parentProduct={parent_product} sku_enabled={false} on:change={() => applyFilters()} />
					</div>
				{/if}
			</div>
			
		</div>
		<div class="grid grid-cols-2 gap-2">
		<div>
			<div class="p-2 stat-title text-[#002a47] dark:text-gray-100">Standard Products</div>

		<div class="stats grid grid-cols-2 shadow ml-2 mb-2 h-fit w-full flex justify-between">
		    <div class="stat w-full text-gray-300">
				<div class="text-gray-900">

				</div>
				<div class="flex gap-2">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Gross Revenue</div>
				<div class="flex gap-2 stat-value text-gray-900 dark:text-gray-200 dark:text-gray-200 text-2xl">
					 {totalSTDRevenue} ETB
				</div>
				</div>
				
				</div>
			</div>


			<div class="stat flex w-full flex justify-start text-gray-300">
				<div class="text-gray-900">
					
				</div>
				<div class="flex gap-2">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">{timeline == "Daily"? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly"? "MTM" : "YTY"}</div>
				<div class="flex gap-2 stat-value text-gray-900 dark:text-gray-200 text-2xl">
					<div class="flex font-bold self-center text-gray-900 text-2xl dark:text-gray-200">
					<div class="flex self-center">
					<div>{@html

					STDRevenueGrowth < 0 ?

					'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
				    :
				    STDRevenueGrowth == 0 ?
                    
						'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
				    :

					'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

					}</div>
					</div>
					{#if STDRevenueGrowth != 0}
					<div class={STDRevenueGrowth > 0 ? "pl-1 stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : STDRevenueGrowth == 0  ? 'invisible' : "pl-1 stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
					{Math.abs(STDRevenueGrowth)}%
										</div>
					{/if}
				</div>

				</div>
			</div>
				
			</div>
			</div>

			
		</div>

		<div class="stats grid grid-cols-2 shadow ml-2 mb-2 h-fit w-full flex justify-between">
		    <div class="stat w-full text-gray-300">
				<div class="text-gray-900">

				</div>
				<div class="flex gap-2">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Gross Profit</div>
				<div class="flex gap-2 stat-value text-gray-900 dark:text-gray-200 dark:text-gray-200 text-2xl">
					 {totalSTDProfit} ETB
				
				</div>
				</div>
				
				</div>
			</div>


			<div class="stat flex w-full flex justify-start text-gray-300">
				<div class="text-gray-900">
					
				</div>
				<div class="flex gap-2">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">{timeline == "Daily"? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly"? "MTM" : "YTY"}</div>
				<div class="flex gap-2 stat-value text-gray-900 dark:text-gray-200 text-xl">
					<div class="flex self-center text-gray-900 text-2xl font-bold dark:text-gray-100">
					<div class="flex self-center">
					<div>{@html

					STDProfitGrowth < 0 ?

					'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
				    :
				    STDProfitGrowth == 0 ?
                    
						'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
				    :

					'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

					}</div>
					</div>
					{#if STDProfitGrowth != 0}
					<div class={STDProfitGrowth > 0 ? "pl-1 stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : STDProfitGrowth == 0  ? 'invisible' : "pl-1 stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
					{Math.abs(STDProfitGrowth)}%
										</div>
					{/if}
				</div>

				</div>
				</div>
				
				</div>
		</div>

			
		</div>

			<table class="table bg-white w-full dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0">
				<!-- head -->
				<thead
					class="text-gray-700 bg-gray-100 dark:text-gray-100 dark:bg-[#0f1727] sticky top-0 z-0"
				>
					<tr class="rounded-full">
						<th>STD Product</th>
						<th>Gross Revenue</th>
						<th>Gross Profit</th>
					</tr>
				</thead>
				<tbody>
					<!-- row 1 -->
					{#each topSTDProducts as _, i}
							<tr
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{_.product}</div></td>
								<td>{_.revenue}</td>
								<td>{_.gross_profit}</td>
							</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div>
		<div class="p-2 stat-title text-[#002a47] dark:text-gray-100">Non Standard Products</div>
			<div class="stats grid grid-cols-2 shadow ml-2 mb-2 h-fit w-full flex justify-between">
		    <div class="stat w-full text-gray-300">
				<div class="text-gray-900">

				</div>
				<div class="flex gap-2">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Gross Revenue</div>
				<div class="flex gap-2 stat-value text-gray-900 dark:text-gray-200 dark:text-gray-200 text-2xl">
					 {totalNSTDRevenue} ETB
				</div>
				</div>
				
				</div>
			</div>


			<div class="stat flex w-full flex justify-start text-gray-300">
				<div class="text-gray-900">
					
				</div>
				<div class="flex gap-2">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">{timeline == "Daily"? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly"? "MTM" : "YTY"}</div>
				<div class="flex gap-2 stat-value text-gray-900 dark:text-gray-200 text-2xl">
					<div class="flex font-bold self-center text-gray-900 text-2xl dark:text-gray-200">
					<div class="flex self-center">
					<div>{@html

					NSTDRevenueGrowth < 0 ?

					'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
				    :
				    NSTDRevenueGrowth == 0 ?
                    
						'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
				    :

					'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

					}</div>
					</div>
					{#if NSTDRevenueGrowth != 0}
					<div class={NSTDRevenueGrowth > 0 ? "pl-2 stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : NSTDRevenueGrowth == 0  ? 'invisible' : "pl-1 stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
					{Math.abs(NSTDRevenueGrowth)}%
										</div>
					{/if}
				</div>

				</div>
			</div>
				
			</div>
			</div>

			
		</div>

		<div class="stats grid grid-cols-2 shadow ml-2 mb-2 h-fit w-full flex justify-between">
		    <div class="stat w-full text-gray-300">
				<div class="text-gray-900">

				</div>
				<div class="flex gap-2">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Gross Profit</div>
				<div class="flex gap-2 stat-value text-gray-900 dark:text-gray-200 dark:text-gray-200 text-2xl">
					 {totalNSTDProfit} ETB
				
				</div>
				</div>
				
				</div>
			</div>


			<div class="stat flex w-full flex justify-start text-gray-300">
				<div class="text-gray-900">
					
				</div>
				<div class="flex gap-2">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">{timeline == "Daily"? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly"? "MTM" : "YTY"}</div>
				<div class="flex gap-2 stat-value text-gray-900 dark:text-gray-200 text-xl">
					<div class="flex self-center text-gray-900 text-2xl font-bold dark:text-gray-100">
					<div class="flex self-center">
					<div>{@html

					NSTDProfitGrowth < 0 ?

					'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
				    :
				    NSTDProfitGrowth == 0 ?
                    
						'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
				    :

					'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

					}</div>
					</div>
					{#if NSTDProfitGrowth != 0}
					<div class={NSTDProfitGrowth > 0 ? "pl-2 stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : NSTDProfitGrowth == 0  ? 'invisible' : "pl-1 stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
					{Math.abs(NSTDProfitGrowth)}%
										</div>
					{/if}
				</div>

				</div>
				</div>
				
				</div>
		</div>


		</div>

		<table class="table bg-white dark:bg-[#002a47] w-full text-gray-900 dark:text-gray-100 z-0">
				<!-- head -->
				<thead
					class="text-gray-700 bg-gray-100 dark:text-gray-100 dark:bg-[#0f1727] sticky top-0 z-0"
				>
					<tr class="rounded-full">
						<th>N-STD Product</th>
						<th>Gross Revenue</th>
						<th>Gross Profit</th>
					</tr>
				</thead>
				<tbody>
					<!-- row 1 -->
					{#each topNSTDProducts as _, i}
							<tr
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{_.product}</div></td>
								<td>{_.revenue}</td>
								<td>{_.gross_profit}</td>
							</tr>
					{/each}
				</tbody>
			</table>

		</div>
	</div>
	</div>
	
	
</div>
