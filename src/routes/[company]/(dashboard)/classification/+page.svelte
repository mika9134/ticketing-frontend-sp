<script>
    import Classification from "../../components/endPointModules/classifications/classification.svelte";
    
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

<div>
    <Classification onToggleSidebar={toggleSidebar}/>
</div>
