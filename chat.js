document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtém referências aos elementos HTML do chat
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageButton = document.getElementById('send-message-button');
    const newChatButton = document.getElementById('new-chat-button');

    // **2. Configuração da URL do Backend (CRÍTICO!)**
    // Esta é a URL base do seu serviço Render, seguida pela rota da API de chat.
    // Certifique-se de que "https://nsldp-backend.onrender.com" é a URL exata do seu serviço no Render.
    // O "/api/chat" é a rota que seu backend (server.js) está esperando para o chat.
    const BACKEND_URL = 'https://nsldp-backend.onrender.com/api/chat';

    // 3. Função para adicionar mensagens ao display do chat
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        // Garante que o scroll esteja sempre no final, mostrando a última mensagem
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 4. Função assíncrona para enviar a mensagem do usuário ao backend
    async function getIaResponse(userMessage) {
        try {
            // Realiza uma requisição POST para o seu backend
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Informa que o corpo da requisição é JSON
                },
                body: JSON.stringify({ message: userMessage }), // Converte a mensagem do usuário em JSON
            });

            // Verifica se a resposta da rede foi bem-sucedida (status 2xx)
            if (!response.ok) {
                // Se a resposta não for OK, tenta ler o erro do corpo da resposta JSON
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro desconhecido do servidor.');
            }

            // Analisa a resposta JSON do backend
            const data = await response.json();
            // Retorna a resposta da IA (seu backend deve enviar a resposta da IA na propriedade 'reply')
            return data.reply;
        } catch (error) {
            console.error('Erro ao obter resposta da IA (frontend):', error);
            // Retorna uma mensagem de erro amigável para o usuário
            return "Desculpe, não consegui me conectar com a inteligência artificial no momento. Tente novamente mais tarde.";
        }
    }

    // 5. Função principal para enviar uma mensagem do usuário
    async function sendMessage() {
        const userMessage = chatInput.value.trim(); // Pega o texto do input e remove espaços em branco
        if (userMessage === '') return; // Não faz nada se a mensagem estiver vazia

        addMessage(userMessage, 'user'); // Adiciona a mensagem do usuário ao chat
        chatInput.value = ''; // Limpa o campo de input

        // Adiciona um indicador visual de que a IA está "digitando"
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'ia-message');
        typingIndicator.textContent = 'IA está digitando...';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Chama a função para obter a resposta da IA do backend
            const iaResponse = await getIaResponse(userMessage);
            chatMessages.removeChild(typingIndicator); // Remove o indicador de digitação
            addMessage(iaResponse, 'ia'); // Adiciona a resposta da IA ao chat
        } catch (error) {
            chatMessages.removeChild(typingIndicator); // Remove o indicador mesmo em caso de erro
            addMessage("Erro: Não foi possível obter resposta da IA. " + error.message, 'ia'); // Exibe mensagem de erro
            console.error("Erro completo ao enviar mensagem:", error);
        }
    }

    // 6. Configura os Event Listeners
    // Ao clicar no botão de enviar, a função sendMessage é chamada
    sendMessageButton.addEventListener('click', sendMessage);

    // Ao pressionar Enter no campo de input, a função sendMessage é chamada
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita quebra de linha padrão no input ao pressionar Enter
            sendMessage();
        }
    });

    // Ao clicar no botão de nova conversa, limpa o chat e adiciona mensagem de boas-vindas
    newChatButton.addEventListener('click', () => {
        chatMessages.innerHTML = ''; // Limpa todas as mensagens do chat
        addMessage("Olá! Sou seu assistente de IA. Como posso ajudar hoje?", 'ia'); // Mensagem de boas-vindas inicial
    });

    // 7. Mensagem de boas-vindas inicial ao carregar a página
    addMessage("Olá! Sou seu assistente de IA. Como posso ajudar hoje?", 'ia');
});