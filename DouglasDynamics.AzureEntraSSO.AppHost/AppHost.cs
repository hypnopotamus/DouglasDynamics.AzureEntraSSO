var builder = DistributedApplication.CreateBuilder(args);

var be1 = builder.AddProject<Projects.BackEndOne>("backendone");
var be2 = builder.AddProject<Projects.BackEndTwo>("backendtwo")
    .WithReference(be1);
var bff = builder.AddProject<Projects.BackEndForFrontend>("backendforfrontend")
    .WaitFor(be1)
    .WaitFor(be2)
    .WithReference(be1)
    .WithReference(be2);

var ui = builder.AddViteApp
    (
        "frontend",
        Path.GetDirectoryName(new Projects.frontend().ProjectPath) ?? throw new InvalidOperationException()
    )
    .WaitFor(bff)
    .WithReference(bff, "api");

builder.Build().Run();