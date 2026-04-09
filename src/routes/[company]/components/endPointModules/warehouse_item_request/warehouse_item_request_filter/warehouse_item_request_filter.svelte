<script>
    import { createEventDispatcher } from "svelte";
  
    export let status = "All"; // Default status

  
    const dispatch = createEventDispatcher();
  
    function setStatus(newStatus) {
     status = newStatus
      dispatch("statusChange", { status });
    }
  

    let activeStatus = status;
  </script>
  
  <div class="p-2 ml-2 h-fit w-fit flex gap-2 ">
    <button 
      class="btn btn-outline dark:btn-soft dark:bg-[#002a47] sm:btn-xs md:btn-sm hover-bg-white" 
      on:click={() => { setStatus("All"); activeStatus = "All"; }} 
      class:active-button={activeStatus === "All"}
    >
      All
    </button>
    <button 
      class="btn btn-outline dark:btn-soft dark:bg-[#002a47] sm:btn-xs md:btn-sm hover-bg-white" 
      on:click={() => { setStatus("Pending"); activeStatus = "Pending"; }} 
      class:active-button={activeStatus === "Pending"}
    >
      Pending
    </button>
    <button 
      class="btn btn-outline dark:btn-soft dark:bg-[#002a47] sm:btn-xs md:btn-sm hover-bg-blue-400" 
      on:click={() => { setStatus("Approved"); activeStatus = "Approved"; }} 
      class:active-button={activeStatus === "Approved"}
    >
      Approved
    </button>
    <button 
      class="btn btn-outline dark:btn-soft dark:bg-[#002a47] sm:btn-xs md:btn-sm hover-bg-blue-400" 
      on:click={() => { setStatus("Rejected"); activeStatus = "Rejected"; }} 
      class:active-button={activeStatus === "Rejected"}
    >
      Rejected
    </button>
  </div>
  
  <style>
    .active-button {
      background-color: #3498db; /* Change this to your preferred active button color */
      color: white;
    }
  </style>