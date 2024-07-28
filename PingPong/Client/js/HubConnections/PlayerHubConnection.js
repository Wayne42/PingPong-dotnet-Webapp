import * as signalR from "@microsoft/signalr";
import * as signalRMsgPack from "@microsoft/signalr-protocol-msgpack";
import Logger from "../Util/Logger";
import ToastViewHandler from "../ViewHandler/ToastViewHandler";
export default class PlayerHubConnection {
    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("hub/playerHub", {
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
        this.login = (username) => {
            if (username.length < 1)
                return;
            return this.connection.send("login", username);
        };
        this.sendGameInvite = (player_two_id) => {
            return this.connection.send("sendGameInvite", player_two_id);
        };
        this.acceptGameInvite = (player_one_id) => {
            return this.connection.send("acceptGameInvite", player_one_id);
        };
        this.declineGameInvite = (player_one_id) => {
            return this.connection.send("declineGameInvite", player_one_id);
        };
        // Connect Incoming Socket Paths
        this.connection.on("newPlayer", (req) => {
            Logger.log(`newPlayer:`);
            Logger.log("req", req);
            Logger.log(req.NewPlayer);
            let player = req.NewPlayer;
            this.viewHandler.addPlayer(player);
        });
        this.connection.on("initPlayerList", (req) => {
            Logger.log(`playerList:`);
            Logger.log("req", req);
            let playerlist = req.Players;
            let self = req.Self;
            this.viewHandler.initPlayerList(playerlist, self);
            this.viewHandler.registerGameHubId(self);
        });
        this.connection.on("playerDisconnect", (req) => {
            Logger.log(`playerDisconnect:`);
            Logger.log(req.PlayerId);
            this.viewHandler.removePlayer(req.PlayerId);
        });
        this.connection.on("receiveInvite", (req) => {
            Logger.log(`receiveInvite:`, req.Creator, req.Opponent);
            let player1 = req.Creator;
            let player2 = req.Opponent;
            this.viewHandler.successToast(req.Message);
            this.viewHandler.renderPlayerInvite(player1.Id, player2.Id);
        });
        this.connection.on("successInvite", (req) => {
            Logger.log(`successInvite`);
            ToastViewHandler.renderToast(req.Message, ToastViewHandler.ToastType.SUCCESS);
        });
        this.connection.on("errorInvite", (req) => {
            Logger.log(`errorInvite`);
            ToastViewHandler.renderToast(req.Message, ToastViewHandler.ToastType.ERROR);
        });
        this.connection.on("declineInvite", (req) => {
            Logger.log(`declineInvite`);
            ToastViewHandler.renderToast(req.Message, ToastViewHandler.ToastType.ERROR);
            // reset invite state
            let player = req.Opponent;
            this.viewHandler.renderPlayerInviteDeclined(player.Id);
        });
        // accepted Invite
        this.connection.on("registerGame", (req) => {
            Logger.log(`registerGame`);
            ToastViewHandler.renderToast(req.Message, ToastViewHandler.ToastType.SUCCESS);
        });
        this.connection.on("blockPlayerInvite", (req) => {
            Logger.log(`players started game:`);
            Logger.log(req.Players);
            // this.viewHandler.disablePlayers(req.Players as Playerlist);
        });
        this.connection.onclose(error => {
            Logger.log("Lost connection from PlayerHub " + error);
        });
        // Start Socket Connection
        this.connection.start().then(() => {
            Logger.log("PlayerHub connected. ");
        }, error => { Logger.log(error); });
    }
}
