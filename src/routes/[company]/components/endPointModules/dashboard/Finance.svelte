<script>
	import DefectVsStock from '../../charts/defectVsStock.svelte';
	import DepositVsSales2 from '../../charts/depositVsSales2.svelte';
	import Revenue from '../../cards/revenue.svelte';

	import FilterSection from '../../filter/filter.svelte';

	import { onMount } from 'svelte';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import Chart from 'chart.js/auto';
	import CashVsCreditChartVoid from '../../charts/cashVsCreditVsVoid-chart.svelte';

	import {
		fetchTotalDeposit,
		fetchRecentSalesVsDefect,
		fetchTotalDepositRecent
	} from '../../../../../apis/api-utils.js';

	let totalDeposit = $state(0);
	let totalSales = $state(0);
	let totalVolume = $state(0);
	let salesRemaining = $state(0);
	let depositPercentage = $state(0);
	let remainingPercentage = $state(0);
	let currentBalance = $state(0);
	let currentBalanceAsset = $state(0);
	let initialBalance = $state(0);
	let defectAsset = $state(0);
	let purchasedAsset = $state(0);
	let defectStock = $state(0);
	let stockIn = $state(0);
	let totalSalesVolume = $state(0);
	let summaryDate = $state('');
	let salesDate = $state('');

	let totalSalesrecent = $state(0);
	let totalDepositrecent = $state(0);
	let salesRemainingrecent = $state(0);
	let salesDaterecent = $state(0);
	let totalVolumerecent = $state(0);

	let totalNonSTDSalesrecent = $state(0);
	let totalNonSTDDepositrecent = $state(0);
	let salesNonSTDRemainingrecent = $state(0);
	let salesNonSTDDaterecent = $state(0);
	let totalNonSTDVolumerecent = $state(0);

	let depositPercentagerecent = $state(0);
	let remainingPercentagerecent = $state(0);


	let non_std_currentBalance = $state(0);
	let non_std_initialBalance = $state(0);
	let non_std_stockIn = $state(0);
	let non_std_defectStock = $state(0);
	let non_std_purchasedAsset = $state(0);
	let non_std_totalSalesVolume = $state(0);
	let non_std_summaryDate = $state(0);
	let non_std_defectAsset = $state(0);
	let non_std_currentBalanceAsset = $state(0);


	Chart.register(ChartDataLabels);

	let { onToggleSidebar } = $props();

	// Manage sidebar open/close state
	let sidebarToggle = true;

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};

	let timeline = $state('Daily');
	let span = $state(20);
	let territory = $state('');
	let route = $state('');
	let point_of_sale = $state('');
	let employee = $state('');
	let top_filter = $state(5);
	let region = $state('');

	function handleFilterChange(event) {
		timeline = event.detail.timeline;
		territory = event.detail.territory;
		route = event.detail.route;
		point_of_sale = event.detail.point_of_sale;
		employee = event.detail.employee;
		fetchData(span, timeline, region, territory, route, point_of_sale, employee);
		// fetchDatarecent(timeline, territory, route, point_of_sale, employee);
	}

	async function fetchData(span, timeline, territory, route, point_of_sale, employee) {
		try {
			const summaryData = await fetchRecentSalesVsDefect(
				span,
				timeline,
				region,
				territory,
				route,
				point_of_sale,
				employee
			);

			currentBalance = summaryData.recent.current_balance;
			initialBalance = summaryData.recent.initial_balance;
			stockIn = summaryData.recent.purchased;
			defectStock = summaryData.recent.defect;
			totalSalesVolume = summaryData.recent.sold;
			summaryDate = summaryData.recent.period;
			defectAsset = summaryData.recent.defect_asset;
			currentBalanceAsset = summaryData.recent.current_asset;

			non_std_currentBalance = summaryData.recent.non_std_current_balance;
			non_std_initialBalance = summaryData.recent.non_std_initial_balance;
			non_std_stockIn = summaryData.recent.non_std_purchased;
			non_std_defectStock = summaryData.recent.non_std_defect;
			non_std_totalSalesVolume = summaryData.recent.non_std_sold;
			non_std_summaryDate = summaryData.recent.non_std_period;
			non_std_defectAsset = summaryData.recent.non_std_defect_asset;
			non_std_currentBalanceAsset = summaryData.recent.non_std_current_asset;

			const data = await fetchTotalDeposit(
				span,
				timeline,
				region,
				territory,
				route,
				point_of_sale,
				employee
			);

			totalDeposit = data.recent.deposit;
			salesDate = data.recent.period;
			totalVolume = data.recent.volume;

			depositPercentage = data.recent.deposit_percentage;
			remainingPercentage = data.recent.remaining_percentage;

			const depositedata = await fetchTotalDepositRecent(
				timeline,
				region,
				territory,
				route,
				point_of_sale,
				employee
			);

			totalSales = depositedata.total_sales;
			salesRemaining = depositedata.total_remaining;
			totalSalesrecent = depositedata.sales;
			totalDepositrecent = depositedata.deposit;
			salesRemainingrecent = depositedata.remaining;
			salesDaterecent = depositedata.period;
			totalVolumerecent = depositedata.volume;

			totalNonSTDSalesrecent = depositedata.non_std_sales;
			totalNonSTDDepositrecent = depositedata.non_std_deposit;
			salesNonSTDRemainingrecent = depositedata.non_std_remaining;
			salesNonSTDDaterecent = depositedata.period;
			totalNonSTDVolumerecent = depositedata.non_std_volume;

			depositPercentagerecent = depositedata.deposit_percentage;
			remainingPercentagerecent = depositedata.remaining_percentage;
		} catch (error) {
			console.error('Error fetching sales vs deposit:', error);
		}
	}

	onMount(async () => {
		await fetchData(span, timeline, region, territory, route, point_of_sale, employee);
		// await fetchDatarecent(timeline, territory, route, point_of_sale, employee);
	});
