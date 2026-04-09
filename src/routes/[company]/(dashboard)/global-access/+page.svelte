<script>
	import GlobalAccessUsers from '../../components/endPointModules/global-access/global-access.svelte';
	let { onToggleSidebar } = $props();
	let sidebarToggle = true;

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<GlobalAccessUsers onToggleSidebar={toggleSidebar} />