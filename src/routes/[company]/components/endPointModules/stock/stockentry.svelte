<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { host } from '../../../../../apis/config';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import Table from '../../tables/table.svelte';
	import { getCompanyName } from '../../../../../stores/companyStore';
	import StockTab from './stock_tab/stock_tab.svelte';
	import RefreshButton from '../../buttons/refresh-button.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import { v4 as uuidv4 } from 'uuid';
	import ItemRequest from '../warehouse_item_request/warehouse_item_request.svelte';
	import Header from '../../header/header.svelte';
	import { roles } from '../../../../../stores/roleStore.js';
	import { hasPrivilege } from '$lib/role.js';
	import Modal from '$lib/modals/createForm.svelte';
	import Details from '$lib/modals/details-component.svelte';

	let userRoles = $state({});
	let approveActivated = $state(false);
	let detailsEndpointById = $state('');
	let tableEndpoint = $state(`${host}warehouse/get-stocks`);
	let searchEndpoint = $state(`${host}warehouse/stock-log-search`);
	let tableEndpointById = $state(`${host}warehouse/get-stock/`);
	let summarizeEndpoint = $state(`${host}warehouse/get-stock-log/summary/`);
	let token = getAccessToken();
	let formEndpoint = $state('');
	let submitUrl = $state('');
	let updateUrl = $state(`${host}warehouse/update-stock`);
	let deleteUrl = $state(`${host}warehouse/delete-stock`);
	let table_name = $state('Stocks');
	let company_name = $state('');
	let id = $state();
	let stock_id = $state();
	let access_policy = $state();
	let isStockCount = $state(false);
	let isTransaction = $state(false);
	let subTableLoad;
	let onAdd = $state('');
	let closeOnSubmit = $state(true);
	let currentRow = $state(null);
	let refreshTable = $state(false);
	let tableRef;
	let submitted = $state(false);
	let item_request_visible = $state(false);
	let show_add_label = $state(false);
	let activeStatus = $state('Tasks');
	let has_stock_count = $state(false);
	let has_stock_adjustment = $state(false);
	let showRejectionModal = $state(false);
	let selectedRowForRejection = $state(null);
	let showAllRejectionModal = $state(false);
	let selectedAllRowForRejection = $state(null);
	let selectedRowForCorrection = $state(null);
	let reason = $state('');
	let transactions = $state({});
	let showCorrectionModal = $state(false);
	let detailsOpen = $state(false);
	let detailsTitle = $state('');
	let rejectionForm = $state('');
	let correctionForm = $state('');
	let clickCallback = $state(rowClickedTransactions);
	let clickCallbackShow = $state(rowClickedShow);
	let showbuttonCallback = $state(nobutton);
	let field_show_callback = $state(field_show_tasks);
	let module_name = $state('');
	let remark_screen = $state(false);
	let hideButton = $state(true);
	let description = $state('Rejection Remark');
	let myDialog = $state();
	let enable_print = $state(true);
	let hide_buttons_parent = $state(true);
	function nobutton(row, button_name) {
		return false;
	}

	const approve_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	let approve_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg> Approve </div>`;
	let confirm_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg> Confirm </div>`;
	let confirm_all_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg> Confirm All </div>`;
	let approve_all_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg> Approve All </div>`;

	const reject_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-red-100 dark:hover:bg-red-600/20 border-1 border-black/25 rounded-lg !px-3';
	let reject_svg =
		'<div class="flex items-center justify-center gap-x-2 h-6"><svg class="reject" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg> Reject </div>';
	let reject_all_svg =
		'<div class="flex items-center justify-center gap-x-2 h-6"><svg class="reject" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg> Reject All </div>';

	const request_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	const request_svg_code =
		'<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="#286692" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1Zm-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71Zm10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z"/></svg>';
	let request_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${request_svg_code} Correction </div>`;

	const info_button =
		'<svg width="24px" height="24px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="#9ca3af"></path></g></svg>';

	let button_names = [
		approve_svg,
		confirm_svg,
		reject_svg,
		request_svg,
		'Delete',
		approve_all_svg,
		reject_all_svg,
		confirm_all_svg
	];
	let button_styles = [
		approve_styling,
		approve_styling,
		reject_styling,
		request_styling,
		'',
		approve_styling,
		reject_styling,
		approve_styling
	];
	let button_callbacks = [
		approve,
		confirm,
		reject,
		correction,
		rejectLog,
		approveAll,
		rejectAll,
		confirmAll
	];

	function showbutton(row, button_name) {
		if (activeStatus == 'Stock Requests') {
			if (hasPrivilege(userRoles['Procurement'], 'U')) {
				return (
					row.status == 'Correction Required' &&
					(button_name == approve_svg || button_name == 'Delete')
				);
			} else if (hasPrivilege(userRoles['Finance'], 'D')) {
				return (
					row.status == 'Confirmed' && (button_name == approve_svg || button_name == reject_svg)
				);
			}
		} else if (row.parent == 'true') {
			if (activeStatus == 'Count Requests' || activeStatus == 'Adjustment Requests') {
				return null;
			}
			if (hasPrivilege(userRoles['Finance'], 'D')) {
				return (
					row.status == 'Confirmed' &&
					(button_name == approve_all_svg || button_name == reject_all_svg)
				);
			} else if (hasPrivilege(userRoles['Inventory Management'], 'U')) {
				return (
					(row.status == 'Pending' ||
						(row.status == 'Correction Required' && row.has_pending == 'true')) &&
					button_name == confirm_all_svg
				);
			}
		} else if (activeStatus == 'Adjustment Requests' || activeStatus == 'Count Requests') {
			if (
				userRoles['name'] !== 'Higher Management' &&
				hasPrivilege(userRoles['Inventory Management'], 'U')
			) {
				return (
					row.status == 'Pending' && (button_name == confirm_svg || button_name == request_svg)
				);
			} else if (row?.show_button == true) {
				return button_name == approve_svg || button_name == reject_svg;
			}
		}
	}

	onMount(() => {
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;

			if (userRoles['name'] === 'Higher Management') {
				submitUrl = undefined;
			}

			has_stock_count = hasPrivilege(userRoles['Stock Count'], 'R');
			has_stock_adjustment = hasPrivilege(userRoles['Stock Adjustment'], 'R');
		});
	});

	async function print_transaction(row) {
		const apiUrl = new URL(`${host}finance/test-stock-report/${row.id}/${row.request_type}`);

		try {
			const response = await fetch(apiUrl, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			if (!response.ok) {
				throw new Error(`Error fetching sales volume: ${response.statusText}`);
			}
			const data = await response.json();

			return data;
		} catch (error) {
			console.log(error);
		}
	}

	async function rowClickedShow(row) {
		if (activeStatus == 'Count Requests' || activeStatus == 'Adjustment Requests') {
			if (row?.parent == 'true') {
				return false;
			}
			if (row?.status == 'Rejected') {
				return true;
			}
			return false;
		}
		return true;
	}

	async function rowClickedTransactions(row) {
		try {
			console.log(row);
			currentRow = row;
			token = getAccessToken();

			const data = await fetchTable(`${detailsEndpointById}${row.id}`, token);

			if (data.succeed === true) {
				transactions = data.data.items;
				detailsOpen = true;
				const detailsHtml = `
					<div class="flex flex-col justify-center">
						<p class="text-sm text-gray-700 dark:text-gray-300">
							<span class="font-semibold">Requester:</span>
							${row?.requester ?? '-'}
						</p>

						<p class="text-sm text-gray-700 dark:text-gray-300">
							<span class="font-semibold">Total Quantity / Amount:</span>
							${row?.['quantity_/_Amount'] ?? '-'}
						</p>

						<p class="text-xs text-gray-500 mt-1">
							${row?.date ?? ''}
						</p>
					</div>
				`;

				detailsTitle = detailsHtml;
				remark_screen = false;
				if (myDialog) {
					myDialog.showModal();
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function rowClickedRemark(row) {
		// console.log('Here - ' + row);
		try {
			if (row?.status == 'Confirmed') {
				return;
			}
			currentRow = row;
			// f;
			token = getAccessToken();

			const data = await fetchTable(`${detailsEndpointById}${row?.id}`, token);

			if (data.succeed && data.data.rejection_remark != null) {
				transactions = data.data.rejection_remark;
				detailsOpen = true;
				remark_screen = true;
				if (myDialog) {
					myDialog.showModal();
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	function field_show_tasks(k, v, f) {
		let ind = k.indexOf('request_type');
		if (
			v[ind] == 'Stock In' &&
			f == 'request_type' &&
			!hasPrivilege(userRoles['Procurement'], 'D')
		) {
			return false;
		}
		return true;
	}

	function handleTasks() {
		if (activeStatus === 'Tasks') {
			stock_id = uuidv4();
			table_name = 'Entry';
			onAdd = undefined;
			detailsTitle = 'Transactions';

			tableEndpoint = `${host}warehouse/get-stock-logs/${id}`;
			summarizeEndpoint = `${host}warehouse/get-stock-log/summary/${id}`;
			searchEndpoint = `${host}warehouse/stock-log-search`;
			tableEndpointById = `${host}warehouse/get-stock-log/`;
			detailsEndpointById = `${host}warehouse/get-current-stock-log/${id}/`;

			formEndpoint = `${host}warehouse/stock-log-form/${id}`;

			submitUrl = `${host}warehouse/create-stock-log/${id}/${stock_id}`;
			updateUrl = `${host}warehouse/update-stock-log/${stock_id}`;
			deleteUrl = undefined;

			closeOnSubmit = false;
			show_add_label = true;
			isStockCount = false;
			isTransaction = true;
			showbuttonCallback = nobutton;
			hideButton = true;
			enable_print = true;
			clickCallback = rowClickedTransactions;
			refreshTable = !refreshTable;
			hide_buttons_parent = true;
			field_show_callback = field_show_tasks;
		} else if (activeStatus === 'Count Requests') {
			stock_id = uuidv4();
			table_name = 'Stock Count';
			detailsTitle = 'Stock Count Entries';
			onAdd = undefined;
			detailsEndpointById = `${host}stock-counts/stock-counts/get-stock-count-entry/`;

			tableEndpoint = `${host}stock-counts/stock-counts/get-stock-counts/${id}`;
			searchEndpoint = `${host}stock-counts/stock-counts/search`;
			tableEndpointById = `${host}stock-counts/stock-counts/get-stock-count/`;
			formEndpoint = `${host}stock-counts/stock-counts/stock-counts-form`;

			rejectionForm = `${host}stock-counts/stock-counts/get-rejection-form`;
			summarizeEndpoint = null;
			correctionForm = `${host}stock-counts/stock-counts/get-correction-form`;

			if (userRoles['name'] === 'Higher Management') {
				submitUrl = undefined;
			}
			submitUrl = undefined;
			updateUrl = `${host}stock-counts/stock-counts/update-stock-counts/${id}/`;
			deleteUrl = undefined;
			closeOnSubmit = false;
			show_add_label = false;
			isStockCount = true;
			isTransaction = false;
			showbuttonCallback = showbutton;
			hideButton = true;
			enable_print = true;
			clickCallback = rowClickedRemark;
			refreshTable = !refreshTable;
			hide_buttons_parent = false;
		} else if (activeStatus === 'Adjustment Requests') {
			stock_id = uuidv4();
			table_name = 'Adjustment';
			detailsTitle = 'Adjustment Entries';
			onAdd = undefined;
			// clickCallback = undefined;
			detailsEndpointById = `${host}adjustments/adjustments/get-adjustment-entry/`;

			tableEndpoint = `${host}adjustments/adjustments/get-adjustments/${id}`;
			searchEndpoint = `${host}adjustments/adjustments/search`;
			tableEndpointById = `${host}adjustments/adjustments/get-adjustments-by-id/`;
			formEndpoint = `${host}adjustments/adjustments/adjustments-form/${id}`;
			summarizeEndpoint = null;

			rejectionForm = `${host}adjustments/adjustments/get-rejection-form`;
			correctionForm = `${host}adjustments/adjustments/get-correction-form`;

			if (userRoles['name'] === 'Higher Management') {
				submitUrl = undefined;
			}
			// submitUrl = `${host}adjustments/adjustments/create-adjustments/${id}`;
			updateUrl = `${host}adjustments/adjustments/update-adjustments/${id}/`;
			// deleteUrl = `${host}adjustments/adjustments/delete-adjustments`;
			submitUrl = undefined;
			// updateUrl = undefined;
			deleteUrl = undefined;
			// module_name = `Procurement`;
			closeOnSubmit = false;
			show_add_label = false;
			isStockCount = false;
			isTransaction = false;
			showbuttonCallback = showbutton;
			hideButton = true;
			enable_print = true;
			clickCallback = rowClickedRemark;
			refreshTable = !refreshTable;
			hide_buttons_parent = false;
		}
	}

	async function handleAddAll(stockid) {
		//const stock_url = `${host}warehouse/create-stock/`;
		//const result = await fetchTable(stock_url + stockid, token);
		activeStatus = 'Stock Requests';
	}

	onMount(async () => {
		const query = $page.url.searchParams;
		id = query.get('id');
		access_policy = query.get('min_access_policy');
		tableEndpoint = `${host}warehouse/get-stocks/${id}`;
		summarizeEndpoint = `${host}warehouse/get-stock-log/summary/${id}`;
		searchEndpoint = `${host}warehouse/get-stock-search`;
		updateUrl = `${host}warehouse/update-stock/${id}`;
		formEndpoint = `${host}warehouse/stock-log-form/${id}`;
		onAdd = handleTasks;
		handleTasks();
	});

	async function rowClicked(row) {
		try {
			currentRow = row;
			token = getAccessToken();

			if (activeStatus == 'Tasks') {
				const data = await fetchTable(`${formEndpoint}`, token);
			} else {
				const data = await fetchTable(`${detailsEndpointById}${row.id}`, token);
				if (data.succeed === true) {
					transactions = data.data.items != null ? data.data.items : {};
					detailsOpen = true;
					if (myDialog) {
						myDialog.showModal();
					}
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function approve(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url =
				activeStatus == 'Stock Requests'
					? 'warehouse/approve-stock-log'
					: activeStatus == 'Count Requests'
						? 'stock-counts/stock-counts/approve-stock-counts'
						: 'adjustments/adjustments/approve-adjustments';
			const response = await fetch(`${host}${url}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
				// refreshTable = !refreshTable;
			} else {
				console.error('Approval failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	async function approveAll(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url =
				activeStatus == 'Count Requests'
					? 'stock-counts/stock-counts/approve-all-stock-counts'
					: 'adjustments/adjustments/approve-all-adjustments';
			const response = await fetch(`${host}${url}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
				refreshTable = !refreshTable;
			} else {
				console.error('Approval failed:', data);
			}
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	async function confirm(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url = isStockCount
				? 'stock-counts/stock-counts/confirm-stock-counts'
				: 'adjustments/adjustments/confirm-adjustments';
			const response = await fetch(`${host}${url}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
				// refreshTable = !refreshTable;
			} else {
				console.error('Confirmation failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while confirming:', error);
		}
	}

	async function confirmAll(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url = isStockCount
				? 'stock-counts/stock-counts/confirm-all-stock-counts'
				: 'adjustments/adjustments/confirm-all-adjustments';
			const response = await fetch(`${host}${url}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
				refreshTable = !refreshTable;
			} else {
				console.error('Confirmation failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while confirming:', error);
		}
	}

	async function reject(result, loader) {
		subTableLoad = loader;
		selectedRowForRejection = result;
		showRejectionModal = true;
	}

	async function rejectAll(result) {
		selectedAllRowForRejection = result;
		showAllRejectionModal = true;
	}

	async function correction(result, loader) {
		subTableLoad = loader;
		selectedRowForCorrection = result;
		showCorrectionModal = true; //correction
	}

	async function handleRejectionSubmit(action, result) {
		try {
			description = 'Rejection Remark';
			const id = selectedRowForRejection.id;
			const status = selectedRowForRejection.status;
			reason = result?.remark;

			let httpMethod = activeStatus == 'Tasks' ? 'DELETE' : 'PUT';

			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url =
				activeStatus == 'Tasks'
					? 'warehouse/reject-stock-log'
					: activeStatus == 'Count Requests' &&
						  (status == 'Confirmed' ||
								status == 'Partially Approved' ||
								status == 'Deletion Requested')
						? 'stock-counts/stock-counts/reject-stock-counts'
						: activeStatus == 'Adjustment Requests' &&
							  (status == 'Confirmed' ||
									status == 'Partially Approved' ||
									status == 'Deletion Requested')
							? 'adjustments/adjustments/reject-adjustments'
							: '';
			const response = await fetch(`${host}${url}/${id}`, {
				method: httpMethod, // use POST if your backend expects that
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					remark: String(reason)
				})
			});

			const data = await response.json();
			if (response.ok) {
				// refreshTable = !refreshTable;
			} else {
				console.error('rejection failed:', data);
			}
			subTableLoad();
			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	async function handleAllRejectionSubmit(action, result) {
		try {
			description = 'Rejection Remark';
			const id = selectedAllRowForRejection.id;
			const status = selectedAllRowForRejection.status;
			reason = result?.remark;

			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url =
				activeStatus == 'Count Requests' && status == 'Confirmed'
					? 'stock-counts/stock-counts/reject-stock-counts'
					: activeStatus == 'Adjustment Requests' && status == 'Confirmed'
						? 'adjustments/adjustments/reject-adjustments'
						: '';
			const response = await fetch(`${host}${url}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					remark: String(reason)
				})
			});

			const data = await response.json();
			if (response.ok) {
				refreshTable = !refreshTable;
			} else {
				console.error('rejection failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	async function handleCorrectionSubmit(action, result) {
		try {
			description = 'Correction Remark';

			const id = selectedRowForCorrection.id;
			const status = selectedRowForCorrection.status;
			const reason = result?.correction;

			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url =
				activeStatus === 'Count Requests'
					? 'stock-counts/stock-counts/correct-stock-counts'
					: 'adjustments/adjustments/correct-adjustments';

			const response = await fetch(`${host}${url}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					correction: String(reason)
				})
			});

			const data = await response.json();
			if (response.ok) {
				// refreshTable = !refreshTable;
			} else {
				console.error('Correction failed:', data);
			}
			subTableLoad();
			return data;
		} catch (error) {
			console.error('Error while submitting correction:', error);
		}
	}

	async function rejectLog(result) {
		try {
			const id = result.id;

			if (!id) {
				console.error('No ID found in selected row');
				return;
			}
			let url = 'warehouse/reject-stock-log';
			const response = await fetch(`${host}${url}/${id}`, {
				method: 'DELETE', // use POST if your backend expects that
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
				// refreshTable = !refreshTable;
			} else {
				console.error('rejection failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	onDestroy(async () => {
		handleAddAll(stock_id);
	});

	let sidebarToggle = true;

	let { onToggleSidebar } = $props();

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<div class="m-4">
	<div class="border-b border-gray-200 dark:border-[#00527c]">
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => {
					activeStatus = 'Tasks';
					handleTasks();
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                  border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Tasks'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Stock Transactions
			</button>
			<button
				type="button"
				onclick={() => {
					activeStatus = 'Stock Requests';
					handleTasks();
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                  border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Stock Requests'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Stock Requests
			</button>
			<!-- {#if has_stock_count} -->
				<button
					type="button"
					onclick={() => {
						activeStatus = 'Count Requests';
						handleTasks();
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                  border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Count Requests'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Count Requests
				</button>
			<!-- {/if}
			{#if has_stock_adjustment} -->
				<button
					type="button"
					onclick={() => {
						activeStatus = 'Adjustment Requests';
						handleTasks();
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                  border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeStatus === 'Adjustment Requests'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Adjustment Requests
				</button>
			<!-- {/if} -->
		</div>
	</div>

	{#if activeStatus == 'Stock Requests'}
		<ItemRequest />
	{:else}
		{#key refreshTable}
			<dialog bind:this={myDialog}>
				<Details
					isOpen={detailsOpen}
					title={detailsTitle}
					bind:data={transactions}
					handleClose={() => {
						detailsOpen = false;
						myDialog.close();
					}}
					isRemark={remark_screen}
					{description}
				/>
			</dialog>
			<Table
				bind:this={tableRef}
				bind:get_table_endpoint={tableEndpoint}
				bind:search_endpoint={searchEndpoint}
				bind:summerize_endpoint={summarizeEndpoint}
				bind:get_table_endpoint_by_id={tableEndpointById}
				bind:get_form_endpoint={formEndpoint}
				bind:create_entry_url={submitUrl}
				bind:update_entry_url={updateUrl}
				bind:delete_entry_url={deleteUrl}
				{token}
				{table_name}
				module={['Inventory Management', 'Procurement', 'Finance']}
				get_id_bool={true}
				buttons_names={button_names}
				{button_styles}
				buttons_callbacks={button_callbacks}
				add_callback={onAdd}
				min_access_policy={access_policy}
				closeAfterSubmit={closeOnSubmit}
				row_clicked={clickCallback}
				row_clicked_show={clickCallbackShow}
				buttons_show={showbuttonCallback}
				bind:enable_print
				print_html={print_transaction}
				fields_show={(k, v, f) => {
					let request_type_index = k.indexOf('request_type');
					if (v[request_type_index] != 'Stock In' && (f == 'purchase_price' || f == 'tax_type')) {
						return false;
					}
					if (v[request_type_index] != 'Transfer' && f == 'source_warehouse') {
						return false;
					}
					if (v[request_type_index] != 'Conversion' && f == 'destination_stock_type') {
						return false;
					}
					if (v[request_type_index] != 'Return to Vendor' && (f == 'vendor' || f == 'reason')) {
						return false;
					}
					if (v[request_type_index] != 'Donation' && f == 'recipient') {
						return false;
					}

					return true;
				}}
				{hide_buttons_parent}
			/>
		{/key}
		<Modal
			table_name={'Rejection'}
			{token}
			get_form_endpoint={rejectionForm}
			action_type={'Add'}
			bind:showFormModal={showRejectionModal}
			callback={handleRejectionSubmit}
			disable_save_and_add={true}
		/>
		<Modal
			table_name={'Rejection'}
			{token}
			get_form_endpoint={rejectionForm}
			action_type={'Add'}
			bind:showFormModal={showAllRejectionModal}
			callback={handleAllRejectionSubmit}
			disable_save_and_add={true}
		/>
		<Modal
			table_name={'Correction'}
			{token}
			get_form_endpoint={correctionForm}
			action_type={'Add'}
			bind:showFormModal={showCorrectionModal}
			callback={handleCorrectionSubmit}
			disable_save_and_add={true}
		/>
	{/if}
</div>
