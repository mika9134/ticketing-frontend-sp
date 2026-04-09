<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the datalabels plugin
	import { fetchCashVsCreditVoid } from '../../../../apis/api-utils.js'; // Adjust the path as needed
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';
	import { exportCSV } from '../../../../apis/table.js'; // Adjust the path as needed
	import CategoryFilter from '../filter/category_filter.svelte';
	// Declare props with default values
	export let timeline = 'Daily'; // Default timeline
	export let span = 7; // Default span is 3 days
	export let region = '';
	export let territory;
	export let route;
	export let point_of_sale;
	export let user_id;
	export let category = '';
	export let parentProduct = '';
	export let product = '';
	export let chartID;
	export let legendID;

	let maxItems = 10;

	let pieChart;
	let cashRatio = 0;
	let creditRatio = 0;
	let cashVolume = 0;
	let cashVoidVolume = 0;
	let creditVolume = 0;
	let creditVoidVolume = 0;
	let cashPercentage = 0; // Changed to a number
	let cashVoidPercentage = 0;
	let creditPercentage = 0; // Changed to a number
	let creditVoidPercentage = 0;
	let voidPercentage = 0;
	let cash_series = [];
	let credit_series = [];
	let void_series = [];
	let cashGrowth = 0;
	let creditGrowth = 0;
	let cashSVG = '';
	let creditSVG = '';
	let showFilters = false;
	let total = 0;

	let currentTheme = get(themeStore);
	themeStore.subscribe(async (value) => {
		currentTheme = value;
		if (pieChart) {
			await pieChart.destroy();
			await setupChart();
			fetchData(span, timeline);
		}
	});

	function parseSuffix(s) {
		let num = parseFloat(s);

		if (typeof s == 'string') {
			if (s.toLowerCase().endsWith('k')) num *= 1000;
			else if (s.toLowerCase().endsWith('m')) num *= 1000000;
		}

		return num;
	}

	// Fetch data from the API
	async function fetchData(
		span,
		timeline,
		region,
		territory,
		route,
		point_of_sale,
		user_id,
		category,
		parentProduct,
		product
	) {
		try {
			const data = await fetchCashVsCreditVoid(
				span,
				timeline,
				region,
				territory,
				route,
				point_of_sale,
				user_id,
				category,
				parentProduct,
				product
			);
			total = 0;

			cash_series = data.cash;
			credit_series = data.credit;
			void_series = data.void;


			cashVolume = data.cash_total;
			cashVoidVolume = data.void_total;
			creditVolume = data.credit_total;
			creditVoidVolume = 0;

			total = parseSuffix(cashVolume) + parseSuffix(cashVoidVolume) + parseSuffix(creditVolume);

        	if(total > 0)
        	{
			updateChart(
					(parseSuffix(data.cash_total)*100/total).toFixed(2),
					(parseSuffix(data.credit_total)*100/total).toFixed(2),
					(parseSuffix(data.void_total)*100/total).toFixed(2),
					0
			);
			}
			else {
			updateChart(
					0,
					0,
					0,
					0
			);
			}
		} catch (error) {
			console.error('Error fetching cash vs credit:', error);
		}
	}

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
				li.style.color = currentTheme == 'light' ? '#555555' : 'white';

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

	async function setupChart() {
		const ctx = document.getElementById(chartID).getContext('2d');

		// Register the datalabels plugin
		Chart.register(ChartDataLabels);

		pieChart = new Chart(ctx, {
			type: 'doughnut',
			plugins: [htmlLegendPlugin],
			data: {
				labels: ['Cash', 'Credit', 'Void'],
				datasets: [
					{
						label: [],
						data: [0, 0, 0],
						backgroundColor: ['#177e89', '#084c61', '#7dcfb6'],// Colors for the pie chart
						borderColor: currentTheme == 'light' ? 'white' : '#002a47',
						hoverBackgroundColor: ['#177e89', '#084c61',  '#7dcfb6'],// Match the background color to remove black hover
						borderWidth: 4,
						tension: 0.4 // Smooth curve
					},
				]
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: true, // Allow manual resizing

				plugins: {
					title: {
						display: false,
						text: 'Cash Invoice vs Credit Invoice',
						color: 'white'
					},
					datalabels: {
						anchor: 'center',
						align: 'center',
						formatter: function (value) {
							if (value > 0) {
								return `${value.toLocaleString()} %`;
							} else {
								return '';
							}
						},
						color: 'white',
						font: {
							size: 16
						}
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
						containerID: legendID
					},
					legend: {
						display: false,
						position: 'bottom'
					} // Hide the legend
				}
			}
		});
	}

	$: fetchData(
		span,
		timeline,
		region,
		territory,
		route,
		point_of_sale,
		user_id,
		category,
		parentProduct,
		product
	);

	onMount(() => {
		setupChart();
	});

	function updateChart(cashPercentage, creditPercentage, cashVoidPercentage, creditVoidPercentage) {
		if (pieChart) {
			pieChart.data.datasets[0].data = [cashPercentage, creditPercentage, cashVoidPercentage + creditVoidPercentage];
			pieChart.update();
		}
	}

	function applyFilters() {
		fetchData(
			span,
			timeline,
			region,
			territory,
			route,
			point_of_sale,
			user_id,
			category,
			parentProduct,
			product
		);
	}
