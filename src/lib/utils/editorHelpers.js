/**
 * Helpers pour la gestion de l'éditeur Tiptap
 */

/**
 * Applique une mise à jour distante en préservant le curseur
 */
export function applyRemoteUpdate(editor, newContent, currentHash, hashFn) {
  if (!editor) return currentHash;

  const newHash = hashFn(newContent);
  if (newHash === currentHash) {
    return currentHash; // Pas de changement réel
  }

  const { from, to } = editor.state.selection;

  try {
    editor.commands.setContent(newContent, false);

    setTimeout(() => {
      const docSize = editor.state.doc.content.size;
      const safeFrom = Math.min(from, docSize);
      const safeTo = Math.min(to, docSize);

      if (safeFrom > 0 && safeTo > 0) {
        editor.commands.setTextSelection({ from: safeFrom, to: safeTo });
      }
    }, 0);

    return newHash;
  } catch (error) {
    console.error('Erreur lors de l\'application de la mise à jour:', error);
    return currentHash;
  }
}

/**
 * Fonction de debounce générique
 */
export function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

