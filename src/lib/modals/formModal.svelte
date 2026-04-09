
<script>

	import { onMount } from 'svelte';
	import { host} from '../../apis/config';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Map from '$lib/map/map.svelte';
	import { fetchForm, addForm, updateForm } from '../../apis/form.js';
	import { sharedProducts as products} from '../../routes/[company]/components/endPointModules/salesProduct/salesProductStore';
	import {fetchTable} from '../../apis/table.js'
	import Fileupload from './fileupload.svelte';
	import { _adapters } from 'chart.js';
	import { formatFieldNames } from '$lib/utils.js';
	import FormModal from './formModal.svelte';
	import HierarchicalCheckbox from '$lib/custom-input/hierarchicalCheckbox.svelte';
	import TenantResultModal from './tenantResultModal.svelte';
	import { createEventDispatcher } from 'svelte';
	import GetLocationButton from '$lib/button/get-location-button.svelte';
	import { getCompanyName } from '../../stores/companyStore';
	const dispatch = createEventDispatcher(); 

	
	let {
		showFormModal = $bindable(),
		closeUpdateModal = $bindable(),
		action_type,
		table_name,
		get_form_endpoint,
		create_entry_url,
		update_entry_url,
		delete_url,
		file,
		onBase64Ready = () => {} ,
		form_data,
		token,
		route,
		pointOfSale,
		territory,
        role,
		scope_group,
		warehouse
	} = $props();
	let imageFile;

	let dialog = $state();
	let showPermissionFormModalAdd = $state(false);
	let showOrganizationFormModalAdd = $state(false);
	let showStoreAdminFormModalAdd = $state(false);
	let permissionFormEndpoint = $state(`${host}role/modules-form`);
	let permissionUpdateEndpoint = $state(`${host}role/update-role-module`);
	let scopeOrganizationFormEndpoint = $state(`${host}account/scope-organization-form`);
	let scopeOrganizationUpdateEndpoint = $state(`${host}account/add-scope-organization`);
	let storeAdminFormEndpoint = $state(`${host}warehouse/warehouse-storeadmin-form`);
	let storeAdminAddEndpoint = $state(`${host}warehouse/assign-storeadmin`);
	let role_id = $state()
	let scope_group_id = $state()
	let warehouse_id = $state()
	let isTenant = $state(false)

	let scope_organization_form_data = $state()
	let warehouse_store_admin_data = $state()
	let tenantShowModal = $state(false);
    let tenantResult = $state(null);

	let image_data = $state(null)
	let location = $state('')
	let company_name = $state('')
	let permissions = $state({})
	let selectedModule = $state("")
	let role_name = $state("");

	

	function onCloseModal() {
		showFormModal = false;
		if(dialog){
			dialog.close();

		}
		
		//closeUpdateModal();
	}

	function forwardUpdate(event) {
    dispatch('update', {});
  }

	$effect(() => {
		if (showFormModal) 
	{
		updateData(showFormModal);
		dialog.showModal();
	}

	});



	let selectedProducts = $state([]);
	let salesItemToSubmit = $state([]);
	const submitUrl = `${host}sales/add-sales-item`;

	async function updateData(showFormModal) {
	
		
		form_info = await fetchForm(get_form_endpoint, token);
		console.log("FORMINF", form_info);
		console.log("FORMDATA", form_data);
		form_keys = Object.keys(form_info.data);
		form_values = []; // Initialize as an empty array
		form_initial = form_data; // Use the selected row's data as the initial values


		for (let i = 0; i < form_keys.length; i++) {
			const field = form_keys[i];
			console.log(form_keys);
            console.log(form_initial);
			if (form_info.html_types[field] === 'select multiple') {
			// Handle "None" and other values for select multiple fields
			if (form_initial[field] === "None") {
				form_values[i] = []; // No options selected
			} else if (Array.isArray(form_initial[field])) {
				form_values[i] = [...form_initial[field]]; // Use the array directly
			} else {
				form_values[i] = form_initial[field] ? [form_initial[field]] : []; // Wrap single value in an array
			}
			} else if(form_info.html_types[field] === 'select'){
				form_values[i] = form_initial[field] !== undefined && form_initial[field] !== null && form_initial[field] !== "" 
				? String(form_initial[field]) 
				: "";

			}
			else {
			// Handle other field types
			if(form_initial) {
				form_values[i] = form_initial[field] ?? ""; // Use the value from form_initial or default to an empty string
			}
			}
			if(["Warehouse"].includes(table_name) && form_keys[i] === "location"){
				location = form_values[i];
			}
			if(["Role"].includes(table_name) && action_type == "Update"){
				permissions = form_data["permissions"]
				if(selectedModule !== ""){
					form_initial["module"] = selectedModule;
					
				}
			}
			if(["Role"].includes(table_name) && role_name !== ""){
				form_initial["name"] = role_name;
			}

		}

		console.log("form_initial:", form_initial);
		console.log("form_keys:", form_keys);
		console.log("form_values after initialization:", form_values);
		}
				
	let form_info = $state(null);
	let form_keys = $state(null);
	let form_values = $state(null);
	let form_initial = $state(null);
	let option_label = "";
	let image_values = $state(null)
	let alertText = $state("")
	let gridClass = $state("grid-cols-4");
	
	async function handleSubmit(e) {
	e.preventDefault();

	
	// Prepare the form data for submission
	const form_submit_data = {};
	for (let ind = 0; ind < form_values.length; ind++) {
		const field = form_keys[ind];

		if (form_info.html_types[field] === 'select multiple') {
		// Check if any options are selected
		if (form_values[ind] && form_values[ind].length > 0) {
			form_submit_data[field] = Array.isArray(form_values[ind]) ? [...form_values[ind]] : [];
		} else {
			// If no options are selected, set to null or an empty array
			form_submit_data[field] = []; // Or use null if the backend expects null
		}
		} else {
		// Handle other field types
		form_submit_data[field] = form_values[ind];
		}
	}
	//  add the image as a base64 string
	//form_submit_data.image = file ? file.base64 : null;


	try {

		if(["Sales"].includes(table_name)){
			const now = new Date();
			const timePart = now.toTimeString().split(' ')[0]; // HH:MM:SS
			const msPart = now.getMilliseconds().toString().padStart(3, '0');
			form_submit_data['date'] = new Date(`${form_submit_data['date']}T${timePart}.${msPart}Z`).toISOString();
			form_submit_data['payment_date'] = new Date(
				`${form_submit_data['payment_date']}T${timePart}.${msPart}Z`
			).toISOString();
			form_submit_data['payment_due_date'] = new Date(
				`${form_submit_data['payment_due_date']}T${timePart}.${msPart}Z`
			).toISOString();
			form_submit_data['route'] = route;
			form_submit_data['point_of_sale'] = pointOfSale;
			form_submit_data['bank'] = "";

		} else if(["Promotion"].includes(table_name)){
			form_submit_data['route'] = route;
			form_submit_data['point_of_sale'] = pointOfSale;
			form_submit_data['territory'] = territory;
		}
		
		// console.log("FORM DATA", form_submit_data);	
		if(action_type == "Add" ){
			if(["Role"].includes(table_name)){
				if(role && role != ""){
					form_submit_data["id"] = role

				}
			}
			if(["Organizations"].includes(table_name)){
				console.log("data scope", form_submit_data["hidden"])
				form_submit_data["scope_id"] = scope_group
				if(form_submit_data["hidden"] === null || form_submit_data["hidden"] == undefined){
					form_submit_data["hidden"] = [];
				}
			}
			if(["Store Admin"].includes(table_name)){
				form_submit_data["warehouse_id"] = warehouse
			}
			

			if (image_values && Object.keys(image_values).length > 0) {
				Object.entries(image_values).forEach(([field, file]) => {
					form_submit_data[field] = file;
				});
			}
			if(location !== "" && ["Warehouse"].includes(table_name)){ 
				form_submit_data["location"] = location;	
			}
			console.log("Role data", form_submit_data);
			const result = await addForm(create_entry_url, form_submit_data, token);
			dispatch('update', { detail: "update" });

			if(["Tenant"].includes(table_name)){
				isTenant = true;
				tenantResult = result;
				console.log("tenant result", tenantResult)
				tenantShowModal = true;
			}
			if(["Users"].includes(table_name)){
				isTenant = false;
				tenantResult = result;
				tenantShowModal = true;
			}

			if(["Permissions"].includes(table_name)){
				alertText = `Permission for ${form_submit_data['module']} is updated successfully`
				// alert(`Permission for ${form_submit_data['module']} updated to ${form_submit_data['policy']} successfully`);	
				updateData(showFormModal);
		dialog.showModal();
				
			}

			if(["Role"].includes(table_name)){ 
				role = result;
				role_name = form_submit_data["name"];
				alertText = `Permission for ${form_submit_data['module']} is added successfully`;
				form_values["policy"] = "";
				form_values["module"] = "";
				// showPermissionFormModalAdd = true
				
			}
	
			if(["Warehouse"].includes(table_name)){ 
				warehouse_id = result
				showStoreAdminFormModalAdd = true
				
			}
			if (["Sales"].includes(table_name)){
				const queryParams = new URLSearchParams({
					id: JSON.stringify(result.id),
					sales: form_submit_data['sales_type']
				});
				for (const salesItem of salesItemToSubmit) {
					salesItem.sales = result.id;

					try {
						await addForm(submitUrl, salesItem, token);
						//alert(`Paid ${total.toFixed(2)}`);
						//goto('/sales');
						
					} catch (e) {
						console.error(e);
					}
				}
				goto(`/sales/checkout?${queryParams}`);
				onCloseModal();		
				
				
			} 
				
			else if(["Promotion"].includes(table_name)){
				
				goto("/trade-marketing/sales-activation");
				onCloseModal();


			}
			if(!["Role"].includes(table_name)){
				onCloseModal();		
			}

				

			}
		else if(action_type === 'Update') {
			if (image_values && Object.keys(image_values).length > 0) {
				Object.entries(image_values).forEach(([field, file]) => {
					form_submit_data[field] = file;
				});
			}
			if(location !== "" && ["Warehouse"].includes(table_name)){ 
				form_submit_data["location"] = location;	
			}
			if(["Role"].includes(table_name)){
				if(role){
					form_submit_data["id"] = role
				}
			}
			console.log(form_submit_data);
			const result = await updateForm(update_entry_url, form_submit_data, token);
			dispatch('update', { detail: "update" });

			if(["Role"].includes(table_name)){ 
				role = result;
				role_name = form_submit_data["name"];
				console.log("module", form_values["module"])
				alertText = `Role is updated`;
				form_values["policy"] = "";
				form_values["module"] = "";
				//updateData();
			}

			
			if(["Warehouse"].includes(table_name)){ 
				warehouse_id = result
				warehouse_store_admin_data={"store_admin": form_data["store_admins"]}
				showStoreAdminFormModalAdd = true
				
			}

			if (["Sales"].includes(table_name)){
				const queryParams = new URLSearchParams({
					id: JSON.stringify(result.id),
					sales: form_submit_data['sales_type']
				});
				for (const salesItem of salesItemToSubmit) {
					salesItem.sales = result.id;

					try {
						await addForm(submitUrl, salesItem, token);
						//alert(`Paid ${total.toFixed(2)}`);
						//goto('/sales');
						
					} catch (e) {
						console.error(e);
					}
				}
				onCloseModal();		
				goto(`/sales/checkout?${queryParams}`);
				
			}
			}
			if(!["Role"].includes(table_name)){
				onCloseModal();		
			}
			
		} catch (error) {
			console.error('Error submitting form:', error);
		}
		}

		async function onFileSelected(event){
			console.log(event.detail)
			
			let selectedFile = event.detail.selectedFile
			let field = event.detail.image_name
			console.log(selectedFile)
			image_values= {
				...image_values,
				[field]: selectedFile
			};
			console.log(image_values);
		}

		async function onLocationSelected(event){
			location = event.detail.location
			console.log("onLocation",location)
		}





	// async function handleFileChange(event) {
	// 	const selectedFile = event.detail; // Access the file from the event's detail property
	// 	if (selectedFile instanceof File) {
	// 		console.log('Selected file:', selectedFile);
	// 		const reader = new FileReader();
	// 		reader.onload = (e) => {
	// 		file = {
	// 			name: selectedFile.name,
	// 			type: selectedFile.type,
	// 			base64: e.target.result.split(',')[1], // Remove the prefix (data:image/png;base64,...)
	// 		};
	// 		};
	// 		reader.readAsDataURL(selectedFile);
	// 	} else {
	// 		console.error('Invalid file type:', selectedFile);
	// 		file = null; // Clear the file if no valid file is selected
	// 	}
	// }


	onMount(() => {
		company_name = getCompanyName();
		role="";
		role_name="";
		selectedModule="";
		permissions={};
		if(table_name === "Scope Group"){
			gridClass = "grid-cols-2";
		}else{
			gridClass ="grid-cols-4";
		}

		if ((company_name === '' || company_name === 'provider') && table_name === 'Scope Group') {
			table_name = 'Tenants';
		}else if((company_name !== '' && company_name !== 'provider') && table_name === 'Scope Group'){
			table_name = "Organizations"
		}
		products.subscribe((value) => {
			selectedProducts = value;
		});

		salesItemToSubmit = JSON.parse(JSON.stringify(selectedProducts));
	});

	function handleNoneOption(event, index) {
		const selectedValue = event.target.value;

		// If "None" is selected, clear the selection
		if (selectedValue === "") {
			form_values[index] = ""; // Set the value to an empty string
		}
		}

	</script>

	<dialog
		class="p-2 border-none bg-transparent backdrop:bg-black/50"
		bind:this={dialog}
		onclose={() => {(showFormModal = false);
		role=""; role_name=""}}
		onclick={(e) => {
			if (e.target === dialog) dialog.close();
			alertText="";
			selectedModule="";

			
		}} >
		
			<!-- Modal Content Container -->
			<div class="relative overflow-x-hidden p-4 w-full max-w-2xl max-h-full bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg">
				<!-- Header -->
				<div class="flex justify-between items-center pb-4 mb-4 border-b dark:border-gray-600">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
						{action_type} {table_name}
					</h3>
					<button
						type="button"
						aria-label="close modal button"
						onclick={() => dialog.close()}
					>
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style="fill: bg-black dark:fill: var(--close-button-color, #1f2937);">
							<path
								fill-rule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>

				<form onsubmit={handleSubmit}>
					
					<!-- Grid for other inputs -->
					<div class="grid gap-4 mb-4 lg:{gridClass} sm:grid-cols-2">
					  {#if form_info && form_keys && form_values && form_info.html_types}
						{#each form_keys as field, i}						
						  {#if form_info.html_types[field] === 'hidden' || (["Sales","Promotion"].includes(table_name)&&( field === "point_of_sale" || field === "route"|| field === "territory")) }
							<input type="hidden" name={field} value={form_values[i]} />
						  {:else if form_info.html_types[field] === 'text'}
							<!-- Text Input -->
							<div>
							  <label
								for={field}
								class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>{formatFieldNames(field)}</label
							  >

							 {#if field === "location"}
								<input
									type="text"
									id={field}
									name={field}
									bind:value={location}
									class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
									placeholder="Enter {formatFieldNames(field)}"
								/>
								{:else}
								<input
									type="text"
									id={field}
									name={field}
									bind:value={form_values[i]}
									class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
									placeholder="Enter {formatFieldNames(field)}"
								/>
								{/if}

							</div>
							{:else if form_info.html_types[field] === 'select'}
							<div>
								<label for={field} class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{formatFieldNames(field)}</label>
								<select bind:value={form_values[i]} id={field} name={field} 
								onchange={()=>{
										if(["Role"].includes(table_name) && action_type =="Update"){
											console.log("Selecting permissions", permissions)
											console.log("Module selected", form_values[i])
											if(permissions[form_values[i]]){
												console.log("Permission found", permissions[form_values[i]])
												form_values["policy"] = permissions[form_values[i]];
												form_initial["policy"] = permissions[form_values[i]];
												selectedModule = form_values[i]
												updateData();
											}else{
												form_values["policy"] = ""
												form_initial["policy"] = ""
												selectedModule = form_values[i]
												updateData()
											}
										}
								}}
								class="select w-full shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-white dark:bg-[#002a47] text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden  dark:border-gray-800 dark:text-white dark:placeholder:text-white"
								> 
									<option value="" disabled>Select</option>
									{#each Object.entries(Object.values(form_info.data)[i] || {}) as [optionKey, optionLabel]}
										<option value={optionKey}>{formatFieldNames(optionLabel)}</option>
									{/each}
								</select>
							</div>
							{:else if form_info.html_types[field] === 'radio'}
							<div>
								<label for={field} class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									{formatFieldNames(field)}
								</label>
								<div class="space-y-2">
									{#each Object.entries(Object.values(form_info.data)[i] || {}) as [optionKey, optionLabel]}
										<label class="flex items-center space-x-2 text-sm text-gray-700 dark:text-white">
											<input
												type="radio"
												name={field}
												value={optionKey}
												bind:group={form_values[i]}
												checked={form_initial[i] == optionLabel}
												class="accent-brand-500"
											/>
											<span>{formatFieldNames(optionLabel)}</span>
										</label>
									{/each}
								</div>
							</div>

							{:else if form_info.html_types[field] === 'select multiple'}
							<div>
							  <label for={field} class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
								{formatFieldNames(field)}
							  </label>
							  <select
								bind:value={form_values[i]}
								id={field}
								name={field}
								multiple
								class="w-full h-22 p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-800 focus:outline-none resize-none overflow-auto"
							  >
								<option value="" disabled={form_values[i]?.length > 0}>None</option>
								{#each Object.entries(Object.values(form_info.data)[i] || {}) as [optionKey, optionLabel]}
								  <option value={optionKey} selected={form_values[i]?.hasOwnProperty(optionKey)}>
									{optionLabel}
								  </option>
								{/each}
							  </select>
							</div>
						  {:else if form_info.html_types[field] === 'number'}
							<!-- Number Input -->
							<div>
							  <label
								for={field}
								class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>{formatFieldNames(field)}</label
							  >
							  <input
								type="number"
								step=0.01
								id={field}
								name={field}
								bind:value={form_values[i]}
								class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30"
								placeholder={`Enter ${formatFieldNames(field)}`}
								min="0"
							  />
							</div>
							{:else if form_info.html_types[field] === 'password'}
							<div>
								<label for={field} class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{formatFieldNames(field)}</label>
								<input type="password" id={field} name={field} bind:value={form_values[i]}
								class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
								placeholder="••••••••"/>
							</div>
							{:else if form_info.html_types[field] === 'datetime-local'}
							<!-- Date/Time local Input -->
							<div>
								<label for={field} class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{formatFieldNames(field)}</label>
								<input
								type="datetime-local"
								id={field}
								name={field}
								bind:value={form_values[i]}
								class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
								/>
							</div>
							{:else if form_info.html_types[field] === 'date'}
							<!-- Date Input -->
							<div>
								<label for={field} class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{formatFieldNames(field)}</label>
								<input
								type="date"
								id={field}
								name={field}
								bind:value={form_values[i]}
								class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
								/>
							</div>
							{:else if form_info.html_types[field] === 'hierarchical-checkbox'}
								{#if field !== "hidden"}
								<label
								for={field}
								class="mb-2 text-sm font-medium text-gray-900 dark:text-white"
								>{formatFieldNames(field)}</label>
								{/if}
								{#each form_info.data[field] as node}
									<HierarchicalCheckbox node={node} bind:boundGroup={form_values[i]} />
								{/each}

						  {/if}
						{/each}
					  {:else}
						<p>Loading form fields...</p>
					  {/if}
					</div>
			  
					<!-- File/Image Input -->
					{#if form_info && form_keys && form_values}
					  {#each form_keys as field, i}
						{#if form_info.html_types[field] === 'file'}
						  <div class="mb-4">
					
							<label
							  for="file-upload"
							  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							  >Upload Image</label
							>
							<Fileupload image_name={field} image_value={form_values[i]} on:change={onFileSelected}/>
						  </div>
						{/if}
					  {/each}
					{/if}
			  
					<!-- Textarea (Description) -->
					{#if form_info && form_keys && form_values}
					  {#each form_keys as field, i}
						{#if form_info.html_types[field] === 'textarea'}
						  <div class="mb-4">
							<label
							  for={field}
							  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
							  >{formatFieldNames(field)}</label
							>
							<textarea
							  id={field}
							  name={field}
							  bind:value={form_values[i]}
							  class="textarea shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 w-full"
							  placeholder={`Enter ${formatFieldNames(field)}`}
							></textarea>
						  </div>
						{/if}
					  {/each}
					{/if}

					{#if form_info && form_keys && form_values}
						{#each form_keys as field, i}
							{#if form_info.html_types[field] === 'checkbox'}
							<label for={field} class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{formatFieldNames(field)}</label>
							{#each Object.entries(Object.values(form_info.data)[i] || {}) as [optionKey, optionLabel]}
								<div class="">
									<label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
										<input
											type="checkbox"
											id={optionKey}
											name={optionKey}
											value={+optionKey}
											bind:group={form_values[i]}
											class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
											/>
											{formatFieldNames(optionLabel)}
									</label>
									
								</div>
							{/each}
								
							{/if}
						{/each}
					{/if}

					{#if ["Warehouse"].includes(table_name)}
					<GetLocationButton on:location={onLocationSelected}/>
					{/if}
					{#if table_name == "Role"}
					<p class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{alertText}</p>
					{/if}
					
				
					<!-- Submit Button -->
					<button
					  type="submit"
					  onclick={() => {if(!(["Role"].includes(table_name))) dialog.close()}}
					  class="btn btn-neutral bg-[#3393ce] w-full text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50"
					>
					  Submit
					</button>
				  </form>
			
		</div>	
	</dialog>
	{#if showPermissionFormModalAdd}
		<FormModal		
			bind:closeUpdateModal
			on:update={forwardUpdate}
			table_name="Permissions"
			role = {role_id}
			token={token}
			get_form_endpoint={permissionFormEndpoint}
			create_entry_url={permissionUpdateEndpoint}
			action_type={'Add'}
			bind:showFormModal={showPermissionFormModalAdd}
			form_data={[]}/>
	{/if}
	{#if showOrganizationFormModalAdd}
		<FormModal		
			bind:closeUpdateModal
		    on:update={forwardUpdate}
			table_name="Organizations"
			scope_group={scope_group_id}
			token={token}
			get_form_endpoint={scopeOrganizationFormEndpoint}
			create_entry_url={scopeOrganizationUpdateEndpoint}
			action_type={'Add'}
			bind:showFormModal={showOrganizationFormModalAdd}
			form_data={scope_organization_form_data}/>
	{/if}
	{#if showStoreAdminFormModalAdd}
		<FormModal		
			bind:closeUpdateModal
		    on:update={forwardUpdate}
			table_name="Store Admin"
			warehouse={warehouse_id}
			token={token}
			get_form_endpoint={storeAdminFormEndpoint}
			create_entry_url={storeAdminAddEndpoint}
			action_type={'Add'}
			bind:showFormModal={showStoreAdminFormModalAdd}
			form_data={warehouse_store_admin_data}/>
	{/if}
	<TenantResultModal isTenant={isTenant} isOpen={tenantShowModal} result={tenantResult} onClose={() => tenantShowModal = false} />

	<style>
	dialog {
		max-width: 42rem;
		max-height: 100vh;
		border-radius: 0.2em;
		border: none;
		overflow-y: auto;
		padding: 0;
		position: absolute;
		top: 50vh;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
		}


	</style>
