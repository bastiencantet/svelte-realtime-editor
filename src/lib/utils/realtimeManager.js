/**
 * Gestion de la connexion Realtime et Presence
 */

/**
 * Configure et retourne un channel Realtime avec Presence
 */
export function setupRealtimeChannel(supabase, docId, clientId, callbacks) {
  const {
    onContentUpdate,
    onPresenceSync,
    onPresenceJoin,
    onPresenceLeave,
    onStatusChange
  } = callbacks;

  const channel = supabase
    .channel(`doc-${docId}`, {
      config: {
        presence: { key: clientId }
      }
    })
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'documents',
        filter: `id=eq.${docId}`
      },
      (payload) => {
        if (onContentUpdate) {
          onContentUpdate(payload);
        }
      }
    )
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      console.log('Présences:', state, '→', count, 'utilisateurs');

      if (onPresenceSync) {
        onPresenceSync(state, count);
      }
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Utilisateur connecté:', key, newPresences);

      if (onPresenceJoin) {
        onPresenceJoin(key, newPresences);
      }
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Utilisateur déconnecté:', key, leftPresences);

      if (onPresenceLeave) {
        onPresenceLeave(key, leftPresences);
      }
    })
    .subscribe((status, err) => {
      console.log('Realtime status:', status);

      if (onStatusChange) {
        onStatusChange(status, err, channel);
      }
    });

  return channel;
}

/**
 * Broadcast la présence du client sur le channel
 */
export function broadcastPresence(channel, clientId, userName = null) {
  const presenceData = {
    client_id: clientId,
    online_at: new Date().toISOString(),
    user_agent: navigator.userAgent.slice(0, 50)
  };

  if (userName) {
    presenceData.user_name = userName;
  }

  channel.track(presenceData);
}

/**
 * Gère le statut de connexion en fonction de l'événement Supabase
 */
export function getConnectionStatus(status) {
  switch (status) {
    case 'SUBSCRIBED':
      return 'connected';
    case 'CHANNEL_ERROR':
      return 'error';
    case 'CLOSED':
      return 'disconnected';
    default:
      return 'connecting';
  }
}

