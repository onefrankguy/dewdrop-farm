# Development Diary #

## 29 August 2020 ##

Day 17 of 31. 13,371 bytes used (100.44%).

Crops will regrow if they're havested with seeds. Harvesting them with the
hoe still destroys them. Crops also stop growing if they're out of season.
The water texture is now randomly rotate. It look so much better! I'm thinking
of doing that for the grass too.

I think I want to move harvested crops into the inventory. It'll provide a
reason for the market to exist and add an element of inventory management.
I'm also thinking land expansion might be the way to go in terms of purchased
upgrades. Start with a 4x4 farm. Grow it to 4x6. Grow it to 6x6.

## 27 August 2020 ##

Day 15 of 31. 13,028 bytes used (97.87%).

The bunny now longer jitters around the farm. Each time a new day starts, it
hops one square. If you poke it with the hoe, the watering can, or seeds, it
hops toward the edge of the farm. If it hops onto a crop, it eats that crop.

Once the bunny gets to the edge of the farm, it hops off and you get a day
without a bunny.

## 25 August 2020 ##

Day 13 of 31. 12,686 bytes used (95.30%).

I redid the crop graphic layout with CSS grid so I can layer them. That made it
much easier to add a bunny that hops around the farm. I recolored one from the
[DawnLike][] tileset. The hard edge outline is probably a bit too dark, so I
think I'll make that lighter.

Next steps will be to make the bunny appear when you're not looking. Maybe
tiggered by the first sale of crops? And then to make it eat the crops when it
hops over them. I think poking the bunny (with any tool) should make it scared.
When it's scared it'll hop to the edge and off the farm. Then it can reappear
when you're not looking.

## 24 August 2020 ##

Day 12 of 31. 12,433 bytes used (93.40%).

I added an explicit "Farm" button to canel out of buying or selling. I kept
getting confused when touching the inventory bar switched me out of the store.

## 23 August 2020 ##

Day 11 of 31. 12,418 bytes used (93.28%).

I added sprinklers! The sprinkler graphic is a "food" from the [DawnLike][]
tileset. I have no idea what kind of food it is. A mushroom maybe? The
sprinklers water the four squares orthogonal to them. Maybe I should charge
more for them and make it eight?

I redid the water graphic based on one from the [DawnLike][] tileset. I
included some transparency, and I'm not sure I like it. I used Jerom's
[32x32 Fantasy Tileset][Jerom] as a basis for the hoe graphic. It looks a bit
too much like an axe, so I need to tweak it some more. The watering can graphic
started life as a potion from the [DawnLike][] tileset. I think it came out
pretty well.

I theory it's possilbe to get yourself down to no cash, and not have a way to
generate more cash. I'm not sure what I should do in that case. Maybe give
web monitized players a way to pay real money for in-game cash? I could have
a zero cost crop that's always available. Birdseed! Flowers will sell for one
cash each. And it'll only be available for sale & use in the winter.

I'm wondering if I should change the background color with the seasons? Slowly
fade from one color to another.

## 22 August 2020 ##

Day 10 of 31. 12,009 bytes used (90.21%).

Graphics are starting to take shape. I made an envelope for the seeds, since I'm
reusing the picked crop graphic. I fixed a bug where the seasons didn't cycle.
I probably need to add some tests at the point. I also removed all the extra
crops I'm not using.

Oh! And the grass grows back after a bit. The timing on that feels off though.
It starts slow and goes quick. I want it to feel more slow over a longer period
of time. So that needs tweaking.

## 21 August 2020 ##

Day 9 of 31. 13,351 bytes used (100.29%).

The buttons look like buttons! I borrowed the CSS from [Wizard Zines][] just to
see what it looks like. I'll swap them out for something keeping with my
pixelated theme later.

I recolored one of the coin stacks from the [DawnLike][] tileset to use as a
cash icon. And I figured out how to resize it smaller so it doesn't have to be
a full tile height.

