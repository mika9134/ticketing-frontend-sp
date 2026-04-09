<script>
    import Penetration from "../../components/endPointModules/penetration/penetration.svelte";
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

<Penetration onToggleSidebar={toggleSidebar}/>
