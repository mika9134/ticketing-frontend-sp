<script>
	import Regions from '../../components/endPointModules/regions/regions.svelte';
	let { onToggleSidebar } = $props();
	let sidebarToggle = true;

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<Regions onToggleSidebar={toggleSidebar} />
