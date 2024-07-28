import ChatHubConnection from "../HubConnections/ChatHubConnection";
import { EventType } from "../Util/EventType";


export default class ChatViewHandler {
    divMessages: HTMLDivElement;
    inpMessage: HTMLInputElement;
    btnSend: HTMLButtonElement;
    inpPlayerName: HTMLInputElement;
    initHTMLHandles() {
        // Gather all HTML Elements for Chatting
        this.divMessages = document.getElementById("divMessages") as HTMLDivElement;
        this.inpMessage = document.getElementById("inpMessage") as HTMLInputElement;
        this.btnSend = document.getElementById("btnSend") as HTMLButtonElement;
        this.inpPlayerName = document.getElementById("inpPlayerName") as HTMLInputElement;
    }

    initEventListener() {
        this.inpMessage.addEventListener(EventType.KEYUP, (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                this.sendNewMessage();
            }
        });

        this.btnSend.addEventListener(EventType.CLICK, this.sendNewMessage);
    }

    chatHubConnection: ChatHubConnection;
    constructor(chatHubConnection: ChatHubConnection) {
        this.initHTMLHandles();
        this.initEventListener();

        this.chatHubConnection = chatHubConnection;
    }

    // Render Functions
    renderNewMessage = (username: string, message: string) => {
        const m = document.createElement("div");

        m.innerHTML = `<div class="message-author">${username}</div><div>${message}</div>`;

        this.divMessages.appendChild(m);
        this.divMessages.scrollTop = this.divMessages.scrollHeight;
    }

    // Chatting
    sendNewMessage = () => {
        this.chatHubConnection.sendNewMessage(this.inpPlayerName.value, this.inpMessage.value);
        this.inpMessage.value = "";
    }
}



