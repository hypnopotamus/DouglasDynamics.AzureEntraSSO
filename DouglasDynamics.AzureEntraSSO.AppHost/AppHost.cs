var builder = DistributedApplication.CreateBuilder(args);

var db = builder.AddSqlServer("db")
    .WithEndpoint("tcp", tcp =>
    {
        tcp.IsProxied = false;
        tcp.Port = 1433;
        tcp.UriScheme = "tcp";
    })
    .WithDataVolume()
    .WithLifetime(ContainerLifetime.Persistent);
var db1 = db.AddDatabase("db1");

var tools = builder.AddExecutable(
    "tools",
    "dotnet",
    "..",
    "tool", "restore"
);
var migration = builder.AddExecutable(
        "backendone-migration",
        "dotnet",
        Path.GetDirectoryName(new Projects.BackEndOne().ProjectPath) ?? throw new InvalidOperationException(),
        "ef", "database", "update", "--no-build"
    )
    .WaitForCompletion(tools)
    .WaitFor(db1)
    .WithReference(db1)
    .WithArgs(context =>
    {
        context.Resource.TryGetAnnotationsOfType<ResourceRelationshipAnnotation>(out var references);
        var dbReference = (IResourceWithConnectionString)(references ?? [])
            .Single(r => r is { Type: "Reference", Resource: IResourceWithConnectionString { Name: "db1" } })
            .Resource;

        context.Args.Add("--connection");
        context.Args.Add(dbReference.ConnectionStringExpression);
    });

var be1 = builder.AddProject<Projects.BackEndOne>("backendone")
    .WaitForCompletion(migration)
    .WaitFor(db1)
    .WithReference(db1, "DbConnection");
var be2 = builder.AddProject<Projects.BackEndTwo>("backendtwo")
    .WithReference(be1);
var be3 = builder.AddProject<Projects.BackEndThree>("backendthree");
var bff = builder.AddProject<Projects.BackEndForFrontend>("backendforfrontend")
    .WithReference(be1)
    .WithReference(be2)
    .WithReference(be3);

builder.AddViteApp
    (
        "frontend",
        Path.GetDirectoryName(new Projects.frontend().ProjectPath) ?? throw new InvalidOperationException(),
        "start"
    )
    .WithEndpoint("http", http =>
    {
        http.Port = 64634;
        http.UriScheme = "http";
    })
    .WithReference(bff, "api");
builder.AddViteApp
    (
        "dicefrontend",
        Path.GetDirectoryName(new Projects.dicefrontend().ProjectPath) ?? throw new InvalidOperationException()
    )
    .WithEndpoint("http", http =>
    {
        http.Port = 64635;
        http.UriScheme = "http";
    })
    .WithReference(bff, "api");

builder.Build().Run();