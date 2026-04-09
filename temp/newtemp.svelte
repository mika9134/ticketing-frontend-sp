<script>

    import { onMount, tick } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from '$app/stores'; // Importing the $page store
    import { fetchTable, fetchHiddenFields } from "../../../apis/table";
    import {deleteItem, updateForm} from "../../../apis/form.js";
    import {formatFieldNames} from "../../../lib/utils"
    import {roles} from "../../../stores/roleStore";
  
    // import AddModuleForm from "../forms/createForm.svelte";
    import DeleteModal from "../../../lib/modals/deleteModal.svelte";
      import Modal from '../../../lib/modals/formModal.svelte';
      import ShareButton from "../buttons/share-button.svelte";
  
      let {
          get_table_endpoint,
          table_name,
          get_form_endpoint,
          create_entry_url,
          update_entry_url,
          delete_entry_url,
      void_entry_url,
          token
      } = $props();
  
    let columns = $state(true);
      let table_data = $state([]);
    let showFormModalAdd = $state(false);
    let showFormModalUpdate = $state([]);
    let showDeleteModal =$state(false);
  
    let selectedRow = $state(null);
    let action_type = "";
    let currentRoute = $page.url.pathname; // Access the current route (path)
  
    let userRoles = $state({});
    $effect(() => {
      userRoles = $roles; // Subscribe to the roles store
    });
  
    let currentPageName = $state(""); // Track the current page name
    $effect(() => {
      currentPageName = window.location.pathname.split("/").pop(); // Extract the last part of the URL
    });
  
  
  
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
      selectedRow =null;
    }
    let isActionsDropdownOpen = false;
    let isFilterDropdownOpen = $state(false);
  
    let isDeleteModalOpen = false;
    let selectedProduct = null;
  
    async function loadTable() {
      try {
        // Fetch hidden fields
        const hiddenFields = await fetchHiddenFields(table_name, token);
        // Fetch table data
        table_data = await fetchTable(get_table_endpoint, token);
  
        if (table_data && table_data.length > 0) {
          let cols = Object.keys(table_data[0]);
  
          // Exclude hidden fields
          cols = cols.filter((col) => !hiddenFields.includes(col));
  
          if (cols.includes('id')) {
            cols = cols.filter((col) => col !== 'id');
            cols.unshift('id');
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
  
    // Fetch table data on mount
      onMount(async () => {
        loadTable();
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
          console.error("Error deleting item:", error);
        });
    }
  
    async function handleVoidClick(id) {
      console.log(id);
      const url = `${void_entry_url}/${id}`; // Append the row ID to the delete URL
       try{
        await updateForm(url, {},token);
        alert(`Sale ${id} voided`);
        loadTable();
       }catch(e){
  
       }
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
  
    let currentPage = 1;
    let totalPages = 100;
  
    function goToPage(page) {
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
      }
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
  </script>
  
  
  <main class = "mx-auto sm:p-5 antialiased">
      <!-- Start block -->
      <section class="h-full w-full">
          <!-- Start coding here -->
          <div class="bg-white dark:bg-[#002a47] relative shadow-md sm:rounded-lg overflow-hidden">
  
                  <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                      <div class="w-full md:w-1/2">
                          <form class="flex items-center">
                              <label for="simple-search" class="sr-only">Search</label>
                              <div class="relative w-full">
                                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                      <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                      </svg>
                                  </div>
                                  <input type="text" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" required="">
                              </div>
                          </form>
                      </div>
                      <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        {#if !(currentRoute === '/deposit/approved' || currentRoute === '/deposit/rejected')}
                        <button type="button" id="createProductModalButton" data-modal-target="createProductModal" data-modal-toggle="createProductModal"
                            class="btn btn-neutral bg-[#3393ce] text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50"
                            onclick={() => {
                              if (table_name === "Sales") {
                                goto('/sales/sales-map');
                              } else if (table_name === "Promotion") {
                                goto('/trade-marketing/sales-activation-map');
                              } else {
                                action_type = "Add";
                                showFormModalAdd = true;
                              }
                            }}
                          >     
                              <svg class="h-3.5 w-3.5 mr-2" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                              </svg>
                              Add {table_name}
                          </button>
                        {/if}
  
                          <!-- add form modal section -->
                          <Modal
                          bind:closeUpdateModal
                          {table_name}
                          {token}
                          {get_form_endpoint}
                          {get_table_endpoint}
                          {create_entry_url}
                          action_type={"Add"}
                          bind:showFormModal={showFormModalAdd}
                          form_data={[]}
                        />
  
                        <!-- warehouse Inventory -->
                        {#if table_name === "Warehouse"}
                        <button type="button" id="inventory" data-modal-target="inventory" data-modal-toggle="inventory"
                        class="btn btn-neutral bg-[#3393ce] text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50"
                        onclick={()=>{
                          goto("/warehouse/inventory");
                        }
  
                        }>
                        Inventory</button>
                        {/if}
                      </div>
                  </div>
  
              {#if table_data.length === 0}
                <p class="flex justify-self-center text-gray-800 dark:text-white">No data available</p>
              {/if}   
              <div class="overflow-x-auto w-full h-[600px]">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm text-left text-gray-700 dark:text-gray-300">
                  <thead class="bg-gray-100 dark:bg-gray-800 text-xs uppercase text-gray-600 dark:text-gray-400">
                    <tr>
                        <!-- Check All Checkbox in the th -->
                      <th scope="col" class="px-6 py-3">
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
                      <th scope="col" class="px-6 py-3">{formatFieldNames(col)}</th>
                    {/each}
                    <th scope="col" class="px-10 py-4 ">Actions</th>
                    {#if ["deposit", "warehouse", "inventory", "category"].includes(table_name)}
                    <th scope="col" class = "px-10 py-4">Status</th>
                    {/if}
                    </tr>
                  </thead>
                  <tbody>
                    {#each table_data as row, i}
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200">
                      <td class="px-6 py-4 font-medium text-gray-900 dark:text-white border-b border-primary-500 dark:border-gray-600">
                        <div class="flex items-center">
                          <input
                          id="checkbox-{row.id}"
                          type="checkbox"
                          class="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          checked={checkedProducts.has(row.id)}
                          onchange={() => toggleProduct(row.id)}
                          />
                          <label for="checkbox-{row.id}" class="sr-only">checkbox</label>
                        </div>
                      </td>
                      {#each columns as col}
                      {#if row[col] === null}
                        <td class="px-4 py-3 max-w-[12rem] truncate border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400">N/A</td>
                      {:else if col === "description"}
                        <!-- Apply special styling to the description column -->
                        <td class="px-6 py-4 max-w-[12rem] truncate border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400">{row[col]}</td>
                      
                        {:else if col === "image"}
                          <!-- Apply special styling to display images column -->
                          <td class="px-6 py-4 max-w-[12rem] truncate border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400">
                                <img 
                                  src={row[col]} 
                                  alt="employee avator preview"
                                  class="w-24 h-auto rounded shadow-md object-contain"
                                />
                            </td>
                        {:else}
                        <td class="px-6 py-4 max-w-[12rem] truncate border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400">{row[col]}</td>
                      {/if}
                      {/each}
  
  
                      <!-- Action section -->
                      <td class="px-6 py-4 border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400">
                        <div class="flex items-center space-x-4 w-fit">
                          <button
                            type="button"
                            class="py-2 px-3 flex items-center text-sm font-medium dark:text-white
                            text-gray-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-700
                            focus:ring-4 focus:outline-none 
                            focus:ring-primary-200 dark:focus:ring-primary-800 
                            transition duration-200 ease-in-out transform hover:scale-105"
                            onclick={() => {action_type = "Update";  showFormModalUpdate[i]=true;}}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 -ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                            Edit
                        </button>
                        <Modal
                          bind:closeUpdateModal
                          {table_name}
                          {token}
                          {get_form_endpoint}
                          {update_entry_url}
                          {get_table_endpoint}
                          action_type={"Update"}
                          bind:showFormModal={showFormModalUpdate[i]}
                          form_data={table_data[i]}
                        />
                          <button type="button" data-modal-target="delete-modal" data-modal-toggle="delete-modal"
                            class="flex items-center text-red-700 hover:text-white border border-red-700
                            hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg
                            text-sm px-3 py-2 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white
                            dark:hover:bg-red-600 dark:focus:ring-red-900
                            transition duration-200 ease-in-out transform hover:scale-105"
                            onclick={() => openDeleteModal(row)}>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 -ml-0.5" viewbox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                                Delete
                          </button>
                        <!-- Delete Modal -->
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
                      </td>
                      <!-- Request status section -->
                      {#if ["Address","deposit", "warehouse", "inventory", "category"].includes(table_name) && userRoles.deposit && userRoles.deposit.includes("CRUD")}
                      <td class="px-6 py-4 border-b border-primary-500 dark:border-gray-600 hover:underline dark:text-primary-400">
                        <div class="flex items-center space-x-4 w-fit">
                            {#if row.status === "pending"}
                              <!-- Approve Button -->
                              <button
                                onclick={() => handleApprove(row.id)}
                                class="py-2 px-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800"
                              >
                                Approve
                              </button>
                      
                              <!-- Reject Button -->
                              <button
                                onclick={() => handleReject(row.id)}
                                class="py-2 px-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                              >
                                Reject
                              </button>
                            {:else}
                              <span class="text-gray-500 dark:text-gray-400">{row.status}</span>
                            {/if}
                        </div>
                      </td>     
                      {/if}                    
                    </tr>
                    {/each}
                  </tbody>
                  </table>
              </div>
  
            
  
      <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
              Showing
              <span class="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, 1000)}</span>
              of
              <span class="font-semibold text-gray-900 dark:text-white">1000</span>
          </span>
          <ul class="inline-flex items-stretch -space-x-px">
              <li>
              <button
                  class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  onclick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
              >
                  <span class="sr-only">Previous</span>
                  <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
              </button>
              </li>
              {#each Array(totalPages).fill(0).slice(0, 5) as _, index}
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
                  disabled={currentPage === totalPages}
              >
                  <span class="sr-only">Next</span>
                  <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
              </button>
              </li>
          </ul>
          </nav>
          {#if table_name === "Sales" }
                  <!-- Checkout Section -->
          <div class="flex justify-between items-center p-4 rounded-lg border border-gray-200 bg-white dark:bg-[#002a47] dark:border-gray-600 mt-4"
              >
            <div class="text-lg font-semibold text-gray-800 dark:text-white">
              Total: <span> ETB</span>
            </div>
  
            <button
              onclick={handleSubmit}
              class="ml-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              >
              Proceed to Checkout
            </button>
          </div>
          {/if}
        </div>
      </section>
  
  <!-- End block -->
  
  
  </main>