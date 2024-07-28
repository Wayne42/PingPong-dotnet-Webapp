using Microsoft.AspNetCore.SignalR;
using PingPong.Server.Game.Logic;
using PingPong.Server.Game.Model;

namespace PingPong.Server.Hubs
{
    public class PlayerHub : Hub
    {
        public async Task Login(string name)
        {
            if (name.Length < 1) return;
            string player_id = Context.ConnectionId; // Create new Player with new Socket User Connection ID
            PlayerModel newPlayer = PlayerManager.CreateAndLoginPlayer(name, player_id);

            await Clients.All.SendAsync("newPlayer", new
            {
                NewPlayer = newPlayer
            });
            await Clients.Caller.SendAsync("initPlayerList", new
            {
                Players = PlayerManager.GetAllPlayer(),
                Self = newPlayer
            });
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            PlayerManager.LogoutPlayer(Context.ConnectionId);
            await Clients.All.SendAsync("playerDisconnect", new
            {
                PlayerId = Context.ConnectionId
            });
            // await base.OnDisconnectedAsync(exception);
        }

        public async Task SendGameInvite(string player_two_id)
        {   // Player 1 sends Game Invite to Player 2
            var player_one_id = Context.ConnectionId;
            var player1 = PlayerManager.GetPlayer(player_one_id);
            var player2 = PlayerManager.GetPlayer(player_two_id);

            bool success = PlayerManager.CreateInvite(player_one_id, player_two_id);

            if (success)
            {
                // notify the Game Inviter (Player 1)
                await Clients.Client(player_one_id).SendAsync("successInvite", new
                {
                    Creator = player1,
                    Opponent = player2,
                    Message = $"Successfully invited {player2.Name}({player_one_id}) to a Game of PingPong. "
                });
                // send invite to possible Player 2
                await Clients.Client(player_two_id).SendAsync("receiveInvite", new
                {
                    Creator = player1,
                    Opponent = player2,
                    Message = $"You have been invited to a Game of PingPong from {player1.Name}({player_one_id}). "
                });
            }
            else
            {
                await Clients.Client(player_one_id).SendAsync("errorInvite", new
                {
                    Creator = player1,
                    Opponent = player2,
                    Message = $"Could not invite player. "
                });
            }

        }

        public async Task AcceptGameInvite(string player_one_id)
        {   // Player 2 accepts Game Invite from Player 1
            var player_two_id = Context.ConnectionId;
            var player1 = PlayerManager.GetPlayer(player_one_id);
            var player2 = PlayerManager.GetPlayer(player_two_id);

            bool success = PlayerManager.AcceptInvite(player_one_id, player_two_id);

            if (success)
            {
                /*await Clients.Client(player_one_id).SendAsync("successInvite", new
                {
                    Creator = player1,
                    Opponent = player2,
                    Message = $"Player {player2.Name} accepted your Game Invite! "
                });*/

                await Clients.Client(player_one_id).SendAsync("registerGame", new
                {
                    Creator = player1,
                    Opponent = player2,
                    Message = $"Player {player2.Name} accepted your Game Invite! Game begins now! "
                });
                await Clients.Client(player_two_id).SendAsync("registerGame", new
                {
                    Creator = player1,
                    Opponent = player2,
                    Message = $"Game with {player1.Name} begins now! "
                });
                await Clients.All.SendAsync("blockPlayerInvite", new
                {
                    Players = new[] { player1, player2 }
                });
            }
            else
            {
                await Clients.Client(player_one_id).SendAsync("errorInvite", new
                {
                    Creator = player1,
                    Opponent = player2,
                    Message = $"Game Invite failed. "
                });
            }

        }

        public async Task DeclineGameInvite(string player_one_id)
        {   // Player 2 declines Game Invite from Player 1
            var player_two_id = Context.ConnectionId;
            var player1 = PlayerManager.GetPlayer(player_one_id);
            var player2 = PlayerManager.GetPlayer(player_two_id);

            bool success = PlayerManager.DeclineInvite(player_one_id, player_two_id);

            await Clients.Client(player_one_id).SendAsync("declineInvite", new
            {
                Creator = player1,
                Opponent = player2,
                Message = $"{player2.Name} declined your invite :("
            });
        }

    }
}



