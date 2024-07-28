using MessagePack;

namespace PingPong.Server.Game.Model
{
    [MessagePackObject(keyAsPropertyName: true)]
    public class BallModel
    {
        public float PositionX { get; set; } = 0;

        public float PositionY { get; set; } = 0;

        public int Width { get; set; } = 10;

        public int Height { get; set; } = 10;

        [IgnoreMember]
        public float Speed { get; set; } = 1f;

        [IgnoreMember]
        public float SpeedIncrement { get; set; } = 0.4f;
        [IgnoreMember]
        public float MaxSpeed { get; set; } = 12f;
        [IgnoreMember]
        public float DirectionX { get; set; } = 0f;
        [IgnoreMember]
        public float DirectionY { get; set; } = 0f;
    }

}
