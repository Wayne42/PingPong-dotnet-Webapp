export interface Player {
    Id: string;
    GameHubId: string;
    Name: string;
    Width: number;
    Height: number;
    PositionX: number;
    PositionY: number;
}

export interface Playerlist { [key: string]: Player }

export interface Ball {
    PositionX: number;
    PositionY: number;
    Width: number;
    Height: number;
    Speed: number;
    MaxSpeed: number;
    DirectionX: number;
    DirectionY: number;
}

export interface Field {
    Width: number;
    Height: number;
}

export interface Game {
    Id: number;
    GameId: string;
    Player1: Player;
    Player2: Player;
    GameField: Field;
    GameBall: Ball;
}