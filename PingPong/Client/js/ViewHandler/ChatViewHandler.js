import { EventType } from "../Util/EventType";
export default class ChatViewHandler {
    initHTMLHandles() {
        // Gather all HTML Elements for Chatting
        this.divMessages = document.getElementById("divMessages");
        this.inpMessage = document.getElementById("inpMessage");
        this.btnSend = document.getElementById("btnSend");
        this.inpPlayerName = document.getElementById("inpPlayerName");
    }
    initEventListener() {
        this.inpMessage.addEventListener(EventType.KEYUP, (e) => {
            if (e.key === "Enter") {
                this.sendNewMessage();
            }
        });
        this.btnSend.addEventListener(EventType.CLICK, this.sendNewMessage);
    }
    constructor(chatHubConnection) {
        // Render Functions
        this.renderNewMessage = (username, message) => {
            const m = document.createElement("div");
            m.innerHTML = `<div class="message-author">${username}</div><div>${message}</div>`;
            this.divMessages.appendChild(m);
            this.divMessages.scrollTop = this.divMessages.scrollHeight;
        };
        // Chatting
        this.sendNewMessage = () => {
            this.chatHubConnection.sendNewMessage(this.inpPlayerName.value, this.inpMessage.value);
            this.inpMessage.value = "";
        };
        this.initHTMLHandles();
        this.initEventListener();
        this.chatHubConnection = chatHubConnection;
    }
}
