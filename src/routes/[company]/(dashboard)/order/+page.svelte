<script>
    import Order from "../../components/endPointModules/orders/order.svelte";
    
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
    <Order onToggleSidebar={toggleSidebar}/>
</div>
