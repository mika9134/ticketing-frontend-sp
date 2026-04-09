<script>

    import Commision from "../../components/endPointModules/productModule/commission.svelte";
    
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

<Commision onToggleSidebar={toggleSidebar}/>
