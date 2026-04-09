<script>
	import Categories from "../../components/endPointModules/categories/categories.svelte";
	
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

<Categories onToggleSidebar={toggleSidebar} />
