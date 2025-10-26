<script>
  export let saveStatus = 'saved';
  export let connectionStatus = 'connecting';
  export let onlineUsers = 0;
  export let lastSaveError = null;
</script>

<div class="status-indicators">
  <!-- Statut de sauvegarde -->
  {#if saveStatus === 'saving'}
    <span class="status status-warning">
      <span class="dot"></span>
      Sauvegarde...
    </span>
  {:else if saveStatus === 'saved'}
    <span class="status status-success">
      <span class="dot"></span>
      Sauvegardé
    </span>
  {:else if saveStatus === 'error'}
    <span class="status status-error" title={lastSaveError}>
      <span class="dot"></span>
      Erreur
    </span>
  {/if}

  <!-- Statut de connexion -->
  {#if connectionStatus === 'connected'}
    <span class="status status-success">
      <span class="dot pulse"></span>
      Connecté
    </span>
  {:else if connectionStatus === 'connecting'}
    <span class="status status-warning">
      <span class="dot"></span>
      Connexion...
    </span>
  {:else if connectionStatus === 'disconnected'}
    <span class="status status-neutral">
      <span class="dot"></span>
      Déconnecté
    </span>
  {:else if connectionStatus === 'error'}
    <span class="status status-error">
      <span class="dot"></span>
      Erreur
    </span>
  {/if}

  <!-- Utilisateurs en ligne -->
  {#if onlineUsers > 0}
    <span class="status status-neutral">
      {onlineUsers} en ligne
    </span>
  {/if}
</div>

<style>
  .status-indicators {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.75rem;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .status-success {
    color: #10b981;
  }

  .status-warning {
    color: #f59e0b;
  }

  .status-error {
    color: #ef4444;
  }

  .status-neutral {
    color: #6b7280;
  }

  .dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>

