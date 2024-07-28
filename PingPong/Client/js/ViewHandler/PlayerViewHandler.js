import { EventType } from "../Util/EventType";
import Logger from "../Util/Logger";
import ToastViewHandler from "./ToastViewHandler";
export default class PlayerViewHandler {
    initHTMLHandles() {
        // Gather all HTML Elements for Login
        this.divOverlay = document.getElementById("Overlay");
        this.btnLogin = document.getElementById("btnLogin");
        this.inpPlayerName = document.getElementById("inpPlayerName");
        this.divPlayerlist = document.getElementById("Playerlist");
    }
    initEventListener() {
        this.btnLogin.addEventListener(EventType.CLICK, this.login);
    }
    constructor(playerHubConnection, gameHubConnection) {
        this.renderPlayerlist = () => {
            this.divPlayerlist.innerHTML = "";
            for (const [key, player] of Object.entries(this.playerlist)) {
                this.renderNewPlayer(player);
            }
        };
        this.renderNewPlayer = (player) => {
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
            }
            else {
                const div = document.createElement("div");
                div.innerHTML = "(you)";
                p.appendChild(div);
            }
            this.divPlayerlist.appendChild(p);
        };
        this.renderRemovedPlayer = (playerid) => {
            document.querySelector(`.player-item[data-playerid=${playerid}]`).remove();
        };
        this.successToast = (message) => {
            ToastViewHandler.renderToast(message, ToastViewHandler.ToastType.SUCCESS);
        };
        this.renderPlayerInvite = (playeroneid, playertwoid) => {
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
        };
        this.renderPlayerInviteDeclined = (playerid) => {
            this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}]`).classList.remove("received-invite");
            this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}] .accept-btn`).remove();
            this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}] .decline-btn`).remove();
        };
        this.renderPlayerInviteAccepted = (playerid) => {
            this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}]`).classList.remove("received-invite");
            this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}] .accept-btn`).remove();
            this.divPlayerlist.querySelector(`.player-item[data-playerid=${playerid}] .decline-btn`).remove();
        };
        // ? 
        this.initPlayerList = (players, selfPlayer) => {
            this.playerlist = players;
            this.selfPlayer = selfPlayer;
            this.renderPlayerlist();
        };
        this.registerGameHubId = (player) => {
            this.gameHubConnection.registerPlayer(player.Id);
        };
        this.addPlayer = (player) => {
            this.playerlist[player.Id] = player;
            this.renderNewPlayer(player);
        };
        this.removePlayer = (playerId) => {
            delete this.playerlist[playerId];
            this.renderRemovedPlayer(playerId);
        };
        this.disablePlayers = (players) => {
            // TODO
        };
        // Login
        this.login = () => {
            if (this.inpPlayerName.value.length < 1) {
                ToastViewHandler.renderToast("Your Name is invalid! ", ToastViewHandler.ToastType.ERROR);
                return;
            }
            this.playerHubConnection.login(this.inpPlayerName.value).then(() => {
                this.divOverlay.style.display = "none";
                ToastViewHandler.renderToast("Welcome " + this.inpPlayerName.value, ToastViewHandler.ToastType.SUCCESS);
            });
        };
        // sendGameInvite to challenge another player (used with button)
        this.sendGameInvite = (e) => {
            Logger.log("sending game invite");
            let playerid = e.target.dataset.playerid;
            this.playerHubConnection.sendGameInvite(playerid).then(() => {
                Logger.log("invite sent ", playerid);
            });
        };
        this.acceptGameInvite = (e) => {
            Logger.log("accepting game invite");
            let playeroneid = e.target.dataset.playeroneid;
            let playertwoid = e.target.dataset.playertwoid;
            this.playerHubConnection.acceptGameInvite(playeroneid).then(() => {
                Logger.log("invite accepted ", playeroneid);
                this.startGame(playeroneid, playertwoid);
                this.renderPlayerInviteAccepted(playeroneid);
            });
        };
        this.declineGameInvite = (e) => {
            Logger.log("declining game invite");
            let playeroneid = e.target.dataset.playeroneid;
            let playertwoid = e.target.dataset.playertwoid;
            this.playerHubConnection.declineGameInvite(playeroneid).then(() => {
                Logger.log("invite declined ", playeroneid);
                this.renderPlayerInviteDeclined(playeroneid);
            });
        };
        this.startGame = (player1, player2) => {
            Logger.log("gameHubConnection.startGame started");
            this.gameHubConnection.startGame(player1, player2).then(() => {
                Logger.log("gameHubConnection.startGame finished");
            });
        };
        this.initHTMLHandles();
        this.initEventListener();
        this.playerHubConnection = playerHubConnection;
        this.gameHubConnection = gameHubConnection;
    }
}
