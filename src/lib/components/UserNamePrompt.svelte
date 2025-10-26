<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let userName = '';
  let isVisible = true;

  function handleSubmit() {
    const trimmedName = userName.trim();
    if (trimmedName) {
      // Sauvegarder dans localStorage
      localStorage.setItem('user-name', trimmedName);
      isVisible = false;
      dispatch('submit', { userName: trimmedName });
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }
</script>

{#if isVisible}
  <div class="modal-overlay" on:click={handleSubmit}>
    <div class="modal-content" on:click|stopPropagation>
      <h2>Bienvenue !</h2>
      <p>Comment vous appelez-vous ?</p>
      
      <input 
        type="text" 
        bind:value={userName}
        on:keydown={handleKeydown}
        placeholder="Votre nom..."
        autofocus
      />
      
      <button 
        on:click={handleSubmit}
        disabled={!userName.trim()}
      >
        Commencer
      </button>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 90%;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #333;
  }

  p {
    margin: 0 0 1.5rem 0;
    color: #666;
    font-size: 0.95rem;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1rem;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #4a90e2;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover:not(:disabled) {
    background: #357abd;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>

