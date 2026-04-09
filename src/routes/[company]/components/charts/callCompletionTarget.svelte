<script>
	import Highcharts from 'highcharts';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { fetchCallCompletionTarget } from '../../../../apis/api-utils.js';
	import { themeStore } from '../../../../stores/themeStore.js';
	import { exportCSV } from '../../../../apis/table.js'; // Adjust the path as needed

	export let span = 10;
	export let timeline = 'Daily'; // Default timeline
	export let territory;
	export let route;
	export let user_id;
	let maxItems = 10;

	let currentTheme = get(themeStore);
	themeStore.subscribe(async (value) => {
		currentTheme = value;
		load(span, timeline);
	});

	let targetData = [];
	let actualData = [];
	let xAxisLabels = {};
	let series = [];

		let ytd_actual = 0;
	let mtm_actual = 0;
	let mtm_target = 0;
	let ytd_actual_growth = 0;
	let actual = 0;
	let target = 0;
	let progress = 0;
	let top_performance = {};

	let chart;

	$: load(span, timeline, territory, route, user_id);

	async function fetchData(
		selectedSpan,
		selectedTimeline,
		selectedTerritory,
		selectedRoute,
		selectedUser
	) {
		try {
			let data = await fetchCallCompletionTarget(
				selectedSpan,
				selectedTimeline,
				selectedTerritory,
				selectedRoute,
				selectedUser
			);
			if (!data || data.length === 0) {
				console.error('No data available to display the chart.');
				return;
			}
			series = data.series;

			ytd_actual = data.recent.ytd_actual;
			mtm_actual = data.recent.mtm_actual;;
			mtm_target = data.recent.mtm_target;
			ytd_actual_growth = data.recent.ytd_actual_growth;
			actual = data.recent.actual;
			target = data.recent.target;
			progress = data.series.length > 0 ? data.series[data.series.length - 1].progress : 0;
			top_performance = data.current_period;


			const chartData = series.map((item) => ({
				period: item.label,
				sales: item.actual_visits,
				target: item.target_visits,
				salesPercentage: item.progress // Include salesPercentage
			}));

			targetData = [];
			actualData = [];
			xAxisLabels = {};

			chartData.map((item) => {
				xAxisLabels[item.period] = { name: item.period, color: 'black' };
			});

			chartData.map((item) =>
				actualData.push([
					item.period,
					item.sales,
					item.sales >= item.target ? '#218380' : '#d81159',
					item.salesPercentage
				])
			);

			chartData.map((item) => targetData.push([item.period, item.target, '#dedede']));
		} catch (error) {
			console.error('Error fetching sales vs target data:', error);
		} finally {
		}
	}

	function getData(data_in) {
		return data_in.map((point) => ({
			name: point[0],
			y: point[1],
			color: point[2]
		}));
	}

	async function load(
		selectedSpan,
		selectedTimeline,
		selectedTerritory,
		selectedRoute,
		selectedUser
	) {
		await fetchData(selectedSpan, selectedTimeline, selectedTerritory, selectedRoute, selectedUser);

		let trg = getData(targetData);
		let act = getData(actualData);

		chart = Highcharts.chart('containerCC', {
			chart: {
				type: 'column',
				backgroundColor: currentTheme == 'light' ? '#ffffff' : '#002A47'
			},
			// Custom option for templates
			xAxisLabels,
			title: {
				text: '',
				align: 'left'
			},
			subtitle: {
				text: '',
				align: 'left'
			},
			plotOptions: {
				series: {
					grouping: false,
					borderWidth: 0
				}
			},
			legend: {
				enabled: false
			},
			tooltip: {
				shared: true,
				headerFormat:
					'<span style="font-size: 15px">' +
					'{series.chart.options.xAxisLabels.(point.key).name}' +
					'</span><br/>',
				pointFormat:
					'<span style="color:{point.color}">\u25CF</span> ' +
					'{series.name}: <b>{point.y}</b><br/>'
			},
			xAxis: {
				type: 'category',
				accessibility: {
					description: 'Period'
				},
				title: {
					text: 'Period',
					style: {
						textAlign: 'center',
						color: currentTheme == 'light' ? '#002A47' : '#FFFFFF'
					}
				},
				labels: {
					useHTML: true,
					animate: true,
					format: '',
					style: {
						textAlign: 'center',
						color: currentTheme == 'light' ? '#002A47' : '#FFFFFF'
					}
				}
			},
			yAxis: [
				{
					title: {
						text: 'Call Completion',
						style: {
							textAlign: 'center',
							color: currentTheme == 'light' ? '#002A47' : '#FFFFFF'
						}
					},
					showFirstLabel: false,
					gridLineColor: currentTheme == 'light' ? '#F3F4F6' : '#1e3a5f',
					labels: {
						style: {
							textAlign: 'center',
							color: currentTheme == 'light' ? '#002A47' : '#FFFFFF'
						}
					}
				}
			],
			series: [
				{
					color: '#efefef55',
					pointPlacement: -0.2,
					linkedTo: 'main',
					data: trg,
					name: 'Target'
				},
				{
					name: 'Actual',
					id: 'main',
					data: act
				}
			],
			exporting: {
				allowHTML: true
			},
			credits: {
				enabled: false
			}
		});
	}

	onMount(async () => {
		await load(span, timeline);
	});
