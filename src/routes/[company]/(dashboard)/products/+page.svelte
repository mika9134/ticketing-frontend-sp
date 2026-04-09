<script>

    import ProductModule from "../../components/endPointModules/productModule/products.svelte";
    
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

<ProductModule onToggleSidebar={toggleSidebar}/>
