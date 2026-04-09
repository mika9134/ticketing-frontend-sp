<script>
	import VStockPermission from '../../components/endPointModules/vstock-permission/vstock-permission.svelte';
	let { onToggleSidebar } = $props();
	let sidebarToggle = true;

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<VStockPermission onToggleSidebar={toggleSidebar} />