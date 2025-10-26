/**
 * Gestion du contenu des documents
 */

/**
 * Hash simple pour détecter les changements de contenu
 */
export function hashContent(obj) {
  return JSON.stringify(obj).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
}

/**
 * Charge les informations complètes d'un document (titre + contenu)
 */
export async function loadDocument(supabase, docId) {
  try {
    const { data: row, error } = await supabase
      .from('documents')
      .select('id, title, content')
      .eq('id', docId)
      .single();

    console.log('Document chargé:', row);

    if (error || !row) {
      console.error('Error loading doc:', error);
      return {
        name: `Document ${docId}`,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'New doc' }]
            }
          ]
        }
      };
    }

    // Parser le contenu si c'est une string JSON
    let parsedContent = row.content;
    if (typeof row.content === 'string') {
      parsedContent = JSON.parse(row.content);
    }

    return {
      name: row.title || `Document ${docId}`,
      content: parsedContent
    };
  } catch (err) {
    console.error('Erreur fatale au chargement:', err);
    throw err;
  }
}

/**
 * Charge le contenu initial d'un document (pour compatibilité)
 */
export async function loadInitialContent(supabase, docId) {
  const doc = await loadDocument(supabase, docId);
  return doc.content;
}

/**
 * Sauvegarde le contenu d'un document avec retry automatique
 */
export async function saveContent(supabase, docId, json, options = {}) {
  const { isRetry = false, retryCount = 0, maxRetries = 3 } = options;

  try {
    const { error } = await supabase
      .from('documents')
      .update({
        content: JSON.stringify(json),
        updated_at: new Date().toISOString()
      })
      .eq('id', docId);

    if (error) throw error;

    return { success: true, retryCount: 0 };
  } catch (error) {
    console.error('Error saving content:', error);

    // Retry logic
    if (!isRetry && retryCount < maxRetries) {
      const newRetryCount = retryCount + 1;
      console.log(`Tentative de sauvegarde ${newRetryCount}/${maxRetries}...`);
      
      await new Promise(resolve => setTimeout(resolve, 1000 * newRetryCount));
      
      return saveContent(supabase, docId, json, {
        isRetry: true,
        retryCount: newRetryCount,
        maxRetries
      });
    }

    return { success: false, error: error.message, retryCount };
  }
}

/**
 * Parse le contenu reçu (string JSON ou objet)
 */
export function parseContent(content) {
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      return null;
    }
  }
  return content;
}

