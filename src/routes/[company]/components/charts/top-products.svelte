<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import { fetchTopProducts } from '../../../../apis/api-utils.js';
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';
	import CategoryFilter from '../filter/category_filter.svelte';
	import { fetchTable } from '../../../../apis/table.js';
	import { host } from '../../../../apis/config.js';

	export let timeline = 'Daily';
	export let span = 7;
	export let region = '';
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';
	export let category = '';
	export let parentProduct = '';
	export let product_type = '';

	let table_title = '';
	let categories = [];
	let products = [];
	let parentProducts = [];

	let top_n = 3;
	let total = [];
	let datasets = [];
	let pieChart3;
	let labels = [];
	let showFilters = false;

	let colors = ['#177e89', '#084c61', '#7dcfb6', '#00b2ca', '#1d4e89'];

	let currentTheme = get(themeStore);
	themeStore.subscribe(async (value) => {
		currentTheme = value;
		if (pieChart3) {
			fetchData(span, timeline, region, territory, route, point_of_sale, top_n, category, parentProduct);
			await pieChart3.destroy();
			await setupChart();
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
		top_n,
		category,
		parentProduct
	) {
		try {
			const data = await fetchTopProducts(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				territory_id,
				route_id,
				point_of_sale_id,
				top_n,
				category,
				parentProduct,
				product_type
			);
			labels = [];
			category = '';
			datasets = [
				{
					label: [],
					data: [],
					backgroundColor: [],
					hoverBackgroundColor: [],
					borderWidth: 1
				}
			];
			data.map((item, index) => {
				labels.push(item.product_name);
				total.push(item.percentage);
				datasets[0].data.push(data[index].percentage);
				datasets[0].backgroundColor.push(colors[index]);
				datasets[0].hoverBackgroundColor.push(colors[index]);
			});
			datasets.reverse();

			if(data.length == 0)
			{
				table_title = "";
			}
			else {
				table_title = `Top ${product_type} Products`;
			}

			if (pieChart3) updateChart(labels, total);
		} catch (error) {
			console.error('Error fetching Top Products: ', error);
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
		const ctx = document.getElementById(`pieChart3_${product_type}`).getContext('2d');

		// Register the datalabels plugin
		Chart.register(ChartDataLabels);

		pieChart3 = new Chart(ctx, {
			type: 'doughnut',
			plugins: [htmlLegendPlugin],
			data: {
				labels: labels,
				datasets: datasets
			},
			options: {
				indexAxis: 'x',
				responsive: true,

				scales: {
					x: {
						title: {
							display: false,
							align: 'center',
							text: 'Product',
							color: currentTheme == 'light' ? '#555555' : 'white',
							font: {
								family: 'Arial',
								size: 12
							},
							padding: {
								top: 10,
								bottom: 10,
								left: 10,
								right: 10
							}
						},
						ticks: {
							callback: function (val, index) {
								// Hide every 2nd tick label
								return '';
							}
						},
						axis: {
							display: false,
							padding: {
								top: 10,
								bottom: 10,
								left: 10,
								right: 10
							}
						},
						grid: {
							display: false
						},
						border: {
							display: false
						}
					},
					y: {
						title: {
							display: false,
							align: 'center',
							text: 'Sales Volume',
							color: currentTheme == 'light' ? '#555555' : 'white',
							font: {
								family: 'Arial',
								size: 12
							},
							padding: {
								top: 10,
								bottom: 10,
								left: 10,
								right: 10
							}
						},
						ticks: {
							callback: function (val, index) {
								// Hide every 2nd tick label
								return '';
							}
						},
						axis: {
							display: false,
							padding: {
								top: 10,
								bottom: 10,
								left: 10,
								right: 10
							}
						},
						grid: {
							display: false
						},
						border: {
							display: false
						}
					}
				},
				maintainAspectRatio: true,
				plugins: {
					title: {
						display: false,
						text: 'Top Products by Sales',
						color: 'white'
					},
					datalabels: {
						anchor: 'center',
						align: 'center',
						formatter: function (value) {
							return `${value}%`;
						},
						color: currentTheme == 'light' ? 'white' : 'white'
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
						containerID: product_type
					},
					legend: {
						display: false,
						position: 'bottom'
					}
				}
			}
		});
	}

	$: fetchData(span, timeline, region, territory, route, point_of_sale, top_n, category, parentProduct);

	onMount(async () => {
		setupChart();
	});

	function applyFilters() {
		fetchData(span, timeline, region, territory, route, point_of_sale, top_n, category, parentProduct);
	}

	function updateChart(labels, values) {
		if (pieChart3) {
			pieChart3.data.labels = labels;
			pieChart3.data.datasets = datasets;
			pieChart3.update();
		}
	}
</script>

<div class="">
	<div class="flex justify-between items-center">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 ml-2 mt-2">{table_title}</h3>
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
					class="absolute right-0 mt-3 w-[400px] p-4 rounded-2xl shadow-2xl bg-white dark:bg-[#002a47] border border-gray-100 dark:border-gray-700 z-[3] animate-in fade-in zoom-in duration-200"
				>
					<CategoryFilter
						bind:category
						bind:parentProduct
						sku_enabled={false}
						category_enabled={true}
						on:change={() => applyFilters()}
					/>
				</div>
			{/if}
		</div>
	</div>

	<div class="flex justify-center" hidden={total.length == 0}>
		<div class="w-[300px] h-[300px]">
			<canvas id={`pieChart3_${product_type}`}></canvas>
		</div>
	</div>
	{#if total.length > 0}
	<div class="flex mt-10 justify-left hidden">
		<div id={product_type}></div>
	</div>
	{:else}
	<div class="flex mt-10 h-10 justify-left hidden">
		<div id={product_type}></div>
	</div>
	{/if}
</div>
