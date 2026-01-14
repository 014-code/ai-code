import { Button, message, notification } from 'antd';

const clearCache = () => {
  if (window.caches) {
    caches
      .keys()
      .then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      })
      .catch((e) => console.log(e));
  }
};

if ('serviceWorker' in navigator) {
  const { serviceWorker } = navigator;
  if (serviceWorker.getRegistrations) {
    serviceWorker.getRegistrations().then((sws) => {
      sws.forEach((sw) => {
        sw.unregister();
      });
    });
  }
  serviceWorker.getRegistration().then((sw) => {
    if (sw) sw.unregister();
  });
  clearCache();
}

window.addEventListener('offline', () => {
  message.warning('当前处于离线状态');
});

window.addEventListener('online', () => {
  message.success('网络已恢复');
});