importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js');

// Inicializa o Firebase com sua configuração
firebase.initializeApp({
    apiKey: "AIzaSyCtmAj7m8Lg4oyOazOBfKSE4e8C82-uEes",
    authDomain: "opensecurityroom.firebaseapp.com",
    databaseURL: "https://opensecurityroom-default-rtdb.firebaseio.com",
    projectId: "opensecurityroom",
    storageBucket: "opensecurityroom.appspot.com",
    messagingSenderId: "100768688093",
    appId: "1:100768688093:web:39e42da6d5e35258acb834"
});

// Inicializa o Firebase Messaging
const messaging = firebase.messaging();

// Manipula mensagens recebidas em segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('Mensagem recebida em segundo plano: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png' // Altere para o ícone que você deseja mostrar
    };

    // Desabilita a regra para a linha abaixo
    // eslint-disable-next-line no-restricted-globals
    return self.registration.showNotification(notificationTitle, notificationOptions);
});
