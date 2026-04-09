<script>
	import { onMount } from 'svelte';
	import { host } from '../../../../../apis/config';
	import { getAccessToken } from '../../../../../stores/tokenStore';
	import Table from '../../tables/table.svelte';
	import Header from "../../header/header.svelte";
	const resetDefault = `${host}role/reset-default`;
	const tableEndpoint = `${host}role/get-roles`;
	const searchEndpoint = `${host}role/search`;
	const tableEndpointById = `${host}role/get-role/`;
	const formEndpoint = `${host}role/role-form`;
	const submitUrl = `${host}role/create-role`;
	const updateUrl = `${host}role/update-role`;
	const deleteUrl = `${host}role/delete-role`;
	const table_name = 'Role';
	let button_names = [];
	let button_callbacks = [];
	let role_id = $state();
	let name = $state();
	let token = getAccessToken();
	
	let {
	  onToggleSidebar,
	} = $props();

 function afterChange(module, result) {
  let role;

  if (result && result.permissions) {
   if (result.permissions[module]) {
    role = {
     id: result.id,
     name: name? name :result.name,
     module: module,
     policy: result.permissions[module],
     permissions: result.permissions
    };
   } else {
    role = {
     id: result.id,
     name: name ? name : result.name,
     module: module,
     policy: '',
     permissions: result.permissions
    };
   }
  } else {
   console.log("is here wey", role_id);
   if (role_id && role_id !== '') {
    role = { id: role_id, name: name, module: module, policy: '' };
   }
  }

  return role;
 }
 function afterSubmit(result) {
  role_id = result['id'];
  name = result['name'];
 }

 onMount(async () => {
  role_id = '';
  name = '';
 });
 
let sidebarToggle = $state(true);
let roleToggle = $state(true);

// Function to toggle sidebar visibility
const toggleSidebar = () => {
    sidebarToggle = !sidebarToggle;
    onToggleSidebar();
};

async function resetDefaults() {

 if(token === "" || token === undefined)
 {
   token = getAccessToken();
 }
 const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
        
 const response = await fetch(resetDefault, {
            method: 'GET',
            headers
        });
        
  roleToggle = !roleToggle;
        
}
</script>
<div>
<Header onToggleSidebar={toggleSidebar} {sidebarToggle} />
<div>
<div class="flex w-full justify-end sticky top-0 z-10 mt-4 mr-16 mb-4">
  <button class="join-item btn bg-white text-gray-900 border-gray-100 shadow-md" onclick={resetDefaults}>
<img src="/svgs/default.svg" class="w-4 h-4" />
Reset Defaults
</button>
</div>
<div>
{#key roleToggle}
<Table
	get_table_endpoint={tableEndpoint}
	search_endpoint={searchEndpoint}
	get_table_endpoint_by_id={tableEndpointById}
	get_form_endpoint={formEndpoint}
	create_entry_url={submitUrl}
	update_entry_url={updateUrl}
	delete_entry_url={deleteUrl}
	{token}
	{table_name}
	module="Administrative"
	get_id_bool={true}
	buttons_names={button_names}
	buttons_callbacks={button_callbacks}
	handleOnChange={afterChange}
	closeAfterSubmit={false}
	after_submit_callback={afterSubmit}
/>
{/key}
</div>
</div>
</div>
