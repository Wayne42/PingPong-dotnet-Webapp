import GameHubConnection from "../HubConnections/GameHubConnection";
import PlayerHubConnection from "../HubConnections/PlayerHubConnection";
import { Player, Playerlist } from "../Types/ModelTypes";
import { EventType } from "../Util/EventType";
import Logger from "../Util/Logger";
import ToastViewHandler from "./ToastViewHandler";



export default class PlayerViewHandler {

    divOverlay: HTMLDivElement;
    btnLogin: HTMLButtonElement;
    inpPlayerName: HTMLInputElement;
    divPlayerlist: HTMLDivElement;
    initHTMLHandles() {
        // Gather all HTML Elements for Login
        this.divOverlay = document.getElementById("Overlay") as HTMLDivElement;
        this.btnLogin = document.getElementById("btnLogin") as HTMLButtonElement;
        this.inpPlayerName = document.getElementById("inpPlayerName") as HTMLInputElement;

        this.divPlayerlist = document.getElementById("Playerlist") as HTMLDivElement;
    }

    initEventListener() {
        this.btnLogin.addEventListener(EventType.CLICK, this.login);
    }

    playerHubConnection: PlayerHubConnection;
    gameHubConnection: GameHubConnection;
    constructor(playerHubConnection: PlayerHubConnection, gameHubConnection: GameHubConnection) {
        this.initHTMLHandles();
        this.initEventListener();

        this.playerHubConnection = playerHubConnection;
        this.gameHubConnection = gameHubConnection;
    }

    // Render Functions

    playerlist: Playerlist;
    selfPlayer: Player;
    renderPlayerlist = () => {
        this.divPlayerlist.innerHTML = "";
        for (const [key, player] of Object.entries(this.playerlist)) {
            this.renderNewPlayer(player);
        }
    }

    renderNewPlayer = (player: Player) => {
        const p = document.createElement("div");
        p.classList.add("player-item");
        p.dataset.playerid = player.Id;
        p.dataset.playergamehubid = player.GameHubId;
        p.dataset.playername = player.Name;

        p.innerHTML = `<div class="player" data-id="${player.Id}">${player.Name}</div>`;

        if (player.Id != this.selfPlayer.Id) {
            const btn = document.createElement("button");
            btn.innerHTML = "Invite";
            btn.classList.add("invite-btn");
            btn.dataset.playerid = player.Id;
            btn.addEventListener(EventType.CLICK, this.sendGameInvite);
            p.appendChild(btn);
        } else {
            const div = document.createElement("div");
            div.innerHTML = "(you)";
            p.appendChild(div);
        }
        this.divPlayerlist.appendChild(p);
    }

    renderRemovedPlayer = (playerid: string) => {
        document.querySelector(`.player-item[data-playerid=${playerid}]`).remove();
    }

    successToast = (message: string) => {
        ToastViewHandler.renderToast(message, ToastViewHandler.ToastType.SUCCESS);
    }

    renderPlayerInvite = (playeroneid: string, playertwoid: string) => {
        // accept button
        let btn = document.createElement("button");
        btn.innerHTML = "Accept Invite";
        btn.dataset.playeroneid = playeroneid;
        btn.dataset.playertwoid = playertwoid;
        btn.addEventListener(EventType.CLICK, this.acceptGameInvite);
        btn.classList.add("accept-btn");
        this.divPlayerlist.querySelector(`.player-item[data-playerid=${playeroneid}]`).appendChild(btn);

        // decline button
        btn = document.createElement("button");
        btn.innerHTML = "Decline Invite";
        btn.dataset.playeroneid = playeroneid;
        btn.dataset.playertwoid = playertwoid;
        btn.addEventListener(EventType.CLICK, this.declineGameInvite);
        btn.classList.add("decline-btn");
        this.divPlayerlist.querySelector(`.player-item[data-playerid=${playeroneid}]`).appendChild(btn);

        this.divPlayerlist.querySelector(`.player-item[data-playerid=${playeroneid}]`).classList.add("received-invite");
    }

    renderPlayerInviteDeclined = (playerid: string) => {
        this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}]`).classList.remove("received-invite");
        this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}] .accept-btn`).remove();
        this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}] .decline-btn`).remove();
    }

    renderPlayerInviteAccepted = (playerid: string) => {
        this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}]`).classList.remove("received-invite");
        this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}] .accept-btn`).remove();
        this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}] .decline-btn`).remove();
    }

    // ? 
    initPlayerList = (players: Playerlist, selfPlayer: Player) => {
        this.playerlist = players;
        this.selfPlayer = selfPlayer;
        this.renderPlayerlist();
    }
    registerGameHubId = (player: Player) => {
        this.gameHubConnection.registerPlayer(player.Id);
    }
    addPlayer = (player: Player) => {
        this.playerlist[player.Id] = player;
        this.renderNewPlayer(player);
    }
    removePlayer = (playerId: string) => {
        delete this.playerlist[playerId];
        this.renderRemovedPlayer(playerId);
    }
    disablePlayers = (players: Player[]) => {
        // TODO
    }

    // Login
    login = () => {
        if (this.inpPlayerName.value.length < 1) {
            ToastViewHandler.renderToast("Your Name is invalid! ", ToastViewHandler.ToastType.ERROR);
            return;
        }


        this.playerHubConnection.login(this.inpPlayerName.value).then(() => {
            this.divOverlay.style.display = "none";
            ToastViewHandler.renderToast("Welcome " + this.inpPlayerName.value, ToastViewHandler.ToastType.SUCCESS);
        });
    }

    // sendGameInvite to challenge another player (used with button)
    sendGameInvite = (e: Event) => {
        Logger.log("sending game invite");
        let playerid = (e.target as HTMLButtonElement).dataset.playerid;
        
        this.playerHubConnection.sendGameInvite(playerid).then(() => {
            Logger.log("invite sent ", playerid);
        });
    }

    acceptGameInvite = (e: Event) => {
        Logger.log("accepting game invite");
        let playeroneid = (e.target as HTMLButtonElement).dataset.playeroneid;
        let playertwoid = (e.target as HTMLButtonElement).dataset.playertwoid;
        this.playerHubConnection.acceptGameInvite(playeroneid).then(() => {
            Logger.log("invite accepted ", playeroneid);
            this.startGame(playeroneid, playertwoid);
            this.renderPlayerInviteAccepted(playeroneid);
        });

        
    }

    declineGameInvite = (e: Event) => {
        Logger.log("declining game invite");
        let playeroneid = (e.target as HTMLButtonElement).dataset.playeroneid;
        let playertwoid = (e.target as HTMLButtonElement).dataset.playertwoid;
        this.playerHubConnection.declineGameInvite(playeroneid).then(() => {
            Logger.log("invite declined ", playeroneid);
            this.renderPlayerInviteDeclined(playeroneid);
        });
    }

    startGame = (player1: string, player2: string) => {
        Logger.log("gameHubConnection.startGame started");
        this.gameHubConnection.startGame(player1, player2).then(() => {
            Logger.log("gameHubConnection.startGame finished");
        });
    }

    

}