</script>

<div>
	<div class="sticky top-36 bg-gray-100 dark:bg-[#0f1727] z-[1]">
		<FilterSection
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
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">{totalSales} ETB</div>
				
			</div>
			</div>

			<div class="stat flex border-gray-900 dark:border-gray-100 text-gray-300">
				<div class="text-gray-900">
					<svg
						fill="#42A5F5"
						width="32px"
						height="32px"
						viewBox="0 0 1024 1024"
						xmlns="http://www.w3.org/2000/svg"
						stroke="#42A5F5"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier"
							><path
								d="M136.948 908.811c5.657 0 10.24-4.583 10.24-10.24V610.755c0-5.657-4.583-10.24-10.24-10.24h-81.92a10.238 10.238 0 00-10.24 10.24v287.816c0 5.657 4.583 10.24 10.24 10.24h81.92zm0 40.96h-81.92c-28.278 0-51.2-22.922-51.2-51.2V610.755c0-28.278 22.922-51.2 51.2-51.2h81.92c28.278 0 51.2 22.922 51.2 51.2v287.816c0 28.278-22.922 51.2-51.2 51.2zm278.414-40.96c5.657 0 10.24-4.583 10.24-10.24V551.322c0-5.657-4.583-10.24-10.24-10.24h-81.92a10.238 10.238 0 00-10.24 10.24v347.249c0 5.657 4.583 10.24 10.24 10.24h81.92zm0 40.96h-81.92c-28.278 0-51.2-22.922-51.2-51.2V551.322c0-28.278 22.922-51.2 51.2-51.2h81.92c28.278 0 51.2 22.922 51.2 51.2v347.249c0 28.278-22.922 51.2-51.2 51.2zm278.414-40.342c5.657 0 10.24-4.583 10.24-10.24V492.497c0-5.651-4.588-10.24-10.24-10.24h-81.92c-5.652 0-10.24 4.589-10.24 10.24v406.692c0 5.657 4.583 10.24 10.24 10.24h81.92zm0 40.96h-81.92c-28.278 0-51.2-22.922-51.2-51.2V492.497c0-28.271 22.924-51.2 51.2-51.2h81.92c28.276 0 51.2 22.929 51.2 51.2v406.692c0 28.278-22.922 51.2-51.2 51.2zm278.414-40.958c5.657 0 10.24-4.583 10.24-10.24V441.299c0-5.657-4.583-10.24-10.24-10.24h-81.92a10.238 10.238 0 00-10.24 10.24v457.892c0 5.657 4.583 10.24 10.24 10.24h81.92zm0 40.96h-81.92c-28.278 0-51.2-22.922-51.2-51.2V441.299c0-28.278 22.922-51.2 51.2-51.2h81.92c28.278 0 51.2 22.922 51.2 51.2v457.892c0 28.278-22.922 51.2-51.2 51.2zm-6.205-841.902C677.379 271.088 355.268 367.011 19.245 387.336c-11.29.683-19.889 10.389-19.206 21.679s10.389 19.889 21.679 19.206c342.256-20.702 670.39-118.419 964.372-284.046 9.854-5.552 13.342-18.041 7.79-27.896s-18.041-13.342-27.896-7.79z"
							></path><path
								d="M901.21 112.64l102.39.154c11.311.017 20.494-9.138 20.511-20.449s-9.138-20.494-20.449-20.511l-102.39-.154c-11.311-.017-20.494 9.138-20.511 20.449s9.138 20.494 20.449 20.511z"
							></path><path
								d="M983.151 92.251l-.307 101.827c-.034 11.311 9.107 20.508 20.418 20.542s20.508-9.107 20.542-20.418l.307-101.827c.034-11.311-9.107-20.508-20.418-20.542s-20.508 9.107-20.542 20.418z"
							></path></g
						></svg
					>
				</div>
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Deposit Remaining</div>
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">{salesRemaining} %</div>
				
			</div>
			</div>


			<div class="stat flex border-gray-900 dark:border-gray-100 text-gray-300">
				<div class="text-gray-900">
					<svg
						width="32px"
						height="32px"
						viewBox="0 0 512 512"
						xmlns="http://www.w3.org/2000/svg"
						fill="#42A5F5"
						stroke="#42A5F5"
						stroke-width="0.00512"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier"
							><path
								fill="#42A5F5"
								d="M384.47 9.938L320.436 26.03 181.03 165.438c-46.298 46.3 1.17 87.987-48.25 137.407l-81.593 81.594c-1.23-.054-2.468-.058-3.718.03-5.936.42-13.572 2.884-19.94 9.25-6.365 6.367-8.423 13.597-8.843 19.532-.418 5.935.87 11.557 2.907 17.47 4.076 11.823 12.242 24.43 23.718 35.905 11.477 11.476 24.05 19.642 35.875 23.72 5.912 2.037 11.565 3.324 17.5 2.905 5.936-.42 12.915-2.727 19.282-9.094 6.365-6.366 9.048-13.752 9.467-19.687.27-3.817-.147-7.53-1.03-11.25l78.374-78.376c49.42-49.42 91.108-1.95 137.407-48.25l160.938-160.938-107 12.156 7.78-101.593L327.47 104c3.406-34.72 23.273-64.073 57-94.063zm1.217 218.906l13.438 13.437-65.344 65.314c-25.316 25.317-51.6 25.56-73.874 25.656-22.274.098-40.82-.075-63.5 22.594l-77.625 78.5c-2.994-5.3-6.705-10.628-11.093-15.813l75.282-76.124c26.74-26.74 54.44-27.996 76.936-28.094 22.495-.097 39.457.857 60.438-20.125l65.343-65.343zm-344.78 175.5c2.838-.034 7.036.442 11.28 1.906 9.702 3.345 21.423 10.86 32.032 21.47 10.608 10.608 18.123 22.328 21.467 32.03 1.673 4.85 1.79 9.35 1.594 12.125-.28 1.417-.234 1.427-1.593 1.625-2.774.196-6.9-.327-11.75-2-9.696-3.343-21.395-10.9-32-21.5-10.608-10.61-18.155-22.33-21.5-32.03-1.672-4.852-2.446-9.195-2.25-11.97.038-1.55.02-1.547 1.594-1.625.348-.025.72-.026 1.126-.03z"
							></path></g
						></svg
					>
				</div>
				<div>
				<div class="stat-title text-[#002a47] dark:text-gray-100">Defect</div>
				<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">
					{defectStock.toLocaleString()}
				</div>
			</div>
			</div>
		</div>
	</div>

	<div class="pl-2 p-2 overflow-x-hidden">
		<div
			class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg p-4 md:p-6 h-fit mb-4"
		>
			<div class="grid grid-cols-2 gap-6 items-start">
				<div class="col-span-2">
					<DepositVsSales2
						{span}
						{timeline}
						{region}
						{territory}
						{route}
						{point_of_sale}
						{employee}
						chartID={'deposit_vs_sales_v2'}
						legendID={'deposit_vs_sales_legend_v2'}
					/>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 mb-4">
			<div class="mb-4">
				<div class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg p-4 md:p-6">
					<DefectVsStock {span} {timeline} />
				</div>
			</div>
			<div>
				<div class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg p-4 md:p-6">
					<CashVsCreditChartVoid
						{span}
						{timeline}
						{region}
						{territory}
						{route}
						{point_of_sale}
						chartID={'cashVsCredit100'}
						legendID={'cashVsCreditLegend100'}
					/>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4">
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
