# Development Diary #

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
