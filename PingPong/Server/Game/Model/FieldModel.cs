using MessagePack;

namespace PingPong.Server.Game.Model
{
    [MessagePackObject(keyAsPropertyName: true)]
    public class FieldModel
    {
        public int Width { get; set; } = 500;

        public int Height { get; set; } = 300;
    }
}
