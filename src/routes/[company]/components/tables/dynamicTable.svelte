<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fetchTable, fetchHiddenFields } from '../../../../apis/table';
	import { deleteItem, updateForm } from '../../../../apis/form.js';
	import { formatFieldNames } from '$lib/utils';
	import { hasPrivilege } from '$lib/role.js';
	import {roles} from '../../../../stores/roleStore.js';
	import { host} from '../../../../apis/config';

	import { getAccessToken } from '../../../../stores/tokenStore'

	// import AddModuleForm from "../forms/createForm.svelte";
	import { sharedProducts } from '../endPointModules/salesProduct/salesProductStore';
	import { sharedSales } from '../endPointModules/salesProduct/salesStore';
	import DeleteModal from '$lib/modals/deleteModal.svelte';
	import Modal from '$lib/modals/formModal.svelte';
	import ShareButton from '../buttons/share-button.svelte';
	import { getCompanyName } from '../../../../stores/companyStore.js';



	let {
		get_table_endpoint,
		table_name,
		get_form_endpoint,
		get_update_form_endpoint,
		get_table_endpoint_by_id,
		create_entry_url,
		update_entry_url,
		delete_entry_url,
		void_entry_url,
		get_id_bool,
		token,

		statusOptions = []
	} = $props();
	const module = {"create":{"Users":"Users","Category":"Category","Product":"Product","Role":"Administrative","Scope Group":"Administrative","Organization":"Organization","Tenant":"Service Provider", "Warehouse":"Warehouse","Stocks": "Stock", "Warehouse Stop":"Warehouse-stop", "Address":"Address", "Inheritance":"Inheritance"},
					"update":{"Users":"Users","Category":"Category","Product":"Product","Role":"Administrative","Scope Group":"Administrative","Organization":"Organization","Tenant":"Service Provider", "Warehouse":"Warehouse","Stocks":"Stock","Warehouse Stop":"Warehouse-stop", "Address":"Address", "Inheritance":"Inheritance"},
					"delete":{"Users":"Users","Category":"Category","Product":"Product","Role":"Administrative","Scope Group":"Administrative","Organization":"Organization","Tenant":"Service Provider", "Warehouse":"Warehouse", "Stocks":"Stock","Warehouse Stop":"Warehouse-stop", "Address":"Address", "Inheritance":"Inheritance"}}

	const employeeURL = `${host}employee/employees`;
	let userRoles = $state({});
	let columns = $state(true);
	let uses_get_by_id = $state(get_id_bool);
	let table_data = $state([]);
	let table_id_data = $state([]);
	let showFormModalAdd = $state(false);
	let showSalesModalAdd = $state(false);
	let showSalesModalUpdate = $state(false);
	let showFormModalUpdate = $state([]);
	let showDeleteModal = $state(false);
	let openDropdownId = $state(null);
	let employees = $state([]);
	let products = $state([]);
	let employee = $state();
	let query = $state();
	let selectedRoute = $state();
	let selectedPointOfSale = $state();
	let selectedTerritory = $state();
	let totalSales = $state();
	let get_sales_table_endpoint = $state();
	let get_sales_form_endpoint = $state();
	let create_sales_entry_url = $state();
	let update_sales_entry_url = $state();
	let sales_table_name = $state();
	let sales_data = $state();
	let company_name = $state();
	let get_children_organization_endpoint = `${host}organization/get-children-organizations/`;
	let children_organization = $state([]);

	let selectedRow = $state(null);
	let action_type = '';
	let currentRoute = $page.url.pathname; // Access the current route (path)

	let quantities = $state({});
	let totalQuantity = $state(0);
	let totalPrice = $state(0);
	let discounts = $state({});


	let currentPageName = $state(''); // Track the current page name
	$effect(() => {
		currentPageName = window.location.pathname.split('/').pop(); // Extract the last part of the URL
	});

	function toggleDropdown(id) {
		openDropdownId = openDropdownId === id ? null : id;
	}

	function closeDropdown() {
		openDropdownId = null;
	}

	async function onDataUpdated(event){
			console.log("table updated");
	        await loadTable();
			
		}

	// add product
	function handleAddClick(product) {
		quantities[product.id] = 1;
		discounts[product.id] = 0;
		totalQuantity++;
		totalPrice += Number(product.price.toFixed(2));
	}

	// increase quantity of product
	function increment(product) {
		quantities[product.id] += 1;
		totalQuantity++;
		totalPrice += Number(product.price.toFixed(2));
	}

	// decrease quantity of product
	function decrement(product) {
		totalQuantity--;
		totalPrice -= Number(product.price.toFixed(2));
		totalPrice = Number(totalPrice.toFixed(2));
		if (quantities[product.id] > 1) {
			quantities[product.id] -= 1;
		} else {
			delete quantities[product.id];
		}
	}

	// save selected sale items
	async function handleSubmit() {
		let prods = [];
		for (const product of table_data) {
			const quantity = quantities[product.id];
			const discount = discounts[product.id] || 0;

			if (quantity) {
				if (table_name === 'Add Product') {
					const payload = {
						//sales: query.get('id'),
						employee: employee,
						product: product.id,
						quantity: quantity,
						unit_price: product.price.toFixed(2),
						discount: discount,
						total: product.price.toFixed(2) * quantity - discount,
						before_tax: product.price.toFixed(2) * quantity
					};
					prods.push(payload);
				} else if (table_name === 'Add Promotion') {
					const payload = {
						product: product.id,
						quantity: quantity
					};
					prods.push(payload);
				}
			}
		}

		sharedProducts.set(prods);

		selectedRoute = query.get('route');
		selectedPointOfSale = query.get('pointOfSale');
		console.log('is in here', table_name);
		if (table_name === 'Add Promotion') {
			selectedTerritory = query.get('territory');
			get_sales_table_endpoint = `${host}marketing/promotions`;
			get_sales_form_endpoint = `${host}marketing/form`;
			create_sales_entry_url = `${host}marketing/create-promotion`;
			sales_table_name = 'Promotion';
			totalSales = totalPrice;
			showSalesModalAdd = true;
		} else if (table_name === 'Add Product') {
			selectedTerritory = 0;
			get_sales_table_endpoint = `${host}sales/sales`;
			get_sales_form_endpoint = `${host}sales/form`;
			create_sales_entry_url = `${host}sales/create-sale`;
			sales_table_name = 'Sales';
			totalSales = totalPrice;
			update_sales_entry_url = `${host}sales/update-sales`;

			if (query.get('id')) {
				action_type = 'Update';
				sharedSales.subscribe((value) => {
					sales_data = value;
				});
				console.log(sales_data);
				showSalesModalUpdate = true;
			} else {
				console.log('I am in Add products');
				showSalesModalAdd = true;
			}
		}

		//goto(`/sales/sales-form`);
	}

	async function openUpdateModal(row) {
		selectedRow = row;
		await tick(); // wait for DOM to reflect form_data
		// showUpdateModal = true;
		table_data[0]['show'] = true;
	}

	async function closeUpdateModal() {
		table_data = await fetchTable(get_table_endpoint, token);
	}

	function openDeleteModal(row) {
		selectedRow = row;
		showDeleteModal = true;
	}
	// Close the modal
	function closeDeleteModal() {
		showDeleteModal = false;
		selectedRow = null;
	}
	let isActionsDropdownOpen = false;
	let isFilterDropdownOpen = $state(false);

	let isDeleteModalOpen = false;
	let selectedProduct = null;

	export async function loadTable() {
		try {
		    if(token == null){
				token = getAccessToken();
			}
			
			// Fetch hidden fields
			const hiddenFields = await fetchHiddenFields(table_name, getAccessToken());
			// Fetch table data
			table_data = await fetchTable(get_table_endpoint, getAccessToken());
			// console.log('check table data', table_data);
			if (['Add Product'].includes(table_name)) {
				employees = await fetchTable(employeeURL, token);
			}

			if (table_data && table_data.length > 0) {
				let cols = Object.keys(table_data[0]);

				// Exclude hidden fields
				cols = cols.filter((col) => !hiddenFields.includes(col));

				if (cols.includes('id')) {
					cols = cols.filter((col) => col !== 'id');
					cols.unshift('id');
				}

				// Dynamically set status options if the table has a status column
				if (cols.includes('status')) {
					const uniqueStatuses = [...new Set(table_data.map((row) => row.status))];
					statusOptions = uniqueStatuses.map(
						(status) => status.charAt(0).toUpperCase() + status.slice(1)
					); // Capitalize the first letter
				} else {
					statusOptions = []; // No status column
				}

				for (let i = 0; i < table_data.length; i++) {
					await tick();
					showFormModalUpdate[i] = false;
				}

				columns = cols; // Set the filtered columns
			}
		} catch (error) {
			console.error('Error loading table:', error);
		}
	}

	async function fetchUpdate_table_by_Id(id) {
		try {
			if (uses_get_by_id) {
				table_id_data = await fetchTable(get_table_endpoint_by_id + id, token);
				console.log('fetched table by Id: ', table_id_data);
				return table_id_data;
			} else {
				console.log('fetched from TAble', table_data[id]);
				return table_data[id];
			}
		} catch (error) {
			console.error('Error loading table:', error);
		}
	}

	// Fetch table data on mount
	onMount(async () => {
		company_name = getCompanyName();
		const unsubscribe = roles.subscribe(value => {
        userRoles = value;
                // console.log("roles are here", userRoles);
        });

		if(token == null){
			token = getAccessToken()
		}
		loadTable();
		query = $page.url.searchParams;
	});
	// Toggle dropdowns
	function toggleActionsDropdown() {
		isActionsDropdownOpen = !isActionsDropdownOpen;
	}

	function toggleFilterDropdown() {
		isFilterDropdownOpen = !isFilterDropdownOpen;
	}

	function handleDelete(id) {
		const url = `${delete_entry_url}/${id}`; // Append the row ID to the delete URL
		deleteItem(url, token)
			.then(() => {
				// Remove the deleted row from the table
				table_data = table_data.filter((row) => row.id !== id);
				closeDeleteModal(); // Close the modal after deletion
			})
			.catch((error) => {
				console.error('Error deleting item:', error);
			});
	}

	async function handleVoidClick(id) {
		console.log(id);
		const url = `${void_entry_url}/${id}`; // Append the row ID to the delete URL
		try {
			await updateForm(url, {}, token);
			alert(`Sale ${id} voided`);
			loadTable();
		} catch (e) {}
	}

	async function handleApprove(id) {
		const url = `${entry_status_url}/${id}/approve`; // URL for approving the request
		try {
			await updateForm(url, {}, token);
			alert(`Request ${id} approved`);
			loadTable(); // Reload the table data
		} catch (error) {
			console.error(`Error approving request ${id}:`, error);
		}
	}

	async function handleReject(id) {
		const url = `${entry_status_url}/${id}/reject`; // URL for rejecting the request
		try {
			await updateForm(url, {}, token);
			alert(`Request ${id} rejected`);
			loadTable(); // Reload the table data
		} catch (error) {
			console.error(`Error rejecting request ${id}:`, error);
		}
	}

	async function handleApproveReject(endpoint, id, status){
		try{
			await updateForm(`${endpoint}${status}/${id}`,{}, token);
			loadTable(); // Reload the table data
			

		}catch (error) {
			console.error(`Error rejecting request ${id}:`, error);
		}
		closeDropdown();
	}

	// Track the checked state of all checkboxes
	let checkedProducts = new Set();

	// Track the 'select all' checkbox state
	let selectAll = false;

	// Toggle individual product checkbox
	function toggleProduct(id) {
		if (checkedProducts.has(id)) {
			checkedProducts.delete(id); // Uncheck
		} else {
			checkedProducts.add(id); // Check
		}
		updateSelectAllState();
	}

	// Toggle the 'select all' checkbox
	function toggleSelectAll() {
		if (selectAll) {
			// Select all products
			table_data.forEach((product) => checkedProducts.add(product.id));
		} else {
			// Unselect all products
			checkedProducts.clear();
		}
	}

	// Update the 'select all' checkbox state based on individual selections
	function updateSelectAllState() {
		selectAll = table_data.every((product) => checkedProducts.has(product.id));
	}

	let currentPage = $state(1); // Current page number
	let rowsPerPage = 8; // Number of rows per page
	let paginatedData = $state([]); // Data for the current page

	function goToPage(page) {
		if (page >= 1 && page <= Math.ceil(table_data.length / rowsPerPage)) {
			currentPage = page;
		}
	}
	let searchTerm = $state('');
	let filteredData = $state([]); // Initialize as an empty array
	let selectedStatus = 'all';

	// Reactive filtered table data (no sorting)
	$effect(() => {
		// Filter data based on search and status
		const filteredData = table_data.filter((item) => {
			const matchesSearch = Object.values(item)
				.join(' ')
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

			const matchesStatus =
				selectedStatus === 'all' || item.status?.toLowerCase() === selectedStatus.toLowerCase();

			return matchesSearch && matchesStatus;
		});

		// Paginate the filtered data
		const startIndex = (currentPage - 1) * rowsPerPage;
		const endIndex = startIndex + rowsPerPage;
		paginatedData = filteredData.slice(startIndex, endIndex);
	});