</script>

<div class="grid grid-cols-2">
	<div class="flex flex-col gap-6 p-2">
		<div class="flex justify-between items-center">
			<h3 class="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Invoice</h3>
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

		<div class="flex-1">
			<!-- Pie chart -->
			<div class="flex justify-center w-full">
				<div class="flex justify-center w-fit">
					<canvas class="w-[350px] grow-0" id={chartID} width="300" height="300"></canvas>
				</div>
			</div>
		</div>
		<div class="flex mt-10 h-10 justify-left">
			<div id={legendID}></div>
		</div>
	</div>
	
		<div class="grid grid-cols-2 gap-x-2 gap-y-10 mt-4">

			<div class="stat text-gray-300 w-full rounded-lg shadow-lg">
				<div class="stat-title text-[#002a47] dark:text-gray-100">Cash</div>
				<div class="stat-value text-gray-900 dark:text-gray-200">{cashVolume} ETB</div>
			</div>
			
			
			<table class="table h-fit bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0">
				<!-- head -->
				<thead
					class="text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-[#0f1727] sticky h-fit top-0 z-0"
				>
					<tr class="h-fit">
						<th>Employee</th>
						<th>Cash Amount</th>
						<th
							><div
								onclick={() => {
									exportCSV(cash_series);
								}}
								class="flex justify-end h-fit rounded-sm cursor-pointer bg-gray-200 dark:bg-[#0f1727]"
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
				 	{#if cash_series.length}
					{#each cash_series as _, i}
						{#if i < maxItems}
							<tr
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{_.employee}</div></td>
								<td>{_.cash_amount} ETB</td>
								<td></td>
							</tr>
						{/if}
					{/each}
					{:else}
					<tr>
				 <td colspan=3><p class="p-2">No cash records in this period</p></td>
				</tr>
					{/if}
				</tbody>
			</table>

			<div class="stat text-gray-300 w-full rounded-lg shadow-lg">
				<div class="stat-title text-[#002a47] dark:text-gray-100">Credit</div>
				<div class="stat-value text-gray-900 dark:text-gray-200">{creditVolume} ETB</div>
			</div>

			<table class="table h-fit bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0">
					<!-- head -->
				<thead
					class="text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-[#0f1727] sticky h-fit top-0 z-0"
				>
					<tr class="h-fit">
						<th>Employee</th>
						<th>Credit Amount</th>
						<th
							><div
								onclick={() => {
									exportCSV(credit_series);
								}}
								class="flex justify-end h-fit rounded-sm cursor-pointer bg-gray-200 dark:bg-[#0f1727]"
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
					{#if credit_series.length}
					{#each credit_series as _, i}
						{#if i < maxItems}
							<tr
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{_.employee}</div></td>
								<td>{_.credit_amount} ETB</td>
								<td></td>
							</tr>
						{/if}
					{/each}
					{:else}
					 <tr>
				 <td colspan=3><p class="p-2">No credit records in this period</p></td>
				</tr>
					{/if}
				</tbody>
			</table>

			<div class="stat text-gray-300 w-full rounded-lg shadow-lg">
				<div class="stat-title text-[#002a47] dark:text-gray-100">Void</div>
				<div class="stat-value text-gray-900 dark:text-gray-200">{cashVoidVolume} ETB</div>
			</div>


			<table class="table h-fit bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0">
				<!-- head -->
				<thead
					class="text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-[#0f1727] sticky h-fit top-0 z-0"
				>
					<tr class="h-fit">
						<th>Employee</th>
						<th>Void Amount</th>
						<th
							><div
								onclick={() => {
									exportCSV(void_series);
								}}
								class="flex justify-end h-fit rounded-sm cursor-pointer bg-gray-200 dark:bg-[#0f1727]"
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
				{#if void_series.length}
					{#each void_series as _, i}
						{#if i < maxItems}
							<tr
								class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
							>
								<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{_.employee}</div></td>
								<td>{_.void_amount} ETB</td>
								<td></td>
							</tr>
						{/if}
					{/each}
				{:else}
				<tr>
				 <td colspan=3><p class="p-2">No void records in this period</p></td>
				</tr>
				{/if}
				</tbody>
			</table>
		</div>
</div>