</script>

<div class="grid grid-cols-2">
	<div class="h-[500px]">
		<div id="containerCC"></div>

		<div class="flex mt-10 gap-2 p-4">
			<div class="text-gray-900 dark:text-gray-100 inline-block">
				<span class="inline-block bg-[#efefef] w-[20px] h-[10px]"> </span>
				<span class="text-lg">Target</span>
			</div>
			<div class="text-gray-900 dark:text-gray-100 inline-block">
				<span class="inline-block bg-[#218380] w-[20px] h-[10px]"> </span>
				<span class="text-lg">Achieved</span>
			</div>
			<div class="text-gray-900 dark:text-gray-100 inline-block">
				<span class="inline-block bg-[#d81159] w-[20px] h-[10px]"> </span>
				<span class="text-lg">Progress</span>
			</div>
		</div>
	</div>
	<div class="overflow-y-scroll rounded-xl bg-white dark:bg-[#002a47]">
		

		<div class='w-full'>
					<div class="stats shadow ml-2 mb-2 w-full h-fit">

						<div class="flex stat border-gray-900 dark:border-gray-100 text-gray-300">
								<div class="row-span-1">
									<div class="stat-title text-[#002a47] dark:text-gray-100 ">Actual</div>
									<div class="flex gap-20 justify-start w-fit">
									<div>
										<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">
											{progress}%
										</div>
										<div class="stat-value text-gray-900 font-normal dark:text-gray-200 text-xs text-center">
											{actual} Outlets
										</div>
									</div>

								</div>
								</div>

					               <div class="row-span-2">
					               <div class="stat-title text-[#002a47] dark:text-gray-100 ">{timeline == "Daily"? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly"? "MTM" : "YTY"}</div>
					               <div class="flex gap-2">
									
									<div class="flex self-center">
										<div class="flex self-center">{@html

										mtm_actual < 0 ?

										'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
									    :
									    mtm_actual == 0 ?
					                    
					                    '<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
									    
									    :

										'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

										}</div>
										</div>
										<div class={mtm_actual > 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : mtm_actual == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
											{Math.abs(mtm_actual)}%
										</div>
					
									</div>
								</div>
								</div>





						<div class="flex stat border-gray-900 dark:border-gray-100 text-gray-300">
								<div class="row-span-1">
									<div class="stat-title text-[#002a47] dark:text-gray-100 ">Target</div>
									<div class="flex gap-20 justify-start w-fit">
									<div>
										<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">
											{target}
										</div>
									</div>

								</div>
								</div>

					               <div class="row-span-2">
					               <div class="stat-title text-[#002a47] dark:text-gray-100 ">{timeline == "Daily"? "DTD" : timeline == "Weekly" ? "WTW" : timeline == "Monthly"? "MTM" : "YTY"}</div>
					               <div class="flex gap-2">
									
									<div class="flex self-center h-full">
										<div class="flex-self-center">{@html

										mtm_target < 0 ?

										'<svg fill="#ff0000" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(180)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'
									    :
									    mtm_target == 0 ?
					                    
					                    '<h1 class="flex font-bold text-xs text-[#42A5F5] self-center">EQ</h1>'
									    
									    :

										'<svg fill="#00ff00" width="12px" height="12px" viewBox="0 0 64.00 64.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;" stroke="#ff0000" transform="matrix(1, 0, 0, 1, 0, 0)rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.384"></g><g id="SVGRepo_iconCarrier"> <g id="Icons1" serif:id="Icons"> <g id="Strike"> </g> <g id="H1"> </g> <g id="H2"> </g> <g id="H3"> </g> <g id="list-ul"> </g> <g id="hamburger-1"> </g> <g id="hamburger-2"> </g> <g id="list-ol"> </g> <g id="list-task"> </g> <g id="trash"> </g> <g id="vertical-menu"> </g> <g id="horizontal-menu"> </g> <g id="sidebar-2"> </g> <g id="Pen"> </g> <g id="Pen1" serif:id="Pen"> </g> <g id="clock"> </g> <g id="external-link"> </g> <g id="hr"> </g> <g id="info"> </g> <g id="warning"> </g> <path id="triangle" d="M32.398,7.855c2.184,0.124 4,1.164 5.096,3.281l17.936,36.208c1.739,3.66 -0.953,8.585 -5.372,8.656l-36.119,0c-4.022,-0.065 -7.323,-4.631 -5.353,-8.697l18.271,-36.206c0.343,-0.65 0.499,-0.838 0.793,-1.179c1.187,-1.375 2.484,-2.111 4.748,-2.063Zm-0.294,3.997c-0.687,0.034 -1.317,0.419 -1.659,1.017c-6.313,11.979 -12.398,24.08 -18.302,36.266c-0.545,1.225 0.391,2.797 1.763,2.864c12.06,0.195 24.124,0.194 36.185,0c1.325,-0.064 2.321,-1.584 1.768,-2.85c-5.793,-12.184 -11.765,-24.286 -17.965,-36.267c-0.367,-0.651 -0.903,-1.042 -1.79,-1.03Z" style="fill-rule:nonzero;"></path> <g id="plus-circle"> </g> <g id="minus-circle"> </g> <g id="vue"> </g> <g id="cog"> </g> <g id="logo"> </g> <g id="radio-check"> </g> <g id="eye-slash"> </g> <g id="eye"> </g> <g id="toggle-off"> </g> <g id="shredder"> </g> <g id="spinner--loading--dots-" serif:id="spinner [loading, dots]"> </g> <g id="react"> </g> <g id="check-selected"> </g> <g id="turn-off"> </g> <g id="code-block"> </g> <g id="user"> </g> <g id="coffee-bean"> </g> <g id="coffee-beans"> <g id="coffee-bean1" serif:id="coffee-bean"> </g> </g> <g id="coffee-bean-filled"> </g> <g id="coffee-beans-filled"> <g id="coffee-bean2" serif:id="coffee-bean"> </g> </g> <g id="clipboard"> </g> <g id="clipboard-paste"> </g> <g id="clipboard-copy"> </g> <g id="Layer1"> </g> </g> </g></svg>'

										}</div>
										</div>
										<div class={mtm_target > 0 ? "stat-value text-[#70cd32] font-normal dark:text-[#70cd32] text-lg self-center h-full" : mtm_target == 0  ? 'invisible' : "stat-value text-[#ff0000] font-normal dark:text-[#ff0000] text-lg self-center h-full"}>
											{Math.abs(mtm_target)}%
										</div>
					
									</div>
								</div>
								</div>


						<div class="flex stat border-gray-900 dark:border-gray-100 text-gray-300">
								<div class="row-span-1">
									<div class="stat-title text-[#002a47] dark:text-gray-100 ">{timeline == "Daily"? "MTD" : timeline == "Weekly" ? "MTD" : timeline == "Monthly"? "MTD" : "YTD"}</div>
									<div class="flex gap-2 justify-start w-fit">
									<div>
										<div class="stat-value text-gray-900 dark:text-gray-200 text-2xl">
											{ytd_actual}%
										</div>
									</div>

								</div>
								</div>

					               <div class="row-span-2">
					               <div class="stat-title text-[#002a47] dark:text-gray-100 ">&nbsp;</div>
					               <div class="flex gap-2">
									
									<div class="flex self-center">
										</div>
					
									</div>
								</div>
								</div>


					</div>

					<table class="table bg-white dark:bg-[#002a47] text-gray-900 dark:text-gray-100 z-0">
							<!-- head -->
							<thead
								class="text-gray-700 bg-gray-100 dark:text-gray-100 dark:bg-[#0f1727] sticky top-0 z-0"
							>
								<tr class="rounded-full">
									<th>Period</th>
									<th>Full Name</th>
									<th>Actual</th>
									<th>Target</th>
									<th>Progress</th>
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
								{#if  Object.keys(top_performance).length > 0}
								{#each Object.keys(top_performance) as username, i}
									{#if i < maxItems}
										<tr
											onclick={() => {
												if (employee == _.id) employee = '';
												else employee = _.id;
											}}
											class='bg-white font-semibold text-xs text-gray-900 dark:bg-gray-900 dark:text-white cursor-pointer border-b-2 border-dashed border-gray-100'
										>
											<td><div class="bg-[#42A5F5] w-fit px-4 py-2 rounded-full text-gray-100">{top_performance[username].period}</div></td>
											<td>{username}</td>
											<td>{top_performance[username].actual.toLocaleString()}</td>
											<td>{top_performance[username].target.toLocaleString()}</td>
											<td>{typeof top_performance[username].progress == "number" ? `${top_performance[username].progress}%` : "-"}</td>
											<td></td>
										</tr>
									{/if}
								{/each}
								{:else}
								<p class="p-2">No data in this period</p>
								{/if}
							</tbody>
						</table>
		</div>


	</div>
</div>

<style>
	#chartdiv {
		width: 100%;
		height: 500px;
	}
</style>
