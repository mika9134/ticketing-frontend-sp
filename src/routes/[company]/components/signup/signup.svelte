
<script lang='ts'>
  import { setTokens } from '../../../../stores/tokenStore.js'
  import { onMount, onDestroy} from 'svelte';
  import {login} from '../../../../apis/api-utils.js';
  import { fetchForm, signUp } from '../../../../apis/form.js';
	import { goto } from '$app/navigation';
	import { host_super } from '../../../../apis/config.js';
  import { Eye, EyeOff } from 'lucide-svelte';
	import ErrorMessage from '$lib/message/errorMessage.svelte';
	import SuccessMessage from '$lib/message/successMessage.svelte';

  let full_name = ''
  let username = '';
  let password = '';
  let confirmPassword = '';
  let showPassword = false;
  let showConfirmPassword = false;
  let email = '';
  let company_name='Blue Spark Business Technology';
  // let company_name = $companyStore.organization;

  let errorMessage = '';
  let successMessage = '';
  let loading = false;

  // Handle form submission
  const handleSignUp = async () => {

      loading = true;
      errorMessage = '';
      try {
        if (password !== confirmPassword) {
              errorMessage = "Passwords do not match!";
              return;
              }
          const formData = {
              service_provider_company: company_name,
              full_name: full_name,
              username : username,
              email : email,
              password : password,
          };
          const responseData = await signUp(formData);
          console.log('Sign up successful!', responseData);
          company_name = '';
          username = '';
          email = '';
          password = '';
          successMessage = responseData.message;
          goto('/signin');
         
     
    } catch (error) {
      // Handle errors
      errorMessage = error.message || 'SignUp failed.';
      console.error('Sign up error:', error);
    } finally {
      loading = false;
    }
  };

  let activeSlide = 1;
  let interval: number;
  let slides = [
    {
      icon: "/landingPage/Street_map.png",
      title: "Welcome to BlueSpark Sales Force Automation",
      content: "A Sales Force Automation App to enhance your sales productivity.",
    },
    {
      icon: "/landingPage/Salesprocess.png",
      title: "Sales Process/Activity Management",
      content: "Streamline your sales process and activities to increase efficiency and close rates.",
    },
    {
      icon: "/landingPage/ethiopia.png",
      title: "Sales Territory Management",
      content: "Optimize sales territories and manage your team effictively with our automation tool",
    },
    {
      icon: "/landingPage/poss.png",
      title: "Point-of-sale Management",
      content: "Manage your POS system and track performance with real-time data to improve sales.",
    },
    {
      icon: "/landingPage/productmanagement.png",
      title: "Product and Knowledge Management",
      content: "Centralize product information and enhance your team's product knowledge for better sales results.",
    },
    {
      icon: "/landingPage/trademarketing.png",
      title: "Trade Marketing Management",
      content: "Enhnace trade marketing efforts and measure ROI to boost brand visibility and sales.",
    },
    {
      icon: "/landingPage/getstarted.png",
      title: "Get Started",
      content: "You're all set to streamline your sales process.",
    }
  ];

  // Function to go to the next slide
  function nextSlide() {
      activeSlide = activeSlide < slides.length ? activeSlide + 1 : 1;
  }

  // Auto-slide every 5 seconds
  onMount(async () => {
    const check_url = `${host_super}has-superadmin`
    const isRegistered = await fetchForm(check_url, "");
    console.log("isRegistered", isRegistered);
    
    if(isRegistered){
      goto("/signin")
    }

      interval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
  });

  // Clear interval on component destroy
  onDestroy(() => {
      clearInterval(interval);
  });

  // Manual Slide Change
  function setSlide(index:number) {
      activeSlide = index;
      clearInterval(interval); // Reset auto-slide on manual click
      interval = setInterval(nextSlide, 5000); // Restart the interval
  }
</script>


