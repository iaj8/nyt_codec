<script>
  import {
    media_store_filtered,
    ui_store,
    platform_config_store,
  } from "../stores/store";
  import { onMount } from 'svelte';

  let password = '';
  let error = '';

  function checkPassword() {
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('authenticated', 'true');
      window.location.reload(); // Refresh to load the actual content
    } else {
      password = ""
      error = '';
      setTimeout(() => {
        error = 'Incorrect password. Please try again.'; // Reset error message after 0.1 seconds
      }, 100);
    }
  }

  // Check if already authenticated
  onMount(() => {
    if (localStorage.getItem('authenticated') === 'true') {
      window.location.reload(); // Already authenticated, refresh to load the actual content
    }
  });

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      checkPassword();
    }
  }
</script>

<div>
  <h1>Enter Password</h1>
  <input 
    type="password"
    bind:value={password}
    placeholder="Password" 
    on:keydown={handleKeydown}
  />
  <button 
    on:click={checkPassword}
    class="box text_level1 noselect submit_button"
    style="color: 'white'"
    >
      Submit
    </button>
  {#if error}
    <p>{error}</p>
  {/if}
</div>

<style>

  h1 {
    color: white;
  }

  p {
    color: white;
  }

  button {
      margin-right: var(--font-size);
  }

  .submit_button {
      color: white;
      border: 1px solid white;
  }

  .submit_button:active {
    color: blue;
    border: 1px solid blue;
  }
</style>
