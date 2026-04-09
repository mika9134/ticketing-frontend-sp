<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher(); 

	let location = $state('');

	
    async function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = parseFloat(position.coords.latitude);
                    const longitude = parseFloat(position.coords.longitude);
                
                    dispatch("location", { latitude,longitude });
                },
                (error) => {
                    console.error("Error getting location:", error.code, error.message);
                    location = '';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            location = '';
            console.error("Geolocation is not supported by this browser.");
        }
    }
</script>


<button
				type="button"
				onclick={getLocation}
				class="btn btn-neutral bg-[#1d6092] w-fit text-white hover:bg-[#2371ac] focus:outline-none focus:bg-[#2371ac] disabled:opacity-50 mb-2"
			>
				Get Location
</button>