</script>

<main class="mx-auto sm:p-2 max-h-xl antialiased">
	<!-- Start block -->
	<section class="h-full w-full">
		<div class="bg-white dark:bg-[#002a47] relative shadow-md sm:rounded-lg">
			<!-- Dynamic table header -->
			<div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4"	>
				<div class="w-full md:w-1/2">
					<!-- Search bar -->
					<div class="relative w-full max-w-md mb-4">
						<input
							type="text"
							bind:value={searchTerm}
							placeholder="Search..."
							class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f9fafb] dark:bg-gray-700 dark:text-white"
						/>
						<svg
							class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
							/>
						</svg>

					</div>

					{#if statusOptions.length > 0}
						<select
							bind:value={selectedStatus}
							class="select shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-white dark:bg-[#002a47] text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:text-white dark:placeholder:text-white rounded"
						>
							<option value="all">Filter</option>
							{#each statusOptions as status}
								<option value={status}>{status}</option>
							{/each}
						</select>
					{/if}
				</div>

				<div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0"	>
				
					{#if !["Stock Log"].includes(table_name)}
					{#if hasPrivilege(userRoles[module["create"][table_name]], "C")}
						<button
							type="button"
							id="createProductModalButton"
							data-modal-target="createProductModal"
							data-modal-toggle="createProductModal"
							class="btn btn-neutral bg-[#3393ce] text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50"
							onclick={() => {
								if (table_name === 'Sales') {
									goto('/sales/sales-map');
								} else if (table_name === 'Promotion') {
									goto('/trade-marketing/sales-activation/sales-activation-map');
								} else {
									action_type = 'Add';
									showFormModalAdd = true;
								}
							}}
						>
							<svg
								class="h-3.5 w-3.5 mr-2"
								fill="currentColor"
								viewbox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									clip-rule="evenodd"
									fill-rule="evenodd"
									d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
								/>
							</svg>
							Add {table_name}
						</button>
						{/if}

					{:else if ['Add Product'].includes(table_name)}
						<div>
							<div class="flex-1 flex items-center">
								<h5>
									<span class="text-gray-500">Select Employee Responsible</span>
								</h5>
							</div>
							<select
								bind:value={employee}
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							>
								<option value="" disabled>Select employee</option>
								{#each employees as employee}
									<option value={employee.id}>Employee {employee.id}</option>
								{/each}
							</select>
						</div>
					{/if}

					{#each paginatedData as row, index}
						<Modal
							bind:closeUpdateModal
							on:update={onDataUpdated}
							{table_name}
							{token}
							get_form_endpoint={get_update_form_endpoint || get_form_endpoint}
							{update_entry_url}
							{get_table_endpoint}
							action_type={'Update'}
							bind:showFormModal={showFormModalUpdate[index]}
							form_data={table_id_data}
						/>
					{/each}
					
					<!-- add form modal section -->
					<Modal
						bind:closeUpdateModal
						on:update={onDataUpdated}
						{table_name}
						{token}
						{get_form_endpoint}
						{get_table_endpoint}
						{create_entry_url}
						action_type={'Add'}
						bind:showFormModal={showFormModalAdd}
						form_data={[]}
					/>

					<Modal
						bind:closeUpdateModal
						table_name={sales_table_name}
						{token}
						get_form_endpoint={get_sales_form_endpoint}
						{get_table_endpoint}
						create_entry_url={create_sales_entry_url}
						action_type={'Add'}
						{totalSales}
						route={selectedRoute}
						pointOfSale={selectedPointOfSale}
						bind:showFormModal={showSalesModalAdd}
						form_data={[]}
					/>

					<Modal
						bind:closeUpdateModal
						update_entry_url={update_sales_entry_url}
						table_name={sales_table_name}
						{token}
						get_form_endpoint={get_sales_form_endpoint}
						{get_table_endpoint}
						action_type={'Update'}
						{totalSales}
						bind:showFormModal={showSalesModalUpdate}
						form_data={sales_data}
					/>

				</div>
			</div>

			<!-- Table section -->
			{#if table_data.length === 0}
				<p class="flex justify-self-center text-gray-800 dark:text-white">No data available</p>
			{:else}
			<div class="overflow-visible max-h-5xl">
				<table	class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left text-gray-700 dark:text-gray-300"	>
					<thead class="bg-gray-100 dark:bg-gray-800 text-xs  text-gray-600 dark:text-gray-400">
						<tr>
							<!-- Check All Checkbox in the th -->
							<th scope="col" class="px-4 py-4">
								<div class="flex items-center">
									<!-- Select All Checkbox -->
									<input
										id="checkAll"
										type="checkbox"
										class="w-4 h-4 bg-white border-gray-100 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-300 dark:border-gray-500"
										bind:checked={selectAll}
										onchange={toggleSelectAll}
									/>
									<label for="checkAll" class="sr-only">Select All</label>
								</div>
							</th>
							{#each columns as col}
								<th scope="col" class="px-2 py-3">{formatFieldNames(col)}</th>
							{/each}
							<!-- action row -->
							<th scope="col" class=" px-2 py-4"></th>
						</tr>
					</thead>
					<tbody>
						{#each paginatedData as row, i}
							<tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200">
								<td	class="px-4 py-4 font-medium text-gray-900 dark:text-white border-b border-primary-500 dark:border-gray-600"
								>
									<div class="flex items-center">
										<input
											id="checkbox-{row.id}"
											type="checkbox"
											class="w-4 h-4 text-primary-600 bg-gray-50 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
										/>
										<label for="checkbox-{row.id}" class="sr-only">checkbox</label>
									</div>
								</td>
								{#each columns as col}
								
									{#if row[col] === null}
										<td
											class="px-2 py-3 max-w-[12rem] truncate border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400"
											>N/A</td
										>
									{:else if col === 'description' || col === "roles"|| col === "domain"  ||(table_name === "Scope Group" && col === "organizations")}
										<!-- Apply special styling to the description column -->
										 
										<td class="px-2 py-4 max-w-[12rem] whitespace-pre-wrap break-words border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400"
										>
											{#if col === "roles"}

												{@html row[col]}
											{:else}
												{row[col]}
										
											{/if}
										</td>
									{:else if typeof row[col] === 'string' && row[col].startsWith('data:image')}
										<!-- Apply special styling to display images column -->
										<td
											class="px-2 py-4 max-w-[12rem] truncate border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400"
										>
											{#if row[col]}
												<img
													src={row[col]}
													alt="table entry preview"
													class="w-24 h-auto rounded shadow-md object-contain"
												/>
											{:else}
												<span class="text-gray-500 dark:text-gray-400">No Image</span>
											{/if}
										</td>
									{:else}
										<td
											class="px-2 py-4 max-w-[16rem] break-word border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400"
											>{row[col]}</td
										>
									{/if}
								{/each}

								<!-- Request status section -->
								<!-- Action section -->
								<td class="px-6py-4 border-b border-primary-500 dark:border-gray-600">
									<div
										class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0"
									>
										{#if ['Add Product', 'Add Promotion'].includes(table_name)}
											{#if quantities[row.id]}
												<div class="flex items-center space-x-2">
													<button
														onclick={() => decrement(row)}
														class="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
													>
														-
													</button>
													<span>{quantities[row.id]}</span>
													<button
														onclick={() => increment(row)}
														class="px-2 py-1 text-white bg-green-500 rounded hover:bg-green-600"
													>
														+
													</button>
												</div>
											{:else}
												<button
													onclick={() => handleAddClick(row)}
													class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
												>
													Add
												</button>
											{/if}
										{:else}
												<!-- Action section -->
										{#if hasPrivilege(userRoles[module["update"][table_name]], "U") ||  hasPrivilege(userRoles[module["delete"][table_name]], "D")}
										
										<div class="relative inline-block text-left">
											<!-- Kebab Menu Button -->
											<button
											type="button"
											class="inline-flex justify-center w-full rounded-md px-2 py-1 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
											onclick={async() => {
												toggleDropdown(row.id);
												if(["Organization"].includes(table_name)){
													children_organization = await fetchTable(get_children_organization_endpoint+row.id, getAccessToken());
													console.log("children",children_organization,children_organization.length)

												}
												
												}}
											aria-labelledby = "kebab button"
											>
											<svg
											xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
											<path fill="currentColor"
											d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2">
											</path>
											</svg>
											</button>

											<!-- Dropdown -->
											{#if openDropdownId === row.id}
											
											
											<div
												class="origin-top-right absolute right-0 mt-2 mb-2 w-36 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
											>
												<div class="py-1 text-sm text-gray-700 dark:text-white">
												{#if hasPrivilege(userRoles[module["update"][table_name]], "U")}
												<!-- EDIT / VIEW -->
												<button
												type="button"
												class="py-2 px-3 flex items-center text-sm font-medium dark:text-white
												text-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-700
												focus:ring-4 focus:outline-none
												focus:ring-primary-200 dark:focus:ring-primary-800
												transition duration-200 ease-in-out transform hover:scale-105"
												onclick={async () => {
													if (['Sales'].includes(table_name)) {
														console.log(table_data[i]);
														//sales_data  = table_data[i];
														sharedSales.set(table_data[i]);
														const queryParams = new URLSearchParams({
															id: i
														});
														goto(`/sales/sales-product?${queryParams}`);
													} else {
														action_type = 'Update';
														console.log('TEST', row.id);
														table_id_data = await fetchUpdate_table_by_Id(row.id);
														console.log('ID', table_id_data);
														showFormModalUpdate[i] = true;
													}
													closeDropdown();
												}}
											>
											<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
												<path
												  d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
												/>
												<path
												  fill-rule="evenodd"
												  clip-rule="evenodd"
												  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
												/>
											  </svg>
								  
									  
												{currentRoute === '/sales'? "View" : "Edit"} 
											</button>
											{/if}

											{#if ['Stocks'].includes(table_name) & hasPrivilege(userRoles[module["update"][table_name]], "U")}

												<!-- View Log-->
												<button
													type="button"
													class="py-2 px-3 flex items-center text-sm font-medium dark:text-white
													text-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-700
													focus:ring-4 focus:outline-none
													focus:ring-primary-200 dark:focus:ring-primary-800
													transition duration-200 ease-in-out transform hover:scale-105"
													onclick={() => {
													const queryParams = new URLSearchParams({
														id: row.id
													});
													goto(`/${company_name}/warehouse/stock/stock-log?${queryParams}`);
													}}
												>
												<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
													<path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
													<path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
												  </svg>
												  
													View Log
												</button>
											{/if}
											{#if ['Organization'].includes(table_name) & hasPrivilege(userRoles[module["update"][table_name]], "R") & children_organization.length !== 0}

												<!-- View Log-->
												<button
													type="button"
													class="py-2 px-3 flex items-center text-sm font-medium dark:text-white
													text-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-700
													focus:ring-4 focus:outline-none
													focus:ring-primary-200 dark:focus:ring-primary-800
													transition duration-200 ease-in-out transform hover:scale-105"
													onclick={() => {
		
													  get_table_endpoint = get_children_organization_endpoint+row.id;
													  loadTable()
													}}
												>
												<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
													<path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 110-10 5 5 0 010 10z" />
													<path d="M10 7a3 3 0 100 6 3 3 0 000-6z" />
												  </svg>
												  
													View Children
												</button>
											{/if}

											{#if ['Warehouse Stop'].includes(table_name) & hasPrivilege(userRoles[module["update"][table_name]], "U") & row.request_status === "Pending"}

												<!-- Approve/Reject-->
												<button
													type="button"
													class="py-2 px-3 flex items-center text-sm font-medium dark:text-white
													text-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-700
													focus:ring-4 focus:outline-none
													focus:ring-primary-200 dark:focus:ring-primary-800
													transition duration-200 ease-in-out transform hover:scale-105"
													onclick={() => {handleApproveReject(`${host}warehouse/warehouse-stops/`, row.id, "approve")}}
												>
												<svg class="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd" />
												  </svg>
												  
												  
													Approve
												</button>
												<button
													type="button"
													class="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700"
													onclick={() => {handleApproveReject(`${host}warehouse/warehouse-stops/`, row.id, "reject")}}
												>
												<svg class="w-4 h-4 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
												  </svg>
												  
												  
													Reject
												</button>
											{/if}
											{#if ['Warehouse Stop'].includes(table_name) & hasPrivilege(userRoles[module["update"][table_name]], "U") & row.request_status === "Approved" & !row.confirmed}
											<button
													type="button"
													class="py-2 px-3 flex items-center text-sm font-medium dark:text-white
													text-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-700
													focus:ring-4 focus:outline-none
													focus:ring-primary-200 dark:focus:ring-primary-800
													transition duration-200 ease-in-out transform hover:scale-105"
													onclick={() => {handleApproveReject(`${host}warehouse/warehouse-stops/`, row.id, "confirm")}}
												>
												<svg class="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clip-rule="evenodd" />
												  </svg>
												  
												  
													Confirm
												</button>

											{/if}

											{#if !['Tenant'].includes(table_name) & hasPrivilege(userRoles[module["delete"][table_name]], "D")}

												<!-- DELETE -->
												<button
													type="button"
													class="w-full flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700"
													onclick={() => {
													openDeleteModal(row);
													closeDropdown();
													}}
												>
													<svg
													class="w-4 h-4 mr-2"
													fill="currentColor"
													viewBox="0 0 20 20"
													xmlns="http://www.w3.org/2000/svg"
													>
													<path
														fill-rule="evenodd"
														d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
														clip-rule="evenodd"
													/>
													</svg>
													Delete
												</button>
												{/if}
												</div>
											</div>
										
											{/if}

											<!-- Existing Modals -->
											{#if showDeleteModal}
												<DeleteModal
													{selectedRow}
													delete_url={delete_entry_url}
													onCloseModal={closeDeleteModal}
													onDeleteItem={handleDelete}
													{token}
												/>
											{/if}
										</div>
										{/if}
										
										
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			<nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
				aria-label="Table navigation">
				<span class="text-sm font-normal text-gray-500 dark:text-gray-400">
					Showing
					<span class="font-semibold text-gray-900 dark:text-white">
						{(currentPage - 1) * rowsPerPage + 1}-{Math.min(
							currentPage * rowsPerPage,
							table_data.length
						)}
					</span>
					of
					<span class="font-semibold text-gray-900 dark:text-white">{table_data.length}</span>
				</span>
				<ul class="inline-flex items-stretch -space-x-px">
					<li>
						<button
							class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
							onclick={() => goToPage(currentPage - 1)}
							disabled={currentPage === 1}
						>
							<span class="sr-only">Previous</span>
							<svg
								class="w-5 h-5"
								aria-hidden="true"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</li>
					{#each Array(Math.ceil(table_data.length / rowsPerPage)).fill(0) as _, index}
						<li>
							<button
								class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
								onclick={() => goToPage(index + 1)}
							>
								{index + 1}
							</button>
						</li>
					{/each}
					<li>
						<button
							class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
							onclick={() => goToPage(currentPage + 1)}
							disabled={currentPage === Math.ceil(table_data.length / rowsPerPage)}
						>
							<span class="sr-only">Next</span>
							<svg
								class="w-5 h-5"
								aria-hidden="true"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									d="M7.293 14.707a1 1 0 010-1.414L11.586 10 7.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</li>
				</ul>
			</nav>
			{/if}
			<!-- table data check if close -->

		</div>

		{#if ['Add Product', 'Add Promotion'].includes(table_name)}
			<!-- Checkout Section -->
			<div
				class="flex justify-between items-center p-4 rounded-lg border border-gray-200 bg-white dark:bg-[#002a47] dark:border-gray-600 mt-4"
			>
				<div class="text-lg font-semibold text-gray-800 dark:text-white">
					Total: <span>{totalPrice} ETB</span>
				</div>

				<button
					onclick={handleSubmit}
					class="ml-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
				>
					Proceed to Checkout
				</button>
			</div>
		{/if}
	</section>

	<!-- End block -->
</main>
