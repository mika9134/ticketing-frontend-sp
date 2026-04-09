<script>
    import Users from "../../components/endPointModules/users/users.svelte";
    	
	let {
	  onToggleSidebar,
	} = $props();
	

</script>

<Users {onToggleSidebar}/>
