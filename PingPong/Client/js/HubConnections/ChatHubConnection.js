import * as signalR from "@microsoft/signalr";
import * as signalRMsgPack from "@microsoft/signalr-protocol-msgpack";
import Logger from "../Util/Logger";
export default class ChatHubConnection {
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("hub/chatHub", {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
        })
            .withHubProtocol(new signalRMsgPack.MessagePackHubProtocol())
            .withAutomaticReconnect()
            .build();
        this.viewHandler = null;
        this.setViewHandler = (viewHandler) => {
            this.viewHandler = viewHandler;
        };
        // Connect Outgoing Socket Paths
        this.sendNewMessage = (username, message) => {
            return this.connection.send("newMessage", username, message);
        };
        // Connect Incoming Socket Paths 
        this.connection.on("messageReceived", (username, message) => {
            Logger.log(`Message received: (${username}): ${message} `);
            this.viewHandler.renderNewMessage(username, message);
        });
        this.connection.onclose(error => {
            Logger.log("Lost connection from ChatHub " + error);
        });
        // Start Socket Connection
        this.connection.start().then(() => {
            Logger.log("ChatHub connected. ");
        }, error => { Logger.log(error); });
    }
}
