<script>
	import WarehouseGroup from "../../components/endPointModules/warehouse_group/warehouse_group.svelte";
	
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

<WarehouseGroup onToggleSidebar={toggleSidebar}/>
