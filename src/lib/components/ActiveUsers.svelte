<script>
  export let users = []; // Liste des utilisateurs actifs: [{ name, color, clientId }]
</script>

{#if users.length > 0}
  <div class="active-users">
    <div class="users-list">
      {#each users as user (user.clientId)}
        <div class="user-badge" style="background-color: {user.color}">
          <span class="user-initial">{user.name.charAt(0).toUpperCase()}</span>
          <span class="user-name">{user.name}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .active-users {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .users-list {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .user-badge {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.6rem;
    border-radius: 20px;
    font-size: 0.85rem;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .user-initial {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .user-name {
    font-weight: 500;
  }
</style>

