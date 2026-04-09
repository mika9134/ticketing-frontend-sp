<script>
	import { onMount } from 'svelte';
	import { host } from '../../../../../apis/config';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import { fetchTable } from '../../../../../apis/table';
	import { writable } from 'svelte/store';
	// import Details from '$lib/modals/details.svelte';
	import Table from '../../tables/table.svelte';
	import { deleteItem, updateForm, addForm } from '../../../../../apis/form.js';
	import Modal from '$lib/modals/createForm.svelte';
	import Header from '../../header/header.svelte';
	import { hasPrivilege } from '$lib/role';
	import { getCompanyName } from '../../../../../stores/companyStore.js';
	import { roles } from '../../../../../stores/roleStore';
	import Details from '$lib/modals/details-component.svelte';

	let token = getAccessToken();
	let showFormModalAdd = $state(false);
	let showFormModalRemove = $state(false);
	let approveActivated = $state(false);
	let rejectActivated = $state(false);
	let userRoles = $state({});
	let company_name = $state('');
	let button_callbacks = [approve, reject, handleDetails];
	let button_names = ['Approve', 'Reject', 'Details'];
	let closeAfterSubmit = true;
	let sidebarToggle = true;
	let invoice_html = $state('');
	let attachment_html = $state('');
	let cash_receipt_vouchers = $state([]);
	let crv_index = $state(0);
	let invoice_show = $state(false);
	let activeTab = $state('Receipt');
	let current_sales_type = $state('Cash');
	let dialog;

	let description = $state('Void Remark');
	let myDialog = $state();
	let transactions = $state({});
	let detailsOpen = $state(false);
	let detailsTitle = $state('');
	let showVoidModal = $state(false);
	let selectedVoidRow = $state();
	let note = $state('');

	const tableEndpoint = `${host}finance/get-invoices`;
	const searchEndpoint = `${host}finance/search-invoice`;
	const table_id_data = `${host}finance/get-invoice/`;
	const summerizEndpoint = `${host}finance/invoice-summary`;
	const filterEndpoint = `${host}finance/invoice/all-filters`;
	const table_name = 'Invoice';
	let row_id = $state("");
	let row_status = $state("");
	function printDiv(divName) {
		var printContents = document.getElementById(divName).innerHTML;
		let w = window.open();
		w.document.write(printContents);
		w.print();
		w.close();
	}

	// const formEndpoint = `${host}finance/deposit-form`;

	let { onToggleSidebar } = $props();

	let invoice_redirect_id = $state({ id: null });

	let activeType = $state('Cash');

	let newtype = $state('');

	let cashType = $state('Paid');
	let form_info = {};
	onMount(() => {
		company_name = getCompanyName();
		const unsubscribe = roles.subscribe((value) => {
			userRoles = value;
		});

		const searchParams = new URLSearchParams(window.location.search);

		if (searchParams.get('id')) {
			invoice_redirect_id = searchParams.get('id');
			rowClicked({ id: invoice_redirect_id });
		}
		
	});

	async function rowClicked(row) {
		try {
			token = getAccessToken();
			const data = await fetchTable(`${table_id_data}${row.id}`, token);

			if (data.succeed === true) {
		    row_id = data.data.id;
		    row_status = data.data.status;
				invoice_html = data.data.receipt;
				attachment_html = data.data.attachment;
				cash_receipt_vouchers = data.data.cash_receipt_voucher;
				invoice_show = true;
				current_sales_type = data.data.sales_type;
				dialog.showModal();
			}
		} catch (error) {
			console.log(error);
		}
	}

	function showbutton(row, button_name) {
		// console.log(row, "this is row");
		// if (hasPrivilege(userRoles['Finance'], 'D') || hasPrivilege(userRoles['Deposit'], 'D')) {
		// 	return (
		// 		row.status == 'Void Requested' &&
		// 		(button_name == 'Approve' || button_name == 'Reject' || button_name == 'Details')
		// 	);
		// } else if (hasPrivilege(userRoles['Deposit'], 'R')) {
		// 	return row.status == 'Paid' && button_name == 'Void' && row.approved_by === null;
		// }

		if (row.show_button){
			return ((button_name == 'Approve' || button_name == 'Reject' || button_name == 'Details'))}
		else if (row.show_void_button) {
			return row.status == 'Paid' && button_name == 'Void' && row.approved_by === null;

		
		}

	}

	async function requests(result) {
		selectedVoidRow = result;
		showVoidModal = true;
		// try {
		// 	console.log('action_type:', action_type);
		// 	console.log('result:', result);
		// 	const id = result?.id;
		// 	if (!id) {
		// 		console.error('No ID found in selected row');
		// 		return;
		// 	}

		// 	const response = await fetch(`${host}finance/void-request/${id}`, {
		// 		method: 'PUT',
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 			Authorization: `Bearer ${token}`
		// 		}
		// 	});

		// 	const data = await response.json();
		// 	if (response.ok) {
		// 		approveActivated = !approveActivated;
		// 		console.log('void Request:', data);
		// 	} else {
		// 		console.error('request failed:', data);
		// 	}
		// } catch (error) {
		// 	console.error('Error while sending request:', error);
		// }
	}

	async function handleVoidSubmit(action, result) {
		note = result?.remark;

		if (!note) {
			console.error('Remark is missing.');
			return;
		}
		showVoidModal = !showVoidModal;

		try {
			const response = await fetch(`${host}finance/void-request/${row_id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					remark: note
				})
			});

			const data = await response.json();
			if (response.ok) {
				approveActivated = !approveActivated;
				// transactions = data.data.void_remark;
				// console.log(transactions);
				// detailsOpen = true;
				// if (myDialog) {
				// 	myDialog.showModal();
				// }
			} else {
				console.error('Void Request failed:', data);
			}
			return data;
		} catch (error) {
			console.error('Error while correcting:', error);
		}
	}

	async function handleDetails(result) {
		console.log('Outside');
		console.log(result);
		if (result?.status == 'Void Requested') {
			approveActivated = !approveActivated;
			transactions = result.void_remark;
			console.log('Inside - ' + result.void_remark);
			detailsOpen = true;
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

			const response = await fetch(`${host}finance/void-accept/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
				approveActivated = !approveActivated;
				console.log('Request approved:', data);
			} else {
				console.error('Approval failed:', data);
			}
		} catch (error) {
			console.error('Error while approving:', error);
		}
	}

	async function reject(result) {
		try {
			const id = result?.id;
			if (!id) {
				console.error('No ID found in selected row');
				return;
			}

			const response = await fetch(`${host}finance/void-reject/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			const data = await response.json();
			if (response.ok) {
				approveActivated = !approveActivated;
				console.log('Request has been rejected:', data);
			} else {
				console.error('Rejection failed:', data);
			}
		} catch (error) {
			console.error('Error while rejecting:', error);
		}
	}
</script>

<div>
	<Header />
	<div class="border-b border-gray-200 dark:border-[#00527c] m-4">
		<div class="flex gap-2">
			<button
				type="button"
				onclick={() => {
					activeType = 'Cash';
					newtype = '';
					approveActivated = !approveActivated;
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Cash'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Cash
			</button>

			<button
				type="button"
				onclick={() => {
					activeType = 'Credit';
					newtype = '';
					approveActivated = !approveActivated;
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeType === 'Credit'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Credit
			</button>

			<button
				type="button"
				onclick={() => {
					newtype = 'Void';
					 activeType = '';
					approveActivated = !approveActivated;
				}}
				class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{newtype === 'Void'
					? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
					: 'bg-white'}"
			>
				Void
			</button>
		</div>
	</div>

	{#key approveActivated}
		<Table
			get_table_endpoint={tableEndpoint}
			search_endpoint={searchEndpoint}
			get_table_endpoint_by_id={table_id_data}
			summerize_endpoint={summerizEndpoint}
			filter_endpoint={filterEndpoint}
			{token}
			{table_name}
			module="Deposit"
			get_id_bool={true}
			buttons_names={button_names}
			buttons_callbacks={button_callbacks}
			buttons_show={showbutton}
			row_clicked={rowClicked}
			additional_param={{ invoice_type: activeType , invoice_status: newtype }}

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
		/>
	</dialog>
	<Modal
		table_name={'Void Remark'}
		{token}
		get_form_endpoint={`${host}finance/get-rejection-form`}
		action_type={'Add'}
		bind:showFormModal={showVoidModal}
		callback={handleVoidSubmit}
		disable_save_and_add={true}
	/>

	<dialog
		class="p-2 border-none bg-white"
		bind:this={dialog}
		onclose={async () => {
			invoice_show = false;
		}}
		onclick={(e) => {
			if (e.target === dialog) {
				dialog.close();
			}
		}}
	>
		<div class="border-b border-gray-200 dark:border-[#00527c] mb-4">
		    <div class="absolute top-4 right-4 cursor-pointer" onclick={() => {dialog.close();}}>
		    	<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Menu / Close_SM"> <path id="Vector" d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g> </g></svg>	
		    </div>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={() => {
						activeTab = 'Receipt';
					}}
					class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#003b5e]
				{activeTab === 'Receipt'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
				>
					Receipt
				</button>

					<button
						type="button"
						onclick={() => {
							activeTab = 'Cash Receipt Voucher';
						}}
						class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
							border border-b-0
            text-gray-700 hover:bg-gray-100
            dark:text-white dark:bg-[#002a47] dark:hover:bg-[#81919b]
				{activeTab === 'Cash Receipt Vouchery'
						? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
						: 'bg-white'}"
					>
						Cash Receipt Voucher
					</button>
			</div>
		</div>

		<div class="flex justify-end w-full gap-4">
			<button
				onclick={() => {
					printDiv('invoice_body');
				}}
			>
				<svg width="32px" height="32px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M192 234.666667h640v64H192z" fill="#424242"></path><path d="M85.333333 533.333333h853.333334v-149.333333c0-46.933333-38.4-85.333333-85.333334-85.333333H170.666667c-46.933333 0-85.333333 38.4-85.333334 85.333333v149.333333z" fill="#616161"></path><path d="M170.666667 768h682.666666c46.933333 0 85.333333-38.4 85.333334-85.333333v-170.666667H85.333333v170.666667c0 46.933333 38.4 85.333333 85.333334 85.333333z" fill="#424242"></path><path d="M853.333333 384m-21.333333 0a21.333333 21.333333 0 1 0 42.666667 0 21.333333 21.333333 0 1 0-42.666667 0Z" fill="#00E676"></path><path d="M234.666667 85.333333h554.666666v213.333334H234.666667z" fill="#90CAF9"></path><path d="M800 661.333333h-576c-17.066667 0-32-14.933333-32-32s14.933333-32 32-32h576c17.066667 0 32 14.933333 32 32s-14.933333 32-32 32z" fill="#242424"></path><path d="M234.666667 661.333333h554.666666v234.666667H234.666667z" fill="#90CAF9"></path><path d="M234.666667 618.666667h554.666666v42.666666H234.666667z" fill="#42A5F5"></path><path d="M341.333333 704h362.666667v42.666667H341.333333zM341.333333 789.333333h277.333334v42.666667H341.333333z" fill="#1976D2"></path></g></svg>
			</button>
			{#if (row_status != "Void" && row_status != "Void Requested")}			
			<button class="flex items-center font-bold gap-2 text-gray-100 transition-colors bg-red-700 px-3 rounded-xl shadow-xl mb-1" onclick={() => {showVoidModal = true;}}>
				VOID
			</button>
			
			{/if}
		</div>
		{#if activeTab == 'Cash Receipt Voucher'}
			<select
				bind:value={crv_index}
				class="select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-white dark:bg-[#0c1d37] text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white dark:placeholder:text-white"
			>
				{#each cash_receipt_vouchers as crv, i}
					<option value={i}>{crv.invoice_number}</option>
				{/each}
			</select>
		{/if}
		<div id="invoice_body">
			{#if activeTab == 'Receipt'}
				{@html invoice_html}
			{:else if activeTab == 'Attachment'}
				{@html attachment_html}
			{:else if cash_receipt_vouchers.length}
				{@html cash_receipt_vouchers[crv_index].html}
			{/if}
		</div>
	</dialog>
</div>
