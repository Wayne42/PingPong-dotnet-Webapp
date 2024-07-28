using PingPong.Server.Game.Model;

namespace PingPong.Server.Game.Logic
{
    public enum GameState
    {
        GAME_RUNNING = 0,
        GAME_WINNER_1 = 1,
        GAME_WINNER_2 = 2,
    }
    public static class GameLogic
    {
        static Random rndDbl = new Random();
        static Random rndInt = new Random();

        public static void InitGame(ref GameModel game)
        {
            game.Player1.PositionX = 0;
            game.Player2.PositionX = game.GameField.Width - game.Player2.Width;

            game.Player1.PositionY = game.GameField.Height / 2;
            game.Player2.PositionY = game.GameField.Height / 2;

            game.GameBall.PositionX = game.GameField.Width / 2;
            game.GameBall.PositionY = game.GameField.Height / 2;


            float x = GetNonZeroRandomFloat();
            float y = 1 - x;

            int dir = rndInt.Next(0, 2);
            dir = dir == 0 ? -1 : 1;
            game.GameBall.DirectionY = y * dir;

            dir = rndInt.Next(0, 2);
            dir = dir == 0 ? -1 : 1;
            game.GameBall.DirectionX = x * dir;

            game.GameBall.Speed = 3.2f;
        }

        public static float GetNonZeroRandomFloat()
        {
            float f = (float)rndDbl.NextDouble();
            return f <= 0.5f ? 0.75f : f;

        }

        public static GameState NextFrame(ref GameModel game, int player1move, int player2move)
        {
            // Update Player
            UpdatePlayerPosition(ref game, player1move, player2move);

            // Update Ball and return GameState (did someone win? )
            return UpdateBallPosition(ref game);
        }

        public static void UpdatePlayerPosition(ref GameModel game, int player1move, int player2move)
        {
            game.Player1.PositionY += player1move;
            if (game.Player1.PositionY < 0)
            {
                game.Player1.PositionY = 0;
            }
            else if (game.Player1.PositionY + game.Player1.Height > game.GameField.Height)
            {
                game.Player1.PositionY = game.GameField.Height - game.Player1.Height;
            }

            game.Player2.PositionY += player2move;
            if (game.Player2.PositionY < 0)
            {
                game.Player2.PositionY = 0;
            }
            else if (game.Player2.PositionY + game.Player2.Height > game.GameField.Height)
            {
                game.Player2.PositionY = game.GameField.Height - game.Player2.Height;
            }
        }

        public static void InvertBallDirectionY(ref GameModel game)
        {
            if (game.GameBall.DirectionY < 0)
            {
                game.GameBall.DirectionY = 1 * GetNonZeroRandomFloat();
            }
            else
            {
                game.GameBall.DirectionY = -1 * GetNonZeroRandomFloat();
            }
        }

        public static void InvertBallDirectionX(ref GameModel game)
        {
            if (game.GameBall.DirectionX < 0)
            {
                game.GameBall.DirectionX = 1 * GetNonZeroRandomFloat();
            }
            else
            {
                game.GameBall.DirectionX = -1 * GetNonZeroRandomFloat();
            }
        }

        public static GameState UpdateBallPosition(ref GameModel game)
        {
            // Update Ball
            game.GameBall.PositionX += game.GameBall.DirectionX * game.GameBall.Speed;
            game.GameBall.PositionY += game.GameBall.DirectionY * game.GameBall.Speed;

            if (game.GameBall.PositionY < 0)
            {
                game.GameBall.PositionY = 0;
                InvertBallDirectionY(ref game);
            }
            else if (game.GameBall.PositionY + game.GameBall.Height > game.GameField.Height)
            {
                game.GameBall.PositionY = game.GameField.Height - game.GameBall.Height;
                InvertBallDirectionY(ref game);
            }



            // check if someone won
            GameState newState = GameState.GAME_RUNNING;

            bool touched = UpdateBallDirectionIfTouchedPlayer(ref game);
            if (!touched)
            {
                if (game.GameBall.PositionX < 0)
                {
                    game.GameBall.PositionX = 0;
                    newState = GameState.GAME_WINNER_2;
                }
                else if (game.GameBall.PositionX + game.GameBall.Width > game.GameField.Width)
                {
                    game.GameBall.PositionX = game.GameField.Width - game.GameBall.Width;
                    newState = GameState.GAME_WINNER_1;
                }
            }


            return newState;
        }

        public static bool UpdateBallDirectionIfTouchedPlayer(ref GameModel game)
        {
            // Check if Player 1 collided with Ball
            bool touched1 = CheckCollision(game.GameBall, game.Player1);
            bool touched2 = false;
            // If Player 1 didn't collide, check if Player 2 collided with Ball
            if (!touched1)
            {
                touched2 = CheckCollision(game.GameBall, game.Player2);
            }

            // If any Player collided with Ball, change Ball direction
            if (touched1 || touched2)
            {
                InvertBallDirectionX(ref game);
                // Update Ball Speed
                if (game.GameBall.Speed < game.GameBall.MaxSpeed)
                {
                    game.GameBall.Speed += game.GameBall.SpeedIncrement;
                }
                // Change Position so there won't be multiple Collisions at once
                game.GameBall.PositionX = touched1 ? 0 + game.Player1.Width + 1 : game.GameBall.PositionX;
                game.GameBall.PositionX = touched2 ? game.GameField.Width - game.Player2.Width - game.GameBall.Width - 1 : game.GameBall.PositionX;
            }

            return touched1 || touched2;
        }


        public static bool CheckCollision(BallModel ball, PlayerModel player)
        {
            return LL_CheckCollision(
                    ball.PositionX, ball.PositionY, ball.Width, ball.Height,
                    player.PositionX, player.PositionY, player.Width, player.Height
                );
        }

        // Basic Collision Detection
        public static bool LL_CheckCollision(float rect1x, float rect1y, float rect1w, float rect1h,
                                          float rect2x, float rect2y, float rect2w, float rect2h)
        {
            if (rect1x < rect2x + rect2w &&
                rect1x + rect1w > rect2x &&
                rect1y < rect2y + rect2h &&
                rect1h + rect1y > rect2y
                )
            {
                return true;
            }
            return false;
        }
    }
}
