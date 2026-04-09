<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { host, token } from '../../../../../apis/config';
	import { getCompanyName } from '../../../../../stores/companyStore';
	import Table from '../../tables/table.svelte';
	import Header from '../../header/header.svelte';
	import Details from '$lib/modals/details-component.svelte';
	import Breakdowns from './breakdowns.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import Penetration from '../penetration/penetration.svelte';
	// import { getAccessToken } from '../../../../../stores/tokenStore';

	let tableEndpoint = $state(`${host}performance-employee/get-targets-by-role`);
	let tablePerformance = $state(`${host}performance-employee/get-performances-by-role`);
	const searchEndpoint = `${host}performance-employee/search`;
	const childSearchEndpoint = `${host}performance-employee/search`;
	const tableEndpointById = `${host}performance-employee/get-performance-employee/`;

	let targetSummarizationEndpoint = $state(`${host}performance-employee/get-performance-employee/target/summary`);
	let progressSummarizationEndpoint = $state(`${host}performance-employee/get-performance-employee/performance/summary`);
	const filterEndpoint = `${host}performance-employee/all-filters`;
	const formEndpoint = undefined;
	const submitUrl = undefined;
	const updateUrl = undefined;
	const deleteUrl = undefined;
	let table_name = $state('Employees List');

	let company_name = $state('');
	let sidebarToggle = $state(true);
	let activeStatus = $state('Target');
	let performanceStatus = $state('Sales');
	let targetStatus = $state('Sales');
	let refreshTable = $state(false);
	let form_default = $state();
	// let token = getAccessToken();

	let myDialog = $state();

	let order_conversion_progress = $state(undefined);
	let sales_volume_progress = $state(undefined);
	let penetration_progress = $state(undefined);
	let call_completion_progress = $state(undefined);
	let productivity_progress = $state(undefined);
	let pre_sales_toggle = $state(false);
	let employee_name = $state('');
	let transactions = $state({});
	let detailsOpen = $state(false);
	let detailsTitle = $state('');
	let isRejected = $state(false);

	let { onToggleSidebar } = $props();

	async function rowClicked(row) {
		viewTarget(row);
	}

	function viewTarget(result) {
		const queryParams = new URLSearchParams({
			id: result.id,
			name: result.full_name,
			role: result.role
		});
		const url = new URL(window.location);

		if (url.searchParams.get('id')) url.searchParams.set('id', result.id);
		else url.searchParams.append('id', result.id);

		if (url.searchParams.get('name')) url.searchParams.set('name', result.full_name);
		else url.searchParams.append('name', result.full_name);

		if (url.searchParams.get('role')) url.searchParams.set('role', result.role);
		else url.searchParams.append('role', result.role);

		goto(`/${company_name}/kpi/targets?${url.searchParams}`);
	}

	async function rowClickedPerformance(row) {
		viewPerformance(row);
	}

	function viewPerformance(result) {
		console.log(result);
		const queryParams = new URLSearchParams({
			id: result.id,
			name: result.full_name,
			role: result.role
		});
		const url = new URL(window.location);

		if (url.searchParams.get('id')) url.searchParams.set('id', result.id);
		else url.searchParams.append('id', result.id);

		if (url.searchParams.get('name')) url.searchParams.set('name', result.full_name);
		else url.searchParams.append('name', result.full_name);

		if (url.searchParams.get('role')) url.searchParams.set('role', result.role);
		else url.searchParams.append('role', result.role);

		goto(`/${company_name}/kpi/performances?${url.searchParams}`);
	}

	let button_names = [];
	let button_callbacks = [];

	onMount(async () => {
		company_name = getCompanyName();
		performanceStatus = 'Sales';
		targetStatus = 'Sales';
		tablePerformance = `${host}performance-employee/get-performances-by-role`;
		tableEndpoint = `${host}performance-employee/get-targets-by-role`;
	});

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />

	<div class="p-2 h-fit w-fit flex gap-2 m-2">
		<div class="border-b border-gray-200 dark:border-[#00527c]">
			<div class="flex gap-2">
				<button
					type="button"
					onclick={() => {
						activeStatus = 'Target';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Target'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Target
				</button>
				<button
					type="button"
					onclick={() => {
						activeStatus = 'Performance';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200 border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Performance'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Performance
				</button>
			</div>
		</div>
	</div>
	{#if activeStatus == 'Target'}
		{#key refreshTable}
			<Table
				bind:get_table_endpoint={tableEndpoint}
				search_endpoint={searchEndpoint}
				summerize_endpoint={targetSummarizationEndpoint}
				filter_endpoint={filterEndpoint}
				get_table_endpoint_by_id={tableEndpointById}
				get_form_endpoint={formEndpoint}
				create_entry_url={submitUrl}
				update_entry_url={updateUrl}
				delete_entry_url={deleteUrl}
				{token}
				{table_name}
				module={['Sales', 'Order']}
				get_id_bool="true"
				buttons_names={button_names}
				buttons_callbacks={button_callbacks}
				row_clicked={rowClicked}
				disable_date_filter={true}
			/>
		{/key}
	{:else}
		{#key refreshTable}
			<Table
				bind:get_table_endpoint={tablePerformance}
				search_endpoint={searchEndpoint}
				summerize_endpoint={progressSummarizationEndpoint}
				filter_endpoint={filterEndpoint}
				get_table_endpoint_by_id={tableEndpointById}
				get_form_endpoint={formEndpoint}
				create_entry_url={submitUrl}
				update_entry_url={updateUrl}
				delete_entry_url={deleteUrl}
				{token}
				{table_name}
				module={['Sales', 'Order']}
				get_id_bool="true"
				buttons_names={button_names}
				buttons_callbacks={button_callbacks}
				row_clicked={rowClickedPerformance}
				disable_date_filter={true}
			/>
		{/key}
	{/if}
</div>
