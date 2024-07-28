using Microsoft.AspNetCore.SignalR;
using PingPong.Server.Game.Logic;
using PingPong.Server.Game.Model;
using PingPong.Server.Hubs;
using PingPong.Server.Hubs.Interfaces;
// using System.Security.Cryptography;

namespace PingPong.Server.Worker
{
    public class GameWorker : BackgroundService
    {
        
        private readonly IHubContext<GameHub, IGameHub> _gameHub;

        public GameWorker(IHubContext<GameHub, IGameHub> gameHub)
        {
            _gameHub = gameHub;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                // await _gameHub.Clients.All.SendAsync("r");
                foreach (var (Key, Value) in PlayerManager.GetIngamePlayer()) {
                    try
                    {
                        NextFrame(Value[0], Value[1]);
                    }
                    catch (Exception e) {
                        PlayerManager.ClearIngamePlayer(Value[0], Value[1]);
                    }
                    
                }
                
                await Task.Delay(1, stoppingToken);
            }
        }

        private async void NextFrame(PlayerModel player1, PlayerModel player2) {
            GameModel newGame;

            // Debug.WriteLine(GameManager.GameIsBlocked(one,two));
            try
            {
                newGame = GameManager.GetGame(
                    player1,
                    player2
                );
                if (GameManager.GameIsBlocked(player1, player2))
                {
                    return;
                }
            }
            catch (Exception ex) {
                return; 
            }

            string[] players = 
            {
                player1.GameHubId,
                player2.GameHubId
            };
            int playermove_1 = GameManager.GetNextPlayerMove(player1);
            int playermove_2 = GameManager.GetNextPlayerMove(player2);
            GameState gameState = GameLogic.NextFrame(ref newGame, playermove_1, playermove_2);
            // Debug.WriteLine(gameState);
            if (gameState == GameState.GAME_RUNNING)
            {
                GameManager.NewBlockTimer(player1, player2);
                await _gameHub.Clients.Clients(players).n( new
                {
                    Game = newGame
                });
            }
            else
            {
                GameManager.EndGame(newGame);
                PlayerModel winner = gameState == GameState.GAME_WINNER_1 ? newGame.Player1 : newGame.Player2;
                await _gameHub.Clients.Clients(players).gameOver(new
                {
                    Game = newGame,
                    Message = $"{winner.Name} won the Game! "
                });
                PlayerManager.ClearIngamePlayer(player1, player2);
            }
        }
    }
}
