importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBxFGlrdpsuYqJMVwnI_8fjAkk-tceqGfs",
  authDomain: "lunar-reminder-69af6.firebaseapp.com",
  projectId: "lunar-reminder-69af6",
  messagingSenderId: "649690588313",
  appId: "1:649690588313:web:ca2c2edf22f4f16d118408"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});