<script>
	import { host, token } from '../../../../../apis/config';
	import Table from '../../tables/table.svelte';
	import { hasPrivilege } from '$lib/role';
	import { getCompanyName } from '../../../../../stores/companyStore.js';
	import { roles } from '../../../../../stores/roleStore';
	import Header from '../../header/header.svelte';
	import { onMount } from 'svelte';
	import RejectionReasonModal from './rejectionModal.svelte';
	import ApproveModal from './approvalModal.svelte';
	import Modal from '$lib/modals/createForm.svelte';
	import Details from '$lib/modals/details-component.svelte';
	import { fetchTable } from '../../../../../apis/table';

	let refreshTable = $state(false);
	let userRoles = $state({});
	let company_name = $state('');
	let reason = $state('');
	let rejectionDetail = $state(false);
	const fields = ['territory', 'route'];
	let form_default = $state();

	let clickCallback = $state(rowClicked);
	let transactions = $state({});
	let detailsOpen = $state(false);
	let detailsTitle = $state('');
	let detailsEndpointById = $state('');

	let showApprovalModal = $state(false);
	let selectedRowForApproval = $state(null);
	let showRejectionModal = $state(false);
	let selectedRowForRejection = $state(null);
	let form_info_data = $state({});
	let pendingCount = $state(0);

	const tableEndpoint = `${host}penetrations/get-penetration`;
	const approvedTableEndpoint = `${host}penetrations/get-approved-penetration`;
	const rejectedTableEndpoint = `${host}penetrations/get-rejected-penetration`;
	const searchEndpoint = `${host}penetrations/search`;
	const searchStatusEndpoint = `${host}penetrations/search-by-status`;
	const exportEndpoint = `${host}penetrations/export-penetration`;
	const summerizEndpoint = `${host}penetrations/penetration-summary/`;

	const formEndpoint = `${host}penetrations/penetration-form`;
	const tableEndpointById = `${host}penetrations/get-penetration/`;
	const submitUrl = `${host}penetrations/create-penetration`;
	const updateUrl = `${host}penetrations/update-penetration`;
	const deleteUrl = `${host}penetrations/delete-penetration`;

	let approval_form = $state('');
	let get_table_endpoint_by_id_approval = $state(
		`${host}penetrations/get-penetration-approval-data/`
	);
	let approval_data = $state(undefined);
	const table_name = 'Penetration';

	const approve_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-green-200 dark:hover:bg-green-600/20 border-1 border-black/25 rounded-lg !px-3';
	const reject_styling =
		'bg-white/10 dark:text-gray-300 dark:bg-black/10 hover:bg-red-100 dark:hover:bg-red-600/20 border-1 border-black/25 rounded-lg !px-3';
	let approve_svg = `<div class="flex items-center justify-center gap-x-2 h-6"><svg class="approve" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><path fill="none" stroke="#286692" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.897 6.63c.32.898-.13 1.513-.998 2.118c-.702.488-1.595 1.017-2.542 1.922c-.928.887-1.834 1.955-2.639 3.006a39 39 0 0 0-2.71 3.99a1.65 1.65 0 0 1-1.446.834a1.66 1.66 0 0 1-1.426-.873c-.748-1.363-1.326-1.901-1.592-2.094c-.737-.537-1.544-.63-1.544-1.8C7 12.776 7.746 12 8.667 12c.658.027 1.262.309 1.789.693c.342.249.705.578 1.082 1.012c.442-.654.975-1.408 1.573-2.189c.868-1.133 1.892-2.35 2.99-3.399c1.08-1.032 2.33-1.998 3.653-2.508c.863-.333 1.822.124 2.143 1.022M4.44 12.076a2.7 2.7 0 0 0-.6-.125l-.141-.006c-.938 0-1.699.783-1.699 1.748c0 .874.623 1.598 1.437 1.728q.042.02.137.087c.27.195.86.737 1.623 2.111c.298.538.851.873 1.453.88a1.67 1.67 0 0 0 1.112-.407M15 5.5c-1.35.515-2.622 1.489-3.723 2.53c-.384.363-.76.746-1.123 1.139" color="currentColor"/></svg></div>`;
	let reject_svg =
		'<div class="flex items-center justify-center gap-x-2 h-6"><svg class="reject" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 26 26" fill="#286692"><g fill="#286692" fill-rule="evenodd" clip-rule="evenodd"><path d="M13 7a6 6 0 1 0 0 12a6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 16 0a8 8 0 0 1-16 0Z"/><path d="M18.657 7.343a1 1 0 0 1 0 1.414l-9.9 9.9a1 1 0 0 1-1.414-1.414l9.9-9.9a1 1 0 0 1 1.414 0Z"/><path d="M13 24c6.075 0 11-4.925 11-11S19.075 2 13 2S2 6.925 2 13s4.925 11 11 11Zm0 2c7.18 0 13-5.82 13-13S20.18 0 13 0S0 5.82 0 13s5.82 13 13 13Z"/></g></svg></div>';
	const location_icon =
		"<div class='flex items-center justify-center gap-x-1'><svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='18' height='18' viewBox='0 0 100 100' xml:space='preserve'><g style='stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;' transform='translate(1.4065934065934016 1.4065934065934016) scale(1, 1)'><path d='M 45 0 C 25.463 0 9.625 15.838 9.625 35.375 c 0 8.722 3.171 16.693 8.404 22.861 L 45 90 l 26.97 -31.765 c 5.233 -6.167 8.404 -14.139 8.404 -22.861 C 80.375 15.838 64.537 0 45 0 z M 45 48.705 c -8.035 0 -14.548 -6.513 -14.548 -14.548 c 0 -8.035 6.513 -14.548 14.548 -14.548 s 14.548 6.513 14.548 14.548 C 59.548 42.192 53.035 48.705 45 48.705 z' style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(40,102,146); fill-rule: nonzero; opacity: 1;' transform=' matrix(1 0 0 1 0 0) ' stroke-linecap='round'/></g></svg></div>";

	let button_names = [location_icon, approve_svg, reject_svg];
	let button_styles = ['', approve_styling, reject_styling];
	let button_callbacks = [fetchLocation, approve, reject];

	const tabs = ['Approved', 'Rejected', 'Pending'];
	let activeTab = $state('Approved');

	let { onToggleSidebar } = $props();

	async function count_pending() {
		try {
			const countRes = await fetch(`${host}penetrations/count-pending`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (countRes.ok) {
				const data = await countRes.json();
				pendingCount = data?.data ?? 0;
				refreshTable = !refreshTable;
			} else {
				console.error('Failed to fetch pending count');
			}
		} catch (err) {
			console.error('Error fetching pending count:', err);
		}
	}

	onMount(async () => {
		company_name = getCompanyName();
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});

		const response = await fetch(`${host}penetrations/get-approval-form`, {
			headers: { Authorization: `Bearer ${token}` }
		});
		if (response.ok) {
			form_info_data = await response.json();
		} else {
			console.error('Failed to fetch form info data');
		}

		count_pending();
	});

	function showbutton(row, button_name) {
		return (
			row.show_button == true &&
			(button_name == location_icon || button_name == approve_svg || button_name == reject_svg)
		);
	}

	async function fetch_data_for_approval(id) {
		try {
			let table_id_data = await fetchTable(get_table_endpoint_by_id_approval + id, token);
			approval_data = table_id_data.data;
			console.log(approval_data);
			return approval_data;
		} catch (error) {
			console.error('Failed to fetch form info data');
		}
	}

	async function approve(result) {
		selectedRowForApproval = result;
		showApprovalModal = true;
		approval_form = `${host}penetrations/get-approval-form/${result?.id}`;
		approval_data = fetch_data_for_approval(result?.id);
	}

	async function reject(result) {
		selectedRowForRejection = result;
		showRejectionModal = true;
	}

	async function rowClicked(row) {
		try {
			// console.log('This is the selected ROW - ' + row?.id);
			// currentRow = row;
			// token = getAccessToken();

			const data = await fetchTable(`${tableEndpointById}${row.id}`, token);
			// console.log(data.data.items);
			if (data.succeed === true) {
				transactions = data.data.remark != null ? data.data.remark : 'None';
				// if (transactions != null)
				detailsOpen = true;
				detailsTitle = 'Penetration | Rejection Remark';
				// console.log("Transactions - " + transactions)
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function handleRejectionSubmit(action, result) {
		// const rejectionReason = event.detail;
		const id = selectedRowForRejection.id;
		// const id = result?.id;
		const remark = result?.remark;

		// Ensure we have a reason and a selected row
		if (!remark || !selectedRowForRejection) {
			console.error('Rejection reason or selected row is missing.');
			return;
		}

		showRejectionModal = false; // Hide the modal

		try {
			// console.log('Reason front - ' + remark);
			reason = remark;

			const response = await fetch(`${host}penetrations/penetration/${id}/reject`, {
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
				count_pending();
				refreshTable = !refreshTable;
				showRejectionModal = !showRejectionModal;
				// console.log('Request rejected:', data);
			} else {
				console.error('Rejection failed:', data);
			}

			return result;
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}

	async function handleApprovalSubmit(action, result) {
		// const { territory, route } = event.detail;
		// const id = result?.id;
		console.log(result);
		const id = selectedRowForApproval.id;
		const territory = result?.territory;
		const route = result?.route;

		if (!id) {
			console.error('No ID found for approval');
			return;
		}

		if (territory === 'All' || route === 'All') {
			console.error('Please select a territory and a route.');
			return;
		}

		showApprovalModal = false;
		// console.log('Territory is: ' + territory + ' and Route is: ' + route);

		try {
			const response = await fetch(`${host}penetrations/penetration/${id}/accept`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					territory_id: territory,
					route_id: route
				})
			});

			const data = await response.json();
			if (response.ok) {
				// console.log('Request approved:', data);
				count_pending();
				showApprovalModal = !showApprovalModal;
				refreshTable = !refreshTable;
			} else {
				console.error('Approval failed:', data);
			}
			return result;
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	let sidebarToggle = $state(true);

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};

	let icon =
		"<div class='flex items-center justify-center gap-x-1'><svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='18' height='18' viewBox='0 0 100 100' xml:space='preserve'><g style='stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;' transform='translate(1.4065934065934016 1.4065934065934016) scale(1, 1)'><path d='M 45 0 C 25.463 0 9.625 15.838 9.625 35.375 c 0 8.722 3.171 16.693 8.404 22.861 L 45 90 l 26.97 -31.765 c 5.233 -6.167 8.404 -14.139 8.404 -22.861 C 80.375 15.838 64.537 0 45 0 z M 45 48.705 c -8.035 0 -14.548 -6.513 -14.548 -14.548 c 0 -8.035 6.513 -14.548 14.548 -14.548 s 14.548 6.513 14.548 14.548 C 59.548 42.192 53.035 48.705 45 48.705 z' style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(40,102,146); fill-rule: nonzero; opacity: 1;' transform=' matrix(1 0 0 1 0 0) ' stroke-linecap='round'/></g></svg></div>";
	let button_callbackss = [fetchLocation];

	async function fetchLocation(result) {
		console.log('Row Latitude: ' + result?.latitude);
		console.log('Row Longitude: ' + result?.longitude);
		console.log('==');
		console.log(result);

		try {
			// Open Google Maps in new tab
			if (result?.location) {
				const [lat, lon] = result.location.split(',');

				const latitude = lat?.trim();
				const longitude = lon?.trim();
				const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
				window.open(mapsUrl, '_blank');
			}
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}
</script>

<Modal
	table_name={'Approval'}
	{token}
	get_form_endpoint={approval_form}
	form_data={approval_data}
	action_type={'Add'}
	bind:showFormModal={showApprovalModal}
	callback={handleApprovalSubmit}
	disable_save_and_add={true}
/>

<Modal
	table_name={'Rejection'}
	{token}
	get_form_endpoint={`${host}penetrations/get-rejection-form`}
	action_type={'Add'}
	bind:showFormModal={showRejectionModal}
	callback={handleRejectionSubmit}
	disable_save_and_add={true}
/>

<div>
	<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
	<div class="mt-4">
		{#key refreshTable}
			<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
				<div class="flex gap-2">
					{#each tabs as tab}
						<button
							type="button"
							onclick={() => {
								activeTab = tab;
								count_pending();
							}}
							class="relative px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeTab === tab
								? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border-b-2 border-[#3393ce] dark:border-[#3393ce]'
								: 'bg-white'}"
						>
							<span class="flex items-center gap-2">
								{tab}
								{#if tab === 'Pending'}
									<span
										class="ml-1 absolute -top-2 -right-2 items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#3393ce] rounded-full"
									>
										{pendingCount}
									</span>
								{/if}
							</span>
						</button>
					{/each}
				</div>
			</div>

			{#if activeTab == 'Approved'}
				<Table
					get_table_endpoint={approvedTableEndpoint}
					search_endpoint={searchStatusEndpoint}
					get_table_endpoint_by_id={tableEndpointById}
					get_export_endpoint={exportEndpoint}
					summerize_endpoint={summerizEndpoint}

					get_form_endpoint={formEndpoint}
					create_entry_url={undefined}
					update_entry_url={undefined}
					delete_entry_url={undefined}
					{token}
					table_name={'Status Penetration'}
					module="Penetration"
					get_id_bool={true}
					search_enabled={true}
				/>
			{:else if activeTab == 'Rejected'}
				<Details
					isOpen={detailsOpen}
					title={detailsTitle}
					bind:data={transactions}
					handleClose={() => {
						detailsOpen = false;
					}}
					isRemark={true}
				/>
				<Table
					get_table_endpoint={rejectedTableEndpoint}
					search_endpoint={searchStatusEndpoint}
					get_table_endpoint_by_id={tableEndpointById}
					get_form_endpoint={formEndpoint}
					summerize_endpoint={summerizEndpoint}

					create_entry_url={undefined}
					update_entry_url={undefined}
					delete_entry_url={deleteUrl}
					{token}
					table_name={'Status Penetration'}
					module="Penetration"
					get_id_bool={true}
					search_enabled={true}
					row_clicked={clickCallback}
				/>
			{:else}
				<Table
					get_table_endpoint={tableEndpoint}
					search_endpoint={searchEndpoint}
					get_table_endpoint_by_id={tableEndpointById}
					summerize_endpoint={summerizEndpoint}

					get_form_endpoint={formEndpoint}
					create_entry_url={!hasPrivilege(userRoles['Sales'], 'D') ? submitUrl : undefined}
					update_entry_url={updateUrl}
					delete_entry_url={deleteUrl}
					{token}
					{table_name}
					module={['Penetration', 'Sales']}
					get_id_bool={true}
					search_enabled={true}
					buttons_names={button_names}
					{button_styles}
					buttons_callbacks={button_callbacks}
					buttons_show={showbutton}
				/>
			{/if}
		{/key}
	</div>
</div>
