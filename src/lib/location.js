export function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = parseFloat(position.coords.latitude);
                    const longitude = parseFloat(position.coords.longitude);
                    return {'lat': latitude,'lon':longitude}
     
                },
                (error) => {
                    console.error("Error getting location:", error.code, error.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }