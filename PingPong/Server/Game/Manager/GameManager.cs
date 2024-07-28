using PingPong.Server.Game.Model;

namespace PingPong.Server.Game.Logic
{
    public static class GameManager
    {
        public static Dictionary<string, GameModel> Games { get; } = new Dictionary<string, GameModel>(); // keep track of active games

        public static Dictionary<string, DateTime> GameFrameBlocker { get; } = new();

        public static Dictionary<string, int> PlayerMoves { get; } = new();

        public static GameModel CreateGame(PlayerModel one, PlayerModel two)
        {
            GameModel newGame = new GameModel(one, two);
            Games.Add(one.Id + two.Id, newGame);
            // newGame.GameId = one.Id + two.Id;

            PlayerMoves[one.GameHubId] = 0;
            PlayerMoves[two.GameHubId] = 0;

            GameLogic.InitGame(ref newGame);

            GameFrameBlocker[one.Id + two.Id] = DateTime.Now;

            return newGame;
        }

        public static GameModel GetGame(PlayerModel one, PlayerModel two)
        {
            var game = Games[one.Id + two.Id];
            if (game == null) throw new Exception("No Game found. ");
            return game;
        }

        public static void NewBlockTimer(PlayerModel one, PlayerModel two)
        {
            GameFrameBlocker[one.Id + two.Id] = DateTime.Now;
        }

        public static bool GameIsBlocked(PlayerModel one, PlayerModel two)
        {
            // Responsible for FPS, 1000/ 15 = 66 FPS or Ticks per Second possible
            const int t = 10;
            try {
                
                return GameFrameBlocker[one.Id + two.Id].AddMilliseconds(t) > DateTime.Now;
            }
            catch(Exception ex)
            {
                GameFrameBlocker[one.Id + two.Id] = DateTime.Now;
                return GameFrameBlocker[one.Id + two.Id].AddMilliseconds(t) > DateTime.Now;
            }
            
        }

        public static GameState NextFrame(ref GameModel game, int player1move, int player2move)
        {
            return GameLogic.NextFrame(ref game, player1move, player2move);
        }

        public static GameModel EndGame(GameModel game)
        {
            if (game == null) throw new Exception("No Game found. ");

            PlayerManager.ClearGame(game);
            Games.Remove(game.GameId);

            return game;
        }

        public static void SetNextPlayerMove(string playerGameHubId, int move)
        {
            // normalize move range to prevent cheating
            if (move > 10)
            {
                move = 10;
            }
            else if (move < -10)
            {
                move = -10;
            }
            PlayerMoves[playerGameHubId] = move;
            // PlayerMoves.TryUpdate(playerId, move, move);
        }
        public static int GetNextPlayerMove(PlayerModel player)
        {
            int move = PlayerMoves[player.GameHubId];
            PlayerMoves[player.GameHubId] = 0;
            return move;
        }
    }
}
