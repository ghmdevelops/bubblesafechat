const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializa o Firebase Admin SDK
admin.initializeApp();

// Função para apagar dados do Realtime Database e Storage diariamente às 3 da manhã
exports.deleteChatData = functions.pubsub.schedule('0 3 * * *')
  .timeZone('America/Sao_Paulo') // Define o fuso horário para 3 AM no Brasil
  .onRun(async (context) => {
    const dbRef = admin.database().ref('chats'); // Referência ao caminho dos chats no Realtime Database
    const storageRef = admin.storage().bucket(); // Referência ao bucket do Cloud Storage

    try {
      // Apaga todos os dados do Realtime Database
      await dbRef.remove();
      console.log('Dados dos chats apagados do Realtime Database com sucesso.');

      // Apaga todos os arquivos no Storage
      const [files] = await storageRef.getFiles({ prefix: 'chat_files/' }); // Ajuste o prefixo conforme necessário
      const deletePromises = files.map(file => file.delete());
      await Promise.all(deletePromises);
      console.log('Arquivos dos chats apagados do Cloud Storage com sucesso.');
      
    } catch (error) {
      console.error('Erro ao apagar dados dos chats:', error);
    }
    
    return null;
  });
