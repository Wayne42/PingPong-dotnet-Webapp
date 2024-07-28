import * as signalR from "@microsoft/signalr";
import * as signalRMsgPack from "@microsoft/signalr-protocol-msgpack";
import Logger from "../Util/Logger";
import ChatViewHandler from "../ViewHandler/ChatViewHandler";

export default class ChatHubConnection {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("hub/chatHub", {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
        })
        .withHubProtocol(new signalRMsgPack.MessagePackHubProtocol())
        .withAutomaticReconnect()
        .build();

    viewHandler: ChatViewHandler = null;
    setViewHandler = (viewHandler: ChatViewHandler) => {
        this.viewHandler = viewHandler;
    }
    constructor() {
        // Connect Incoming Socket Paths 
        this.connection.on("messageReceived", (username: string, message: string) => {
            Logger.log(`Message received: (${username}): ${message} `);
            this.viewHandler.renderNewMessage(username, message);
        });

        this.connection.onclose(error => {
            Logger.log("Lost connection from ChatHub " + error);
        });

        // Start Socket Connection
        this.connection.start().then(
            () => {
                Logger.log("ChatHub connected. ");
            }, error => { Logger.log(error) }
        );
    }

    // Connect Outgoing Socket Paths
    sendNewMessage = (username: string, message: string) => {
        return this.connection.send("newMessage", username, message);
    }
}
