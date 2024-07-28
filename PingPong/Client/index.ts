﻿import "./CSS/main.css";

import PlayerHubConnection from "./js/HubConnections/PlayerHubConnection";
import ChatHubConnection from "./js/HubConnections/ChatHubConnection";
import GameHubConnection from "./js/HubConnections/GameHubConnection";

import PlayerViewHandler from "./js/ViewHandler/PlayerViewHandler";
import ChatViewHandler from "./js/ViewHandler/ChatViewHandler";
import GameViewHandler from "./js/ViewHandler/GameViewHandler";


const playerConnection = new PlayerHubConnection();
const chatConnection = new ChatHubConnection();
const gameConnection = new GameHubConnection();

const playerViewHandler = new PlayerViewHandler(playerConnection, gameConnection);
const chatViewHandler = new ChatViewHandler(chatConnection);
const gameViewHandler = new GameViewHandler(playerConnection, gameConnection);

playerConnection.setViewHandler(playerViewHandler);
chatConnection.setViewHandler(chatViewHandler);
gameConnection.setViewHandler(gameViewHandler);


