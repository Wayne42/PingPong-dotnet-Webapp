using MessagePack;

namespace PingPong.Server.Game.Model
{
    [MessagePackObject(keyAsPropertyName: true)]
    public class PlayerModel
    {
        public string Id { get; set; }

        public string GameHubId { get; set; } = "not set";

        public string Name { get; set; } = "Anon";

        public int Width { get; set; } = 12; // 10 Pixel

        public int Height { get; set; } = 70; // 70 Pixel
        public float PositionX { get; set; } = 0;

        public float PositionY { get; set; } = 0;

        // public GameModel? CurrentGame { get; set; }

        public PlayerModel(string name, string id)
        {
            this.Name = name;
            this.Id = id;
        }
    }
}
