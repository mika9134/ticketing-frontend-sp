<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import { fetchDefectVsStock, fetchRecentSalesVsDefect } from '../../../../apis/api-utils';
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';
	import { exportCSV, fetchTable } from '../../../../apis/table.js'; // Adjust the path as needed
	import { getAccessToken } from '../../../../stores/tokenStore';
	import { host } from '../../../../apis/config';
	import CategoryFilter from '../filter/category_filter.svelte';

	export let timeline = 'Daily';
	export let span = 7;
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';
	export let employee = '';
	export let category = '';
	export let parentProduct = '';
	export let product = '';

	let warehouse = '';
	let stock_type = '';
	let pieChart;
	let totalSold = 0;
	let totalDefect = 0;
	let totalStockIn = 0;
	let totalVstock = 0;
	let totalReturnToVendor = 0;
	let totalCurrentBalance = 0;
	let totalInitialBalance = 0;
	let series = [];
	let maxItems = 10;
	let summaryDate = '';
	let soldPercentage = 0;
	let defectPercentage = 0;
	let stockInPercentage = 0;
	let currentBalancePercentage = 0;
	let initialBalancePercentage = 0;

	let non_std_currentBalance = 0;
	let non_std_initialBalance = 0;
	let non_std_stockIn = 0;
	let non_std_defectStock = 0;
	let non_std_purchasedAsset = 0;
	let non_std_totalSalesVolume = 0;
	let non_std_summaryDate = 0;
	let non_std_defectAsset = 0;
	let non_std_currentBalanceAsset = 0;
	let non_std_vstock = 0;
	let non_std_returnToVender= 0;
	let canvasEl; // bound canvas reference

	let showFilters = false;

	let currentTheme = get(themeStore);
	themeStore.subscribe(async (value) => {
		currentTheme = value;
		if (pieChart) {
			await pieChart.destroy();
			await setupChart();
			fetchData(span, timeline, territory, route, point_of_sale, employee, category, parentProduct, product, warehouse, stock_type);
		}
	});

	const getOrCreateLegendList = (chart, id) => {
		const legendContainer = document.getElementById(id);
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

			items.forEach((item) => {
				const li = document.createElement('li');
				li.style.alignItems = 'center';
				li.style.cursor = 'pointer';
				li.style.display = 'flex';
				li.style.flexDirection = 'row';
				li.style.marginLeft = '10px';

				li.onclick = () => {
					const { type } = chart.config;
					if (type === 'pie' || type === 'doughnut') {
						// Pie and doughnut charts only have a single dataset and visibility is per item
						chart.toggleDataVisibility(item.index);
					} else {
						chart.setDatasetVisibility(
							item.datasetIndex,
							!chart.isDatasetVisible(item.datasetIndex)
						);
					}
					chart.update();
				};

				// Color box
				const boxSpan = document.createElement('span');
				boxSpan.style.background = item.fillStyle;
				boxSpan.style.borderWidth = '0px';
				boxSpan.style.display = 'inline-block';
				boxSpan.style.flexShrink = 0;
				boxSpan.style.height = '10px';
				boxSpan.style.marginRight = '10px';
				boxSpan.style.width = '20px';

				// Text
				const textContainer = document.createElement('p');
				textContainer.style.color = currentTheme == 'light' ? '#555555' : 'white';
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

	// Fetch data from backend
	async function fetchData(
		selectedSpan,
		selectedTimeline,
		selectedTerritory,
		selectedRoute,
		selectedPointOfSale,
		selectedEmployee,
		selectedCategory,
		selectedParentProduct,
		selectedProduct,
		selectedWarehouse,
		selectedStockType
	) {
		try {

			const data = await fetchRecentSalesVsDefect(
				selectedSpan,
				selectedTimeline,
				selectedTerritory,
				selectedRoute,
				selectedPointOfSale,
				selectedEmployee,
				selectedCategory,
				selectedParentProduct,
				selectedProduct,
				selectedWarehouse,
				selectedStockType
			);
			// Extract totals
			totalSold = data.recent.sold;
			totalDefect = data.recent.defect;
			totalStockIn = data.recent.purchased;
			totalInitialBalance = data.recent.initial_balance;
			totalCurrentBalance = data.recent.current_balance;
			totalVstock = data.recent.vstock_balance;
			totalReturnToVendor = data.recent.return_to_vendor_balance;


			non_std_currentBalance = data.recent.non_std_current_balance;
			non_std_initialBalance = data.recent.non_std_initial_balance;
			non_std_stockIn = data.recent.non_std_purchased;
			non_std_defectStock = data.recent.non_std_defect;
			non_std_totalSalesVolume = data.recent.non_std_sold;
			non_std_summaryDate = data.recent.non_std_period;
			non_std_defectAsset = data.recent.non_std_defect_asset;
			non_std_currentBalanceAsset = data.recent.non_std_current_asset;
			non_std_vstock = data.recent.non_std_vstock_balance;
			non_std_returnToVender = data.recent.non_std_return_to_vendor_balance;
			summaryDate = data.recent.period;

			const data_series = await fetchDefectVsStock(
				selectedSpan,
				selectedTimeline,
				selectedCategory,
				selectedParentProduct,
				selectedProduct,
				selectedWarehouse,
				selectedStockType
			);
			series = data_series.timeseries;

			const grandTotal =
				totalSold + totalDefect + totalStockIn + totalInitialBalance + totalCurrentBalance;

			// Percentages
			soldPercentage = grandTotal ? Math.round((totalSold / grandTotal) * 100) : 0;
			defectPercentage = grandTotal ? Math.round((totalDefect / grandTotal) * 100) : 0;
			stockInPercentage = grandTotal ? Math.round((totalStockIn / grandTotal) * 100) : 0;
			initialBalancePercentage = grandTotal
				? Math.round((totalInitialBalance / grandTotal) * 100)
				: 0;
			currentBalancePercentage = grandTotal
				? Math.round((totalCurrentBalance / grandTotal) * 100)
				: 0;

			// updateChart(totalSold, totalDefect, totalStockIn, totalInitialBalance, totalCurrentBalance);
		} catch (error) {
			console.error('Error fetching Sold vs Defect vs StockIn:', error);
		}
	}

	async function setupChart() {
		if (!canvasEl) return; // Guard to avoid null

		const ctx = canvasEl.getContext('2d');
		Chart.register(ChartDataLabels);

		pieChart = new Chart(ctx, {
			type: 'doughnut',
			plugins: [htmlLegendPlugin],
			data: {
				labels: ['Sold', 'Defect', 'Purchased', 'Initial Balance', 'Current Balance'],
				datasets: [
					{
						data: [0, 0, 0, 0, 0],
						backgroundColor: ['#f79256', '#e8dab2', '#7dcfb6', '#00b2ca', '#1d4e89'],
						hoverBackgroundColor: ['#f79256', '#e8dab2', '#7dcfb6', '#00b2ca', '#1d4e89'],
						// #F78D46
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
					datalabels: {
						formatter: function (value, context) {
							return `${value}`;
						}
					},
					title: {
						display: false,
						text: 'Cash vs Credit',
						color: 'white'
					},
					htmlLegend: {
						containerID: 'soldvsdefect'
					},
					legend: {
						display: false,
						position: 'bottom'
					}
				}
			}
		});
	}

	$: fetchData(span, timeline, territory, route, point_of_sale, employee, category, parentProduct, product, warehouse, stock_type);

	onMount(() => {
		setupChart();
	});

	function updateChart(sold, defect, stockIn, initial, current) {
		if (pieChart) {
			pieChart.data.datasets[0].data = [sold, defect, stockIn, initial, current];
			pieChart.update();
		}
	}

	function applyFilters() {
		fetchData(span, timeline, territory, route, point_of_sale, employee, category, parentProduct, product, warehouse, stock_type);
	}
</script>

<div class="grid grid-cols-3 grid-rows-1 gap-4 z-[5]">
	<div class="flex flex-col col-span-3 gap-6 p-2">
		<div class="flex justify-between items-center">
			<h3 class="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
				Stock Overview
			</h3>
			<div class="relative">
				<button
					onclick={() => (showFilters = !showFilters)}
					class="p-2 rounded-xl transition-all duration-200 bg-white dark:bg-[#0f1727] shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
				>
					<svg
					width="32px"
					height="32px"
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
						class="absolute right-0 mt-3 w-[400px] p-4 rounded-2xl shadow-2xl bg-white dark:bg-[#002a47] border border-gray-100 dark:border-gray-700 z-[50] animate-in fade-in zoom-in duration-200"
					>
						<CategoryFilter bind:category bind:product bind:parentProduct bind:warehouse bind:stock_type warehouse_enabled={true} on:change={() => applyFilters()} />
					</div>
				{/if}
			</div>
		</div>
	</div>
		<div
			class="p-4 rounded-2xl row-span-3 bg-gray-100 p-8 dark:bg-[#0f1727] border border-gray-100 dark:border-gray-800 shadow-sm"
		>
			<div class="relative z-2">
				<div class="flex items-center gap-3 mb-2">
					<div class="w-2 h-8 rounded-full bg-[#00999f]"></div>
					<span class="text-xs font-medium text-gray-800 dark:text-gray-400">Current Balance</span>
				</div>

					<div class='flex flex-col gap-2'>

				<p class="text-gray-900 dark:text-blue-200 text-xs mt-4 flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line
							x1="16"
							y1="2"
							x2="16"
							y2="6"
						></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"
						></line></svg
					>
				</p>


						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Standard Products</div>
						    <div class="stat-value text-2xl">{totalCurrentBalance}</div>
						  </div>
						</div>



						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Non Standard Products</div>
						    <div class="stat-value text-2xl">{non_std_currentBalance}</div>
						  </div>
						</div>

					</div>
			</div>

		</div>

	<div
				class="p-4 rounded-2xl bg-white p-8 dark:bg-[#0f1727] border border-gray-100 dark:border-gray-800 shadow-sm"
			>
				<div class="flex items-center gap-3 mb-2">
					<div class="w-2 h-8 rounded-full bg-[#00aa80]"></div>
					<span class="text-xs font-medium text-gray-800 dark:text-gray-400">Initial Balance</span>
				</div>
				<div class="flex gap-2">

						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Standard Products</div>
						    <div class="stat-value text-2xl">{totalInitialBalance}</div>
						  </div>
						</div>



						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Non Standard Products</div>
						    <div class="stat-value text-2xl">{non_std_initialBalance}</div>
						  </div>
						</div>
				</div>
			</div>

		<div
				class="p-4 rounded-2xl bg-white p-8 dark:bg-[#0f1727] border border-gray-100 dark:border-gray-800 shadow-sm"
			>
				<div class="flex items-center gap-3 mb-2">
					<div class="w-2 h-8 rounded-full bg-[#aa99ff]"></div>
					<span class="text-xs font-medium text-gray-800 dark:text-gray-400">Purchased</span>
				</div>
				<div class="flex gap-2">

					<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Standard Products</div>
						    <div class="stat-value text-2xl">{totalStockIn}</div>
						  </div>
						</div>



						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Non Standard Products</div>
						    <div class="stat-value text-2xl">{non_std_stockIn}</div>
						  </div>
						</div>
				</div>
			</div>


		<div
				class="p-4 rounded-2xl bg-white p-8 dark:bg-[#0f1727] border border-gray-100 dark:border-gray-800 shadow-sm"
			>
				<div class="flex items-center gap-3 mb-2">
					<div class="w-2 h-8 rounded-full bg-[#99aaaa]"></div>
					<span class="text-xs font-medium text-gray-800 dark:text-gray-400">Sold</span>
				</div>
				<div class="flex gap-2">

						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Standard Products</div>
						    <div class="stat-value text-2xl">{totalSold}</div>
						  </div>
						</div>



						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Non Standard Products</div>
						    <div class="stat-value text-2xl">{non_std_totalSalesVolume}</div>
						  </div>
						</div>
				</div>
			</div>


		<div
				class="p-4 rounded-2xl bg-white p-8 dark:bg-[#0f1727] border border-gray-100 dark:border-gray-800 shadow-sm"
			>
				<div class="flex items-center gap-3 mb-2">
					<div class="w-2 h-8 rounded-full bg-[#99aaaa]"></div>
					<span class="text-xs font-medium text-gray-800 dark:text-gray-400">Defect</span>
				</div>
				<div class="flex gap-2">

						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Standard Products</div>
						    <div class="stat-value text-2xl">{totalDefect}</div>
						  </div>
						</div>



						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Non Standard Products</div>
						    <div class="stat-value text-2xl">{non_std_defectStock}</div>
						  </div>
						</div>
				</div>
			</div>

		<div
				class="p-4 rounded-2xl bg-white p-8 dark:bg-[#0f1727] border border-gray-100 dark:border-gray-800 shadow-sm"
			>
				<div class="flex items-center gap-3 mb-2">
					<div class="w-2 h-8 rounded-full bg-[#99aaaa]"></div>
					<span class="text-xs font-medium text-gray-800 dark:text-gray-400">VStock</span>
				</div>
				<div class="flex gap-2">
						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Standard Products</div>
						    <div class="stat-value text-2xl">{totalVstock}</div>
						  </div>
						</div>



						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Non Standard Products</div>
						    <div class="stat-value text-2xl">{non_std_vstock}</div>
						  </div>
						</div>
				</div>
			</div>



		<div
				class="p-4 rounded-2xl bg-white p-8 dark:bg-[#0f1727] border border-gray-100 dark:border-gray-800 shadow-sm"
			>
				<div class="flex items-center gap-3 mb-2">
					<div class="w-2 h-8 rounded-full bg-[#99aaaa]"></div>
					<span class="text-xs font-medium text-gray-800 dark:text-gray-400">Return to Vendor</span>
				</div>
				<div class="flex gap-2">
					<div class="flex gap-2">
						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Standard Products</div>
						    <div class="stat-value text-2xl">{totalReturnToVendor}</div>
						  </div>
						</div>



						<div class="stats shadow p-2">
						  <div class="stat text-gray-900 dark:text-gray-100">
						    <div class="stat-title text-gray-900 dark:text-gray-100 text-xs">Non Standard Products</div>
						    <div class="stat-value text-2xl">{non_std_returnToVender}</div>
						  </div>
					</div>
				</div>
			</div>
		</div>



	
</div>

<style>
    /* You can remove the old .circle-container and .deg CSS entirely */
	#soldvsdefect :global(ul) {
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
	}
	#soldvsdefect :global(li) {
		background: rgba(125, 125, 125, 0.05);
		padding: 4px 10px;
		border-radius: 8px;
		margin: 0 !important;
	}
</style>