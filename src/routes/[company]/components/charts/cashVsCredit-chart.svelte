<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the datalabels plugin
	import { fetchCashVsCredit } from '../../../../apis/api-utils.js'; // Adjust the path as needed
	import { exportCSV, fetchTable } from '../../../../apis/table.js'; // Adjust the path as needed
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';
	import CategoryFilter from '../filter/category_filter.svelte';
	import { getAccessToken } from '../../../../stores/tokenStore.js';
	import { host } from '../../../../apis/config.js';
	// Declare props with default values
	export let timeline = 'Daily'; // Default timeline
	export let span = 30; // Default span is 3 days
	export let region;
	export let territory;
	export let route;
	export let point_of_sale;
	export let employee;
	export let category = '';
	export let parentProduct = '';
	export let product = '';
	export let chartID;
	export let legendID;

	let maxValues = 10;

	let pieChart;
	let cashRatio = 0;
	let creditRatio = 0;
	let cashVolume = 0;
	let creditVolume = 0;
	let voidVolume = 0;
	let cashPercentage = 0; // Changed to a number
	let creditPercentage = 0; // Changed to a number
	let voidPercentage = 0;
	let cashGrowth = 0;
	let creditGrowth = 0;
	let series = [];
	let cashSVG = '';
	let creditSVG = '';
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

	let currentTheme = get(themeStore);
	themeStore.subscribe(async (value) => {
		currentTheme = value;
		if (pieChart) {
			await pieChart.destroy();
			await setupChart();
			fetchData(span, timeline, region, territory, route, point_of_sale, employee);
		}
	});

	// Fetch data from the API
	async function fetchData(
		selectedSpan,
		selectedTimeline,
		selectedRegion,
		selectedTerritory,
		selectedRoute,
		selectedPointofSale,
		selectedEmployee,
		selectedCategory,
		selectedParentProduct,
		selectedProduct
	) {
		try {
			const data = await fetchCashVsCredit(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				selectedTerritory,
				selectedRoute,
				selectedPointofSale,
				selectedEmployee,
				selectedCategory,
				selectedParentProduct,
				selectedProduct
			);
			let total = 0;
			series = [];

			data.timeseries.map((item) => {
				if (item.cashPercentage > 0 || item.creditPercentage > 0) {
					series.push(item);
				}
			});

			cashPercentage = Math.round(data.recent.cashPercentage); // Ensure this is a whole number
			creditPercentage = Math.round(data.recent.creditPercentage); // Ensure this is a whole number
			cashVolume = data.recent.cash;
			creditVolume = data.recent.credit;

			let prevCash = data.timeseries.length > 1 ? data.timeseries[1].cash : 0;

			let prevCredit = data.timeseries.length > 1 ? data.timeseries[1].credit : 0;

			cashGrowth = data.recent.cashGrowth;

			creditGrowth = data.recent.creditGrowth;


			updateChart(cashPercentage, creditPercentage);
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

			items.forEach((item, i) => {
				if(chart.data.datasets[0].data[i] != 0)
				{
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
			}
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
				labels: ['Cash', 'Credit'],
				datasets: [
					{
						data: [0, 0], // Initial empty data
						backgroundColor: ['#177e89', '#084c61'], // Colors for the pie chart
						borderColor: [
							currentTheme == 'light' ? 'white' : '#002a47',
							currentTheme == 'light' ? 'white' : '#002a47'
						],
						hoverBackgroundColor: ['#177e89', '#084c61'], // Match the background color to remove black hover
						datalabels: {
							color: 'white'
						},
						borderWidth: 0,
						tension: 0.4 // Smooth curve
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: true, // Allow manual resizing

				plugins: {
					title: {
						display: false,
						text: 'Cash vs Credit',
						color: 'white'
					},
					datalabels: {
						formatter: function (value, context) {
							if (value > 0) {
								return `${value}%`;
							} else {
								return '';
							}
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

	$: fetchData(span, timeline, region, territory, route, point_of_sale, employee, category, parentProduct, product);

	onMount(() => {
		setupChart();
	});

	// Update the pie chart with the fetched data
	function updateChart(cashPercentage, creditPercentage) {
		if (pieChart) {
			pieChart.data.datasets[0].data = [cashPercentage, creditPercentage];
			pieChart.data.datasets[0].borderWidth =
				cashPercentage == 100 || creditPercentage == 100 ? 0 : 4;
			pieChart.update();
		}
	}

	function applyFilters() {
		fetchData(span, timeline, region, territory, route, point_of_sale, employee, category, parentProduct, product);
	}
</script>

<div class="grid grid-cols-1">
<div class="flex gap-x-4 items-center">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">
				Cash vs Credit
			</h3>
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
		
<div class="flex justify-center">
		<div class="stats shadow ml-2 mb-2 h-fit w-fit">
		    <div class="stat flex w-fit border-gray-900 dark:border-gray-100 text-gray-300">
				<div class="text-gray-900">
					
				</div>
				<div class="flex gap-1">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Cash</div>

				<div class="flex gap-2">
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">
					{cashVolume} ETB
				</div>
				<div class="flex self-center dark:text-gray-200">
					<div class="self-center">{@html

					cashGrowth < 0 ?

					'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
				    :
				    cashGrowth == 0 ?
                    
						'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
				    :

					'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

					}</div>
					<div class={cashGrowth > 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : cashGrowth == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
					{Math.abs(cashGrowth)}%
										</div>

					
					</div>
					
				</div>
				</div>
				</div>
			</div>

				<div class="stat flex w-fit border-gray-900 dark:border-gray-100 text-gray-300">
				<div class="text-gray-900">
					
				</div>
				<div class="flex gap-1">
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Credit</div>

				<div class="flex gap-2">
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">
					{creditVolume} ETB
				</div>
				<div class="flex self-center dark:text-gray-200">
					<div class="self-center">{@html

					creditGrowth < 0 ?

					'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
				    :
				    creditGrowth == 0 ?
                    
						'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
				    :

					'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

					}</div>

					<div class={creditGrowth < 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : creditGrowth == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
					{Math.abs(creditGrowth)}%
										</div>

					
					</div>
					
				</div>
				</div>
				</div>
			</div>

		</div>
	<div>
</div>
</div>
		

		<div class="flex-1">
			<!-- Pie chart -->
			<div class="flex justify-center w-full">
				<div class="flex justify-center w-fit">
					<canvas class="w-[350px] grow-0" id={chartID} width="100" height="150"></canvas>
				</div>
			</div>
		</div>
		<div class="flex mt-10 justify-center" hidden={cashVolume == 0 && creditVolume == 0}>
			<div id={legendID}></div>
		</div>

	</div>
