<script>
  import { createEventDispatcher } from "svelte";

  export let timeline = "Daily"; // Default timeline
  export let span = 7; // Default span

  const dispatch = createEventDispatcher();

  function setFilter(newTimeline, newSpan) {
  
    timeline = newTimeline;
    span = newSpan;

    // Dispatch an event to notify parent components of the change
    dispatch("filterChange", { timeline, span });
  }

  // Reactive variable to track the active timeline
  let activeTimeline = timeline;
</script>

<div class="ml-2 h-fit w-fit flex gap-2 ">
  <button 
    class="btn btn-outline dark:btn-soft dark:bg-[#002a47] sm:btn-xs md:btn-md hover-bg-white dark:text-gray-100" 
    on:click={() => { setFilter("Daily", 365); activeTimeline = "Daily"; }} 
    class:active-button={activeTimeline === "Daily"}
  >
    Daily
  </button>
  <button 
    class="btn btn-outline dark:btn-soft dark:bg-[#002a47] sm:btn-xs md:btn-md hover-bg-white dark:text-gray-100" 
    on:click={() => { setFilter("Weekly", 52); activeTimeline = "Weekly"; }} 
    class:active-button={activeTimeline === "Weekly"}
  >
    Weekly
  </button>
  <button 
    class="btn btn-outline dark:btn-soft dark:bg-[#002a47] sm:btn-xs md:btn-md hover-bg-blue-400 dark:text-gray-100" 
    on:click={() => { setFilter("Monthly", 12); activeTimeline = "Monthly"; }} 
    class:active-button={activeTimeline === "Monthly"}
  >
    Monthly
  </button>
  <button 
    class="btn btn-outline dark:btn-soft dark:bg-[#002a47] sm:btn-xs md:btn-md hover-bg-blue-400 dark:text-gray-100" 
    on:click={() => { setFilter("Yearly", 3); activeTimeline = "Yearly"; }} 
    class:active-button={activeTimeline === "Yearly"}
  >
    Annually
  </button>
</div>

<style>
  .active-button {
    background-color: #3498db; /* Change this to your preferred active button color */
    color: white;
  }
</style>
