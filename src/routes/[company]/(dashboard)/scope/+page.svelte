<script>
    import Scope from "../../components/endPointModules/scope/scope.svelte";
    
    let sidebarToggle = true;
    
      	let {
	  onToggleSidebar,
	} = $props();
	

// Function to toggle sidebar visibility
const toggleSidebar = () => {
    sidebarToggle = !sidebarToggle;
};

</script>

<Scope onToggleSidebar={toggleSidebar} />
