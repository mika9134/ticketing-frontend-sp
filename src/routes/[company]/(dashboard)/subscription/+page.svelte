<script>
	import Subscription from '../../components/endPointModules/subscription/subscription.svelte';
	let { onToggleSidebar } = $props();
	let sidebarToggle = true;

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<Subscription onToggleSidebar={toggleSidebar} />