<script>
    import Dashboard from "../../components/endPointModules/dashboard/dashboard.svelte";
    
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

<main>
    <Dashboard onToggleSidebar={toggleSidebar}/>
</main>
