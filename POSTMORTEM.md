I was a bit late to the js13kGames party this year. Not in the sense that I
didn't get anything done, but in that I didn't start thinking about my game
until the competition started. That's a departure from previous games, where
I've spent the month leading up to the competition playing various indie
games, looking for interesting engines and inspiring mechanics.

_Dewdrop Farm_ was my entry into the js13kGames competition for 2020. It's a
tiny farming simulator, with an intentionally addictive compulsion loop. You can
play it online at: [https://2020.js13kgames.com/entries/dewdrop-farm]. This is
the 9<sup>th</sup> year I've entered the competition. The challenge of creating
a game in a month, and fitting it all in a 13 kilobyte zip file, is always fun.

The only real idea I had going into the competition, was "Make a game where the
passage of time matters." I usually pick some technical topic I want to learn
about during the competition, and build a game around that. Having never done a
game where the world runs independent of the player's actions, I thought that
would be an interesting thing to build.

I was playing _Drop7_ on my phone in the days leading up to the competition. The
designer of that game, [Frank Lantz][], also made _Universal Paperclips_, an
incremental game. So I played that, and read the paper [Playing to Wait][], and
thought a lot about idle games. The 1.16 Nether update to _Minecraft_ had also
recently been released. So I had piglin trading mechanics on my mind, and I
figured making a game with an economy would be interesting.

That combination of ideas reminded me of [SimFarm][], a game I loved as a kid.
I got it in my head that I would build a mini version of _Minicraft_, just the
farming and trading bits, rendering with a top down view so I didn't have to
also learn 3D maths while learning about game economies.

15 Aug - 21 Aug

Starting Off

I start all my games off the same way, with 616 bytes of mobile friendly HTML
and CSS. The template below does a handful of useful things.

First, it assumes the world is 320 pixels wide and 444 pixels tall, and it hides
everything that doesn't fit in that. Hiding stuff from the start helps me catch
layout issues early. I don't want to put critical UI elements on areas of the
screen that won't be visible. That resolution is the usable browser space on an
iPhone 5/SE, assuming the browser is showing a query bar and tabs at the top and
buttons at the bottom.

Second, it sets the base font size to 62.5% and sizes everthing with rems.
This makes 0.1rem equal to 1px. A viewport meta tag scales everything to fit the
device's width, and a media query scales the font size up for desktops. This
means I can think about things in pixels and still have them scale nicely at
various screen resolutions.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    * {
      cursor: default;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      font-weight: normal;
      font-size: 62.5%;
    }

    .world {
      width: 32rem;
      height: 44.4rem;
      margin: 0 auto;
      border: 0.1rem solid black;
      overflow: hidden;
    }

    @media screen and (min-width:40em) {
      html {
        font-size: 120%;
      }
    }
  </style>
</head>
<body>
  <div class="world"></div>
</body>
</html>
```

There are a few gotchas with this template. First, it only has one breakpoint.
So games tend to look small on some screens that are between a mobile and a
desktop in size, like the iPad Pro. Second, text has to be explicitly sized.
1.6rem is (16 pixels) is about as small as you want for game text that needs to
be read. Though I usually to go down to 1.0rem (10 pixels) for copyright text.

- growing crops

Googling Graphics

Searching for "farm" on [OpenGameArt.org] turned up a crop tileset by [josehzz].
That ended up defining the color palette I used for the game, [AAP-64] by ???,
and also the look, 16x16 pixel sprites.

Once I found those crop graphics, I started thinking of [Stardew Valley]. Using
ConcernedApe's game as a reference point got me through the first week of
coding. The player has two tools, a hoe and a water. Land nees to be tilled with
the hoe before seeds can be planted. Crops grow at various speeds. Watering
crops makes them grow faster. Land that's watered dries out over time. Mature
crops can be harvested and sold. Coins can be used to buy seeds to grow more
crops.

Idling Away

I wanted Dewdrop Farm to run even when you weren't actively playing it. So I
used [???'s article on render loops] as a starting point. The game runs in fixed
time, with an update taking place every 1/20th of a second.

I spent a fair bit of time in those first few days figuring out how long each
"day" on the farm should last. I thought a lot about this quote by
[Eric Barone][] about days in _Stardew Valley_:

> "The psychology of it and how, by keeping the days short, it always felt like
> you had time fro 'one more day,' no matter how long you had been playing.
> Before you realized it, hours had passed."

A day in _Stardew Valley_ lasts 14 minutes, 20 seconds. I knew I didn't want my
days to last that long, but I started with that "14 minutes" as a reference,
and keep tweaking the math until I found something that felt right.

```javascript
const SEASONS_PER_YEAR = 4;
const DAYS_PER_SEASON = 28;
const SECONDS_PER_DAY = (14 * 60 * 3) / SEASONS_PER_YEAR / DAYS_PER_SEASON;
```

A day in Dewdrop Farm lasts 22.5 seconds. That's long enough that when I watched
the day counter tick, I felt like it wasn't making progress. But it's short
enough that when I was actively doing things, like buying seeds, I found myself
asking, "Where did the time go?" This also means that the growing season, from
the start of spring to the start of winter, lasts about half an hour. That felt
like a good length of time for a play session.

It was about this time that [Rachel Wenitsky][] posted a thread on Twitter about
walking simulators and other idle games. That got me thinking about compulsion
loops. I knew I was building an adictive mechanic, so I wanted to create a very
deliberate "It's okay to take a break" point to balance that out. I decided
winter would be a season where nothing grew. If you wanted to continue the game
beyond one growing season, you'd need to take a 10 minute break.

Randomizing Growth

Even though the game ran at a fixed rate, I knew I didn't want the crops to grow
at a fixed rate. I wanted to recreate that Minecraft feel, where you come back
to a field of wheat and find that some of it is ready to harvest and some of it
needs a bit more time. At the same time, I wanted to keep the economic stability
found in Stardew Valley. The player should be able to figure out that it takes
four days for turnips to mature, that way they can decide if they have enough
time left in the season to plant them.

What I ended up doing was randomzing the time in each day that each crop would
grow. With each update, `farm.time` is incremented by 1/20th of a second. So I
first figure out how many seconds into the current day we are.

```javascript
const day = Math.floor(farm.time / SECONDS_PER_DAY);
const farmTime = farm.time - (day * SECONDS_PER_DAY);
```

Then, if it's a new day, I slice the 22.5 second day up into 36 time buckets,
one for each plot of farm land. So the first time bucket is between 0 and 0.625
seconds, the second time bucket is between 0.625 seconds and 1.25 seconds, and
so on. I randomly assign each plot of farm land to a time bucket, and pick a
random time within that bucket for it.

```javascript
if (growable.day !== day) {
  let plots = PRNG.shuffle(Farm.plots(farm));
  const dt = SECONDS_PER_DAY / plots.length;
  plots = plots.map((plot, index) => {
    const min = dt * (index + 0);
    const max = dt * (index + 1);
    const time = PRNG.between(min, max);

    return {
      ...plot,
      time,
      id: index,
    };
  });

  growable.day = day;
  growable.plots = plots;
}
```

During each update I check to see if a crop on a plot of land needs to grow.
If it does, I dispatch a grow action. If it doesn't, I save it to check again
the next update.


```javascript
const plots = [];
const remaining = [];

growable.plots.forEach((plot) => {
  if (plot.time <= farmTime && shouldGrow(plot)) {
    plots.push(plot);
  } else {
    remaining.push(plot);
  }
});

growable.plots = remaining;

plots.forEach(({row, col}) => {
  const growAction = {
    tool: 'grow',
    row,
    col,
  };

  farm = Rules.dispatch(farm, growAction);
});
```

That bit of code ended up working nicely for making crop growth feel randomly
predictable. I resued it to also decide when farm land goes fallow, when
sprinklers water crops, and when farm land dries out.

22 Aug - 28 Aug

- new graphics
- sprinklers
- bunny

Finding Fun

One week into the competition I had a working game, but it wasn't really fun.
You could grow crops and sell them, but one spring harvest of turnips gave
you more coins than you could reasonably spend. So I spent some time improving
the graphics.

I styled the inventory bar, plus the market and store screens. A lot of the
visual design for those was inspired by _Stardew Valley_. I added a hoe and
watering can, plus an envelope to hold seeds, and sprinklers that automatically
watered crops. It looked more polished, but it was still a very passive game.
I needed an antagonist.

Market economics and weatehr events are the antagonists in _SimFarm_. I wanted
to do something like that, with variable prices or spoiled crops, but that felt
like it would require a lot of number juggling to balance. Then I remembered the
bunny I saw nosing about the garden one day.

The bunny in _Dewdrop Farm_ hops around randomly. If it lands on a crop, it eats
that crop. You can scare the bunny by poking it, making it hop toward the edge
of the farm. If it's on an edge when you poke it, it'll hop off the farm, and
you get a day without a bunny.

That ended up being exactly the mechanic I needed. I found myself spending lots
of time planting crops and nudging the bunny away from them instead of writing
code.

29 Aug - 4 Sep

- crop regrowth
- seasonal crops
- randomly rotated graphics
- inventory management
- hot keys
- wildflowers

5 Sep - 11 Sep

- price tuning
- crop culling
- saving & loading
- clickable store buttons
- playtesters
- monetization
- XP & leveling
- webpack for rollup
- seasonal colors
- fertilizer

Build Systems
Controls
Rendering


[Frank Lantz]: https://en.wikipedia.org/wiki/Frank_Lantz "Wikipedia: Frank Lantz"
[Playing to Wait]: https://pixl.nmsu.edu/files/2018/02/2018-chi-idle.pdf ""
[Eric Barone]: https://www.gq.com/story/stardew-valley-eric-barone-profile "Sam White & Chona Kasinger (GQ): Valley Forged - How One Man Made the Indie Video Game Sensation Stardew Valley"
[Rachel Wenitsky]: https://twitter.com/RachelWenitsky/status/1296236032803864583 "Rachel Wenitsky (Twitter): are there video games where I just get to walk around?"

