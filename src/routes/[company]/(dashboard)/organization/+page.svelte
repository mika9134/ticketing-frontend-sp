<script>
	import Organization from "../../components/endPointModules/organization/organization.svelte";

	let {
	  onToggleSidebar,
	} = $props();
	
	
		let sidebarToggle = true;

// Function to toggle sidebar visibility
const toggleSidebar = () => {
    sidebarToggle = !sidebarToggle;
    onToggleSidebar();
    };
</script>

<Organization onToggleSidebar={toggleSidebar}/>
