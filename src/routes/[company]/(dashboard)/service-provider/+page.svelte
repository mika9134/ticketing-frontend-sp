<script>
	import ServiceProvider from "../../components/endPointModules/service_provider/service_provider.svelte";
	import Header from "../../components/header/header.svelte";
	import Sidebar from "../../components/sidebar/sidebar.svelte";

   

// Manage sidebar open/close state
let sidebarToggle = true;

// Function to toggle sidebar visibility
const toggleSidebar = () => {
    sidebarToggle = !sidebarToggle;
};

</script>

<ServiceProvider onToggleSidebar={toggleSidebar}/>

