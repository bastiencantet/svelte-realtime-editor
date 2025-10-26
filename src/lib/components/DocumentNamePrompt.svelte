<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let documentName = '';
  let isVisible = true;

  function handleSubmit() {
    const trimmedName = documentName.trim();
    if (trimmedName) {
      isVisible = false;
      dispatch('submit', { documentName: trimmedName });
    }
  }

  function handleCancel() {
    isVisible = false;
    dispatch('cancel');
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      handleSubmit();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  }
</script>

{#if isVisible}
  <div class="modal-overlay" on:click={handleCancel}>
    <div class="modal-content" on:click|stopPropagation>
      <h2>Nouveau document</h2>
      <p>Donnez un nom à votre document</p>
      
      <input 
        type="text" 
        bind:value={documentName}
        on:keydown={handleKeydown}
        placeholder="Mon document..."
        autofocus
      />
      
      <div class="button-group">
        <button 
          class="btn-cancel"
          on:click={handleCancel}
        >
          Annuler
        </button>
        <button 
          class="btn-submit"
          on:click={handleSubmit}
          disabled={!documentName.trim()}
        >
          Créer
        </button>
      </div>
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
    border-color: #2563eb;
  }

  .button-group {
    display: flex;
    gap: 0.75rem;
  }

  button {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel {
    background: #f3f4f6;
    color: #6b7280;
  }

  .btn-cancel:hover {
    background: #e5e7eb;
  }

  .btn-submit {
    background: #2563eb;
    color: white;
  }

  .btn-submit:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-submit:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>

