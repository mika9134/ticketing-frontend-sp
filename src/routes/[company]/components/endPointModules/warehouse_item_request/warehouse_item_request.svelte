<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { host } from '../../../../../apis/config';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import RefreshButton from '../../buttons/refresh-button.svelte';
	import Table from '../../tables/table.svelte';
	import WarehouseStopFilter from './warehouse_item_request_filter/warehouse_item_request_filter.svelte';
	import { updateForm } from '../../../../../apis/form';
	import Modal from '$lib/modals/createForm.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import { hasPrivilege } from '$lib/role.js';
	import { roles } from '../../../../../stores/roleStore';
	import Details from '$lib/modals/details-component.svelte';

	let tableEndpoint = $state(`${host}warehouse/get-warehouse-item-requests`);
	let tableEndpointById = $state(`${host}warehouse/get-warehouse-item-request-4/`);
	const searchEndpoint = `${host}warehouse/warehouse-item-request-search`;
	let formEndpoint = $state(`${host}warehouse/warehouse-item-request-form-store-admin`);
	const submitUrl = undefined;
	let updateUrl = $state(`${host}warehouse/update-warehouse-item-request-2`);
	const deleteUrl = undefined;
	const table_name = 'Request';
	let userRoles = $state({});
	let id = $state();
	let tableRef;
	let token = getAccessToken();
	let myDialog = $state();

	let subTableLoad;

	let transactions = $state({});
	let detailsOpen = $state(false);
	let detailsTitle = $state('');
	let detailsEndpointById = $state('');

	let reason = $state('');
	let showRejectionModal = $state(false);
	let showAllRejectionModal = $state(false);
	let showCorrectionModal = $state(false);
	let showCorrectionModal2 = $state(false);
	let selectedRowForRejection = $state(null);
	let selectedAllRowForRejection = $state(null);
	let selectedRowForCorrection = $state(null);
	let note = $state(0);
	// let selectedRow = $state(null)
	let refreshTable = $state(false);
	let description = $state('Rejection Remark');

	const approve_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	let approve_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg></div>`;
	let confirm_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="confirm" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg></div>`;
	let confirm_all_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="confirm all" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg></div>`;
	let approve_all_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve all" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg>  </div>`;

	const reject_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-red-100 dark:hover:bg-red-600/20 border-1 border-black/25 rounded-lg !px-3';
	let reject_svg =
		'<div class="flex items-center justify-center gap-x-2 h-6"><svg class="reject" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg>  </div>';
	let reject_all_svg =
		'<div class="flex items-center justify-center gap-x-2 h-6"><svg class="reject all" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg>  </div>';

	const request_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	const request_svg_code =
		'<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="#286692" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1Zm-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71Zm10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z"/></svg>';
	let request_svg = `<div class="flex items-center justify-center gap-x-2 h-6" id="stock in">${request_svg_code} </div>`;
	let request2_svg = `<div class="flex items-center justify-center gap-x-2 h-6" id="stock log">${request_svg_code} </div>`;

	const info_button =
		'<svg width="24px" height="24px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="#9ca3af"></path></g></svg>';

	let button_names = [
		approve_svg,
		confirm_svg,
		reject_svg,
		request_svg,
		request2_svg,
		info_button,
		confirm_all_svg,
		approve_all_svg,
		reject_all_svg
	];
	let button_styles = [
		approve_styling,
		approve_styling,
		reject_styling,
		request_styling,
		request_styling,
		'',
		approve_styling,
		approve_styling,
		reject_styling
	];
	let button_callbacks = [
		handleApprove,
		confirmStockIn,
		reject,
		correctStockIn,
		correctStockRequest,
		handleDetails,
		confirmAll,
		approveAll,
		rejectAll
	];

	// if (row?.status == 'Correction Required') {
	// 	return (
	// 		(row.from == id &&
	// 			(button_name == approve_svg ||
	// 				button_name == reject_svg ||
	// 				button_name == info_button)) ||
	// 		(row.to == id && button_name == info_button)
	// 	);
	// }
	// console.log('Yes');
	// console.log(row);
	// return (
	// 	(row.status == 'Pending' &&
	// 		row.from == id &&
	// 		(button_name == approve_svg || button_name == reject_svg)) ||
	// 	(row.status == 'Accepted' &&
	// 		row.to == id &&
	// 		row.confirmed == false &&
	// 		(button_name == confirm_svg || button_name == request_svg)) ||
	// 	false
	// );
	function buttonsShow(row, button_name) {
		const sr_request = ['Product Request', 'Return Defect', 'Return Normal'].includes(row?.stop_request_type);

		if (row.parent == 'true') {
			if (row.request_types == 'Transfer') {
				return false;
			}
			if (row.show_button) {
				if (
					(button_name == approve_all_svg || button_name == reject_all_svg) &&
					row.status == 'Confirmed'
				) {
					return true;
				}
			}
			if (
				button_name == confirm_all_svg &&
				row.status == 'Pending' &&
				!hasPrivilege(userRoles['Finance'], 'U') &&
				hasPrivilege(userRoles['Inventory Management'], 'U')
			)
				return true;
		} else {
			if (row.request_type == 'Transfer') {
				if (row.show_button) {
					if (
						[approve_svg, reject_svg].includes(button_name) &&
						(row.status == 'Confirmed' || row.status == 'Requested')
					) {
						return true;
					}
				}
				if (
					[approve_svg, reject_svg].includes(button_name) &&
					row.status == 'Pending' &&
					row.from == id &&
					!hasPrivilege(userRoles['Finance'], 'U') &&
					hasPrivilege(userRoles['Inventory Management'], 'U')
				) {
					return true;
				} else if (
					[confirm_svg, request_svg].includes(button_name) &&
					row.status == 'Accepted' &&
					row.to == id &&
					row.confirmed == false &&
					!hasPrivilege(userRoles['Finance'], 'U') &&
					hasPrivilege(userRoles['Inventory Management'], 'U')
				) {
					return true;
				} else if (
					[info_button].includes(button_name) &&
					row.status == 'Correction Required' &&
					row.confirmed == false &&
					!hasPrivilege(userRoles['Finance'], 'U') &&
					hasPrivilege(userRoles['Inventory Management'], 'U')
				) {
					return true;
				}
			} else if (row.show_button) {
				if (
					[approve_svg, reject_svg].includes(button_name) &&
					(row.status == 'Accepted' || row.status == 'Confirmed' || row.status == 'Requested')
				) {
					return true;
				}
			} else if (
				[confirm_svg, reject_svg].includes(button_name) &&
				row.status == 'Pending' &&
				!hasPrivilege(userRoles['Finance'], 'U') &&
				hasPrivilege(userRoles['Inventory Management'], 'U')
			) {
				return true;
			} else if (
				[info_button].includes(button_name) &&
				row.status == 'Correction Required' &&
				hasPrivilege(userRoles['Procurement'], 'D')
			) {
				return true;
			} else if (
				[info_button].includes(button_name) &&
				row.status == 'Correction Required' &&
				sr_request &&
				hasPrivilege(userRoles['Inventory Management'], 'U')
			) {
				return true;
			}
		}
		return false;
	}

	function handleStatusChange(event) {
		let status = event.detail.status;

		if (status === 'All') {
			tableEndpoint = `${host}warehouse/get-warehouse-item-requests/${id}`;
		} else {
			tableEndpoint = `${host}warehouse/get-status-warehouse-item-request/${id}/${status}`;
		}
		// Wait for endpoint to update, then reload
		setTimeout(() => {
			tableRef?.loadTable?.(); // call function in Table.svelte
		}, 0);
	}

	async function confirmAll(result, loadTable) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url = 'warehouse/confirm-all-stock-log';
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

	async function approveAll(stop) {
		try {
			token = getAccessToken();
			let url = '';

			if (stop.isSR != 'true' && hasPrivilege(userRoles['Procurement'], 'U'))
				url = 'warehouse/approve-all-stock-log/';
			else if (stop.isSR != 'true' && hasPrivilege(userRoles['Finance'], 'U'))
				url = 'warehouse/approve-all-stock-log-2/';
			else if (stop.isSR == 'true' && hasPrivilege(userRoles['Inventory Management'], 'U'))
				url = 'warehouse/approve-all-warehouse-item-request/';

			const response = await fetch(`${host}${url}${stop.id}`, {
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
				console.error('Rejection failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	async function handleApprove(stop) {
		try {
			token = getAccessToken();

			let url = '';
			if (stop.request_type == 'Stock In' && hasPrivilege(userRoles['Procurement'], 'U')) {
				url = 'warehouse/approve-stock-log/';
			} else if (stop.request_type == 'Stock In') {
				url = 'warehouse/approve-stock-log-2/';
			} else if (stop.request_type == 'Return to Vendor' || stop.request_type == 'Donation') {
				url = 'warehouse/approve-stock-transfer-finance/';
			} else if (stop.request_type == 'Transfer' || stop.request_type == 'Conversion') {
				if (stop.show_button) {
					url = 'warehouse/approve-stock-transfer-finance/';
				} else {
					url = 'warehouse/approve-stock-transfer/';
				}
			} else {
				url = 'warehouse/approve-warehouse-item-request/';
			}

			const response = await fetch(`${host}${url}${stop.id}`, {
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
				console.error('Rejection failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	async function reject(stop, loader) {
		subTableLoad = loader;
		selectedRowForRejection = stop;
		showRejectionModal = true;
	}

	async function rejectAll(stop) {
		selectedAllRowForRejection = stop;
		showAllRejectionModal = true;
	}

	async function handleRejectionSubmit(action, stop) {
		const remark = stop?.remark;

		if (!remark) {
			console.error('Rejection reason is missing.');
			return;
		}
		showRejectionModal = !showRejectionModal;

		try {
			reason = remark;
			let url = '';
			if (selectedRowForRejection.request_type == 'Transfer') {
				url = 'warehouse/reject-stock-transfer-finance';
			} else {
				url = 'warehouse/reject-warehouse-item-request';
			}
			const response = await fetch(`${host}${url}/${selectedRowForRejection.id}`, {
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
				// refreshTable = !refreshTable;
			} else {
				console.error('Rejection failed:', data);
			}

			subTableLoad();
			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	async function handleAllRejectionSubmit(action, stop) {
		const remark = stop?.remark;

		if (!remark) {
			console.error('Rejection reason is missing.');
			return;
		}
		showAllRejectionModal = !showAllRejectionModal;

		try {
			reason = remark;

			const response = await fetch(
				`${host}warehouse/reject-all-warehouse-item-request/${selectedAllRowForRejection.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({
						remark: String(reason)
					})
				}
			);

			const data = await response.json();
			if (response.ok) {
				refreshTable = !refreshTable;
			} else {
				console.error('Rejection failed:', data);
			}

			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	function checkApproved(stop) {
		return (stop.status === 'Rejected' || stop.status === 'Pending') && !stop.confirmed;
	}

	function checkReject(stop) {
		return (stop.status === 'Approved' || stop.status === 'Pending') && !stop.confirmed;
	}

	async function confirmStockIn(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			let url = '';
			if (result.request_type == 'Transfer' || result.request_type == 'Conversion') {
				url = 'warehouse/confirm-stock-transfer';
			} else {
				url = 'warehouse/confirm-stock-log';
			}
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

	async function correctStockIn(result, loader) {
		subTableLoad = loader;
		selectedRowForCorrection = result;
		showCorrectionModal = true;
	}

	async function handleDetails(row) {
		if (row?.status === 'Correction Required') {
			transactions = row.correction_remark;
			detailsTitle = 'Correction Remark';
			detailsOpen = true;
			description = 'Correction Remark';
			if (myDialog) {
				myDialog.showModal();
			}
		}
	}

	async function correctStockRequest(result, loader) {
		subTableLoad = loader;
		selectedRowForCorrection = result;
		showCorrectionModal2 = true;
	}

	async function handleCorrectStockRequest(action, result) {
		note = result?.correction;

		if (!note) {
			console.error('Correction quantity is missing.');
			return;
		}
		showCorrectionModal2 = !showCorrectionModal2;

		try {
			const response = await fetch(
				`${host}warehouse/correct-warehouse-item-request/${selectedRowForCorrection.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({
						correction: parseInt(note)
					})
				}
			);

			const data = await response.json();
			if (response.ok) {
				// refreshTable = !refreshTable;
				showCorrectionModal2 = !showCorrectionModal2;
			} else {
				console.error('Correction failed:', data);
			}
			subTableLoad();
			return data;
		} catch (error) {
			console.error('Error while correcting:', error);
		}
	}

	async function handleCorrectionSubmit(action, result) {
		note = result?.correction;
		if (!note) {
			console.error('Correction quantity is missing.');
			return;
		}
		showCorrectionModal = !showCorrectionModal;

		try {
			const response = await fetch(
				`${host}warehouse/correct-stock-log/${selectedRowForCorrection.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					},
					body: JSON.stringify({
						correction: note
					})
				}
			);

			const data = await response.json();
			if (response.ok) {
				// refreshTable = !refreshTable;
				showCorrectionModal = !showCorrectionModal;
			} else {
				console.error('Correction failed:', data);
			}
			subTableLoad();
			return data;
		} catch (error) {
			console.error('Error while correcting:', error);
		}
	}

	let condition_check = [checkApproved, checkReject];

	onMount(async () => {
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});
		const query = $page.url.searchParams;
		id = query.get('id');
		tableEndpoint = `${host}warehouse/get-warehouse-item-requests/${id}`;
	});

	async function rowClicked(stop) {
		try {
			console.log('Am I in here?');
			if (stop?.status === 'Rejected') {
				try {
					token = getAccessToken();
					const data = await fetchTable(
						`${host}warehouse/get-warehouse-item-request/${stop?.id}`,
						token
					);
					if (data.succeed && data.data.remark != null) {
						transactions = data.data.remark;
						detailsTitle = 'Rejection Remark';
						detailsOpen = true;
						if (myDialog) {
							myDialog.showModal();
						}
					}
				} catch (error) {
					console.error(error);
				}
			} else if (stop?.status === 'Requested') {
			}
		} catch (error) {
			console.log(error);
		}
	}

	// if(row.show_button) {

	async function rowClickedShow(stop) {
		const request = stop?.request_type;
		const status = stop?.status;
		const sr_request = ['Product Request', 'Return Defect', 'Return Normal'].includes(stop?.stop_request_type);
		console.log('Fuck');
		console.log(stop);

		if (stop?.name == null || !stop?.name || stop?.name == undefined) {
			if (status == 'Rejected' || (sr_request && stop?.confirmed == true)) {
				console.log('Shit');
				return true;
			} else if (request == 'Stock In') {
				console.log('Fuck again');
				if (['Approved', 'Rejected', 'Partially Approved'].includes(status)) return true;
				else if (status == 'Correction Required' && hasPrivilege(userRoles['Procurement'], 'D'))
					return false;
				else if (status == 'Pending' && hasPrivilege(userRoles['Procurement'], 'D')) return false;
				else return true;
			} else if (['Conversion', 'Return to Vendor', 'Donation'].includes(request)) {
				console.log('Fuck again and again');
				if (
					(request == 'Conversion' ||
						request == 'Return to Vendor' ||
						request == 'Donation') &&
					status == 'Pending'
				) {
					return false;
				}
			} else if (['Transfer'].includes(request)) {
				console.log('Fuck again and again and again');
				if (stop?.to == id && status == 'Pending') return false;
				if (stop?.from == id && status == 'Correction Required') return false;
				else return true;
			}
		}
		return false;
	}

	// async function rowClickedShow(stop) {
	// 	console.log('Stop');
	// 	console.log(stop);
	// 	if (
	// 		stop?.name != null ||
	// 		stop?.status == 'Pending' ||
	// 		(stop?.status == 'Requested' && hasPrivilege(userRoles['Inventory Management'], 'U')) ||
	// 		(stop?.status == 'Approved' && hasPrivilege(userRoles['Finance'], 'D'))
	// 	) {
	// 		console.log('First Condition');
	// 		return false;
	// 	} else if (
	// 		stop?.request_type != 'Transfer' &&
	// 		stop?.status == 'Correction Required' &&
	// 		stop?.confirmed == false
	// 	) {
	// 		console.log('Second Condition');
	// 		return false;
	// 	} else if (hasPrivilege(userRoles['Inventory Management'], 'U')) {
	// 		console.log('Third Condition');
	// 		if (
	// 			((stop?.request_type == 'Transfer' && stop.from == id) ||
	// 				stop?.request_type == 'Conversion' ||
	// 				stop?.request_type == 'Return to Vendor' ||
	// 				stop?.request_type == 'Donation' ) &&
	// 			stop?.status == 'Correction Required'
	// 		) {
	// 			return false;
	// 		}
	// 		return true;
	// 	} else if (stop?.status == 'Requested' && hasPrivilege(userRoles['Finance'], 'D')) {
	// 		console.log('Fourth Condition');
	// 		return false;
	// 	}
	// 	console.log('Last Condition');
	// 	return true;
	// }

	function fields_show(k, v, f) {
		let request_index = k.indexOf('request_type');

		let request = v[request_index];

		if (
			request == 'Stock In' &&
			f == 'request_type' &&
			!hasPrivilege(userRoles['Procurement'], 'D')
		) {
			return false;
		}
		if (request != 'Stock In' && (f == 'purchase_price' || f == 'tax_type')) {
			return false;
		}
		if (request != 'Conversion' && f == 'destination_stock_type') {
			return false;
		}
		if (request != 'Return to Vendor' && (f == 'vendor' || f == 'reason')) {
			return false;
		}
		if (request != 'Donation' && f == 'recipient') {
			return false;
		}
		return true;
	}
</script>

{#key refreshTable}
	<Table
		bind:this={tableRef}
		get_table_endpoint={tableEndpoint}
		get_table_endpoint_by_id={tableEndpointById}
		search_endpoint={searchEndpoint}
		get_form_endpoint={formEndpoint}
		create_entry_url={submitUrl}
		update_entry_url={updateUrl}
		delete_entry_url={deleteUrl}
		{token}
		{table_name}
		module={['Penetration', 'Inventory Management', 'Procurement', 'Finance']}
		get_id_bool={true}
		buttons_names={button_names}
		{button_styles}
		buttons_callbacks={button_callbacks}
		{condition_check}
		buttons_show={buttonsShow}
		row_clicked={rowClicked}
		row_clicked_show={rowClickedShow}
		hide_buttons_parent={false}
		{fields_show}
	/>
{/key}

<dialog bind:this={myDialog}>
	<Details
		isOpen={true}
		title={detailsTitle}
		bind:data={transactions}
		handleClose={() => {
			detailsOpen = false;
			myDialog.close();
		}}
		isRemark={true}
		{description}
	/>
</dialog>

<Modal
	table_name={'Rejection'}
	{token}
	get_form_endpoint={`${host}warehouse/get-rejection-form`}
	action_type={'Add'}
	bind:showFormModal={showRejectionModal}
	callback={handleRejectionSubmit}
	disable_save_and_add={true}
/>
<Modal
	table_name={'Rejection'}
	{token}
	get_form_endpoint={`${host}warehouse/get-rejection-form`}
	action_type={'Add'}
	bind:showFormModal={showAllRejectionModal}
	callback={handleAllRejectionSubmit}
	disable_save_and_add={true}
/>

<Modal
	table_name={'Submit Correction'}
	{token}
	get_form_endpoint={`${host}warehouse/stock-log-correction-form`}
	action_type={'Add'}
	bind:showFormModal={showCorrectionModal}
	callback={handleCorrectionSubmit}
	disable_save_and_add={true}
/>
<Modal
	table_name={'Submit Correction'}
	{token}
	get_form_endpoint={`${host}warehouse/item-request-correction-form`}
	action_type={'Add'}
	bind:showFormModal={showCorrectionModal2}
	callback={handleCorrectStockRequest}
	disable_save_and_add={true}
/>