I need to figure out a font stack and do some graphics compression
(fewer crops?) because I've now gone over the byte limit.

## 20 August 2020 ##

Day 8 of 31. 12,902 bytes used (96.92%).

There's dirt & grass, and it looks really good with non-sharp edges when you
till it to plant crops. I'm a bit concerned about having spent 97% of my bytes
on pretty at this point. Hopefully I can figure out some tricks to make things
smaller.

There's not much challenge. One harvest of turnips, and you've got more cash
than you need to buy the next round of seeds. I should probably add other
things to spend cash on. Sprinklers? Levels? Upgrades? Or maybe just some kind
of exhaustion mechanic where you can only do a small number of things per day.

## 19 August 2020 ##

Day 7 of 31. 11,641 bytes used (87.45%).

Crops can be bought, planted, grown, and sold! But...I just spent 50% of my
byte budget on graphics.

I tested it out in Chrome on my phone. The touch controls work, but everything
looks a bit too big. I can only fit about five tiles horizontally on the screen
and seven tiles vertically. So I need to figure that out.

## 18 August 2020 ##

Day 6 of 31. 5,065 bytes used (38.05%).

Crops grow twice as fast when they're watered every day. Crops can have stages
to their growth and each stage can take a different number of days. When a crop
is fully grown, it can be harvested with the hoe. There's now a bit of a market
interface for seeing how many crops have been harvested and what their current
price is.

I really need to set up some tests around the grow & drain rules. Those were
tricky to get right.

## 17 August 2020 ##

Day 5 of 31. 4,130 bytes used (31.02%).

Game time now runs at a constant speed. Plus, the strawberries can now be
harvested! Kind of. Using a hoe on crops will remove them, but I'm not tracking
how many fully grown crops are hoed.

## 16 August 2020 ##

Day 4 of 31. 4,125 bytes used (30.99%).

It's starting to feel like a game. Maybe? I can till farmland, plant strawberry
seeds, water the plants, and watch them grow. I'm playing around with timing.
Everything feels fast right now. I need to figure out how quick I want the
engine to run, if I want some kind of day/night cycle, those sorts of thing.

I'm currently using a crop tileset made by [josehzz][]. I like it! Crops have
five stages of growth, and the seeds look unique enough that you can tell
what's planted. There are also portraits for each crop, so I'll be able to show
them off in the invetory, store, and market.

Note to self: Allow players to harvest crops early.

## 15 August 2020 ##

Day 3 of 31. 1,543 bytes used (11.59%).

I've got a basic build system in place, complete with hot reloading when HTML
and CSS change. [webpack][] seems to produce _a lot_ of boilerplate code. 1,056
bytes from an empty `index.html` template and `index.js` file. I may switch to
[Rollup][] to save a few bytes.

Gameplay wise, I'm thinking about something real time with an economy. All my
games to date have been turn baesd, so doing something with time could be fun.
Maybe some kind of [idle clicker][] or farming simulation?


[webpack]: https://webpack.js.org/ "Various: webpack is THE build solution for modern web applications"
[Rollup]: https://rollupjs.org/ "Various: Rollup is a module bundler for JavaScript"
[idle clicker]: https://en.wikipedia.org/wiki/Incremental_game "Various (Wikipedia): Incremental game"
[josehzz]: https://opengameart.org/users/josehzz "josehzz (OpenGameArt.org): Farming crops 16x16 and related tiles"
[Wizard Zines]: https://wizardzines.com/ "Julia (Wizard Zines): "
[DawnLike]: https://opengameart.org/content/dawnlike-16x16-universal-rogue-like-tileset-v181 "Dragon DePlatino (OpenGameArt.org): DawnLike - 16x16 Universal Rogue-like tileset v1.81"
[Jerom]: https://opengameart.org/content/32x32-fantasy-tileset "Jerom (OpenGameArt.org): 32x32 Fantasy Tileset"
