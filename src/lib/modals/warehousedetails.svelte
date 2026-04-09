<script>
  
    	import { formatFieldNames } from '$lib/utils';
    	import { host, token } from "../../apis/config";
	  import Table from "../../routes/[company]/components/tables/table.svelte";
	  	import { updateForm } from '../../apis/form.js';
	  

    	
    	let {
    	   isOpen = false,
       title = "",
       data = {},
       handleClose,
    } = $props();
  const tabs = ["General", "Users", "Warehouses"];
	let activeTab = $state("General");
	let accessPolicy = $state(["deny", "view", "edit", "contribute", "manage"]); 
	let selectedPolicy = $state("deny");
	let currentRowData = $state({});
	let currentWarehouseGroup = $state("");
	
	$effect(() => {currentWarehouseGroup = data['name']; selectedPolicy = data['access_policy']; currentRowData['warehouse_group'] = data['id'];});
	
  const table2Endpoint = `${host}warehouse/get-warehouse-storeadmins/`;
	const table2EndpointById = `${host}warehouse/get-warehouse-storeadmin/`;
	const searchEndpoint = `${host}warehouse/search-warehouse-storeadmin`;
	const form2Endpoint = `${host}warehouse/warehouse-storeadmin-form`;
	const submit2Url = `${host}warehouse/create-warehouse-storeadmin`;
  const update2Url = `${host}warehouse/update-warehouse-storeadmin`;
	const delete2Url = `${host}warehouse/delete-warehouse-storeadmin/`;
	const updateUrl = `${host}warehouse/update-warehouse-group`;
	const table_name2 = "User";
	
	
	const table3Endpoint = `${host}warehouse/get-warehouse-group-warehouses/`;
	const search3Endpoint = `${host}warehouse/search-warehouse-group`;
	const table3EndpointById = `${host}warehouse/get-warehouse-group-warehouses-id/`;
	const form3Endpoint = `${host}warehouse/warehouse-group-warehouses-form`;
	const submit3Url = `${host}warehouse/add-warehouse-group-warehouses`;
	const delete3Url = `${host}warehouse/remove-warehouse-group-warehouses/`;
	const table_name3 = "Warehouses";
	
	
	let table2EndpointDynamic = $state(table2Endpoint);
	let delete2UrlDynamic = $state(delete2Url);
	
	$effect(() => {if(data !== undefined && data !== null) {table2EndpointDynamic = `${table2Endpoint}${data['id']}`; delete2UrlDynamic = `${delete2Url}${data['id']}`;}});
	
	let table3EndpointDynamic = $state(table3Endpoint);
	let delete3UrlDynamic = $state(delete3Url);
	$effect(() => {if(data !== undefined && data !== null) {table3EndpointDynamic = `${table3Endpoint}${data['id']}`; delete3UrlDynamic = `${delete3Url}${data['id']}`;}});
	
	async function updateWarehouseGroup()
	{
	  let result = await updateForm(updateUrl, {'id': data['id'], 'name': currentWarehouseGroup, 'access_policy': selectedPolicy}, token);
	}
	
  </script>
  
  {#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop:bg-black/50 bg-opacity-50 overflow-scroll">
      <div class="p-6 min-w-[40vw] min-h-[60vh] bg-white dark:bg-[#002a47] rounded-lg shadow-lg dark:shadow-lg">
       <div class="flex justify-end w-full">
        <button class="btn btn-sm btn-ghost text-red-500 bg-white hover:bg-white w-fit text-lg border-red-500 shadow-none" onclick={handleClose}>✕</button>
      </div>
        <div class="text-center">
          <!-- Icon -->
          <div class="flex justify-center items-center w-30 h-20 mx-auto gap-4">
            <img class="w-10 h-10" src="/svgs/warehouse.svg" />
            <h3 class="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <!-- Title -->

  
          <!-- Result Info -->
          <div class="mt-4">
			      <div class="border-b border-gray-200 dark:border-[#00527c] m-4">
				      <div class="flex gap-2">
					      {#each tabs as tab}
						      <button
							      type="button"
							      onclick={() => (activeTab = tab)}
							      class="px-4 py-2 rounded-t-lg text-sm font-medium transition-colors duration-200
                  border border-b-0
                  text-gray-700 hover:bg-gray-100
                  dark:text-white dark:bg-[#002a47] dark:border-[#00527c] dark:hover:bg-[#003b5e]
                  {activeTab === tab
								? 'text-[#3393ce] bg-white dark:bg-[#003b5e] dark:text-[#3393ce] border border-0 border-b-2 border-[#3393ce] dark:border-[#3393ce]'
								: 'bg-white'}"
						      >
							      {formatFieldNames(tab)}
						      </button>
					      {/each}
				      </div>
			      </div>
			      
			      {#if activeTab == "General"}
			      <div class="grid grid-cols-2 gap-4 mt-8">
			         <div>
									<label
										class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
										>Warehouse Group</label
									>
										<input
											type="text"
											bind:value={currentWarehouseGroup}
											class="input shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
											placeholder={""}
										/>
									
								</div>
								
								<div>
									<label
										class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
									>
										Access Policy
									</label>
									<select
										bind:value={selectedPolicy}
										class="w-fit p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-300 dark:focus:ring-brand-800 focus:outline-none resize-none overflow-auto self-center"
										onchange={() => {}}
									>
										{#each accessPolicy as optionLabel}
											<option
												value={optionLabel}
											>
												{optionLabel}
											</option>
										{/each}
									</select>
								</div>
							</div>
			      {:else if activeTab == "Users"}
                <Table
	                        get_table_endpoint={table2EndpointDynamic}
	                        get_table_endpoint_by_id={table2EndpointById}
	                        get_form_endpoint={form2Endpoint}
                          search_endpoint={searchEndpoint}
	                        create_entry_url={submit2Url}
	                        delete_entry_url={delete2UrlDynamic}
	                        {token}
	                        table_name= {table_name2}
	                        module="Warehouse"
	                        get_id_bool={true}
	                        form_override={currentRowData}
                         
                        />
                        
            {:else}
            
            <Table
	                        bind:get_table_endpoint={table3EndpointDynamic}
	                        get_table_endpoint_by_id={table3EndpointById}
	                        get_form_endpoint={form3Endpoint}
                          search_endpoint={search3Endpoint}
	                        create_entry_url={submit3Url}
	                        bind:delete_entry_url={delete3UrlDynamic}
	                        {token}
	                        table_name= {table_name3}
	                        module="Warehouse"
	                        get_id_bool={true}
	                        form_override={currentRowData}
                        
                        />
		
			      {/if}
			      
			      </div>

  
          <!-- Close Button -->
          <div class="mt-10 flex justify-start">
           
            <button
							type="button"
							id="createModalButton"
							data-modal-target="createModal"
							data-modal-toggle="createModal"
							class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50"
							onclick={() => {updateWarehouseGroup(); handleClose();}}
						>
							Submit
						</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
