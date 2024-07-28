using PingPong.Server.Game.Model;

namespace PingPong.Server.Game.Logic
{

    public static class PlayerManager
    {
        public enum InviteState
        {
            INVITED,
            DECLINED,
            ACCEPTED,
            PLAYING
        }

        public static Dictionary<string, PlayerModel> Players { get; } = new(); // keep track of players

        public static Dictionary<string, PlayerModel[]> IngamePlayer { get; } = new(); // keep track of ingame players

        public static Dictionary<string, InviteState> Invitelist { get; } = new();
        public static PlayerModel CreateAndLoginPlayer(string name, string id)
        {
            var Player = new PlayerModel(name, id);
            Players.Add(id, Player);

            return Player;
        }

        public static void LogoutPlayer(string id)
        {
            Players.Remove(id);
        }

        public static PlayerModel GetPlayer(string id)
        {
            return Players[id];
        }

        public static bool CreateInvite(string player_one_id, string player_two_id)
        {
            string invId = player_one_id + player_two_id;
            bool status = !Invitelist.ContainsKey(invId);
            if (status)
            {
                Invitelist[invId] = InviteState.INVITED;
            }
            return status;
        }

        public static bool AcceptInvite(string player_one_id, string player_two_id)
        {
            string invId = player_one_id + player_two_id;
            bool status = Invitelist.ContainsKey(invId) && Invitelist[invId] != InviteState.PLAYING;
            if (status && Invitelist[invId] == InviteState.INVITED)
            {
                Invitelist[invId] = InviteState.ACCEPTED;
            }
            return status;
        }

        public static bool DeclineInvite(string player_one_id, string player_two_id)
        {
            string invId = player_one_id + player_two_id;
            bool status = Invitelist.ContainsKey(invId);
            if (status && Invitelist[invId] == InviteState.INVITED)
            {
                // Invitelist[invId] = InviteState.DECLINED;
                Invitelist.Remove(invId);
            }
            return status;
        }

        public static Dictionary<String, PlayerModel> GetAllPlayer()
        {
            return Players;
        }

        public static Dictionary<String, PlayerModel[]> GetIngamePlayer()
        {
            return IngamePlayer;
        }

        public static void AddIngamePlayer(PlayerModel player1, PlayerModel player2) {
            PlayerModel[] ps = { player1, player2 };
            IngamePlayer.Add( (player1.Id + player2.Id) , ps);
        }

        public static void ClearIngamePlayer(PlayerModel player1, PlayerModel player2) {
            IngamePlayer.Remove(player1.Id + player2.Id);
        }

        public static void RegisterGame(GameModel game)
        {
            try
            {
                Invitelist[game.Player1.Id + game.Player2.Id] = InviteState.PLAYING;
            }
            catch (KeyNotFoundException E)
            {
            }
        }

        public static void ClearGame(GameModel game)
        {
            try
            {
                Invitelist.Remove(game.Player1.Id + game.Player2.Id);
            }
            catch (KeyNotFoundException E)
            {
            }
        }

        // Necessary to communicate with GameHub
        public static void AddGameHubIdToPlayer(string gamehubid, string playerid)
        {
            Players[playerid].GameHubId = gamehubid;
        }
    }
}
