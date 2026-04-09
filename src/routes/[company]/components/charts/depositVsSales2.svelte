<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import { fetchTotalDeposit } from '../../../../apis/api-utils.js';
	import { themeStore } from '../../../../stores/themeStore.js';
	import { get } from 'svelte/store';

	export let span = 7;
	export let timeline = 'Daily';
	export let region = '';
	export let territory = '';
	export let route = '';
	export let point_of_sale = '';
	export let employee = '';
	export let chartID = '';
	export let legendID = '';

	let maxItems = 10;

	let chart;
	let chartInitialized = false;

	let currentTheme = get(themeStore);

	let totalSales = 0;
	let currentSalesDeposit = 0;
	let previousSalesDeposit = 0;
	let currentSalesDepositMTM = 0;
	let previousSalesDepositMTM = 0;
	let totalDeposit = 0;
	let remaining = 0;
	let prevRemaining = 0;
	let remainingMTM = 0;
	let prevRemainingMTM = 0;

	let depositPercentage = 0;
	let remainingPercentage = 0;

	let time_series = [];

	async function fetchData(span, timeline, territory, route, point_of_sale, employee) {
		try {
			const data = await fetchTotalDeposit(
				span,
				timeline,
				region,
				territory,
				route,
				point_of_sale,
				employee
			);

			time_series = data.timeseries ?? [];

			if (!time_series.length || !data.recent) {
				return;
			}

			const period = data.recent.period;

			totalSales = data.recent.sales;

			totalDeposit = data.recent.deposit;

			currentSalesDeposit = data.recent.current_sales_deposit;

			currentSalesDepositMTM = data.recent.current_sales_deposit_mtm;

			previousSalesDeposit = data.recent.previous_sales_deposit;

			previousSalesDepositMTM = data.recent.previous_sales_deposit_mtm;

			remaining = data.recent.remaining;

			remainingMTM = data.recent.remaining_mtm;

			prevRemaining = data.recent.prev_remaining;

			prevRemainingMTM = data.recent.prev_remaining_mtm;
            

			if(totalSales == 0 && totalDeposit == 0)
			{
				depositPercentage = 0;
				remainingPercentage = 0;
			}
            else {
				depositPercentage = data.recent.depositPercentage;

				remainingPercentage = data.recent.remainingPercentage;
			}
		} catch (err) {
			console.error('Sales vs Deposit fetch failed:', err);
			updateChart(0, 0);
		}
	}

	$: fetchData(span, timeline, region, territory, route, point_of_sale, employee);

	onMount(async () => {
		await fetchData(span, timeline, region, territory, route, point_of_sale, employee);
	});
</script>

