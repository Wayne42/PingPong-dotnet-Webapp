using Microsoft.AspNetCore.SignalR;
using PingPong.Server.Game.Logic;
using PingPong.Server.Game.Model;
using PingPong.Server.Hubs.Interfaces;
using System.Diagnostics;

namespace PingPong.Server.Hubs
{
    public class GameHub : Hub<IGameHub>
    {

        private readonly IHubContext<GameHub> _hubContext;

        public GameHub(IHubContext<GameHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task RegisterPlayer(string playerid)
        {
            PlayerManager.AddGameHubIdToPlayer(Context.ConnectionId, playerid);

            await Clients.Caller.registeredToGameHub(Context.ConnectionId); 
        }
        public async Task StartGame(string player1, string player2)
        {

            Console.WriteLine("c try to start game " + player1 + " " + player2);
            Debug.WriteLine("try to start game", player1, player2);
            PlayerModel one = PlayerManager.GetPlayer(player1);
            PlayerModel two = PlayerManager.GetPlayer(player2);

            PlayerManager.AddIngamePlayer(one, two);

            GameModel newGame = GameManager.CreateGame(
                one,
                two
                );
            Debug.WriteLine(newGame);
            GameState gameState = GameLogic.NextFrame(ref newGame, 0, 0);
            Debug.WriteLine(gameState);
            var players = new List<string>()
             {
                 one.GameHubId,
                 two.GameHubId
             };
            await Clients.Clients(players).firstFrame(new
            {
                Game = newGame,
                Player1 = one.Id,
                Player2 = two.Id
            });
        }


        public async Task Move(int move)
        {
            // Debug.WriteLine("Received Move " + move);
            await Task.Run(() => GameManager.SetNextPlayerMove(Context.ConnectionId, move));
        }
    }
}



