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
	import Details from '$lib/modals/details-component.svelte';
	import { fetchTable } from '../../../../../apis/table';

	let token = getAccessToken();
	let showFormModalAdd = $state(false);
	let showFormModalRemove = $state(false);
	let approveActivated = $state(false);
	let rejectActivated = $state(false);
	let userRoles = $state({});
	let company_name = $state('');
	let closeAfterSubmit = true;
	let subTableLoad;

	let transactions = $state({});
	let detailsOpen = $state(false);
	let detailsTitle = $state('');
	let clickCallback = $state(rowClicked);
	let isRejected = $state(false);

	let showRejectionModal = $state(false);
	let selectedRow = $state(null);
	let reason = $state('');

	let filter = 'Pending';

	let { onToggleSidebar } = $props();

	const tableEndpoint = `${host}finance/get-deposits`;
	const exportEndpoint = `${host}finance/export-deposit`;
	const searchEndpoint = `${host}finance/search`;
	const table_id_data = `${host}finance/get-deposit/`;
	const headerEndpoint = `${host}finance/get-deposit-header`;
	const formEndpoint = `${host}finance/deposit-form`;

	const submitUrl = `${host}finance/create-deposit`;
	const updateUrl = `${host}finance/update-deposit`;
	const deleteUrl = `${host}finance/delete-deposit`;
	const summerizEndpoint = `${host}finance/deposit-summary/`;
	const filterEndpoint = `${host}finance/deposit/all-filters`;


	const table_name = 'Deposit';

	const approve_styling = 'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3'
	const reject_styling = 'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-red-100 dark:hover:bg-red-600/20 border-1 border-black/25 rounded-lg !px-3'
	let approve_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg></div>`;
	let reject_svg = '<div class="flex items-center justify-center gap-x-2 h-6"><svg class="reject" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg></div>';

	let button_callbacks = [approve, reject];
	let button_names = [approve_svg, reject_svg];
	let button_styles = [approve_styling, reject_styling];

	let form_info = {};
	onMount(() => {
		company_name = getCompanyName();
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});
	});

	async function rowClicked(row) {
		try {
			token = getAccessToken();
			const data = await fetchTable(`${table_id_data}${row.id}`, token);

			if (data.succeed === true) {
				transactions = data.data.rejection_remark;
				detailsOpen = true;
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function rowClickedShow(row) {
		isRejected = true;
		// if (row?.status === 'Rejected' && row?.invoice_number != null) {
		// 	isRejected = false;
		// }
		return !isRejected;
	}

	function showbutton(row, button_name) {
		return row.show_button
	}

	async function approve(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			const response = await fetch(`${host}finance/approve-deposit/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
        if (data.succeed)
        {
 				//approveActivated = !approveActivated;
				console.log('Request approved:', data);
				}
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
		return result;
	}

	async function handleRejectionSubmit(action, result) {
		const id = selectedRow.id;
		const remark = result?.remark;

		if (!remark || !selectedRow) {
			console.error('Rejection reason or selected row is missing.');
			return;
		}

		showRejectionModal = false;

		try {
			reason = remark;

			const response = await fetch(`${host}finance/reject-deposit/${id}`, {
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
				//approveActivated = !approveActivated;
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

	// async function getHoverData(row) {
	// 		try {
	// 			const response = await fetch(`${host}approval-group/v2/get-approval-group-next-approvers/${row.id}`, {
	// 				headers: {
	// 					'Authorization': `Bearer ${token}`
	// 				}
	// 			});
				
	// 			const result = await response.json();
				
	// 			console.log("Hover Data Response: ", result);
				
	// 			return {
	// 				"Extra Info": result?.data?.extra_info || "No info provided",
	// 				"Last Updated": result?.data?.updated_at || "Unknown",
	// 				"Manager": result?.data?.manager_name || "Unknown"
	// 			};

	// 		} catch (error) {
	// 			console.error("Error fetching hover data:", error);
	// 			return { error: "Failed to load API data" };
	// 		}
	// 	}


</script>

<div>
	<Header />
	{#key approveActivated}
		<Details
			bind:isOpen={detailsOpen}
			bind:title={detailsTitle}
			bind:data={transactions}
			handleClose={() => {
				detailsOpen = false;
			}}
			isRemark={true}
		/>
		<Table
			get_table_endpoint={tableEndpoint}
			get_export_endpoint={exportEndpoint}
			search_endpoint={searchEndpoint}
			summerize_endpoint={summerizEndpoint}

			filter_endpoint={filterEndpoint}
			get_table_endpoint_by_id={table_id_data}
			get_form_endpoint={formEndpoint}
			create_entry_url={submitUrl}
			update_entry_url={updateUrl}
			delete_entry_url={deleteUrl}
			{token}
			{table_name}
			module={['Cart', 'Deposit']}
			get_id_bool={true}
			buttons_names={button_names}
			buttons_callbacks={button_callbacks}
			button_styles={button_styles}
			buttons_show={showbutton}
			row_clicked={rowClicked}
			row_clicked_show={rowClickedShow}
			header_endpoint={headerEndpoint}
			hide_buttons_parent={true}
		/>
		<Modal
			table_name={'Rejection'}
			{token}
			get_form_endpoint={`${host}finance/get-rejection-form`}
			action_type={'Add'}
			bind:showFormModal={showRejectionModal}
			callback={handleRejectionSubmit}
			disable_save_and_add={true}
		/>
	{/key}
</div>
