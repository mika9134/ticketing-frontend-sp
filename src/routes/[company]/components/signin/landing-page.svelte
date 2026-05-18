<script>
    import { setTokens } from '../../../../stores/tokenStore'
    let username = '';
    let password = '';
    let errorMessage = '';

    // Handle form submission
    const login = async () => {
        try {
            let request_body = {
                "grant_type": 'password',
                'username': username,
                'password': password,
                'scope': '',
                'client_id': '',
                'client_secret': '',
            };
            const response = await fetch('http://172.10.10.202:8000/auth/login/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request_body),  // Convert the form data to a URL-encoded string
            });
            const data = await response.json();

            if (response.ok) {
                console.log('Received tokens:', data);
                alert('Login successful!');

                // Store tokens in the store
                setTokens(data.access_token, data.refresh_token);
            } else {
                errorMessage = 'Login failed';
            }
        } catch (error) {
            errorMessage = 'Network error';
            console.error('Network or unexpected error:', error);
        }
    };
</script>

<style>
    
    /* Custom CSS for animation */
    .car-animation {
        animation: moveCar 5s linear infinite; /* Slower animation */
        overflow: hidden; /* Prevent horizontal scroll */
        position: absolute;
        top: 4px;
        left: 0;
        z-index: 10;
        }
  
    @keyframes moveCar {
      0% {
        transform: translateX(-100%); /* Start off-screen */
      }
      100% {
        transform: translateX(50vw); /* End at 100% of the viewport width */
      }
    }

    /* Add some basic styling */
    @media (max-width: 640px) {
        .welcome-text {
            white-space: normal; /* Allow text to wrap */
        }
        .hide-on-small {
            display: none; /* Hide element on small screens */
        }
    }

</style>

<main class="overflown-x-hidden">
    <section class="bg-[url(background.jpg)] bg-cover shadow-4xl overflow-x:hidden">
            <!-- Add animated car GIF -->
        <div class="absolute top-4 left-0 w-full flex justify-center items-center car-animation z-10">
            <img src="smart-car.png" alt="Car moving" class=" filter hue-rotate-90 w-10 md:w-12 lg:w-18 ">
        </div>
        <!-- Right column container with background and description-->
        <div class="justify-center w-full p-12">

            <div class="xl:grid grid-cols-2 items-center justify-center w-full">
                <div class="p-8 bg-white/20 backdrop-blur-xs w-full h-full grow rounded-t-lg lg:rounded-none lg:rounded-l-lg">
                <!-- Typing effect text -->
                <h1 class="animate-typing overflow-hidden whitespace-nowrap border-r-0 border-r-white pr-5 text-2xl lg:text-3xl text-gray-200 font-bold welcome-text">
                    Welcome to Sale Automation
                </h1>

                <!-- Original content (unchanged) -->
                <h2 class="text-lg lg:text-xl text-gray-100 font-bold pt-4 hide-on-small">Automation For Your Sales Force</h2>
                <img class="hidden lg:inline-block mt-8 w-96 lg:w-full" src="sales.png" alt="Sales Automation" />
                </div>


                <div class="p-8 bg-[#002a47] shadow-2xl w-full h-full rouded-b-lg lg:rounded-none lg:rounded-r-lg">
                    <img src="BlueSpark2.png" alt="Salesforce Logo" class="mx-auto mb-6 w-32 lg:w-64">
                    <h2 class="text-xl lg:text-2xl text-left font-bold text-gray-100 text-center mb-6">Sign In</h2>

                    <form on:submit|preventDefault={login} class="text-xs lg:text-sm">
                        <div class="mb-4">
                            <label for="username" class="block text-gray-100">Username</label>
                            <input type="text" id="username" bind:value={username} required class="bg-gray-100 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-100 focus:border-gray-100 sm:text-sm">
                        </div>
                        <div class="mb-6">
                            <label for="password" class="block text-gray-100">Password</label>
                            <input type="password" id="password" bind:value={password} required class="bg-gray-100 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-100 focus:border-gray-100 sm:text-sm">
                        </div>
                        <div class="flex items-center justify-between mb-6 flex-col sm:flex-row sm:items-center">
                            <!-- Remember me Checkbox -->
                            <div class="flex items-center mb-2 sm:mb-0">
                                <input id="remember_me" name="remember_me" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-800 border-gray-300 rounded">
                                <label for="remember_me" class="ml-2 block text-xs sm:text-sm text-gray-100">Remember me</label> <!-- Adjust font size on small screens -->
                            </div>
                        
                            <!-- Forgot password link -->
                            <div class="text-xs sm:text-sm">
                                <a href="/" class="font-medium text-gray-100 hover:text-blue-300">Forgot your password?</a>
                            </div>
                        </div>
                        
                        <div class="justify-end">
                            <button type="submit" class="w-fit flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs lg:text-sm font-medium text-white bg-linear-to-r from-[#3497d4] to-[#0062e6] hover:from-[#2487c4] hover:to-[#0052e6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Log In</button>
                        </div>
                        {#if errorMessage}
                            <p class="text-red-200">{errorMessage}</p>
                        {/if}
                    </form>
                </div>
            </div>

        </div>
    </section>
    <footer class="bg-[#002a47] pt-4 pb-4 px-10 tracking-wide">
        <div class="mx-auto w-full">
            <div class="flex gap-8">
                <div class="lg:flex lg:items-center">
                    <img class="btn btn-ghost normal-case text-lg text-orange-700 border-none w-32" src="BlueSpark2.png" alt="BlueSpark" />
                </div>
                <h1 class="text-gray-100 text-xs self-center grow text-center">Copyright 2025 BlueSpark Business Technology. All rights reserved.</h1>
            
        </div>
    </footer>
</main>
