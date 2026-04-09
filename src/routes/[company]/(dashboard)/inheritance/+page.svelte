<script>
    import Inheritance from "../../components/endPointModules/inheritance/inheritance.svelte";
    
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

<Inheritance onToggleSidebar={toggleSidebar}/>
