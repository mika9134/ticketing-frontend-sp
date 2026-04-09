<script>
    import Pointofsale from "../../components/endPointModules/pointofsale/pointofsale.svelte";
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

<Pointofsale onToggleSidebar={toggleSidebar}/>
