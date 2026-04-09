<script>
    import Warehouse from "../../components/endPointModules/warehouse_stop/warehouse_stop.svelte";
    import Header from "../../components/header/header.svelte";
    
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
<Header />
<Warehouse onToggleSidebar={toggleSidebar}/>
</div>
