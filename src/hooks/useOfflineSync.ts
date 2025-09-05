import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useLocalStorage<OfflineAction[]>('offline_actions', []);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOfflineAction = (type: string, data: any) => {
    const action: OfflineAction = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now()
    };
    setPendingActions(prev => [...prev, action]);
  };

  const syncOfflineActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    setIsSyncing(true);
    try {
      // Process each pending action
      for (const action of pendingActions) {
        // Here you would implement the actual sync logic
        console.log('Syncing action:', action);
        // Remove action after successful sync
      }
      setPendingActions([]);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncOfflineActions();
    }
  }, [isOnline, pendingActions]);

  return {
    isOnline,
    pendingActions,
    isSyncing,
    addOfflineAction,
    syncOfflineActions
  };
}
