namespace PingPong.Server.Hubs.Interfaces
{
    // Strongly Typed Interface for GameHub, needed for Background Service?
    public interface IGameHub
    {
        Task RegisterPlayer(string playerid);
        Task StartGame(string playerid1, string playerid2);
        Task R(string player1, string player2);
        Task Move(int move);

        // Client Functions
        Task registeredToGameHub(string conid);

        Task firstFrame(object anon);

        Task n(object anon);

        Task gameOver(object anon);
        // ...
    }
}
