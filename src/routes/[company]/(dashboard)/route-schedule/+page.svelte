<script>
    	import RouteSchedule from "../../components/endPointModules/routeSchedule/routeSchedule.svelte";
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

<RouteSchedule onToggleSidebar={toggleSidebar}/>
