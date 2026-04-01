import { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationToggle({ className = '', isNavbar = false }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);
    
    if ('serviceWorker' in navigator && 'PushManager' in window && import.meta.env.VITE_VAPID_PUBLIC_KEY) {
      setIsSupported(true);
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (loading || !isSupported) return;
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await fetch((import.meta.env.VITE_API_URL || '') + '/api/notifications/unsubscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
          await subscription.unsubscribe();
        }
        setIsSubscribed(false);
        localStorage.setItem('jr_push_enabled', 'false');
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert('Please allow notifications in your browser settings to receive booking alerts');
          setLoading(false);
          return;
        }

        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        await fetch((import.meta.env.VITE_API_URL || '') + '/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(subscription),
        });

        setIsSubscribed(true);
        localStorage.setItem('jr_push_enabled', 'true');
      }
    } catch (err) {
      console.error('Push toggle error:', err);
      alert('Failed to update notification settings. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    if (isIOS && !isNavbar) {
      return (
        <div className={`text-sm text-gray-500 mt-2 ${className}`}>
          On iPhone, install this site as a PWA (Add to Home Screen) first to enable notifications.
        </div>
      );
    }
    return null;
  }

  // Bell icons
  const iconFilled = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );

  const iconOutline = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );

  if (isNavbar) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        title={isSubscribed ? "Disable Notifications" : "Enable Notifications"}
        className={`p-2 rounded-full transition-colors ${
          isSubscribed ? 'text-green-500 hover:bg-zinc-800' : 'text-gray-400 hover:text-white hover:bg-zinc-800'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {isSubscribed ? iconFilled : iconOutline}
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          isSubscribed 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-zinc-800 hover:bg-zinc-700 text-gray-200 border border-zinc-700'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubscribed ? (
          <>
            {iconFilled}
            Notifications On
          </>
        ) : (
          <>
            {iconOutline}
            Enable Notifications
          </>
        )}
      </button>
      {isIOS && !isSubscribed && (
        <p className="text-xs text-gray-500 mt-2 max-w-sm">
          On iPhone, install this site as a PWA (Add to Home Screen) first.
        </p>
      )}
    </div>
  );
}
