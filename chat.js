document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageButton = document.getElementById('send-message-button');
    const newChatButton = document.getElementById('new-chat-button');

    // Função para adicionar mensagem ao chat
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scrolla para a última mensagem
    }

    // Função para obter resposta da IA (agora do seu backend)
    async function getIaResponse(userMessage) {
        try {
            // Esta URL DEVE APONTAR PARA O SEU BACKEND
            const response = await fetch('https://nsldp-backend.onrender.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                // Se a resposta do servidor não for 200 OK, lança um erro
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro desconhecido do servidor.');
            }

            const data = await response.json();
            return data.reply; // Supondo que seu backend retorna um JSON com uma propriedade 'reply'
        } catch (error) {
            console.error('Erro ao obter resposta da IA (frontend):', error);
            return "Desculpe, não consegui me conectar com a inteligência artificial no momento. Tente novamente mais tarde.";
        }
    }

    // Função para enviar mensagem
    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return; // Não envia mensagens vazias

        addMessage(userMessage, 'user');
        chatInput.value = ''; // Limpa o input

        // Adiciona uma mensagem de "digitando..." ou um loader visual
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'ia-message');
        typingIndicator.textContent = 'IA está digitando...'; // Ou um GIF de loader
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const iaResponse = await getIaResponse(userMessage);
            chatMessages.removeChild(typingIndicator); // Remove o indicador de digitação
            addMessage(iaResponse, 'ia');
        } catch (error) {
            chatMessages.removeChild(typingIndicator); // Remove o indicador mesmo em caso de erro
            addMessage("Erro: Não foi possível obter resposta da IA. " + error.message, 'ia');
            console.error("Erro completo ao enviar mensagem:", error);
        }
    }

    // Event listener para o botão de enviar
    sendMessageButton.addEventListener('click', sendMessage);

    // Event listener para a tecla Enter no input
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Previne quebra de linha no input
            sendMessage();
        }
    });

    // Event listener para o botão de nova conversa
    newChatButton.addEventListener('click', () => {
        chatMessages.innerHTML = ''; // Limpa todas as mensagens
        addMessage("Olá! Sou seu assistente de IA. Como posso ajudar hoje?", 'ia'); // Mensagem de boas-vindas
    });

    // Mensagem de boas-vindas inicial ao carregar a página
    addMessage("Olá! Sou seu assistente de IA. Como posso ajudar hoje?", 'ia');
});