<div class="grid grid-cols-2 gap-4">
	<!-- LEFT: CHART + STATS -->
	<div class="col-span-2">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-2">
			Deposit vs Remaining
		</h3>

		<div class="col-span-2">
			<div class="flex justify-center w-full pl-2 pr-2">
				<div class="stat text-gray-300 w-full rounded-lg shadow-lg">
					<div class="stat-title text-[#002a47] dark:text-gray-100">Deposit</div>
					<div class="flex gap-4">

						<div class="p-4 w-full">
							<h1 class="text-[#002a47] dark:text-gray-100 text-xs">Previous Sales Deposit</h1>
							<div class="stat-value text-gray-900 dark:text-gray-200">
								{previousSalesDeposit.toLocaleString()} ETB
							</div>
						</div>

						<div class="p-4 w-full">
							<h1 class="text-[#002a47] dark:text-gray-100 text-xs">{timeline == "Daily" ? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly" ? "MTM" : "YTY"}</h1>
							<div class="stat-value flex text-gray-900 dark:text-gray-200 gap-2">

							<div class="self-center">{@html

								previousSalesDepositMTM < 0 ?

								'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
							    :
							    previousSalesDepositMTM == 0 ?
			                    
									'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
							    :

								'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

								}
							</div>
							<div class={previousSalesDepositMTM > 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" :previousSalesDepositMTM == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
											{Math.abs(previousSalesDepositMTM)}%
										</div>

							</div>
						</div>
					</div>
					<div class="flex gap-4">

						<div class="p-4 w-full">
							<h1 class="text-[#002a47] dark:text-gray-100 text-xs">Current Sales Deposit</h1>
							<div class="stat-value text-gray-900 dark:text-gray-200">
								{currentSalesDeposit.toLocaleString()} ETB
							</div>
						</div>

						<div class="p-4 w-full">
							<h1 class="text-[#002a47] dark:text-gray-100 text-xs">{timeline == "Daily" ? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly" ? "MTM" : "YTY"}</h1>
							<div class="stat-value flex text-gray-900 dark:text-gray-200 gap-2">

							<div class="self-center">{@html

								currentSalesDepositMTM < 0 ?

								'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
							    :
							    currentSalesDepositMTM == 0 ?
			                    
									'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
							    :

								'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

								}
							</div>
							<div class={currentSalesDepositMTM > 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" :currentSalesDepositMTM == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
											{Math.abs(currentSalesDepositMTM)}%
										</div>
							</div>
						</div>
					</div>
				</div>

				<div class="stat text-gray-300 w-full rounded-lg shadow-lg">
					<div class="stat-title text-[#002a47] dark:text-gray-100">Deposit Remaining</div>
					<div class="flex gap-4">

						<div class="p-4 w-full">
							<h1 class="text-[#002a47] dark:text-gray-100 text-xs">From Previous Sales</h1>
							<div class="stat-value text-gray-900 dark:text-gray-200">
								{prevRemaining.toLocaleString()} ETB
							</div>
						</div>

						<div class="p-4 w-full">
							<h1 class="text-[#002a47] dark:text-gray-100 text-xs">{timeline == "Daily" ? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly" ? "MTM" : "YTY"}</h1>
							<div class="stat-value flex text-gray-900 dark:text-gray-200 gap-2">

							<div class="self-center">{@html

								prevRemainingMTM > 0 ?

								'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

							    :
							    prevRemainingMTM == 0 ?
			                    
									'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
							    :

							    '<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'


								}
							</div>
							<div class={prevRemainingMTM < 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" :prevRemainingMTM == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
											{Math.abs(prevRemainingMTM)}%
										</div>
							</div>
						</div>
					</div>
					<div class="flex gap-4">

						<div class="p-4 w-full">
							<h1 class="text-[#002a47] dark:text-gray-100 text-xs">From Current Sales</h1>
							<div class="stat-value text-gray-900 dark:text-gray-200">
								{remaining.toLocaleString()} ETB
							</div>
						</div>

						<div class="p-4 w-full">
							<h1 class="text-[#002a47] dark:text-gray-100 text-xs">{timeline == "Daily" ? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly" ? "MTM" : "YTY"}</h1>
							<div class="stat-value flex text-gray-900 dark:text-gray-200 gap-2">

							<div class="self-center">{@html

								remainingMTM > 0 ?

								'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

							    :
							    remainingMTM == 0 ?
			                    
									'<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
							    :

								'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

								}
							</div>
							<div class={remainingMTM < 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" :remainingMTM == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
											{Math.abs(remainingMTM)}%
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

	<!-- RIGHT: TABLE -->
	<div class="overflow-y-scroll col-span-2 rounded-xl bg-white dark:bg-[#002a47]">
		<table class="table text-gray-900 dark:text-gray-400">
			<thead class="text-gray-900 dark:text-gray-400 bg-gray-200 dark:bg-[#0f1727] sticky top-0">
				<tr>
					<th>Period</th>
					<th>Employee</th>
					<th>Deposit</th>
					<th>Sales</th>
					<th>Remaining</th>
				</tr>
			</thead>
			{#if time_series.length > 0}
			<tbody>
				{#each time_series as row, i}
					{#if i < maxItems}
						<tr class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'>
							<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{row.period}</div></td>
							<td>{row.employee}</td>
							<td>{row.deposit.toLocaleString()} ETB</td>
							<td>{row.sales.toLocaleString()} ETB</td>
							<td>{row.remaining.toLocaleString()} ETB</td>
						</tr>
					{/if}
				{/each}
			</tbody>
			{:else}
				<p class="text-gray-700 dark:text-gray-300 p-2">No data during this period</p>
			{/if}
		</table>
	</div>
</div>
