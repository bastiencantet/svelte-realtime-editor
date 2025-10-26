<script>
  import { onMount, onDestroy } from 'svelte';
  import { supabase } from '$lib/supabaseClient.js';
  import { Editor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import TiptapEditor from '$lib/TiptapEditor.svelte';
  import StatusIndicators from '$lib/components/StatusIndicators.svelte';
  import UserNamePrompt from '$lib/components/UserNamePrompt.svelte';
  import ActiveUsers from '$lib/components/ActiveUsers.svelte';

  // Utils
  import { loadDocument, saveContent as saveContentUtil, hashContent, parseContent } from '$lib/utils/contentManager.js';
  import { setupRealtimeChannel, broadcastPresence, getConnectionStatus } from '$lib/utils/realtimeManager.js';
  import { applyRemoteUpdate as applyRemoteUpdateUtil, debounce } from '$lib/utils/editorHelpers.js';

  export let data; // { docId }

  // État de l'éditeur
  let editor = null;
  let isApplyingRemoteUpdate = false;
  let channel = null;
  let initialContent = null;
  let documentName = '';
  let isLoading = true;
  let currentContentHash = 0;

  // États de synchronisation
  let connectionStatus = 'connecting';
  let saveStatus = 'saved';
  let onlineUsers = 0;
  let lastSaveError = null;

  // Gestion du nom d'utilisateur
  let userName = '';
  let showNamePrompt = false;
  let hasInteracted = false;

  // Utilisateurs actifs
  let activeUsers = [];

  // ID unique pour ce client/onglet
  const clientId = crypto.randomUUID();

  // Couleurs pour les utilisateurs
  const USER_COLORS = [
    '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8',
    '#94FADB', '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD'
  ];

  // Obtenir une couleur basée sur le userName
  function getUserColor(name) {
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
  }

  // Sauvegarde du contenu avec gestion des états
  async function handleSaveContent(json) {
    if (isApplyingRemoteUpdate) return;

    saveStatus = 'saving';
    lastSaveError = null;

    const result = await saveContentUtil(supabase, data.docId, json);

    if (result.success) {
      saveStatus = 'saved';
      currentContentHash = hashContent(json);
    } else {
      saveStatus = 'error';
      lastSaveError = result.error;
    }
  }

  const debouncedSave = debounce((json) => {
    handleSaveContent(json);
  }, 300);

  // Gestion du clic sur l'éditeur pour demander le nom
  function handleEditorClick() {
    if (!hasInteracted && !userName) {
      showNamePrompt = true;
      hasInteracted = true;
    }
  }

  // Gestion de la soumission du nom d'utilisateur
  function handleUserNameSubmit(event) {
    userName = event.detail.userName;

    // Mettre à jour la présence avec le userName
    if (channel) {
      broadcastPresence(channel, clientId, userName);
    }
  }

  // Initialisation de l'éditeur
  async function handleEditorReady(event) {
    const { element } = event.detail;

    editor = new Editor({
      element,
      extensions: [StarterKit],
      content: initialContent,
      editable: true,
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        debouncedSave(json);
      }
    });

    if (initialContent) {
      currentContentHash = hashContent(initialContent);
    }

    // Ajouter l'event listener pour le clic
    element.addEventListener('click', handleEditorClick);
  }

  // Application des mises à jour distantes
  function handleRemoteUpdate(newContent) {
    isApplyingRemoteUpdate = true;

    currentContentHash = applyRemoteUpdateUtil(
      editor,
      newContent,
      currentContentHash,
      hashContent
    );

    setTimeout(() => {
      isApplyingRemoteUpdate = false;
    }, 50);
  }

  // Configuration du realtime
  function initRealtimeChannel() {
    channel = setupRealtimeChannel(supabase, data.docId, clientId, {
      // Callback pour les updates de contenu
      onContentUpdate: (payload) => {
        const newContent = parseContent(payload.new.content);
        if (newContent) {
          handleRemoteUpdate(newContent);
        }
      },

      // Callback pour la synchronisation des présences
      onPresenceSync: (state, count) => {
        onlineUsers = count;

        // Mettre à jour la liste des utilisateurs actifs
        activeUsers = Object.keys(state).map(key => {
          const presence = state[key][0]; // Prendre la première présence de chaque utilisateur
          const name = presence.user_name || 'Tigre Anonyme';
          return {
            clientId: key,
            name: name,
            color: getUserColor(name)
          };
        }).filter(user => user.clientId !== clientId); // Ne pas afficher soi-même
      },

      // Callback pour les changements de statut
      onStatusChange: (status, err, channelInstance) => {
        connectionStatus = getConnectionStatus(status);

        if (status === 'SUBSCRIBED') {
          console.log('Realtime ready');
          broadcastPresence(channelInstance, clientId, userName || null);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime error:', err);

          // Reconnexion automatique après 5s
          setTimeout(() => {
            console.log('Tentative de reconnexion...');
            initRealtimeChannel();
          }, 5000);
        }
      }
    });
  }

  onMount(async () => {
    try {
      // 1. Vérifier si l'utilisateur a déjà un nom dans localStorage
      const storedName = localStorage.getItem('user-name');
      if (storedName) {
        userName = storedName;
      }

      // 2. Charger le document (nom + contenu)
      const doc = await loadDocument(supabase, data.docId);
      initialContent = doc.content;
      documentName = doc.name;
      isLoading = false;

      // 3. Initialiser le realtime
      initRealtimeChannel();
    } catch (err) {
      console.error('Erreur lors du montage:', err);
      connectionStatus = 'error';
      isLoading = false;
    }
  });

  onDestroy(() => {
    if (channel) {
      supabase.removeChannel(channel);
    }
    if (editor) {
      editor.destroy();
    }
  });
</script>

{#if isLoading}
  <p>Chargement...</p>
{:else}
  <div class="container">
    <!-- En-tête avec indicateurs de statut -->
    <div class="header">
      <div class="title-section">
        <h1>{documentName}</h1>
        <p class="subtitle">
          {#if userName}
            Connecté en tant que <strong>{userName}</strong> •
          {/if}
          Ouvre ce lien dans un autre onglet pour tester la synchro en live
        </p>
      </div>

      <StatusIndicators
        {saveStatus}
        {connectionStatus}
        {onlineUsers}
        {lastSaveError}
      />
    </div>

    <!-- Utilisateurs actifs -->
    {#if activeUsers.length > 0}
      <div class="active-users-section">
        <span class="active-users-label">En train d'écrire :</span>
        <ActiveUsers users={activeUsers} />
      </div>
    {/if}

    <TiptapEditor on:ready={handleEditorReady} />
  </div>

  <!-- Popup pour demander le nom d'utilisateur -->
  {#if showNamePrompt}
    <UserNamePrompt on:submit={handleUserNameSubmit} />
  {/if}
{/if}

<style>
  .container {
    padding: 1.5rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .title-section h1 {
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.3rem;
  }

  .subtitle {
    font-size: 0.8rem;
    color: #666;
  }

  .subtitle strong {
    color: #4a90e2;
  }

  .active-users-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .active-users-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #555;
  }
</style>
