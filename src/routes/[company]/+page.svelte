<script>
	import { getAccessToken, setTokens, getRefreshToken } from '../../stores/tokenStore';
	import { redirect } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { host} from '../../apis/config.js';
	import { companyStore, getCompanyName, companyName } from '../../stores/companyStore.js';
	import { fetchTenant } from '../../apis/get-my-tenant';
	import { fetchRoles } from '../../stores/roleStore.js';
	
	let company = $companyStore;
	let company_name = getCompanyName();
	
	let userRoles = "";
	
	let current_module = $state("");
  let module_path = {
    "Sales": "sales",
    "Service Provider": "service-provider",
    "Tenant Management": "service-provider",
    "Administrative": "users",
    "Address": "address",
    "Category": "categories",
    "Classification": "classification",
    "Dashboard": "dashboard",
    "Deposit": "deposit",
    "Finance": "deposit",
    "Product": "products",
    "Penetration": "penetration",
    "Inheritance": "inheritance",
    "Inventory Management": "warehouse",
    "Order": "order",
    "Organization": "organization",
    "Scope Group": "scope",
    "Role": "role",
    "Route": "route",
    "Route Schedule": "route-schedule",
    "Trade Marketing": "trade-marketing/shelf-share",
    "Territory": "territory",
    "Point Of Sale": "point-of-sale",
    "Users": "users",
    "Visit": "visit",
    "Vehicle": "vehicle",
    "Warehouse": "warehouse",
    "Procurement": "warehouse"
  };



	// Use the $ store subscription to reactively get the token values
	onMount(async () => {

  
		let access_token = getAccessToken();
		company_name = getCompanyName();

		
		if (access_token) {

		    let userRoles = await fetchRoles(`${host}role/my-role`, access_token);
		    
		  
		    
		    if(userRoles.succeed)
		    {
		      userRoles = userRoles.data;
		    
		    }
		    else {
		     handleSignOut();
		    }
		    let viewPermissionIndex = Object.values(userRoles).indexOf("view");
		    let editPermissionIndex = Object.values(userRoles).indexOf("edit");
		    let contibutePermissionIndex = Object.values(userRoles).indexOf("contribute");
		    let managePermissionIndex = Object.values(userRoles).indexOf("manage");
		    
		    let roleIndex;
		    current_module = undefined;
		    		    
				if(userRoles["Dashboard"] !== undefined)
				{
				  current_module = module_path["Dashboard"];
				}
				else {
        for(let x = 2; x < Object.keys(userRoles).length; x += 1)
        {
            if(x == viewPermissionIndex || x == editPermissionIndex || x == contibutePermissionIndex || x == managePermissionIndex)
            {
              roleIndex = x;

              current_module = module_path[Object.keys(userRoles)[roleIndex]];

              break;
            }
        }
        }

		}
     
    if(getRefreshToken() == "" || (getRefreshToken() && getRefreshToken() != "" && Date.now() >= (JSON.parse(atob(getRefreshToken().split('.')[1]))).exp * 1000))
    {
    	 if($page.params.company != "provider")
    	 {
       goto(`/${$page.params.company}/signin`);    	 
    	 }
    	 else {
    	 goto(`/signin`);    	
    	 }
       return;
    } 

    try {
      if($page.params.company && $page.params.company !== "" && $page.params.company !== "provider")
      {
		    fetchTenant($page.params.company);
	    }
		}
		catch(error) {
		
		}
	
		if (
			$page.params.company &&
			($page.params.company !== 'signup' || $page.params.company !== 'signin' || $page.params.company !== 'provider')
		) {
		
    
			

			if (access_token) {
				goto(`/${$page.params.company}/${current_module}`);
			} else {
				if($page.params.company != "provider")
    	 {
       goto(`/${$page.params.company}/signin`);    	 
    	 }
    	 else {
    	 goto(`/signin`);    	
    	 }
			}
		} else if (company_name !== '' && company_name !== "provider") {
			if (access_token) {
				goto(`/${company_name}/${current_module}`);
			} else {
				goto(`/${company_name}/signin`);
			}
		} else {
			if (access_token) {
				goto(`/provider/${current_module}`);
			} else {
				goto(`/signup`);
			}
		}
	});
	
	// Manage sidebar open/close state
	// let sidebarToggle = true;

	// // Function to toggle sidebar visibility
	// const toggleSidebar = () => {
	// 	sidebarToggle = !sidebarToggle;
	// };	
	
	export function handleSignOut() {
		setTokens("","");
		goto(`/signin`);
    
	}
	
</script>
