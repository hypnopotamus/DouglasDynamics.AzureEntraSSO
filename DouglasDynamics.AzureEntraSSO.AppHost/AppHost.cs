var builder = DistributedApplication.CreateBuilder(args);

var be1 = builder.AddProject<Projects.BackEndOne>("backendone");
var be2 = builder.AddProject<Projects.BackEndTwo>("backendtwo")
    .WithReference(be1);
var be3 = builder.AddProject<Projects.BackEndThree>("backendthree");
var bff = builder.AddProject<Projects.BackEndForFrontend>("backendforfrontend")
    .WaitFor(be1)
    .WaitFor(be2)
    .WithReference(be1)
    .WithReference(be2);

builder.AddViteApp
    (
        "frontend",
        Path.GetDirectoryName(new Projects.frontend().ProjectPath) ?? throw new InvalidOperationException()
    )
    .WaitFor(bff)
    .WithReference(bff, "api");
builder.AddViteApp
    (
        "dicefrontend",
        Path.GetDirectoryName(new Projects.dicefrontend().ProjectPath) ?? throw new InvalidOperationException()
    )
    .WaitFor(be3)
    .WithReference(be3, "api");

builder.Build().Run();