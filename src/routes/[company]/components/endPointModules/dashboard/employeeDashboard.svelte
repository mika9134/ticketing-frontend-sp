<script>
	import CylinderSales from '$lib/charts/cylinderSales.svelte';

	import FilterSection from '../../filter/filter.svelte';
	import Sidebar from '../../sidebar/sidebar.svelte';
	import Header from '../../header/header.svelte';

	import { onMount } from 'svelte';
	import ChartDataLabels from 'chartjs-plugin-datalabels';
	import Chart from 'chart.js/auto';

	import OrderSalesContribution from '../../charts/orderSalesContribution.svelte';
	import PenetrationContribution from '../../charts/penetrationContribution.svelte';
	import CallCompletionTarget from '../../charts/callCompletionTarget.svelte';
	import ProductivityTarget from '../../charts/productivityTarget.svelte';

	import { roles } from '../../../../../stores/roleStore.js';
	import { hasPrivilege } from '$lib/role.js';
	let userRoles = $state({});

	onMount(() => {
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});
	});

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
	let span = $state(10);
	let territory = $state('');
	let route = $state('');
	let point_of_sale = $state('');
	let employee = $state('');

	// Handle filter change event
	function handleFilterChange(event) {
		timeline = event.detail.timeline;
		span = event.detail.span;
		territory = event.detail.territory;
		route = event.detail.route;
		point_of_sale = event.detail.point_of_sale;
		employee = event.detail.employee;
	}
</script>

<div>
	<div class="sticky top-36 bg-gray-100 dark:bg-[#0f1727] z-[4]">
		<FilterSection
			{span}
			{timeline}
			{territory}
			{route}
			{point_of_sale}
			{employee}
			on:filterChange={handleFilterChange}
			disable_point_of_sale={true}
		/>
	</div>
	<!-- Dashboard Content -->
	<div class="pl-2 p-2 overflow-x-hidden flex flex-col gap-4 z-[4]">
		{#if !hasPrivilege(userRoles['Order'], 'U') || hasPrivilege(userRoles['Sales'], 'D')}
			<!-- Sales Volume -->
			<div class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg md:p-2">
				<div class="h-full">
					<CylinderSales
						{span}
						{timeline}
						{territory}
						{route}
						{point_of_sale}
						user_id={employee}
						disable_point_of_sale={true}
					/>
				</div>
			</div>
		{/if}

		<!-- Penetration -->
		<div class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg md:p-2">
			<div class="flex justify-between items-center">
				<h3 class="text-lg text-gray-700 dark:text-white ml-2 mt-4 font-semibold">
					Penetration vs Target
				</h3>
			</div>
			<div class="h-full">
				<PenetrationContribution
					{span}
					{timeline}
					{territory}
					{point_of_sale}
					{route}
					user_id={employee}
					disable_point_of_sale={true}
				/>
			</div>
		</div>

		{#if !hasPrivilege(userRoles['Order'], 'U') || hasPrivilege(userRoles['Sales'], 'D')}
			<!-- Call Completion -->
			<div class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg md:p-2">
				<div class="flex justify-between items-center">
					<h3 class="text-lg text-gray-700 dark:text-white ml-2 mt-4 font-semibold">
						Call Completion vs Target
					</h3>
				</div>
				<div class="h-full">
					<CallCompletionTarget
						{span}
						{timeline}
						{territory}
						{route}
						{point_of_sale}
						user_id={employee}
						disable_point_of_sale={true}
					/>
				</div>
			</div>

			<!-- Productivity -->
			<div class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg md:p-2">
				<div class="flex justify-between items-center">
					<h3 class="text-lg text-gray-700 dark:text-white ml-2 mt-4 font-semibold">
						Productivity vs Target
					</h3>
				</div>
				<div class="h-full">
					<ProductivityTarget
						{span}
						{timeline}
						{territory}
						{route}
						{point_of_sale}
						user_id={employee}
						disable_point_of_sale={true}
					/>
				</div>
			</div>
		{/if}

		{#if hasPrivilege(userRoles['Order'], 'U') || hasPrivilege(userRoles['Sales'], 'D') || userRoles['name'] == 'Higher Management'}
			<div class="bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg md:p-2">
				<div class="h-full">
					<OrderSalesContribution
						{span}
						{timeline}
						{territory}
						{route}
						{point_of_sale}
						user_id={employee}
						disable_point_of_sale={true}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>
