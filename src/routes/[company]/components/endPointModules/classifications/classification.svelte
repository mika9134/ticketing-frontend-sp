<script>
	import { onMount } from 'svelte';
	import { host } from '../../../../../apis/config';
	import { getAccessToken } from '../../../../../stores/tokenStore';

	import { writable } from 'svelte/store';
	import Table from '../../tables/table.svelte';
	import { deleteItem, updateForm, addForm } from '../../../../../apis/form.js';
	import Modal from '$lib/modals/createForm.svelte';
	import Header from '../../header/header.svelte';
	import { hasPrivilege } from '$lib/role';
	import { getCompanyName } from '../../../../../stores/companyStore.js';
	import { roles } from '../../../../../stores/roleStore';
	import Details from '$lib/modals/tabulated-details.svelte';
	import { fetchTable } from '../../../../../apis/table';

	let token = getAccessToken();
	let showFormModalAdd = $state(false);
	let showFormModalRemove = $state(false);
	let refreshTable = $state(false);
	let rejectActivated = $state(false);
	let userRoles = $state({});
	let company_name = $state('');

	const approve_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	const reject_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-red-100 dark:hover:bg-red-600/20 border-1 border-black/25 rounded-lg !px-3';
	let approve_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg></div>`;
	let reject_svg =
		'<div class="flex items-center justify-center gap-x-2 h-6"><svg class="reject" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg></div>';

	// let approve_svg = `Approve`;
	// let reject_svg = 'Reject';

	const info_button =
		'<svg width="24px" height="24px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="#9ca3af"></path></g></svg>';
	let button_callbacks = [approve, reject, showBreakdown];
	let button_names = [approve_svg, reject_svg, info_button];
	let button_styles = [approve_styling, reject_styling, ''];
	let closeAfterSubmit = true;
	let subTableLoad;

	let showRejectionModal = $state(false);
	let selectedRow = $state(null);
	let reason = $state('');
	let detailsOpen = $state(false);
	let detailsTitle = $state('Point of Sales in Route');
	let transactions = $state({});
	let myDialog = $state();

	let tableEndpoint = $state(`${host}classification/get-classification`);
	let summarizeEndpoint = $state(``);
	let tableEndpointById = $state(`${host}classification/get-classification/`);
	let formEndpoint = $state(`${host}classification/classification-form`);
	let searchEndpoint = $state(`${host}classification/search`);
	let submitUrl = $state(`${host}classification/create-classification`);
	let updateUrl = $state(`${host}classification/update-classification`);
	let deleteUrl = $state(`${host}classification/delete-classification`);
	let filterEndpoint = $state(`${host}price-change/all-filters`);

	let approve_url = $state(`${host}classification/classification/accept`);
	let reject_url = $state(`${host}classification/classification/reject`);

	let approve_url_single = $state(`${host}classification/classification/accept/single`);
	let reject_url_single = $state(`${host}classification/classification/reject/single`);

	let approve_product_url = $state(`${host}price-change/approve-single-price-change-product`);
	let reject_product_url = $state(`${host}price-change/reject-single-price-change-product`);

	let approve_pos_url = $state(`${host}price-change/approve-single-price-change-pos`);
	let reject_pos_url = $state(`${host}price-change/reject-single-price-change-pos`);

	let reject_single_url = $state(``);
	let showButtonState = $state(showbutton);
	let table_name = $state('Group');
	let activeStatus = $state('Classification');

	let action_type;

	let form_data = $state(null);
	onMount(async () => {
		company_name = getCompanyName();
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});

		activeStatus = 'Classification';
		table_name = 'Group';
		detailsTitle = 'Classification';

		tableEndpoint = `${host}classification/get-classification`;
		summarizeEndpoint = `${host}classification/classification-summary/`;
		tableEndpointById = `${host}classification/get-classification/`;
		formEndpoint = `${host}classification/classification-form`;
		searchEndpoint = `${host}classification/search`;
		submitUrl = `${host}classification/create-classification`;
		updateUrl = `${host}classification/update-classification`;
		deleteUrl = `${host}classification/delete-classification`;
		approve_url_single = `${host}classification/classification/accept/single`;
		reject_url_single = `${host}classification/classification/reject/single`;
		approve_url = `${host}classification/classification/accept`;
		reject_url = `${host}classification/classification/reject`;
	});

	async function showBreakdown(row) {
		try {
			const data = await fetchTable(`${host}price-change/price-change-details/${row?.id}`, token);
			if (data.succeed === true) {
				detailsTitle = 'Price Change Details: ' + row?.group_name;
				transactions = data.data != null ? data.data : {};
				detailsOpen = true;
				if (myDialog) {
					myDialog.showModal();
				}
				return data;
			}
		} catch (error) {
			console.log(error);
		}
	}

	function showbutton(row, button_name) {
		if (activeStatus == 'Price Change') {
			if (
				row.status == 'Deletion Requested' ||
				row.status == 'Partially Approved' ||
				row.status == 'Pending'
			) {
				if (row.is_parent == true && row.show_button == true) {
					return button_name == approve_svg || button_name == reject_svg || button_name == info_button;
				} else if (row.is_parent == false && row.show_button == true) {
					return button_name == approve_svg || button_name == reject_svg;
				} else if (row.is_parent == true) {
					return button_name == info_button;
				} else {
					return;
				}
			} else {
				if (row.is_parent == true) {
					return button_name == info_button;
				}
			}
		} else if (activeStatus == 'Classification') {
				return row.show_button == true && (button_name == approve_svg || button_name == reject_svg);
		} else return false;
	}

	async function approve(result) {
		try {
			const approval_id = result?.id;
			let approving_url = '';
			if (!approval_id) {
				console.error('No ID found in selected row');
				return;
			}

			if (activeStatus == 'Classification') {
				if (result?.is_parent == true) {
					approving_url = `${approve_url}/${approval_id}`;
				} else {
					approving_url = `${approve_url_single}/${approval_id}`;
				}
			} else {
				if (result?.is_parent == true) {
					approving_url = `${approve_url}/${approval_id}`;
				} else {
					if (result?.is_product == true) {
						approving_url = `${approve_product_url}/${approval_id}`;
					} else {
						approving_url = `${approve_pos_url}/${approval_id}`;
					}
				}
			}
			const response = await fetch(`${approving_url}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
				if (result?.is_parent == true) refreshTable = !refreshTable;
				console.log('Request approved:', data);
			} else {
				console.error('Approval failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	async function reject(result, loader) {
		subTableLoad = loader;
		selectedRow = result;
		showRejectionModal = true;
	}

	async function handleRejectionSubmit(action, result) {
		const id = selectedRow.id;
		const remark = result?.remark;
		let rejecting_url = '';

		if (!selectedRow) {
			console.error('Selected row is missing.');
			return;
		} else if (!remark) {
			console.error('Rejection reason is missing.');
			return;
		}

		if (activeStatus == 'Classification') {
			if (selectedRow?.is_parent == true) {
				rejecting_url = `${reject_url}/${id}`;
			} else {
				rejecting_url = `${reject_url_single}/${id}`;
			}
		} else {
			if (selectedRow?.is_parent == true) {
				rejecting_url = `${reject_url}/${id}`;
			} else {
				if (selectedRow?.is_product == true) {
					rejecting_url = `${reject_product_url}/${id}`;
				} else {
					rejecting_url = `${reject_pos_url}/${id}`;
				}
			}
		}

		showRejectionModal = false;
		try {
			reason = remark;

			const response = await fetch(`${rejecting_url}`, {
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
				if (selectedRow?.is_parent == true) refreshTable = !refreshTable;
				showRejectionModal = !showRejectionModal;
			} else {
				console.error('Rejection failed:', data);
			}

			subTableLoad();
			return data;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	let sidebarToggle = $state(true);

	let { onToggleSidebar } = $props();

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};

	function handleTasks() {
		if (activeStatus === 'Classification') {
			table_name = 'Group';
			detailsTitle = 'Classification';

			tableEndpoint = `${host}classification/get-classification`;
			summarizeEndpoint = `${host}classification/classification-summary/`;
			tableEndpointById = `${host}classification/get-classification/`;
			formEndpoint = `${host}classification/classification-form`;
			searchEndpoint = `${host}classification/search`;
			submitUrl = `${host}classification/create-classification`;
			updateUrl = `${host}classification/update-classification`;
			deleteUrl = `${host}classification/delete-classification`;

			approve_url = `${host}classification/classification/accept`;
			reject_url = `${host}classification/classification/reject`;

			refreshTable = !refreshTable;
		} else if (activeStatus === 'Price Change') {
			table_name = 'Group';
			detailsTitle = 'Price Change';

			tableEndpoint = `${host}price-change/get-price-changes`;
			summarizeEndpoint = `${host}price-change/get-price-changes/summary`;
			tableEndpointById = `${host}price-change/get-price-change/`;
			formEndpoint = `${host}price-change/price-change-form`;
			searchEndpoint = `${host}price-change/search`;
			submitUrl = `${host}price-change/create-price-change`;
			updateUrl = `${host}price-change/update-price-change`;
			deleteUrl = `${host}price-change/delete-price-change`;

			approve_url = `${host}price-change/approve-price-change`;
			reject_url = `${host}price-change/reject-price-change`;

			approve_product_url = `${host}price-change/approve-single-price-change-product`;
			reject_product_url = `${host}price-change/reject-single-price-change-product`;

			approve_pos_url = `${host}price-change/approve-single-price-change-pos`;
			reject_pos_url = `${host}price-change/reject-single-price-change-pos`;

			refreshTable = !refreshTable;
		}
	}
</script>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
	<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
		<div class="flex gap-2">
			<button
				type="button"
				on:click={() => {
					activeStatus = 'Classification';
					handleTasks();
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
              border border-b-0
              text-gray-700 hover:bg-gray-100
              dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
        {activeStatus === 'Classification'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Discount Program
			</button>

			<button
				type="button"
				on:click={() => {
					activeStatus = 'Price Change';
					handleTasks();
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
              border border-b-0
              text-gray-700 hover:bg-gray-100
              dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
        {activeStatus === 'Price Change'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Price Change Program
			</button>
		</div>
	</div>

	{#key refreshTable}
		<Modal
			table_name={'Rejection'}
			{token}
			get_form_endpoint={`${host}classification/get-rejection-form`}
			action_type={'Add'}
			bind:showFormModal={showRejectionModal}
			callback={handleRejectionSubmit}
			disable_save_and_add={true}
		/>
		<Table
			get_table_endpoint={tableEndpoint}
			summerize_endpoint={summarizeEndpoint}
			search_endpoint={searchEndpoint}
			get_table_endpoint_by_id={tableEndpointById}
			get_form_endpoint={formEndpoint}
			filter_endpoint={filterEndpoint}
			create_entry_url={submitUrl}
			update_entry_url={updateUrl}
			delete_entry_url={deleteUrl}
			{token}
			{table_name}
			module="Classification"
			get_id_bool={true}
			buttons_names={button_names}
			buttons_callbacks={button_callbacks}
			{button_styles}
			buttons_show={showButtonState}
			hide_buttons_parent={false}
		/>

		<!-- Parent owns the dialog -->
		<dialog bind:this={myDialog}>
			{#if detailsOpen}
				<Details
					title={detailsTitle}
					dataMap={transactions}
					handleClose={() => {
						detailsOpen = false;
						myDialog?.close();
					}}
				/>
			{/if}
		</dialog>
	{/key}
</div>
