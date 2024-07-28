using PingPong.Server.Hubs;
using PingPong.Server.Worker;

// Create Builder
var WebAppOptions = new WebApplicationOptions
{
    Args = args,
    // ApplicationName = typeof(Program).Assembly.FullName,
    ContentRootPath = Directory.GetCurrentDirectory(),
    // EnvironmentName = Environments.Staging,
    WebRootPath = "wwwroot"
};

var builder = WebApplication.CreateBuilder(WebAppOptions);

// builder.WebHost.UseWebRoot("Client");
Console.WriteLine($"Application Name: {builder.Environment.ApplicationName}");
Console.WriteLine($"Environment Name: {builder.Environment.EnvironmentName}");
Console.WriteLine($"ContentRoot Path: {builder.Environment.ContentRootPath}");
Console.WriteLine($"WebRootPath: {builder.Environment.WebRootPath}");


// Add Services
builder.Services.AddSignalR().AddMessagePackProtocol(options =>
{
    // options.SerializerOptions.WithCompression(MessagePack.MessagePackCompression.Lz4BlockArray);
});

builder.Services.Configure<HostOptions>(hostOptions =>
{
    hostOptions.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
}); // Necessary for Background Threading (Sending Frames)

builder.Services.AddHostedService<GameWorker>(); // Necessary for Background Threading (Sending Frames)

// Prepare Configuration
bool isDevelopment = builder.Environment.IsDevelopment();
// builder.Environment.IsStaging()
// builder.Environment.IsProduction()

String cacheMaxAge;
if (isDevelopment)
{
    cacheMaxAge = (0).ToString();
    Console.WriteLine("System Dev");
}
else {
    cacheMaxAge = (60 * 60 * 24 * 7).ToString();
    Console.WriteLine("System Prod");
}
/*
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins,
                          policy =>
                          {
                              policy.WithOrigins("http://vr-ferhat.eu",
                                                  "http://www.vr-ferhat.eu",
                                                  "localhost:5000",
                                                  "http://localhost:5000",
                                                  "https://vr-ferhat.eu",
                                                  "https://www.vr-ferhat.eu",
                                                  "wss://vr-ferhat.eu"
                                                  )
                                                  .AllowAnyHeader()
                                                  .AllowAnyMethod()
                                                  .AllowCredentials();
                          });
});
*/
// create App with Configuration, Init Client wwwroot Files
var app = builder.Build();

// app.UseCors(MyAllowSpecificOrigins);

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append(
                "Cache-Control", $"public, max-age={cacheMaxAge}");
    }
});

// Map Hubs (Sockets)
app.MapHub<ChatHub>("/pingpong/hub/chatHub");
app.MapHub<PlayerHub>("/pingpong/hub/playerHub");
app.MapHub<GameHub>("/pingpong/hub/gameHub");



app.Run();
/*
if (!isDevelopment)
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

 app.UseHttpsRedirection();
 */