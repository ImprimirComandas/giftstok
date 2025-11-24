// Generate or retrieve a unique device ID
export const getDeviceId = (): string => {
  const STORAGE_KEY = 'tiktok-gifter-device-id';
  
  // Try to get existing device ID from localStorage
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    // Generate a new device ID using timestamp and random string
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
};
