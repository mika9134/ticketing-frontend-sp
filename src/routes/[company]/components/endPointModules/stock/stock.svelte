<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { host } from '../../../../../apis/config';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import Table from '../../tables/table.svelte';
	import { getCompanyName } from '../../../../../stores/companyStore';
	import { roles } from '../../../../../stores/roleStore';
	import StockTab from './stock_tab/stock_tab.svelte';
	import StockEntry from './stockentry.svelte';
	import RefreshButton from '../../buttons/refresh-button.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import { v4 as uuidv4 } from 'uuid';
	import ItemRequest from '../warehouse_item_request/warehouse_item_request.svelte';
	import Header from '../../header/header.svelte';
	import { hasPrivilege } from '$lib/role';
	import Details from '$lib/modals/details-component.svelte';
	import BinCard from '$lib/modals/bincard.svelte';
	import Modal from '$lib/modals/createForm.svelte';
	import Assets from './assets.svelte';

	let token = getAccessToken();
	let detailsEndpointById = $state(`${host}warehouse/get-stock-product/`);
	let detailsEndpointById2 = $state(`${host}warehouse/get-stock-product-initial/`);
	let detailsOpen = $state(false);
	let binOpen = $state(false);
	let binUrl = $state('');
	let historyUrl = $state('');
	let tableEndpoint = $state(`${host}warehouse/get-stocks/`);
	let summarizeEndpoint = $state(`${host}warehouse/get-stock/summary/`);
	let subTableLoad;
	let searchEndpoint = $state(`${host}warehouse/get-stock-search`);
	let tableEndpointById = $state(`${host}warehouse/get-stock/`);
	let formEndpoint = $state(`${host}warehouse/stock-form`);
	let submitUrl = $state(undefined);
	// let submitUrl = $state(`${host}warehouse/create-stock`);
	let updateUrl = $state(`${host}warehouse/update-stock`);
	let deleteUrl = $state(`${host}warehouse/delete-stock`);
	let approveUrl = $state(`${host}stock-counts/stock-counts/approve-stock-counts`);
	let rejectUrl = $state(`${host}stock-counts/stock-counts/reject-stock-counts`);
	let table_name = $state('Stocks');
	let company_name = $state('');
	let id = $state();
	let warehouse_name = $state();
	let module_name = $state('Inventory Management');
	let stock_id = $state();
	let access_policy = $state();
	let onAdd = $state('');
	let closeOnSubmit = $state(true);
	let refreshTable = $state(false);
	let tableRef;
	let submitted = false;
	let showStockEntry = $state(false);
	let showAssets = $state(false);
	let item_request_visible = $state(false);
	let show_add_label = $state(false);
	let currentRow = $state('');
	let transactions = $state({});
	let detailsTitle = $state('Bin Card');
	let detailsHidden = $state(['id', 'product_id', 'stock_type_back']);
	let allow_click = $state(false);
	let myDialog = $state();
	let binDialog = $state();
	let isRemark = $state(true);
	let description = $state('Rejection Remark');
	let enable_print = $state(false);
	let hide_buttons_parent = $state(true);
	let activeStatus = $state('');
	let activeTab = $state('Regular');
	// let refreshTable = $state(false);
	let userRoles = $state({});

	let stockDetailsTitle = $state(null);

	let showRejectionModal = $state(false);
	let selectedRowForRejection = $state(null);
	let reason = $state('');

	let isStockCount = $state(true);

	// Navigation state for Details/BinCard
	let viewMode = $state('list'); // 'list' or 'bin'

	let approveCallback = $state(approve);
	let rejectCallback = $state(reject);

	let clickCallback = $state(parentProductClicked); // Changed default callback

	const approve_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	let approve_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg>Approve</div>`;
	let confirm_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg>Confirm</div>`;

	const reject_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-red-100 dark:hover:bg-red-600/20 border-1 border-black/25 rounded-lg !px-3';
	let reject_svg =
		'<div class="flex items-center justify-center gap-x-2 h-6"><svg class="reject" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg>Reject</div>';

	const info_button =
		'<svg width="24px" height="24px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="#9ca3af"></path></g></svg>';

	let button_names = [approve_svg, reject_svg, confirm_svg, info_button];
	let button_styles = [approve_styling, reject_styling, approve_styling, info_button];
	let button_callbacks = [approve, reject, confirm, details];

	function showbutton(row, button_name) {
		if (row.parent != 'true' && hasPrivilege(userRoles['Procurement'], 'U')) {
			return (
				row.status == 'Correction Required' &&
				(button_name == 'Confirm' || button_name == info_button)
			);
		} else if (row.parent == 'true' && hasPrivilege(userRoles['Procurement'], 'U')) {
			return row.status == 'Correction Required' && button_name == 'Confirm All';
		}
	}

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

	async function details(row) {
		if (row?.status === 'Correction Required') {
			transactions = row.correction_remark;
			detailsOpen = true;
			description = 'Correction Remark';
			isRemark = true;
			if (myDialog) {
				myDialog.showModal();
			}
		}
	}

	async function approve(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url = 'stock-counts/stock-counts/approve-stock-counts';
			const response = await fetch(`${host}${url}/${id}`, {
				method: 'PUT', // use POST if your backend expects that
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
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	async function reject(result, loader) {
		subTableLoad = loader;
		selectedRowForRejection = result;
		showRejectionModal = true;
		// console.log('showRejectionModal:', showRejectionModal);
	}

	async function handleRejectionSubmit(result) {
		try {
			const id = selectedRowForRejection.id;
			const remark = result?.remark;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url = 'stock-counts/stock-counts/reject-stock-counts';
			const response = await fetch(`${host}${url}/${id}`, {
				method: 'PUT', // use POST if your backend expects that
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
				console.log('Request rejected:', data);
			} else {
				console.error('rejection failed:', data);
			}
			subTableLoad();
			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	async function confirm(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url = '';
			if (table_name == 'Stock Count') url = 'stock-counts/stock-counts/confirm-stock-counts';
			else if (table_name == 'Adjustment') url = 'adjustments/adjustments/confirm-adjustments';
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
			let url = '';
			if (table_name == 'Stock Count') url = 'stock-counts/stock-counts/confirm-all-stock-counts';
			else if (table_name == 'Adjustment') url = 'adjustments/adjustments/confirm-all-adjustments';
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

	async function rowClickedShow(row) {
		if (activeStatus == 'Stock Count' || activeStatus == 'Stock Adjustment') {
			if (row?.parent == 'true') {
				return false;
			} else if (row?.status == 'Confirmed') {
				return true;
			} else if (row?.status == 'Rejected') {
				return true;
			}

			return false;
		}
		return true;
	}

	async function rowClicked(row) {
		try {
			if (row?.status == 'Confirmed') {
				return;
			}
			currentRow = row;
			selectedRowForRejection = row;
			token = getAccessToken();

			detailsEndpointById = `${host}warehouse/get-stock-product/`;

			const data = await fetchTable(
				`${detailsEndpointById}${row.id}/${row.product_id}/${row.stock_type}`,
				token
			);

			if (data.succeed === true) {
				description = 'Rejection Remark';
				transactions = data.data;
				detailsOpen = true;
				allow_click = false;
			}
		} catch (error) {
			console.log(error);
		}
	}

	// New function to handle parent product click (Details view)
	async function parentProductClicked(row) {
		try {
			console.log('row');
			console.log(row);
			// Ensure we are in Stock Balance to do this behavior
			if (activeStatus !== 'Stock Balance') {
				return;
			}

			currentRow = row;
			token = getAccessToken();

			// Fetch individual SKUs for the parent product
			// Using the NEW endpoint that filters by stock_type in URL
			const skuUrl = `${host}warehouse/get-stock-skus/${row.id}/${id}/${activeTab}`;
			const data = await fetchTable(
				skuUrl,
				token,
			);

			allow_click = false;
			if (data.succeed === true) {
				description = '';
				transactions = data.data; // List of individual stocks

				stockDetailsTitle = `${row.product} - SKU's | Total Quantity - ${row.total_quantity}`;
				detailsTitle = stockDetailsTitle;
				viewMode = 'list'; // Set view to list mode
				detailsOpen = true;
				detailsHidden = ['id', 'product_id', 'stock_type_back', 'warehouse_id'];
				isRemark = false;
				myDialog.showModal();
				allow_click = true;
			}
		} catch (error) {
			console.log(error);
		}
	}

	// Function to handle clicking on a specific SKU in the Details view
	async function handleSkuClick(row) {
		try {
			currentRow = row;
			selectedRowForRejection = row;
			token = getAccessToken();

			detailsEndpointById = `${host}warehouse/get-stock-product/`;
			detailsEndpointById2 = `${host}warehouse/get-stock-product-initial/`;

			binUrl = `${detailsEndpointById}${row.id}/${row.product_id}/${row.stock_type_back}`;
			historyUrl = `${detailsEndpointById2}${row.id}`;

			allow_click = false;
			// Switch view mode to bin card
			viewMode = 'bin';
		} catch (error) {
			console.log(error);
		}
	}

	// Old binClicked function (kept for reference or fallback)
	async function binClicked(row) {
		try {
			currentRow = row;
			selectedRowForRejection = row;
			token = getAccessToken();

			detailsEndpointById = `${host}warehouse/get-stock-product/`;
			detailsEndpointById2 = `${host}warehouse/get-stock-product-initial/`;

			binUrl = `${detailsEndpointById}${row.id}/${row.product_id}/${row.stock_type_back}`;
			historyUrl = `${detailsEndpointById2}${row.id}`;

			allow_click = false;
			description = '';
			binOpen = true;
			binDialog.showModal();
		} catch (error) {
			console.log(error);
		}
	}

	async function assetRowClicked(row) {
		try {
			const product_id = row.product_id;
			const stock_type = row.stock_type;
			const warehouse_id = row.warehouse_id;

			const data = await fetchTable(
				`${host}warehouse/get-asset-details/products/${product_id}/${stock_type}/${warehouse_id}`,
				token
			);

			allow_click = false;
			if (data.succeed === true) {
				const detailsHtml = `
					<div class="flex flex-col justify-center">
						<p class="text-sm text-gray-700 dark:text-gray-300">
							<span class="font-semibold">Product name:</span>
							${row?.product ?? '-'}
						</p>
						
						<p class="text-sm text-gray-700 dark:text-gray-300">
							<span class="font-semibold">Available Quantity / Amount:</span>
							${row?.['available_quantity_/_Amount'] ?? '-'}
						</p>

						<p class="text-xs text-gray-500 mt-1">
							${row?.stock_type ?? ''}
						</p>

					</div>
				`;

				// detailsTitle = `Assets Information | ${row.product} - ${row.stock_type}`;
				detailsTitle = detailsHtml;
				transactions = data.data != null ? data.data : {};
				detailsOpen = true;
				detailsHidden = ['id', 'product_id', 'stock_type_back', 'warehouse_id'];
				viewMode = 'list';
				allow_click = true;
				if (myDialog) {
					myDialog.showModal();
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function assetRowClickedChild(row) {
		try {
			const product_id = row.product_id;
			const stock_type = row.stock_type;
			const warehouse_id = row.warehouse_id;

			const data = await fetchTable(
				`${host}warehouse/get-asset-details/skus/${product_id}/${stock_type}/${warehouse_id}`,
				token
			);

			allow_click = false;
			if (data.succeed === true) {
				allow_click = false;
				const detailsHtml = `
					<div class="flex flex-col justify-center">
						<p class="text-sm text-gray-700 dark:text-gray-300">
							<span class="font-semibold">Product and SKU:</span>
							${row?.product ?? '-'}
						</p>
						
						<p class="text-sm text-gray-700 dark:text-gray-300">
							<span class="font-semibold">Available Quantity / Amount:</span>
							${row?.['available_quantity_/_Amount'] ?? '-'}
						</p>

						<p class="text-xs text-gray-500 mt-1">
							${row?.stock_type ?? ''}
						</p>

					</div>
				`;

				// detailsTitle = `Assets Information | ${row.product} - ${row.stock_type}`;
				detailsTitle = detailsHtml;
				transactions = data.data != null ? data.data : {};
				detailsOpen = true;
				detailsHidden = ['id', 'product_id', 'stock_type_back', 'warehouse_id'];
				viewMode = 'list';
				if (myDialog) {
					myDialog.showModal();
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	function handleTabChange(event) {
		let status = event.detail.status;
		activeStatus = event.detail.status;

		if (status === 'Stock Balance') {
			activeStatus = 'Stock Balance';
			table_name = 'Stocks';
			//onAdd=handleAdd;
			tableEndpoint = `${host}warehouse/get-parent-products/${id}/${activeTab}`;
			summarizeEndpoint = `${host}warehouse/get-stock/summary/${id}/${activeTab}`;
			searchEndpoint = `${host}warehouse/get-stock-search`;
			tableEndpointById = `${host}warehouse/get-stock/`;
			///submitUrl = '';
			//updateUrl = `${host}warehouse/update-stock/${id}`;
			//deleteUrl = `${host}warehouse/delete-stock`;
			submitUrl = undefined;
			updateUrl = undefined;
			deleteUrl = undefined;
			closeOnSubmit = true;
			formEndpoint = `${host}warehouse/stock-form`;
			item_request_visible = false;
			show_add_label = false;
			showStockEntry = false;
			showAssets = false;
			isStockCount = false;

			// Use the new parent click handler
			clickCallback = parentProductClicked;

			detailsTitle = 'Bin Card';
			enable_print = false;
			isRemark = false;
			hide_buttons_parent = true;
		} else if (status === 'Stock Adjustment') {
			activeStatus = 'Stock Adjustment';
			removeNotSubmitted();
			table_name = 'Adjustment';
			onAdd = undefined;
			clickCallback = undefined;
			tableEndpoint = `${host}adjustments/adjustments/get-adjustments/${id}`;
			summarizeEndpoint = null;
			searchEndpoint = `${host}adjustments/adjustments/search`;

			tableEndpointById = `${host}adjustments/adjustments/get-adjustments-by-id/`;
			formEndpoint = `${host}adjustments/adjustments/adjustments-form/${id}`;
			module_name = `Stock Adjustment`;

			submitUrl = `${host}adjustments/adjustments/create-adjustments/${id}`;
			updateUrl = `${host}adjustments/adjustments/update-adjustments/${id}/`;
			deleteUrl = `${host}adjustments/adjustments/delete-adjustments`;

			item_request_visible = false;
			show_add_label = true;
			showStockEntry = false;
			showAssets = false;
			isStockCount = false;
			refreshTable = !refreshTable;
			enable_print = true;
			detailsTitle = 'Adjustment Details';
			isRemark = true;
			hide_buttons_parent = false;
		} else if (status === 'Stock Count') {
			activeStatus = 'Stock Count';
			removeNotSubmitted();
			table_name = 'Stock Count';
			onAdd = undefined;
			clickCallback = undefined;
			tableEndpoint = `${host}stock-counts/stock-counts/get-stock-counts/${id}`;
			summarizeEndpoint = null;
			searchEndpoint = `${host}stock-counts/stock-counts/search`;

			tableEndpointById = `${host}stock-counts/stock-counts/get-stock-count/`;
			formEndpoint = `${host}stock-counts/stock-counts/stock-counts-form`;

			submitUrl = `${host}stock-counts/stock-counts/create-stock-counts/${id}`;
			updateUrl = `${host}stock-counts/stock-counts/update-stock-counts/${id}`;
			deleteUrl = `${host}stock-counts/stock-counts/delete-stock-counts`;
			module_name = `Stock Count`;

			item_request_visible = false;
			show_add_label = true;
			showStockEntry = false;
			showAssets = false;
			isStockCount = true;
			refreshTable = !refreshTable;
			enable_print = true;
			detailsTitle = 'Count Details';
			isRemark = true;
			hide_buttons_parent = false;
		} else if (status === 'Stock Entry') {
			activeStatus = 'Stock Entry';
			removeNotSubmitted();
			showStockEntry = true;
			showAssets = false;
			isStockCount = false;
			summarizeEndpoint = null;
			detailsTitle = 'Bin Card';
			isRemark = false;
		} else if (status === 'Assets') {
			activeStatus = 'Assets';
			removeNotSubmitted();
			tableEndpoint = `${host}warehouse/get-assets/${id}`;
			searchEndpoint = `${host}warehouse/get-asset-search`;
			table_name = 'Assets';
			module_name = ['Inventory Management', 'Procurement', 'Finance'];
			summarizeEndpoint = null;
			refreshTable = !refreshTable;
			submitUrl = undefined;
			updateUrl = undefined;
			deleteUrl = undefined;
			showStockEntry = false;
			clickCallback = assetRowClicked;
			enable_print = false;
			showAssets = true;
			isStockCount = false;
			detailsTitle = 'Bin Card';

			isRemark = false;
		} else {
			item_request_visible = true;
		}
		setTimeout(() => {
			tableRef?.loadTable?.();
		}, 0);
	}

	function handleTabChangeChild(tab) {
		let status2 = tab;

		if (status2 === 'Regular') {
			activeTab = 'Regular';
			tableEndpoint = `${host}warehouse/get-parent-products/${id}/${activeTab}`;
			summarizeEndpoint = `${host}warehouse/get-stock/summary/${id}/${activeTab}`;
		} else if (status2 === 'Promotional') {
			activeTab = 'Promotional';
			tableEndpoint = `${host}warehouse/get-parent-products/${id}/${activeTab}`;
			summarizeEndpoint = `${host}warehouse/get-stock/summary/${id}/${activeTab}`;
		} else if (status2 === 'Defect') {
			activeTab = 'Defect';
			tableEndpoint = `${host}warehouse/get-parent-products/${id}/${activeTab}`;
			summarizeEndpoint = `${host}warehouse/get-stock/summary/${id}/${activeTab}`;
		}
	}

	function handleSecondClick(row) {
		if (!allow_click) {
			return undefined;
		} else if (activeStatus === 'Stock Balance') {
			handleSkuClick(row);
		} else if (activeStatus === 'Assets') {
			assetRowClickedChild(row);
		} else {
			return undefined;
		}
	}

	onMount(async () => {
		activeTab = 'Regular';
		activeStatus = 'Stock Balance';
		const query = $page.url.searchParams;
		id = query.get('id');
		warehouse_name = query.get('name');
		access_policy = query.get('min_access_policy');
		tableEndpoint = `${host}warehouse/get-parent-products/${id}/${activeTab}`;
		summarizeEndpoint = `${host}warehouse/get-stock/summary/${id}/${activeTab}`;
		searchEndpoint = `${host}warehouse/get-stock-search`;
		updateUrl = `${host}warehouse/update-stock/${id}`;
		enable_print = false;

		clickCallback = parentProductClicked; // Initialize with new callback

		company_name = getCompanyName();
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});
	});

	async function removeNotSubmitted() {
		if (submitted == false && stock_id) {
			let result = await fetch(`${host}warehouse/delete-stock-log-all/${stock_id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});
		}
	}

	onDestroy(async () => {
		removeNotSubmitted();
	});

	let sidebarToggle = $state(true);

	let { onToggleSidebar } = $props();

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
<div>
	<div
		class="grid grid-cols-1 lg:grid-cols-2 text-gray-700 h-fit overflow-x-hidden dark:bg-[#0f1727] space-between"
	>
		<div class=" w-fit">
			<StockTab on:statusChange={handleTabChange} />
		</div>
		<div class="flex justify-end m-2">
			<RefreshButton />
		</div>
	</div>
	<p class="text-sm text-gray-700 dark:text-gray-300 ml-4 mt-4 mb-4 font-bold">
		{warehouse_name}
	</p>
	{#if activeStatus == 'Stock Balance'}
		<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
			<div class="flex gap-2">
				<button
					type="button"
					onclick={() => {
						activeTab = 'Regular';
						handleTabChangeChild(activeTab);
						refreshTable = !refreshTable;
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
									border border-b-0
					text-gray-700 hover:bg-gray-100
					dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
						{activeTab === 'Regular'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Regular
				</button>
				<button
					type="button"
					onclick={() => {
						activeTab = 'Promotional';
						handleTabChangeChild(activeTab);
						refreshTable = !refreshTable;
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
									border border-b-0
					text-gray-700 hover:bg-gray-100
					dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
						{activeTab === 'Promotional'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Promotional
				</button>
				<button
					type="button"
					onclick={() => {
						activeTab = 'Defect';
						handleTabChangeChild(activeTab);
						refreshTable = !refreshTable;
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
									border border-b-0
					text-gray-700 hover:bg-gray-100
					dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
						{activeTab === 'Defect'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Defect
				</button>
			</div>
		</div>
	{/if}
	<div>
		{#if showStockEntry}
			<StockEntry />
			<!-- {:else if showAssets}
			<Assets /> -->
		{:else}
			{#key refreshTable}
				<!-- Main Dialog for Details and BinCard -->
				<dialog bind:this={myDialog}>
					{#if viewMode === 'list'}
						<Details
							isOpen={detailsOpen}
							bind:title={detailsTitle}
							bind:data={transactions}
							handleClose={() => {
								detailsOpen = false;
								myDialog.close();
								detailsTitle = stockDetailsTitle;
							}}
							{isRemark}
							{description}
							onRowClick={handleSecondClick}
							hidden_fields={detailsHidden}
						/>
					{:else if viewMode === 'bin'}
						<!-- Replicating the container style of Details to keep UI consistent -->
						<div
							class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto"
							onclick={() => {
								detailsOpen = false;
								myDialog.close();
							}}
						>
							<div
								class="relative w-[95%] max-w-4xl bg-white dark:bg-[#1e2537] rounded-xl shadow-xl p-6 sm:p-8 mt-10 mb-10 min-h-[500px]"
								onclick={(e) => e.stopPropagation()}
							>
								<BinCard
									isOpen={true}
									bind:title={detailsTitle}
									bind:endpoint={binUrl}
									bind:balance_history_endpoint={historyUrl}
									bind:token
									onBack={() => {
										viewMode = 'list';
										detailsTitle = stockDetailsTitle;
										allow_click = true;
									}}
									handleClose={() => {
										detailsOpen = false;
										myDialog.close();
									}}
								/>
							</div>
						</div>
					{/if}
				</dialog>

				<!-- Deprecated for Stock Balance, but kept for legacy calls if any -->
				<dialog bind:this={binDialog}>
					<BinCard
						isOpen={binOpen}
						bind:title={detailsTitle}
						bind:endpoint={binUrl}
						bind:balance_history_endpoint={historyUrl}
						bind:token
						handleClose={() => {
							detailsOpen = false;
							binDialog.close();
						}}
					/>
				</dialog>
				{#key refreshTable}
					<Table
						bind:this={tableRef}
						bind:get_table_endpoint={tableEndpoint}
						bind:summerize_endpoint={summarizeEndpoint}
						bind:search_endpoint={searchEndpoint}
						bind:get_table_endpoint_by_id={tableEndpointById}
						bind:get_form_endpoint={formEndpoint}
						bind:create_entry_url={submitUrl}
						bind:update_entry_url={updateUrl}
						bind:delete_entry_url={deleteUrl}
						{token}
						{table_name}
						module={module_name}
						get_id_bool={true}
						buttons_names={button_names}
						{button_styles}
						buttons_callbacks={button_callbacks}
						add_callback={onAdd}
						min_access_policy={access_policy}
						closeAfterSubmit={closeOnSubmit}
						row_clicked={clickCallback}
						row_clicked_show={rowClickedShow}
						{hide_buttons_parent}
						buttons_show={showbutton}
						bind:enable_print
						fields_show={(k, q, f) => {
							let ind = k.indexOf('on_create');
							if (q[ind] == true && f == 'vstock') {
								return false;
							}
							return true;
						}}
						print_html={print_transaction}
					/>
				{/key}
			{/key}
		{/if}
	</div>
</div>
<Modal
	table_name={'Rejection'}
	{token}
	get_form_endpoint={`${host}stock-counts/stock-counts/get-rejection-form`}
	action_type={'Add'}
	bind:showFormModal={showRejectionModal}
	callback={handleRejectionSubmit}
	disable_save_and_add={true}
/>
