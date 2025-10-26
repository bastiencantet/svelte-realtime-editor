<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient.js';
  import DocumentNamePrompt from '$lib/components/DocumentNamePrompt.svelte';

  let documents = [];
  let isLoading = true;
  let error = null;
  let showNamePrompt = false;

  async function loadDocuments() {
    try {
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('id, title, updated_at, created_at')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      documents = data || [];
    } catch (err) {
      console.error('Erreur lors du chargement des documents:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }

  function createNewDocument() {
    showNamePrompt = true;
  }

  async function handleDocumentNameSubmit(event) {
    const documentTitle = event.detail.documentName;
    
    try {
      const newDocId = crypto.randomUUID();
      
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          id: newDocId,
          title: documentTitle,
          content: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Commencez à écrire...' }]
              }
            ]
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Rediriger vers le nouveau document
      goto(`/${newDocId}`);
    } catch (err) {
      console.error('Erreur lors de la création du document:', err);
      alert('Impossible de créer le document. Veuillez réessayer.');
    }
  }

  function handleDocumentNameCancel() {
    showNamePrompt = false;
  }

  function formatDate(dateString) {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  onMount(() => {
    loadDocuments();
  });
</script>

<div class="container">
  <header class="header">
    <div class="header-content">
      <h1>Mes Documents</h1>
      <p class="subtitle">Créez et collaborez en temps réel</p>
    </div>
    <button class="btn-create" on:click={createNewDocument}>
      <span class="plus-icon">+</span>
      <span class="btn-text">Nouveau</span>
    </button>
  </header>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Chargement des documents...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>Erreur: {error}</p>
      <button class="btn-retry" on:click={loadDocuments}>Réessayer</button>
    </div>
  {:else if documents.length === 0}
    <div class="empty-state">
      <div class="empty-icon"></div>
      <h2>Aucun document</h2>
      <p>Commencez par créer votre premier document</p>
      <button class="btn-primary" on:click={createNewDocument}>
        <span class="plus-icon">+</span>
        Créer un document
      </button>
    </div>
  {:else}
    <div class="documents-grid">
      {#each documents as doc}
        <a href="/{doc.id}" class="document-card">
          <div class="card-header">
            <h3 class="card-title">{doc.title || 'Sans titre'}</h3>
            <span class="card-icon"></span>
          </div>
          <div class="card-footer">
            <span class="card-date">
              Modifié {formatDate(doc.updated_at)}
            </span>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<!-- Modal pour demander le nom du document -->
{#if showNamePrompt}
  <DocumentNamePrompt 
    on:submit={handleDocumentNameSubmit} 
    on:cancel={handleDocumentNameCancel}
  />
{/if}

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    min-height: 100vh;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-content h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: #1a1a1a;
  }

  .subtitle {
    margin: 0.5rem 0 0;
    color: #666;
    font-size: 0.95rem;
  }

  .btn-create {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
  }

  .btn-create:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .btn-create:active {
    transform: translateY(0);
  }

  .plus-icon {
    font-size: 1.5rem;
    font-weight: 300;
    line-height: 1;
  }

  .loading, .error, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f4f6;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    color: #dc2626;
  }

  .btn-retry {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-retry:hover {
    background: #e5e7eb;
  }

  .empty-state {
    padding: 6rem 2rem;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    color: #1a1a1a;
  }

  .empty-state p {
    color: #666;
    margin-bottom: 2rem;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.75rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }

  .documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .document-card {
    display: block;
    padding: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .document-card:hover {
    border-color: #2563eb;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: #1a1a1a;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-icon {
    font-size: 1.5rem;
    margin-left: 0.5rem;
    opacity: 0.6;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-date {
    font-size: 0.875rem;
    color: #666;
  }

  @media (max-width: 640px) {
    .container {
      padding: 1.5rem 1rem;
    }

    .header-content h1 {
      font-size: 1.5rem;
    }

    .btn-create .btn-text {
      display: none;
    }

    .documents-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
