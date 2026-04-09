<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { host } from '../../../../../apis/config';
	import { getCompanyName } from '../../../../../stores/companyStore';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import Table from '../../tables/table.svelte';
	import { v4 as uuidv4 } from 'uuid';
	import { updateForm } from '../../../../../apis/form';
	import Details from '$lib/modals/details-component.svelte';
	import { fetchTable } from '../../../../../apis/table';
	import Modal from '$lib/modals/createForm.svelte';

	const tableEndpoint = `${host}warehouse/get-my-warehouse-item-request`;
	const tableEndpointById = `${host}warehouse/get-warehouse-item-request-4/`;
	const searchEndpoint = `${host}warehouse/warehouse-item-request-search-sr`;
	const formEndpoint = `${host}warehouse/warehouse-item-request-form-2`;
	let submitUrl = $state(`${host}warehouse/create-warehouse-item-request-uuid`);
	const updateUrl = `${host}warehouse/update-warehouse-item-request-2`;
	const deleteUrl = `${host}warehouse/delete-warehouse-item-request`;
	const table_name = 'Stock';
	let route_schedule = $state();
	let companyName = getCompanyName();

	let subTableLoad;
	let tableRef;
	let myDialog = $state();
	let stock_id = $state();
	let token = getAccessToken();

	let transactions = $state({});
	let detailsOpen = $state(false);
	let detailsTitle = $state('');
	let clickCallback = $state(rowClicked);
	let isRejected = $state(false);

	let showCorrectionModal = $state(false);
	let selectedRowForCorrection = $state(null);
	let note = $state(0);
	let refreshTable = $state(false);

	const approve_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	let confirm_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg></div>`;

	const request_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	const request_svg_code =
		'<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"><path fill="#286692" d="M21 12a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-6a1 1 0 0 0-1-1Zm-15 .76V17a1 1 0 0 0 1 1h4.24a1 1 0 0 0 .71-.29l6.92-6.93L21.71 8a1 1 0 0 0 0-1.42l-4.24-4.29a1 1 0 0 0-1.42 0l-2.82 2.83l-6.94 6.93a1 1 0 0 0-.29.71Zm10.76-8.35l2.83 2.83l-1.42 1.42l-2.83-2.83ZM8 13.17l5.93-5.93l2.83 2.83L10.83 16H8Z"/></svg>';
	let request_svg = `<div class="flex items-center justify-center gap-x-2 h-6">${request_svg_code}</div>`;

	let button_names = [confirm_svg, request_svg];
	let button_styles = [approve_styling, request_styling];
	let button_callbacks = [handleConfirm, correctStockIn];
	let condition_check = [checkConfirm];

	function buttonsShow(row, button_name) {
		return (
			row.confirmed == false && row.show_confirm &&
			// (row.status === 'Approved' || row.status === 'Accepted') &&
			(button_name == confirm_svg || button_name == request_svg)
		);
	}

	async function callback(result, action_type) {
		try {
			token = getAccessToken();
			console.log('Result - ' + result.data.id);
			if (route_schedule === undefined) {
				return;
			}

			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const latitude = parseFloat(position.coords.latitude);
					const longitude = parseFloat(position.coords.longitude);

					let response;
					// if (visitType == 'Planned Visit') {
					response = await fetch(`${host}planned/planned-visit/warehouse-stop`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`
						},
						body: JSON.stringify({
							latitude: latitude,
							longitude: longitude,
							route_schedule_id: route_schedule,
							warehouse_id: result['data']['warehouse'],
							stop_id: result['data']['id']
						})
					});

					const data = await response.json();

					console.log(data);

					if (response.ok) {
						//goto(`/${companyName}/visit`);
					} else {
						console.error('Warehouse stop data recoreded failed:', data);
					}
				},
				(error) => {
					console.error('Error getting location:', error.code, error.message);
				},
				{
					enableHighAccuracy: true,
					timeout: 10000,
					maximumAge: 0
				}
			);
		} catch (error) {
			console.error('Start error:', error.message);
		}
	}

	async function handleConfirm(stop, button_name) {
		try {
			token = getAccessToken();
			const response = await fetch(
				`${host}warehouse/confirm-warehouse-item-request/${stop.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
			});

			// setTimeout(() => {
			// 	tableRef?.loadTable?.(); // call function in Table.svelte
			// }, 0);
			// subTableLoad = loader;
			// subTableLoad();

			const data = await response.json();
			if (response.ok) {
				// refreshTable = !refreshTable;
				console.log('Request confirmed:', data);
			} else {
				console.error('Confirmation failed:', data);
			}
			return data;
		} catch (error) {
			return error;
		}
	}

	async function correctStockIn(result, loader) {
		subTableLoad = loader;
		selectedRowForCorrection = result;
		showCorrectionModal = true;
	}

	async function handleCorrectionSubmit(action, result) {
		note = result?.correction;

		console.log('correction ' + note);
		console.log('id ' + selectedRowForCorrection.id);
		if (!note) {
			console.error('Correction is missing.');
			return;
		}
		showCorrectionModal = !showCorrectionModal;

		try {
			const response = await fetch(
				`${host}warehouse/correct-from-sales-rep/${selectedRowForCorrection.id}`,
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
				console.log('Request corrected:', data);
			} else {
				console.error('Correction failed:', data);
			}
			subTableLoad();
			return data;
		} catch (error) {
			console.error('Error while correcting:', error);
		}
	}

	function checkConfirm(stop) {
		return stop.status === 'Approved' && !stop.confirmed;
	}

	onMount(() => {
		// Wait for endpoint to update, then reload
		setTimeout(() => {
			tableRef?.loadTable?.();
		}, 0);
		const searchParams = new URLSearchParams(window.location.search);

		if (searchParams.get('routeschedule')) {
			route_schedule = searchParams.get('routeschedule');
		}
	});

	async function rowClicked(row) {
		console.log('Row clicked:', row);
		// isRejected = false
		// if (row?.name != null){
		// 	return
		// }
		if (row?.status === 'Rejected') {
			// isRejected = true;
			try {
				token = getAccessToken();
				const data = await fetchTable(
					`${host}warehouse/get-warehouse-item-request/${row?.id}`,
					token
				);
				if (data.succeed && data.data.remark != null) {
					detailsTitle = 'Rejection Remark';
					transactions = data.data.remark;
					console.log(transactions);
					detailsOpen = true;
					if (myDialog) {
						myDialog.showModal();
					}
				}
			} catch (error) {
				console.error(error);
			}
		}
	}

	async function rowClicked2(row) {
		console.log('Show: ', row?.status);
		isRejected = true;

		if (row?.request_ID != null || row?.status == 'Pending') {
			return false;
		}
		return true;
	}
</script>

<Details
	bind:isOpen={detailsOpen}
	bind:title={detailsTitle}
	bind:data={transactions}
	handleClose={() => {
		detailsOpen = false;
	}}
	isRemark={true}
/>
{#key refreshTable}
	<Table
		bind:this={tableRef}
		get_table_endpoint={tableEndpoint}
		get_table_endpoint_by_id={tableEndpointById}
		get_form_endpoint={formEndpoint}
		search_endpoint={searchEndpoint}
		bind:create_entry_url={submitUrl}
		update_entry_url={updateUrl}
		delete_entry_url={undefined}
		{token}
		{table_name}
		module={['Sales', 'Trade Marketing']}
		get_id_bool={true}
		buttons_names={button_names}
		{button_styles}
		buttons_callbacks={button_callbacks}
		{condition_check}
		rowClicked2
		closeAfterSubmit={false}
		buttons_show={buttonsShow}
		after_submit_callback={callback}
		hide_buttons_parent={true}
		row_clicked={clickCallback}
		row_clicked_show={rowClicked2}
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
			if (v[request_type_index] != 'Donation' && (f == 'recipient')) {
				return false;
			}

			return true;
		}}
	/>
{/key}

<Modal
	table_name={'Correction'}
	{token}
	get_form_endpoint={`${host}warehouse/item-request-correction-form`}
	action_type={'Add'}
	bind:showFormModal={showCorrectionModal}
	callback={handleCorrectionSubmit}
	disable_save_and_add={true}
/>

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
	/>
</dialog>
