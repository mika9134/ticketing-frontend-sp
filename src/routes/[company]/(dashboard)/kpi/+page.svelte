<script>
	import Kpi from '../../components/endPointModules/kpi/kpi.svelte';

	let { onToggleSidebar } = $props();

	let sidebarToggle = true;

	const toggleSidebar = () => {
		sidebarToggle = !sidebarToggle;
		onToggleSidebar();
	};
</script>

<Kpi onToggleSidebar={toggleSidebar} />
