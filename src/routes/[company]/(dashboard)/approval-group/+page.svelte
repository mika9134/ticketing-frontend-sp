<script>
    import ApprovalGroup from "../../components/endPointModules/approval-group/approval-group.svelte";
    
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
    <ApprovalGroup onToggleSidebar={toggleSidebar}/>
</div>
