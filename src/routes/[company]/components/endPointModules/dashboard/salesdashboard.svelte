<script>
	import SalesVsTarget from '../../cards/salesVsTarget.svelte';
	import TotalVolumeCard from '../../cards/totalVolume-card.svelte';
	import Revenue from '../../cards/revenue.svelte';

	import SalesVsTargetChart from '../../charts/salesVsTarget-chart.svelte';
	import YearsToDate from '../../cards/yearsToDate.svelte';
	import CashVsCreditChart from '../../charts/cashVsCredit-chart.svelte';

	import FilterSection from '../../filter/filter.svelte';
	import Sidebar from '../../sidebar/sidebar.svelte';
	import Header from '../../header/header.svelte';

	import { onMount } from 'svelte';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import Chart from 'chart.js/auto';
	import {
		fetchTotalVolume,
		fetchYearsToDateStat,
		fetchCashVsCredit,
		fetchEmployees
	} from '../../../../../apis/api-utils.js'; // Adjust the path as needed

	Chart.register(ChartDataLabels);

	let { onToggleSidebar } = $props();

	// Manage sidebar open/close state
	let sidebarToggle = true;

	// Function to toggle sidebar visibility
	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};

	let timeline = $state('Daily');
	let span = $state(30);
	let region = $state('');
	let territory = $state('');
	let route = $state('');
	let point_of_sale = $state('');
	let employee = $state('');

	// Handle filter change event
	function handleFilterChange(event) {
		timeline = event.detail.timeline;
		region = event.detail.region;
		span = event.detail.span;
		territory = event.detail.territory;
		route = event.detail.route;
		point_of_sale = event.detail.point_of_sale;
		employee = event.detail.employee;
		fetchData(span, timeline, region, territory, route, point_of_sale, employee);
	}

	let totalVolumeStd = $state(0); // To store the total volume
	let totalAmount = $state(0);
	let totalVolumeNonStd = $state(0);
	let ytdVsLy = $state(0);
	let cashPercent = $state(0);
	let cashPercentStd = $state(0);
	let cashPercentNonStd = $state(0);
	let cashAmount = $state(0);
	let cashLabel = $state('');
	let currentDateTotal = $state(''); // To store the current timeline (date)
	let currentDateYTD = $state('');
	let currentYTD = $state(0);
	let sr = $state([]);

	// Fetch data from the API
	async function fetchData(selectedSpan, selectedTimeline, selectedRegion, selectedTerritory, selectedRoute, selectedPointOfSale, selectedEmployee) {
		try {
			const data = await fetchTotalVolume(
				selectedSpan,
				selectedTimeline,
				selectedRegion,
				selectedTerritory,
				selectedRoute,
				selectedPointOfSale,
				selectedEmployee
			);
			// Extract the first key-value pair from the response
			currentDateTotal = data.period;
			totalVolumeStd = data.volume_standard;
			totalVolumeNonStd = data.volume_non_standard
			totalAmount = data.amount;
		} catch (error) {
			console.error('Error fetching sales volume:', error);
		}

		try {
			const data = await fetchCashVsCredit(
				selectedSpan,
				selectedTimeline,
				selectedTerritory,
				selectedRoute,
				selectedPointOfSale,
				selectedEmployee
			);
			// Extract the first key-value pair from the response
			cashPercent = data.recent.cashPercentage;
			cashPercentStd = data.recent.cashPercentageStd;
			cashPercentNonStd = data.recent.cashPercentageNonStd;
			cashAmount = data.recent.cash;
			cashLabel = data.recent.period;
		} catch (error) {
			console.error('Error fetching ytd', error);
		}

		try {
			const data = await fetchEmployees(
				selectedSpan, 
				selectedTimeline,
				selectedTerritory,
				selectedRoute,
				selectedPointOfSale,
				selectedEmployee
			);
			// Extract the first key-value pair from the response
			sr = data;
		} catch (error) {
			console.error('Error fetching ytd', error);
		}
	}

	// Fetch data when the component is mounted
	onMount(() => {
	  fetchData(span, timeline, region, territory, route, point_of_sale, employee);
	});
	// fetchData(span, timeline, territory, route, point_of_sale, employee);
</script>

