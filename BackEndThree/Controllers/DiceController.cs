using BackEndThree.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEndThree.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize(Policy = Policy.Name)]
public class DiceController : ControllerBase
{
    private static readonly Random Die = new(DateTime.Now.Millisecond);

    private int Roll(int dieSize) => Die.Next() % dieSize + 1;

    [HttpPost("coin")]
    public int CoinFlip() => Roll(2);

    [HttpPost("d3")]
    public int RollD3() => Roll(3);

    [HttpPost("d4")]
    public int RollD4() => Roll(4);

    [HttpPost("d6")]
    public int RollD6() => Roll(6);

    [HttpPost("d10")]
    public int RollD10() => Roll(10);

    [HttpPost("d20")]
    public int RollD20() => Roll(20);
}