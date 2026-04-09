<script>
	import TargetSetters from '../../components/endPointModules/target-setters/target-setters.svelte';
	let { onToggleSidebar } = $props();
	let sidebarToggle = true;

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<TargetSetters onToggleSidebar={toggleSidebar} />