<div>
	<div class="sticky top-36 bg-gray-100 dark:bg-[#0f1727] z-[4] pt-2">
		<FilterSection
			{span}
			{timeline}
			{region}
			{territory}
			{route}
			{point_of_sale}
			{employee}
			on:filterChange={handleFilterChange}
		/>

		<div class="stats shadow ml-2 mb-2">
			<div class="stat flex border-gray-900 dark:border-gray-100 text-gray-300">
				<div class="text-gray-900">
					<svg
						width="32px"
						height="32px"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier">
							<path
								d="M18 6H21C21.5523 6 22 6.44772 22 7V17C22 17.5523 21.5523 18 21 18H10M13 6H3C2.44772 6 2 6.44772 2 7V17C2 17.5523 2.44772 18 3 18H6M6 9.5V14.5M18 9.5V14.5M14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5C13.3807 9.5 14.5 10.6193 14.5 12Z"
								stroke="#42A5F5"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							></path>
						</g></svg
					>
				</div>
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Total Sales</div>
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">
					{totalAmount.toLocaleString()} ETB
				</div>
				
			</div>
			   
			</div>


			<div class="stat flex border-gray-300 dark:border-gray-100 text-gray-300">
				<div class="text-gray-900">
					<svg
						fill="#42A5F5"
						height="32px"
						width="32px"
						version="1.1"
						id="Layer_1"
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						viewBox="0 0 512 512"
						xml:space="preserve"
						stroke="#42A5F5"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier"
							><g>
								<g>
									<path
										fill="#42a5f5"
										d="M387.618,124.237c-13.918-13.917-36.565-13.917-50.483,0L124.443,336.928c-6.824,6.824-10.558,15.898-10.515,25.548 c0.043,9.652,3.859,18.691,10.745,25.455c6.963,6.838,16.061,10.25,25.156,10.25c9.228,0,18.452-3.513,25.437-10.526 l212.354-212.935C401.536,160.803,401.536,138.155,387.618,124.237z M373.184,160.306l-212.368,212.95 c-5.991,6.016-15.793,6.071-21.851,0.121c-2.973-2.92-4.621-6.824-4.641-10.994c-0.018-4.167,1.594-8.085,4.542-11.031 L351.557,138.66c5.966-5.962,15.672-5.963,21.637-0.001C379.158,144.626,379.158,154.332,373.184,160.306z"
									></path>
								</g>
							</g>
							<g>
								<g>
									<path
										d="M174.916,129.53c-25.027,0-45.386,20.361-45.386,45.386c0,25.026,20.36,45.386,45.386,45.386s45.386-20.361,45.386-45.386 C220.303,149.891,199.943,129.53,174.916,129.53z M174.916,199.904c-13.778,0-24.988-11.209-24.988-24.988 s11.21-24.988,24.988-24.988c13.778,0,24.988,11.209,24.988,24.988S188.694,199.904,174.916,199.904z"
									></path>
								</g>
							</g>
							<g>
								<g>
									<path
										d="M337.084,291.697c-25.026,0-45.386,20.361-45.386,45.386s20.361,45.386,45.386,45.386s45.386-20.361,45.386-45.386 S362.109,291.697,337.084,291.697z M337.084,362.072c-13.779,0-24.988-11.209-24.988-24.988s11.209-24.988,24.988-24.988 s24.988,11.209,24.988,24.988S350.863,362.072,337.084,362.072z"
									></path>
								</g>
							</g>
						</g></svg
					>
				</div>
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Cash Percentage</div>
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">{cashPercent}%</div>
				</div>
			</div>

			<div class="stat flex border-gray-900 dark:border-gray-100 text-gray-300">
				<div class="text-gray-900">
					<svg
						width="32px"
						height="32px"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier">
							<path
								d="M18 6H21C21.5523 6 22 6.44772 22 7V17C22 17.5523 21.5523 18 21 18H10M13 6H3C2.44772 6 2 6.44772 2 7V17C2 17.5523 2.44772 18 3 18H6M6 9.5V14.5M18 9.5V14.5M14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5C13.3807 9.5 14.5 10.6193 14.5 12Z"
								stroke="#42A5F5"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							></path>
						</g></svg
					>
				</div>
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Cash Amount</div>
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">{cashAmount} ETB</div>
				</div>
			</div>

			
		</div>

		
		
	</div>

	<div class="pl-2 p-2 overflow-x-hidden">
		<div class="mb-4">
			<div
				class="bg-white dark:bg-[#002a47] w-full rounded-lg shadow-lg dark:shadow-lg md:p-6 text-gray-700 rounded-lg dark:text-white sm:p-4 xs:p-2"
			>
				<TotalVolumeCard {span} {region} {timeline} {territory} {route} {point_of_sale} {employee} updateTimeline={(tl) => {timeline = tl;}} />
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 mb-4">
			<div class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg p-4 md:p-6">
				<CashVsCreditChart
					{span}
					{timeline}
					{region}
					{territory}
					{route}
					{point_of_sale}
					{employee}
					chartID={'cashVsCreditSR'}
					legendID={'cashVsCreditLegendSR'}
				/>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4 mb-4">
			<div class="mb-4">
			<div
				class="bg-white dark:bg-[#002a47] w-full rounded-lg shadow-lg dark:shadow-lg md:p-6 text-gray-700 rounded-lg dark:text-white sm:p-4 xs:p-2"
			>
				<Revenue {span} bind:timeline={timeline} {region} {territory} {route} {point_of_sale} {employee} />
			</div>
		</div>
		</div>
	</div>


</div>
