<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { host } from '../../../../../apis/config';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import Table from '../../tables/table.svelte';
	import { getCompanyName } from '../../../../../stores/companyStore';
	import { roles } from '../../../../../stores/roleStore';
	import KpiTabs from './kpi-tabs/kpi-tabs.svelte';
	import RefreshButton from '../../buttons/refresh-button.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import { v4 as uuidv4 } from 'uuid';
	import Header from '../../header/header.svelte';
	import { hasPrivilege } from '$lib/role';
	import Details from '$lib/modals/details-component.svelte';
	import Modal from '$lib/modals/createForm.svelte';
	import Breakdowns from './breakdowns.svelte';

	let token = getAccessToken();
	let employee_id = $state();
	let employee_name = $state();
	let selected_period = $state('');
	let role = $state();
	let form_default = $state();

	let myDialog = $state();
	let detailsOpen = $state(false);
	let transactions = $state({});
	let is_remark = $state(false);
	let detailsTitle = $state('KPI Performances');

	let myDialog2 = $state();
	let detailsOpen2 = $state(false);
	let transactions2 = $state({});
	let is_remark2 = $state(false);
	let detailsTitle2 = $state('KPI Performances');

	const info_button = '<svg width="24px" height="24px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="#9ca3af"></path></g></svg>';
	const product_svg_code = `<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
	const category_svg_code = `<svg width="20px" height="20px" viewBox="0 0 32 32" fill="#9ca3af" id="icon" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.cls-1{fill:none;}</style></defs><title>category</title><path d="M27,22.1414V18a2,2,0,0,0-2-2H17V12h2a2.0023,2.0023,0,0,0,2-2V4a2.0023,2.0023,0,0,0-2-2H13a2.002,2.002,0,0,0-2,2v6a2.002,2.002,0,0,0,2,2h2v4H7a2,2,0,0,0-2,2v4.1421a4,4,0,1,0,2,0V18h8v4.142a4,4,0,1,0,2,0V18h8v4.1414a4,4,0,1,0,2,0ZM13,4h6l.001,6H13ZM8,26a2,2,0,1,1-2-2A2.0023,2.0023,0,0,1,8,26Zm10,0a2,2,0,1,1-2-2A2.0027,2.0027,0,0,1,18,26Zm8,2a2,2,0,1,1,2-2A2.0023,2.0023,0,0,1,26,28Z"></path><rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"></rect></g></svg>`;

	let product_svg = `<div class="flex items-center justify-center gap-x-2 h-6 w-6">${product_svg_code}</div>`;
	let category_svg = `<div class="flex items-center justify-center gap-x-2 h-6 w-6">${category_svg_code}</div>`;
	let info_svg = `<div class="flex items-center justify-center gap-x-2 h-6 w-6">${info_button}</div>`;

	let order_conversion_progress = $state(undefined);
	let sales_volume_progress = $state(undefined);
	let penetration_progress = $state(undefined);
	let call_completion_progress = $state(undefined);
	let productivity_progress = $state(undefined);

	let order_conversion_info = $state(undefined);
	let sales_volume_info = $state(undefined);
	let penetration_info = $state(undefined);
	let call_completion_info = $state(undefined);
	let productivity_info = $state(undefined);
	let total_performance = $state(undefined);
	let pre_sales_toggle = $state(false);

	let table_name = $state('Performances');
	let detailsEndpointById = $state(`${host}performance/get-details`);
	let tableEndpoint = $state(`${host}performance/get-by-role/0`);
	let searchEndpoint = $state(`${host}progress/search`);
	let tableEndpointById = $state(`${host}progress/get-progress/`);
	let formEndpoint = $state(`${host}progress/progress-form/`);
	let headerEndpoint = $state(`${host}progress/get-progress-header`);
	let submitUrl = $state(undefined);
	let updateUrl = $state(`${host}performance/update-performance`);
	let deleteUrl = $state(undefined);

	let company_name = $state('');
	let module_name = $state(['Sales', 'Order']);
	let access_policy = $state();
	let onAdd = $state('');
	let closeOnSubmit = $state(true);
	let tableRef = $state(undefined);
	let show_add_label = $state(false);
	let showApprove = $state(true);
	let activeTab = $state('General');

	let refreshTable = $state(false);
	let userRoles = $state({});

	let showRejectionModal = $state(false);
	let selectedRowForRejection = $state(null);

	let currentRow = $state('');
	let reason = $state('');
	let approveId = $state('');

	async function showBreakdown(row) {
		try {
			const data = await fetchTable(`${host}progress/get-breakdown-details/${row.id}`, token);
			if (data.succeed === true) {
				if (row?.status == 'Rejected') {
					detailsTitle = 'KPI Performances';
					is_remark = true;
					transactions2 = data.data.items;
					if (transactions2 == '') return;
					if (myDialog2) {
						myDialog2.showModal();
					}
				} else {
					detailsTitle = 'KPI Performances';
					is_remark = false;
					if (data.data.total) transactions2 = data.data.items;
					else transactions2 = data.data;
					if (transactions2 == '') return;
					if (myDialog2) {
						myDialog2.showModal();
					}
				}
				detailsOpen2 = true;
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}

	async function showProductBreakdown(row) {
		try {
			const data = await fetchTable(
				`${host}progress/get-product-breakdown-details/${row.id}`,
				token
			);
			if (data.succeed === true) {
				if (row?.status == 'Rejected') {
					detailsTitle2 = 'Product Breakdowns';
					is_remark2 = true;
					transactions2 = data.data.items;
					if (transactions2 == '') return;
					if (myDialog2) {
						myDialog2.showModal();
					}
				} else {
					detailsTitle2 = 'Product Breakdowns';
					is_remark2 = false;
					if (data.data.total) transactions2 = data.data.items;
					else transactions2 = data.data;
					if (transactions2 == '') return;
					if (myDialog2) {
						myDialog2.showModal();
					}
				}
				detailsOpen2 = true;
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}

	async function showCategoryBreakdown(row) {
		try {
			const data = await fetchTable(
				`${host}progress/get-category-breakdown-details/${row.id}`,
				token
			);
			if (data.succeed === true) {
				if (row?.status == 'Rejected') {
					detailsTitle2 = 'Category Breakdowns';
					is_remark2 = true;
					transactions2 = data.data.items;
					if (transactions2 == '') return;
					if (myDialog2) {
						myDialog2.showModal();
					}
				} else {
					detailsTitle2 = 'Category Breakdowns';
					is_remark2 = false;
					if (data.data.total) transactions2 = data.data.items;
					else transactions2 = data.data;
					if (transactions2 == '') return;
					if (myDialog2) {
						myDialog2.showModal();
					}
				}
				detailsOpen2 = true;
			}
			return data;
		} catch (error) {
			console.log(error);
		}
	}

	async function childRowClicked(row) {
		// You'll do notin
		return;

		// selected_period = row?.period;
		// try {
		// 	let row_id = row?.performance_id ? row?.performance_id : row?.id;
		// 	// if (role === 'Sales Rep') {
		// 	try {
		// 		const penetration = await fetchTable(
		// 			`${host}performance-employee/get-penetration-breakdowns/${row_id}`,
		// 			token
		// 		);
		// 		const sales = await fetchTable(
		// 			`${host}performance-employee/get-sales-volume-breakdowns/${row_id}`,
		// 			token
		// 		);
		// 		const productivity = await fetchTable(
		// 			`${host}performance-employee/get-productivity-breakdowns/${row_id}`,
		// 			token
		// 		);
		// 		const call_completion = await fetchTable(
		// 			`${host}performance-employee/get-call-completion-breakdowns/${row_id}`,
		// 			token
		// 		);
		// 		const order = await fetchTable(
		// 			`${host}performance-employee/get-order-conversion-breakdowns/${row_id}`,
		// 			token
		// 		);
		// 		if (
		// 			penetration.succeed &&
		// 			sales.succeed &&
		// 			productivity.succeed &&
		// 			call_completion.succeed &&
		// 			order.succeed
		// 		) {
		// 			penetration_progress = penetration.data;
		// 			sales_volume_progress = sales.data;
		// 			productivity_progress = productivity.data;
		// 			call_completion_progress = call_completion.data;
		// 			order_conversion_progress = order.data;

		// 			penetration_info = row?.penetration;
		// 			sales_volume_info = row?.sales_volume;
		// 			productivity_info = row?.productivity;
		// 			call_completion_info = row?.call_completion;
		// 			order_conversion_info = row?.order_conversion;

		// 			total_performance = row?.performance;
		// 			employee_name = row?.employee;
		// 			pre_sales_toggle = false;
		// 			detailsOpen = true;
		// 			if (myDialog) {
		// 				myDialog.showModal();
		// 			}
		// 		}
		// 	} catch (error) {
		// 		console.error(error);
		// 	}
		// } catch (error) {
		// 	console.log(error);
		// }
	}

	function fields_show(k, v, f) {
		let period_index = k.indexOf('period');
		let call_completion_show_index = k.indexOf('call_completion_show');
		let penetration_show_index = k.indexOf('penetration_show');
		let order_conversion_show_index = k.indexOf('order_conversion_show');
		let productivity_show_index = k.indexOf('productivity_show');
		let sales_volume_show_index = k.indexOf('sales_volume_show');

		if (
			period_index == -1 &&
			call_completion_show_index == -1 &&
			penetration_show_index == -1 &&
			order_conversion_show_index == -1 &&
			productivity_show_index == -1 &&
			sales_volume_show_index == -1
		) {
			return false;
		}

		let period = v[period_index];
		let show_completion = v[call_completion_show_index];
		let show_penetration = v[penetration_show_index];
		let show_sales = v[sales_volume_show_index];
		let show_order = v[order_conversion_show_index];
		let show_productivity = v[productivity_show_index];

		let yearly_list = ['yearly', 'yearly_(%)', 'yearly_(Pcs)', 'yearly_(PoS)'];
		let quarterly_list = ['quarterly', 'quarterly_(%)', 'quarterly_(Pcs)', 'quarterly_(PoS)'];
		let monthly_list = ['monthly', 'monthly_(%)', 'monthly_(Pcs)', 'monthly_(PoS)'];
		let weekly_list = ['weekly', 'weekly_(%)', 'weekly_(Pcs)', 'weekly_(PoS)'];
		let daily_list = ['daily', 'daily_(%)', 'daily_(Pcs)', 'daily_(PoS)'];

		let yearly_disallow = ['quarter', 'month', 'week', 'day'];
		let quarterly_disallow = ['year', 'month', 'week', 'day'];
		let monthly_disallow = ['quarter', 'year', 'week', 'day'];
		let weekly_disallow = ['quarter', 'month', 'year', 'day'];
		let daily_disallow = ['quarter', 'month', 'week', 'year'];

		let pen_disallow = ['penetration_progress'];
		let call_disallow = ['call_completion_progress'];
		let sales_disallow = ['sales_volume_progress'];
		let order_disallow = ['order_conversion_progress'];
		let prod_disallow = ['productivity_progress'];

		if (
			typeof period === 'object' &&
			(yearly_disallow.includes(f) ||
				quarterly_disallow.includes(f) ||
				monthly_disallow.includes(f) ||
				weekly_disallow.includes(f) ||
				daily_disallow.includes(f))
		) {
			return false;
		}

		if (period == 'Yearly') {
			return !yearly_disallow.includes(f);
		}

		if (period == 'Quarterly') {
			return !yearly_list.includes(f) && !quarterly_disallow.includes(f);
		}

		if (period == 'Monthly') {
			return (
				!yearly_list.includes(f) && !quarterly_list.includes(f) && !monthly_disallow.includes(f)
			);
		}

		if (period == 'Weekly') {
			return (
				!yearly_list.includes(f) &&
				!quarterly_list.includes(f) &&
				!monthly_list.includes(f) &&
				!weekly_disallow.includes(f)
			);
		}

		if (period == 'Daily') {
			return (
				!yearly_list.includes(f) &&
				!quarterly_list.includes(f) &&
				!monthly_list.includes(f) &&
				!weekly_list.includes(f) &&
				!daily_disallow.includes(f)
			);
		}

		return true;
	}

	function tabs_show(row, tab_name) {
		if (row?.call_completion_show == 'False' && tab_name == 'call_completion_progress') {
			return false;
		}
		if (row?.sales_volume_show == 'False' && tab_name == 'sales_volume_progress') {
			return false;
		}
		if (row?.productivity_show == 'False' && tab_name == 'productivity_progress') {
			return false;
		}
		if (row?.penetration_show == 'False' && tab_name == 'penetration_progress') {
			return false;
		}
		if (row?.order_conversion_show == 'False' && tab_name == 'order_conversion_progress') {
			return false;
		}
		return true;
	}

	onMount(async () => {
		const query = $page.url.searchParams;
		employee_id = query.get('id');
		employee_name = query.get('name');
		role = query.get('role');

		company_name = getCompanyName();
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});
		form_default = { employee: employee_id };
		showApprove = true;
		table_name = 'Performances';
		tableEndpoint = `${host}performance/get-by-role/${employee_id}`;
		searchEndpoint = `${host}progress/search`;
		tableEndpointById = `${host}progress/get-progress/`;
		updateUrl = `${host}progress/update-progress/${employee_id}`;
		detailsEndpointById = `${host}progress/get-details`;
		detailsTitle = 'KPI Performances';
		closeOnSubmit = true;
		show_add_label = false;
	});

	function rowClickedShow(row) {
		if (row?.performance_id) return true;
		return false;
	}

	let sidebarToggle = $state(true);

	let { onToggleSidebar } = $props();

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};

	let button_names = [info_svg, category_svg, product_svg];
	let button_callbacks = [showBreakdown, showCategoryBreakdown, showProductBreakdown];
	let button_styles = ['', '', ''];

	function showbutton(row, button_name) {
		return (
			(button_name == info_svg && row?.route == 'All') ||
			((button_name == product_svg || button_name == category_svg) &&
				row?.show_breakdown_button == true)
		);
	}
</script>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
	<div>
		<p class="text-sm text-gray-700 dark:text-gray-300 ml-4 my-4 font-bold">
			{employee_name} - Performances
		</p>

		{#key refreshTable}
			<Table
				bind:get_table_endpoint={tableEndpoint}
				search_endpoint={searchEndpoint}
				get_table_endpoint_by_id={tableEndpointById}
				get_form_endpoint={formEndpoint}
				create_entry_url={undefined}
				update_entry_url={updateUrl}
				delete_entry_url={false}
				header_endpoint={headerEndpoint}
				{token}
				{table_name}
				module={module_name}
				get_id_bool={true}
				buttons_names={button_names}
				buttons_callbacks={button_callbacks}
				{button_styles}
				buttons_show={showbutton}
				row_clicked={childRowClicked}
				row_clicked_show={rowClickedShow}
				form_override={form_default}
				{fields_show}
				{tabs_show}
				isHierarchical={true}
			/>
			<dialog bind:this={myDialog}>
				<Breakdowns
					title={detailsTitle}
					period={selected_period}
					{order_conversion_progress}
					{penetration_progress}
					{sales_volume_progress}
					{productivity_progress}
					{call_completion_progress}
					{employee_name}
					{pre_sales_toggle}
					{penetration_info}
					{productivity_info}
					{sales_volume_info}
					{call_completion_info}
					{order_conversion_info}
					{total_performance}
					handleClose={() => {
						myDialog.close();
					}}
				/>
			</dialog>
			<dialog bind:this={myDialog2}>
				<Details
					isOpen={detailsOpen2}
					title={detailsTitle2}
					bind:data={transactions2}
					handleClose={() => {
						detailsOpen2 = false;
						myDialog2.close();
					}}
					isRemark={is_remark2}
				/>
			</dialog>
		{/key}
	</div>
</div>
