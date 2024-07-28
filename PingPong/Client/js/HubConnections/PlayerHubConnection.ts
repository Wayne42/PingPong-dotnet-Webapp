import * as signalR from "@microsoft/signalr";
import * as signalRMsgPack from "@microsoft/signalr-protocol-msgpack";
import { Player, Playerlist } from "../Types/ModelTypes";
import Logger from "../Util/Logger";
import PlayerViewHandler from "../ViewHandler/PlayerViewHandler";
import ToastViewHandler from "../ViewHandler/ToastViewHandler";


export default class PlayerHubConnection {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("hub/playerHub", {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
        })
        .withHubProtocol(new signalRMsgPack.MessagePackHubProtocol())
        .withAutomaticReconnect()
        .build();

    viewHandler: PlayerViewHandler = null;
    setViewHandler = (viewHandler: PlayerViewHandler) => {
        this.viewHandler = viewHandler;
    }
    constructor() {
        // Connect Incoming Socket Paths
        this.connection.on("newPlayer", (req) => {
            Logger.log(`newPlayer:`);
            Logger.log("req", req);
            Logger.log(req.NewPlayer);

            let player = req.NewPlayer as Player;
            this.viewHandler.addPlayer(player);
        });

        this.connection.on("initPlayerList", (req) => {
            Logger.log(`playerList:`);
            Logger.log("req", req);

            let playerlist = req.Players as Playerlist;
            let self = req.Self as Player;

            this.viewHandler.initPlayerList(playerlist, self);
            this.viewHandler.registerGameHubId(self);
        });

        this.connection.on("playerDisconnect", (req) => {
            Logger.log(`playerDisconnect:`);
            Logger.log(req.PlayerId);
            this.viewHandler.removePlayer(req.PlayerId as string);
        });


        this.connection.on("receiveInvite", (req) => {
            Logger.log(`receiveInvite:`, req.Creator, req.Opponent);

            let player1 = req.Creator as Player;
            let player2 = req.Opponent as Player;

            this.viewHandler.successToast(req.Message as string);
            this.viewHandler.renderPlayerInvite(player1.Id, player2.Id);
        });
        this.connection.on("successInvite", (req) => {
            Logger.log(`successInvite`);
            ToastViewHandler.renderToast(req.Message as string, ToastViewHandler.ToastType.SUCCESS);
        });
        this.connection.on("errorInvite", (req) => {
            Logger.log(`errorInvite`);
            ToastViewHandler.renderToast(req.Message as string, ToastViewHandler.ToastType.ERROR);
        });

        this.connection.on("declineInvite", (req) => {
            Logger.log(`declineInvite`);
            ToastViewHandler.renderToast(req.Message as string, ToastViewHandler.ToastType.ERROR);
            // reset invite state
            let player = req.Opponent as Player;
            this.viewHandler.renderPlayerInviteDeclined(player.Id);
        });
        // accepted Invite
        this.connection.on("registerGame", (req) => {
            Logger.log(`registerGame`);
            ToastViewHandler.renderToast(req.Message as string, ToastViewHandler.ToastType.SUCCESS);
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
        this.connection.start().then(
            () => {
                Logger.log("PlayerHub connected. ");
            }, error => { Logger.log(error) }
        );
    }

    // Connect Outgoing Socket Paths
    login = (username: string) => {
        if (username.length < 1) return;
        return this.connection.send("login", username);
    }

    sendGameInvite = (player_two_id: string) => {
        return this.connection.send("sendGameInvite", player_two_id);
    }

    acceptGameInvite = (player_one_id: string) => {
        return this.connection.send("acceptGameInvite", player_one_id);
    }

    declineGameInvite = (player_one_id: string) => {
        return this.connection.send("declineGameInvite", player_one_id);
    }

}
