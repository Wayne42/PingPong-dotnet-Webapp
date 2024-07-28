import PlayerHubConnection from "../HubConnections/PlayerHubConnection";
import GameHubConnection from "../HubConnections/GameHubConnection";
import { Game, Player } from "../Types/ModelTypes";
import { EventType } from "../Util/EventType";
import Logger from "../Util/Logger";


// renders pingpong game and handles player control (up and down)
// needs playerHub to notify players when the game starts/ends?
export default class GameViewHandler {
    canvasGame: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    playerCreator: HTMLDivElement;
    playerOpponent: HTMLDivElement;
    initHTMLHandles() {
        // Gather all HTML Elements for Login
        this.canvasGame = document.getElementById("GameCanvas") as HTMLCanvasElement;
        this.canvasContext = this.canvasGame.getContext("2d");

        this.playerCreator = document.getElementById("PlayerCreator") as HTMLDivElement;
        this.playerOpponent = document.getElementById("PlayerOpponent") as HTMLDivElement;
    }

    gameRunning: boolean = false;

    upSticky: boolean;
    downSticky: boolean;
    upInterval;
    downInterval;
    initEventListener() {
        /*document.addEventListener(EventType.KEYPRESS, (event) => {
            // detect up "w"
            if (event.keyCode === 119) {
                this.movePlayer(-10);
            } else if (event.keyCode === 115) { // detect down "s"
                this.movePlayer(10);
            }
        });*/
        document.addEventListener(EventType.KEYDOWN, (event) => {
            // detect up "w"
            const delay = 60;
            const distance = 10;
            const w_key_code = 87;
            const s_key_code = 83;  
            if (!this.gameRunning) return;
            if (event.keyCode === w_key_code) {
                if (!this.upSticky) {
                    this.upSticky = true;
                    this.upInterval = setInterval(() => {
                        this.movePlayer(-distance);
                    }, delay);
                }
            } else if (event.keyCode === s_key_code) { // detect down "s"
                if (!this.downSticky) {
                    this.downSticky = true;
                    this.downInterval = setInterval(() => {
                        this.movePlayer(distance);
                    }, delay);
                }
            }
        });
        document.addEventListener(EventType.KEYUP, (event) => {
            // detect up "w"
            if (event.keyCode === 87) {
                this.upSticky = false;
                clearInterval(this.upInterval);
            } else if (event.keyCode === 83) { // detect down "s"
                this.downSticky = false;
                clearInterval(this.downInterval);
            }
        });
        document.getElementById("moveUp").addEventListener(EventType.MOUSEDOWN, (event) => {
            this.movePlayer(-10);
        });
        document.getElementById("moveDown").addEventListener(EventType.MOUSEDOWN, (event) => {
            this.movePlayer(10);
        });
    }

    playerHubConnection: PlayerHubConnection;
    gameHubConnection: GameHubConnection;
    constructor(playerHubConnection: PlayerHubConnection, gameHubConnection: GameHubConnection) {
        this.initHTMLHandles();
        this.initEventListener();

        this.playerHubConnection = playerHubConnection;
        this.gameHubConnection = gameHubConnection;
    }

    // Event Queue
    previousGameState: Game;
    bGameStates: Game[];
    zFrameCount: number = 3;

    // shim layer with setTimeout fallback 
    // requestAnimFrame = (function () { return window.requestAnimationFrame ||  function (callback) { window.setTimeout(callback, 1000 / 60); }; })(); 

    // Render Functions
    renderFrame = (game: Game) => {

        window.requestAnimationFrame(() => this._renderGameState(game));

        /*
        setTimeout(() => {
            this.canvasContext.fillStyle = "rgba(0,0,0,0.1)";
            this.canvasContext.fillRect(0, 0, this.canvasGame.width, this.canvasGame.height);
        }, 10);
        setTimeout(() => {
            this.canvasContext.fillStyle = "rgba(0,0,0,0.4)";
            this.canvasContext.fillRect(0, 0, this.canvasGame.width, this.canvasGame.height);
        }, 20);
        setTimeout(() => {
            this.canvasContext.fillStyle = "rgba(0,0,0,1)";
            this.canvasContext.fillRect(0, 0, this.canvasGame.width, this.canvasGame.height);
        }, 30);
        setTimeout(() => {
            window.requestAnimationFrame(() => this._renderGameState(game));
        }, 40);
        */
    }

    _zGameState = (game1: Game, game2: Game, steps: number, cstep: number): Game => {
        let bPosX = this._zPos(game1.GameBall.PositionX, game2.GameBall.PositionX, steps, cstep);
        let bPosY = this._zPos(game1.GameBall.PositionY, game2.GameBall.PositionY, steps, cstep);

        let p1PosX = this._zPos(game1.Player1.PositionX, game2.Player1.PositionX, steps, cstep);
        let p1PosY = this._zPos(game1.Player1.PositionY, game2.Player1.PositionY, steps, cstep);

        let p2PosX = this._zPos(game1.Player2.PositionX, game2.Player2.PositionX, steps, cstep);
        let p2PosY = this._zPos(game1.Player2.PositionY, game2.Player2.PositionY, steps, cstep);


        return game2;
    }

    _zPos = (a: number, b: number, steps: number, cstep : number): number => {
        let distance = b - a;
        let stepdistance = distance / steps;
        return a + (cstep * stepdistance);
    }

    _renderGameState = (game: Game) => {
        this.clearCanvas();
        this.canvasContext.fillStyle = "#FFFFFF";
        this.canvasContext.fillRect(game.GameBall.PositionX, game.GameBall.PositionY, game.GameBall.Width, game.GameBall.Height);
        this.canvasContext.fillRect(game.Player1.PositionX, game.Player1.PositionY, game.Player1.Width, game.Player1.Height);
        this.canvasContext.fillRect(game.Player2.PositionX, game.Player2.PositionY, game.Player2.Width, game.Player2.Height);
    }

    clearCanvas = () => {
        this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
        /*this.canvasContext.fillStyle = "#000000";
        this.canvasContext.fillRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);*/
    }

    renderPlayerNames = (name1: string, name2: string) => {
        this.playerCreator.innerHTML = name1;
        this.playerOpponent.innerHTML = name2;
    }

    // helper functions

    gameStarted = () => {
        this.gameRunning = true;
        document.body.classList.add("game-playing");
    }

    gameEnded = () => {
        this.gameRunning = false;
        document.body.classList.remove("game-playing");
    }

    // outgoing connections 
    movePlayer(move: number) {
        this.gameHubConnection.movePlayer(move);
    }

}


