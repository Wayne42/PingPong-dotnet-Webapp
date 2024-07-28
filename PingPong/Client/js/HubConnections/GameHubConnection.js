import * as signalR from "@microsoft/signalr";
import * as signalRMsgPack from "@microsoft/signalr-protocol-msgpack";
import Logger from "../Util/Logger";
import ToastViewHandler from "../ViewHandler/ToastViewHandler";
export default class GameHubConnection {
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("hub/gameHub", {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
        })
            .withHubProtocol(new signalRMsgPack.MessagePackHubProtocol())
            .withAutomaticReconnect()
            .build();
        this.viewHandler = null;
        this.setViewHandler = (gameViewHandler) => {
            this.viewHandler = gameViewHandler;
        };
        this.startGame = (player1, player2) => {
            Logger.log("Trying to start game...", player1, player2);
            return this.connection.send("startGame", player1, player2);
        };
        this.registerPlayer = (playerid) => {
            return this.connection.send("registerPlayer", playerid);
        };
        this.movePlayer = (i) => {
            return this.connection.send("move", i);
        };
        this.requestNextFrame = () => {
            return this.connection.send("r", this.player1Id, this.player2Id);
        };
        // Connect Incoming Socket Paths 
        this.connection.on("firstFrame", (req) => {
            // Logger.log(`Frame Received`);
            // Logger.log(req.Game);
            let game = req.Game;
            this.viewHandler.renderFrame(game);
            this.player1Id = req.Player1;
            this.player2Id = req.Player2;
            let name1 = game.Player1.Name;
            let name2 = game.Player2.Name;
            this.viewHandler.renderPlayerNames(name1, name2);
            this.viewHandler.gameStarted();
            /* outdatet method to get frames (bad performance)
            if (this.selfGameHubId == game.Player1.GameHubId) {
                setTimeout(() => {
                    this.intervalHandler = setInterval(() => {
                        this.requestNextFrame();
                    }, 17);
                }, 20);
            }
            */
        });
        this.connection.on("n", (req) => {
            // Logger.log(`Frame Received`);
            // Logger.log(req.Game);
            this.viewHandler.renderFrame(req.Game);
        });
        this.connection.on("gameOver", (req) => {
            Logger.log(`gameOver`);
            Logger.log(req.Game);
            // this.viewHandler.renderGameFrame(req.Game);
            let game = req.Game;
            if (this.selfGameHubId == game.Player1.GameHubId) {
                clearInterval(this.intervalHandler);
            }
            this.viewHandler.gameEnded();
            ToastViewHandler.renderToast(req.Message, ToastViewHandler.ToastType.DEFAULT);
        });
        this.connection.on("registeredToGameHub", (id) => {
            Logger.log("Registered you with ID: ", id);
            this.selfGameHubId = id;
        });
        this.connection.onclose(error => {
            Logger.log("Lost connection from GameHub " + error);
        });
        // Start Socket Connection
        this.connection.start().then(() => {
            Logger.log("GameHub connected. ");
        }, error => { Logger.log(error); });
    }
}
