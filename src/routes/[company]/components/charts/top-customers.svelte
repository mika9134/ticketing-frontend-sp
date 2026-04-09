<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the datalabels plugin
	import { fetchTopCustomers } from '../../../../apis/api-utils.js'; // Adjust the path as needed
	import { themeStore } from '../../../../stores/themeStore.js';
	import { exportCSV } from '../../../../apis/table.js'; // Adjust the path as needed
	import { get } from 'svelte/store';
	import pkg from 'highcharts';
	import CategoryFilter from '../filter/category_filter.svelte';

	const { Point } = pkg;

	export let timeline = 'Daily';
	export let region = '';
	export let span = 7;
	export let territory = '';
	export let route = '';
	export let point_of_sale_id = '';
	export let category = '';
	export let parentProduct = '';
	export let product = '';

	let std_point_of_sale = [];
	let std_point_of_sale_ids = [];
	let std_categories = [];
	let std_products = [];
	let nstd_point_of_sale = [];
	let nstd_point_of_sale_ids = [];
	let nstd_categories = [];
	let nstd_products = [];
	let showFilters = false;
	let maxItems = 10;

	let top_n = 3;
	let std_total = [];
	let std_total_top = [];
	let std_quantities = [];
	let std_amounts = [];
	let nstd_total = [];
	let nstd_total_top = [];
	let nstd_quantities = [];
	let nstd_amounts = [];
	let pieChart1;
	let pieChart9;
	let setup = false;

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
					if (type === 'polarArea') {
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


	let currentTheme = get(themeStore);
	themeStore.subscribe(async (value) => {
		currentTheme = value;
		if (pieChart1 && pieChart9)   {
			await pieChart1.destroy();
			await pieChart9.destroy();
			await setupChartStandard();
			await setupChartNonStandard();
			fetchData(span, timeline, region, territory, route, top_n);
		}
	});

	// Fetch data from the API
	async function fetchData(
		selectedSpan,
		selectedTimeline,
		selectedRegion,
		territory_id,
		route_id,
		top_n,
		category,
		parentProduct,
		product
	) {
		try {
		 setup = false;
			const std_data = await fetchTopCustomers(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				territory_id,
				route_id,
				top_n,
				category,
				parentProduct,
				product,
				"Standard"
			);



			if(std_data.length > 0){

			std_point_of_sale = std_data.map((item) => item.point_of_sale_name);
			std_point_of_sale_ids = std_data.map((item) => item.id);

			std_total = std_data.map((item) => parseInt(item.percentage * 100));

			std_total_top = std_data.map((item) => parseInt(item.percentage_top * 100));

			std_quantities = std_data.map((item) => item.total_volume);

			std_amounts = std_data.map((item) => item.total_sales);

			updateChartStandard(std_point_of_sale.slice(0, 3), std_total_top.slice(0, 3));

			}
			else {
			 std_point_of_sale = [];
			 std_point_of_sale_ids = '';
			 std_total = 0;
			 std_total_top = 0;
			 std_quantities = 0;
			 std_amounts = 0;

			 updateChartStandard([], []);

			}

			const nstd_data = await fetchTopCustomers(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				territory_id,
				route_id,
				top_n,
				category,
				parentProduct,
				product,
				"Non Standard"
			);

			if(nstd_data.length > 0){

			nstd_point_of_sale = nstd_data.map((item) => item.point_of_sale_name);

			nstd_point_of_sale_ids = nstd_data.map((item) => item.id);

			nstd_total = nstd_data.map((item) => parseInt(item.percentage * 100));

			nstd_total_top = nstd_data.map((item) => parseInt(item.percentage_top * 100));

			nstd_quantities = nstd_data.map((item) => item.total_volume);

			nstd_amounts = nstd_data.map((item) => item.total_sales);

			updateChartNonStandard(nstd_point_of_sale.slice(0, 3), nstd_total_top.slice(0, 3));

			}
			else {
			 nstd_point_of_sale = [];
			 nstd_point_of_sale_ids = '';
			 nstd_total = 0;
			 nstd_total_top = 0;
			 nstd_quantities = 0;
			 nstd_amounts = 0;

			 updateChartNonStandard([], []);

			}

			setup = true;


		} catch (error) {
			console.error('Error fetching Top Customers: ', error);
		}
	}

	async function setupChartStandard(chart_id) {

		const ctx = document.getElementById(chart_id).getContext('2d');

		// Register the datalabels plugin
		Chart.register(ChartDataLabels);

		pieChart1 = new Chart(ctx, {
			type: 'polarArea',
			plugins: [htmlLegendPlugin],
			data: {
				labels: std_point_of_sale,
				datasets: [
					{
						data: std_total,
						backgroundColor: ['#177e89', '#084c61', '#7dcfb6', '#00b2ca', '#1d4e89'],
						hoverBackgroundColor: ['#177e89', '#084c61', '#7dcfb6', '#00b2ca', '#1d4e89'],
						borderWidth: 0
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
					datalabels: {
						anchor: 'center',
						align: 'center',
						formatter: function (value) {
							return `${value}%`;
						},
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
					htmlLegend: {
						containerID: `${chart_id}_legend`
					},
					legend: {
						display: false,
						position: 'bottom'
					},
					tooltip: {
						enabled: true, // Enable tooltips on hover
						callbacks: {
							label: function (tooltipItem) {
								const value = tooltipItem.raw || 0;
								return `${value.toLocaleString()}%`; // Format the tooltip label
							}
						}
					}
				}
			}
		});

	}
	async function setupChartNonStandard(chart_id) {

		const ctx = document.getElementById(chart_id).getContext('2d');

		// Register the datalabels plugin
		Chart.register(ChartDataLabels);

		pieChart9 = new Chart(ctx, {
			type: 'polarArea',
			plugins: [htmlLegendPlugin],
			data: {
				labels: nstd_point_of_sale,
				datasets: [
					{
						data: nstd_total,
						backgroundColor: ['#177e89', '#084c61', '#7dcfb6', '#00b2ca', '#1d4e89'],
						hoverBackgroundColor: ['#177e89', '#084c61', '#7dcfb6', '#00b2ca', '#1d4e89'],
						borderWidth: 0
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
					datalabels: {
						anchor: 'center',
						align: 'center',
						formatter: function (value) {
							return `${value}%`;
						},
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
					htmlLegend: {
						containerID: `${chart_id}_legend`
					},
					legend: {
						display: false,
						position: 'bottom'
					},
					tooltip: {
						enabled: true, // Enable tooltips on hover
						callbacks: {
							label: function (tooltipItem) {
								const value = tooltipItem.raw || 0;
								return `${value.toLocaleString()}%`; // Format the tooltip label
							}
						}
					}
				}
			}
		});

	}

	$: fetchData(span, timeline, region, territory, route, top_n, category, parentProduct, product);

	onMount(() => {
		setupChartStandard('pieChart1');
		setupChartNonStandard('pieChart9');
		fetchData(span, timeline, region, territory, route, top_n, category, parentProduct, product);
	});

	function applyFilters() {
		fetchData(span, timeline, region, territory, route, top_n, category, parentProduct, product);
	}

	function updateChartStandard(labels, values) {
		if (pieChart1) {
			pieChart1.data.labels = labels;
			pieChart1.data.datasets[0].data = values;
			pieChart1.data.datasets[0].label = labels;
			pieChart1.update();
		}
	}
	function updateChartNonStandard(labels, values) {
		if (pieChart9) {
			pieChart9.data.labels = labels;
			pieChart9.data.datasets[0].data = values;
			pieChart9.data.datasets[0].label = labels;
			pieChart9.update();
		}
	}
	
</script>


{#if std_point_of_sale.length == 0 && nstd_point_of_sale.length == 0}
	<p class="p-2 text-gray-900 dark:text-gray-200">No customers in this period</p>
{/if}
<div class={std_point_of_sale.length > 0 && nstd_point_of_sale.length > 0 ? "grid grid-cols-2 bg-white dark:bg-[#002a47] gap-10" : "grid grid-cols-1 bg-white dark:bg-[#002a47] gap-10"}>
<div>
	<div class="flex-1">
		<div class="flex justify-between items-center">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">
				{setup && std_point_of_sale.length == 0 ? "" : "Top Standard Customers"}
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
						<CategoryFilter
							bind:category
							bind:product
							bind:parentProduct
							on:change={() => applyFilters()}
						/>
					</div>
				{/if}
			</div>
		</div>
		<div class="flex justify-center w-full">
			<div class="flex justify-center w-fit">
				<canvas class="w-[300px] grow-0" id="pieChart1" width="150" height="80"></canvas>
			</div>
		</div>
		<div class="flex mt-10 invisible">
			<div id="pieChart1_legend"></div>
		</div>
		{#if std_point_of_sale.length == 0}
		<div class="mt-10">

		</div>
		{/if}
	</div>

	<div class={std_point_of_sale.length == 0 ? "hidden": ""}>
		<table class="table bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0 m-4">
			<!-- head -->
			<thead
				class="text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-[#0f1727] sticky top-0 z-0"
			>
				<tr>
					<th></th>

					<th>Customer</th>
					<th>Percentage</th>
					<th>Quantity</th>
					<th>Sales</th>
					<th
						><div
							onclick={() => {
								exportCSV(std_point_of_sale);
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
				{#if std_total.length > 0}
					{#each std_point_of_sale as row, i}
						{#if i < maxItems}
							<tr
								onclick={() => {
									let index_of_pos = std_point_of_sale.indexOf(row);
									std_point_of_sale_id = std_point_of_sale_ids[index_of_pos];
								}}
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{i + 1}</div></td>
								<td>{row}</td>
								<td>{std_total[i]} %</td>
								<td>{std_quantities[i]} Pcs</td>
								<td>{std_amounts[i]} ETB</td>
								<td></td>
							</tr>
						{/if}
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

<div>
	<div class={setup && nstd_point_of_sale.length == 0 ? "hidden": "flex-1"}>
		<div class="flex justify-between items-center">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">
				Top Non Standard Customers
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
						<CategoryFilter
							bind:category
							bind:product
							bind:parentProduct
							on:change={() => applyFilters()}
						/>
					</div>
				{/if}
			</div>
		</div>
		<div class="flex justify-center w-full">
			<div class="flex justify-center w-fit">
				<canvas class="w-[300px] grow-0" id="pieChart9" width="150" height="80"></canvas>
			</div>
		</div>
		<div class="flex mt-10 invisible">
			<div id="pieChart9_legend"></div>
		</div>
		{#if nstd_point_of_sale.length == 0}
		<div class="mt-10">

		</div>
		{/if}
		
	</div>

	<div class={nstd_point_of_sale.length == 0 ? "hidden": ""}>
		<table class="table bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0 m-4">
			<!-- head -->
			<thead
				class="text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-[#0f1727] sticky top-0 z-0"
			>
				<tr>
					<th></th>

					<th>Customer</th>
					<th>Percentage</th>
					<th>Sales</th>
					<th
						><div
							onclick={() => {
								exportCSV(nstd_point_of_sale);
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
				{#if nstd_point_of_sale.length > 0}
					{#each nstd_point_of_sale as row, i}
						{#if i < maxItems}
							<tr
								onclick={() => {
									let index_of_pos = nstd_point_of_sale.indexOf(row);
									point_of_sale_id = nstd_point_of_sale_ids[index_of_pos];
								}}
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{i + 1}</div></td>
								<td>{row}</td>
								<td>{nstd_total[i]} %</td>
								<td>{nstd_amounts[i]} ETB</td>
								<td></td>
							</tr>
						{/if}
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

</div>
