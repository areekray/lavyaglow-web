import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function usePWAUpdate() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 seconds
      setInterval(() => {
        r?.update();
      }, 60000);
      
      console.log('🕯️ LavyaGlow PWA registered');
    },
    onRegisterError(error) {
      console.error('🚨 PWA registration error:', error);
    },
    immediate: true,
  });

  // Show modal when update is available
  useEffect(() => {
    if (needRefresh) {
      setShowUpdateModal(true);
    }
  }, [needRefresh]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update service worker
      await updateServiceWorker(true);
      
      // Close modal and refresh
      setShowUpdateModal(false);
      setNeedRefresh(false);
      
      // Force reload the page
      window.location.reload();
    } catch (error) {
      console.error('🚨 Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setNeedRefresh(false);
  };

  return {
    showUpdateModal,
    isUpdating,
    offlineReady,
    needRefresh,
    handleUpdate,
    handleCloseModal,
  };
}