<main>
  <div class="min-h-screen flex flex-col bg-white">
    <header class="bg-[#f2f2f2] px-10 tracking-wide">
      <div class="flex gap-8">
        <div class="lg:flex lg:items-center">
          <img class="w-40 mb-2 border-none" src="images/bluespark_sfa_logo.png" alt="BlueSpark" />
        </div>
      </div>
    </header>

    <div class="flex-grow lg:grid grid-cols-2 bg-white h-full overflow-auto self-center w-full">
      <div class="lg:flex self-center">
        <div class="relative w-full">
          <div class="p-10">
            {#each slides as slide, index (index)}
              {#if activeSlide === index + 1}
                <div class="p-2 text-[#1a1a1a] text-center rounded-lg">
                  <img src={slide.icon} alt="slide Icons" class="slide-icon mx-auto" />
                  <div class="w-full lg:w-4/5 mx-auto">
                
                      <h1 class="mt-10 text-3xl lg:text-4xl font-bold text-[#1c467e]">{slide.title}</h1>

                  </div>

                  <div class="w-5/6 my-10 mx-auto">
                    <h3 class="text-[#4a4a4a]">
                      {slide.content}
                    </h3>
                  </div>
                </div>
              {/if}
            {/each}
          </div>

          <div class="absolute bottom-4 w-full grid justify-center">
            <div class="px-6">
              {#each slides as slide, index (index)}
                <button
                  class="w-4 h-2 mt-4 mx-2 mb-0 rounded-full transition-all duration-300 ease-out"
                  aria-label="carousal slide"
                  class:bg-[#2a4c6b]={activeSlide === index + 1}
                  class:bg-[#c8d9e6]={activeSlide !== index + 1}
                  class:w-8={activeSlide === index + 1}
                  on:click={() => setSlide(index + 1)}
                ></button>
              {/each}
            </div>
          </div>
        </div>
      </div>
      

     <!-- Signup form section -->
     <div class="flex justify-center self-center text-[#1a1a1a] m-2 ">
        <div class="bg-[#1c467e] opacity-90 shadow-2xl w-full max-w-md h-full rounded-xl mx-auto p-8">

            <div class="p-4">
              <h2 class="text-xl lg:text-3xl  font-bold text-[#ffffff]  text-left mb-4">Sign Up </h2>

                <form on:submit|preventDefault={handleSignUp} class="text-sm lg:text-base">
                    <!-- Username & Password -->
                    <div>
                        <div class="mb-4">
                            <label for="company_name" class="block text-[#ffffff]">Service provider name</label>
                            <input type="text" id="company_name" bind:value={company_name} disabled class="lg:min-w-md md:min-w-sm bg-gray-100 mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-gray-100 focus:border-gray-100 sm:text-sm">
                        </div>
                        <div class="mb-4">
                          <label for="full_name" class="block text-gray-100">Full name</label>
                          <input type="text" id="full_name" bind:value={full_name} required placeholder="Enter user Full name" class="lg:min-w-md md:min-w-sm bg-gray-100 mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-gray-100 focus:border-gray-100 sm:text-sm">
                        </div>
                        <div class="mb-4">
                          <label for="username" class="block text-[#ffffff]">Username</label>
                          <input type="text" id="username" bind:value={username} required placeholder="Enter user name" class="lg:min-w-md md:min-w-sm bg-gray-100 mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-gray-100 focus:border-gray-100 sm:text-sm">
                      </div>
                      <div class="mb-4">
                          <label for="email" class="block text-[#ffffff]">Email</label>
                          <input type="email" id="email" bind:value={email} placeholder="Enter your email address" class="lg:min-w-md md:min-w-sm bg-gray-100 mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md text-black shadow-sm focus:outline-none focus:ring-gray-100 focus:border-gray-100 sm:text-sm">
                      </div>
                      <div class="mb-4 relative">
                        <label for="password" class="block text-white">Password</label>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          bind:value={password}
                          required
                          placeholder="••••••••"
                          class="bg-white mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-300 focus:border-blue-300 sm:text-sm"
                        />
                        <button
                          type="button"
                          on:click={() => showPassword = !showPassword}
                          class="absolute right-3 top-10 text-gray-500"
                          tabindex="-1"
                        >
                        {#if showPassword}
                          <EyeOff size={20} />
                        {:else}
                          <Eye size={20} />
                        {/if}
                        </button>
                      
                        <div class="mt-4 mb-4 relative">
                          <label for="password" class="block text-white">Confirm Password</label>
                          <input
                            id="password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            bind:value={confirmPassword}
                            required
                            placeholder="••••••••"
                            class="bg-white mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-blue-300 focus:border-blue-300 sm:text-sm"
                          />
                          <button
                            type="button"
                            on:click={() => showConfirmPassword = !showConfirmPassword}
                            class="absolute right-3 top-10 text-gray-500"
                            tabindex="-1"
                          >
                          {#if showConfirmPassword}
                            <EyeOff size={20} />
                          {:else}
                            <Eye size={20} />
                          {/if}
                          </button>
                        </div>
                          {#if errorMessage}
                            <ErrorMessage message={errorMessage}/>
                          {:else if successMessage}
                            <SuccessMessage message={successMessage}/>
                          {/if}
                    </div>


                    <!-- Submit Button -->
                    <div class="flex justify-center w-full mt-2">
                        <button type="submit"
                            class="py-2 px-4 rounded-md shadow-sm font-bold text-[#1a1a1a] bg-[#d3d3d3] hover:bg-[#3497d4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400">
                            Sign Up
                        </button>
                    </div>
                    <!-- <div class="flex justify-center w-full mt-2">
                      <button on:click= {()=>{goto('/signin')}} class="text-blue-500 hover:text-blue-700 text-sm underline">
                        Already have an account? Sign in
                      </button>
                    </div> -->
                </form>


            </div>

        </div>
     </div>

    </div>
  </div>
  <footer class="bg-[#f5f5f0] pt-2 pb-2 px-10 tracking-wide">
    <div class="flex gap-8">
      <img class="w-24 h-auto" src="/images/BlueSpark.png" alt="BlueSpark" />
      <p class="text-[#1a1a1a] text-xs self-center grow text-center">
        © 2025 BlueSpark Business Technology, Inc.
      </p>
    </div>
  </footer>
</main>


<style global lang="postcss">

  .slide-icon {
    width: auto; /* Set a specific size for the icon */
    height: 220px;
    margin-bottom: 5px;
  }
</style>
