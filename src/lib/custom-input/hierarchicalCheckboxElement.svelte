<script>
  import { formatFieldNames } from '$lib/utils';
  import HierarchicalCheckboxElement from './hierarchicalCheckboxElement.svelte';
  
  export let node;
  export let selected;  
  
  let isExpanded = false;

  let val;
  
  function removeValue(value, index, arr) {
      if (value === val) {
          return false;
      }
      return true;
  }
  
  function deleteGroup(id)
  {
     val = id;
     selected = selected.filter(removeValue);
     for(let i=0; i < node.children.length; i++)
     {
        deleteGroup(node.children[i].id);
     }
  }

</script>

       {#if node.children.length === 0}
        <li class="w-fit">
          <a> 
            <input
											id="checkAll"
											type="checkbox"
											class="cyberpunk-checkbox"
											checked={selected.includes(node.id)}
											onchange={() => {if(selected.includes(node.id)){deleteGroup(node.id);}else{selected.push(node.id);}}}
										/>
            {node.name}
          </a>
        </li>
        {:else}
        <li>
          <div>
            <div class="flex gap-2">
              <a> 
            <input
											id="checkAll"
											type="checkbox"
											class="cyberpunk-checkbox"
											checked={selected.includes(node.id)}
											onchange={() => {if(selected.includes(node.id)){deleteGroup(node.id);}else{selected.push(node.id);}}}
										/>
            {node.name}
          </a>
              {#if isExpanded}
              <svg
																		      xmlns="http://www.w3.org/2000/svg"
																		      width="16"
																		      height="16"
																		      viewBox="0 0 24 24"
																		      onclick={() => {isExpanded = !isExpanded;}}
																		      ><path
																			      fill="currentColor"
																			      d="m12 6.586-8.707 8.707 1.414 1.414L12 9.414l7.293 7.293 1.414-1.414L12 6.586z"
																		      /></svg
																	      >
		          {:else}
		          <svg
																		      xmlns="http://www.w3.org/2000/svg"
																		      width="16"
																		      height="16"
																		      viewBox="0 0 24 24"
																		      onclick={() => {isExpanded = !isExpanded;}}
																		      ><path
																			      fill="currentColor"
																			      d="M12 17.414 3.293 8.707l1.414-1.414L12 14.586l7.293-7.293 1.414 1.414L12 17.414z"
																		      /></svg
																	      >
		          {/if}
            </div>
          </div>
          <ul>
          {#if isExpanded}
          {#each node.children as node_child}
              <HierarchicalCheckboxElement node={node_child} bind:selected={selected}/>
          {/each}
          {/if}
          </ul> 
       </li>
       {/if}
       
<style>
/* From Uiverse.io by adamgiebl */ 
.cyberpunk-checkbox {
  appearance: none;
  width: 12px;
  height: 12px;
  border: 2px solid #4d4d4d;
  border-radius: 2px;
  background-color: transparent;
  display: inline-block;
  position: relative;
  margin-right: 10px;
  cursor: pointer;
}

.cyberpunk-checkbox:before {
  content: "";
  background-color: #4d4d4d;
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 6px;
  height: 6px;
  border-radius: 1px;
  transition: all 0.3s ease-in-out;
}

.cyberpunk-checkbox:checked:before {
  transform: translate(-50%, -50%) scale(1);
}

.cyberpunk-checkbox-label {
  font-size: 18px;
  color: #fff;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
}
</style>

