<script>
    import Vehicle from "../../components/endPointModules/vehicle/vehicle.svelte";
    
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

<Vehicle onToggleSidebar={toggleSidebar}/>
