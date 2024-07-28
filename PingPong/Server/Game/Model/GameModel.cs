using MessagePack;

namespace PingPong.Server.Game.Model
{
    [MessagePackObject(keyAsPropertyName: true)]
    public class GameModel
    {

        public string GameId { get; set; }

        public PlayerModel Player1 { get; set; }

        public PlayerModel Player2 { get; set; }

        [IgnoreMember]
        public FieldModel GameField { get; set; }

        public BallModel GameBall { get; set; }

        public GameModel(PlayerModel Player1, PlayerModel Player2) // dont change parameter names messagepack needs those
        {
            this.GameId = Player1.Id + Player2.Id;

            this.Player1 = Player1;
            this.Player2 = Player2;

            this.GameField = new FieldModel();
            this.GameBall = new BallModel();
        }
    }
}
