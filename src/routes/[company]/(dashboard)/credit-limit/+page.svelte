<script>
	import CreditLimit from '../../components/endPointModules/credit-limit/credit-limit.svelte';

	let { onToggleSidebar } = $props();

	let sidebarToggle = true;

	// Function to toggle sidebar visibility
	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<div>
	<CreditLimit onToggleSidebar={toggleSidebar} />
</div>
