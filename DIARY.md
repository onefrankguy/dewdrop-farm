# Development Diary #

## 12 September 2020 ##

Day 31 of 31. 12,837 bytes used (96.43%). 

It's done! I dropped the price of fertilizer to 50 make it more useful. I also
tweaked the cow so it no longer tramples fertilizer and sprinklers. This means
it's now possible to get fertilizer in all three growing seasons if you play
carefully.

I update the `localStorage` namespace, because "farm" was a little too generic.
It's "dewdropfarm" now.

Web monitization now gets a +3 level bonus to luck instead of a flat percentage.
That doesn't unlock anything new, but it makes seed prices a bit higher and
makes fertilizer a bit more likely to trigger growth.

I made a new graphic for wildflower seedds and documented all the graphics info
in the README. I also worked out an icon and a screenshot. Both were done in
Aseprite, which is a first for me. I usually do those in the browser. But with
the pixel art heavy look of this game, it found an actual image editor easier
to use.

Now it's in the submission queue. It's 10 pm in Berlin though, so my guess is it
won't be live until tomorrow.

## 11 September 2020 ##

Day 30 of 31. 12,668 bytes used (95.16%). 

Fertilizer now restocks at level 2 and the sprinkler restocks at level 4. The
sprinkler now waters the eight plots around it (but not itself) so that it's
more useful. I also fixed a bug where the context menu was accidentally
disabled.

There's a one day grace period when selling crops. This allows you to harvest
on the 28th and sell on the 1st. It was a feature asked for during beta
testing, since crops sell for less out of season.

I remove some unused code, like the render sync, and shrunk the font stack used
for the ampersand. It doesn't use Baskerville on iOS and I'm not sure why. I
tweaked the season colors so they all have the same relative brightness. I may
recolor things post contest to improve accessibility.

The major win in terms of bytes was moving all the sprites into a single
vertical list, minifying them with ImageOptim, and embedding that in the HTML
file. That saves a ton of bytes! Enough bytes to add more graphics and features. So now there is...

A cow! If you feed the cow every day, it won't walk around and destroy crops.
The cow will till fields as it walks and has a chance of fertilizing them too.
It's pretty destructive though. It will destroy all the plants and any
fertilizer it walks over.

I fixed the double plant bug with wildflowers, and fixed a bug where the
sprinklers stopped working. But that means you can't plant sprinklers on grass
any more. I aslo fixed a bug with the links not being clickabled and addded a
hotkey "I" for the info screen.

I've got a list of things to fix and improve for tomorrow:

* Show the current year on the info screen.
* Namespace `localStorage`.
* Use a unique graphic for wildflower seeds.
* Maybe add better flower graphics if I've got the space?
* Make fertilizer more useful. Since you can only buy it in the spring, maybe
  it should last all year?
* Adjust the bonus luck that comes from monetization so it's a plus to levels
  instead of a flat percentage.
* Add some static grass around the edges of the farm.
* Maybe add a static bunny at the edges of the farm?

## 10 September 2020 ##

Day 29 of 31. 13,271 bytes used (99.69%).

I think I fixed the "double tap to zoom" bug on Mobile Safari by using
`event.preventDefault()`. It's hard to trigger a cache refresh on Mobile Safari
so only more time spent testing will tell.

I added a fertilizer mechanic. It makes crops grow faster, taking luck into
account. So there's a chance fertilized land will trigger a double grow event.

Selling crops out of season is now less profitable. This gives more of an active
feel to farming, since you're always selling crops as soon as they harvest.

I ditched the custom PRNG to save 110 bytes. I wasn't seeding it, so it wasn't
very useful.

Stuff you can't buy yet (because you're not at a high enough level) shows up
as disabled and "404 Not Found" in the store.

I replaced the watering can (that looked like a small elephant) with a gardening
hose. I like it a lot more! It's my own design, so that was fun.

I added a background color for each season, and made it transition on the first
day of the season. It's probably my favorite effect of the game. I need to tweak
the colors though so they're all a similar brightness level.

There's an exploit with wildflowers in the winter. You can plant them and them
immediately harvest them to figure out what kind they are and get seeds you can
sell.

I've got a list of things to fix and improve for tomorrow:

* There should be a one day grace period for seasonal sales a the start of the
  next season. That accounts for harvesting crops on the very last second of
  the last day of this season but not being able to sell them quick enough.
* Flowers should have a sale price that's more than 1 cash. You can't make
  enough money with them to get out of debt. This is especially true given you
  can only grab 64 of them during the winter. They should at least let you get
  back up to your starting cash level.
* There's a double plant bug with wildflowers. Sometimes two seeds get planted
  on the same plot of land.
* The sprinklers aren't very useful as is. They should do the full eight plots
  around them, but unlock at level 4 instead of level 2.
* The fertilizer should unlock at level 2 instead of level 1.
* Hitting the bunny with the hoe should have a chance of killing it an giving
  you fertilizer. I'm not sure how I feel about that, but it would give you
  something to do during the winter.

## 9 September 2020 ##

Day 28 of 31. 13,006 bytes used (97.70%).

I swapped out [webpack][] for [Rollup][]. Combined with inlining the CSS and
JavaScript into the HTML file, I saved 564 bytes. That's enough for more
features!

I added an "Info" page and a "New Game" button. Color tweaks to the seeds and
water made it stand out a bit more. Grass can't be watered, since it doesn't
have crops. Sprinklers can be planted on grass now. I also tweaked the bunny
so it doesn't eat seeds or mature crops.

## 8 September 2020 ##

Day 27 of 31. 13,468 bytes used (101.17%).

I tuned the crops. There are now only three crops per season, but two of them
are multi-season crops. The profits for them still work out, so there's a
"most profitable" crop for each play style. But the most profitable crop is
not necessarily the one that generates the most experience.

Speaking of experience... There's now an XP and leveling system! You earn XP by
harvesting crops and petting the bunny. XP translates into levels, and more
levels gets you better farming equipment. I think I might have monetization
and a luck factor that's a boost to the base percentage for stuff. That way its
more a boon than a "pay to win" system.

I tuned the water color so it's a little brighter. It should be easier to see
on small screens now. I also fixed the "double tap zooms" bug, but it's not
an elegant fix. I just disabled zooming. I doubt I'll have enough bytes left
for a real fix.

## 7 September 2020 ##

Day 26 of 31. 14,023 bytes used (105.34%).

Store buttons are clickable! I'm not a fan of the blue color (too bright?) but
I like how the clickable look turned out.

The grass texture is now rotated, so that creates some nice variation. And the
stats are swapped (cash on the left, time on the right) for better readability.

I've still got too many bytes. Tried to do a PNG to code to generated SVG
conversion. It still came out too big (and took way to long to load). So
getting the file size smaller needs to be tomorrow's project.

## 6 September 2020 ##

Day 25 of 31. 13,797 bytes used (103.64%).

I tried using SVGs instead of PNGs. They compress much worse. Granted, I was
still going for that pixel art look, so it's possible I could run length encode
the SVG or something and save a bunch of bytes that way. Actually, I only 65
possible colors. I could encode the PNG as custom binary data in HTML and
extract it into a SVG at runtime. I might give that a go.

I did manage to save a few bytes by using a different PNG compression library.
I think it's the same on ImageOptim uses. I'll probably still have to cut crops
to get it down to a reasonable byte size though.

The farm now saves & loads via `localStorage`! That's pretty exciting, 'cause it
means you can leave and come back later. It saves daily, so you don't risk a lot
of progress if you quit.

I tweaked crop prices so stuff just out of season sells for slightly more. I
might invert that though and have it sell for slightly less. Spoiled fruit?
Need to do some research on that. I could do some kind of economic curve based
on when in the season you are. And speaking of economics...

I added monetization! It doesn't do anything yet, but the `<metadata>` tag is
wired up. I'm thinking of having it improve the crop tools? Maybe jump you
forward in XP a bit? I need something that's 100 + 20. So you _can_ get all the
goodies if you're not monetized, it just might take a bit longer. I need to be
careful not to turn this into an addiction loop.

## 5 September 2020 ##

Day 24 of 31. 14,518 bytes used (109.06%).

I rendered the keyboard shortcuts with Michael Hue's [key.css][]. I like their
chiclet look.

I tuned the crop prices so the profit per day curves are more interesting.
There's now a "best" crop per season that maximizes profits for your play style.
I might adjust things so each season has a "best" play style as well.

## 4 September 2020 ##

Day 23 of 31. 12,893 bytes used (96.85%).

Embedding the images in the CSS, and CSS and JavaScript in the HTML, saved me
434 bytes. That's pretty good! Though I seem to have broken the part of the
cycle where crops wither and die. Not sure how I did that.

## 1 September 2020 ##

Day 20 of 31. 13,327 bytes used (100.11%).

I added hot keys for the tools and inventory (1 through 6), plus one for each
of the screens (F for farm, B for buy, and S for sell). This makes the game
much more pleasent to play on a laptop with a trackpad! I need a way to show
that off to players though. Maybe a `<kbd>` element?

I really need to focus on compression. Not sure what I'm going to do to get the
byte size down. Maybe fewer crops? I could reuse some of the seed and stalk
sprites. Maybe randomize those?

## 30 August 2020 ##

Day 18 of 31. 13,231 bytes used (99.39%).

There's now a bit of inventory management around buying and selling crops. Once
all the inventory slots are filled, you can't buy new seeds. The inventory fills
left to right. I'm not sure if I need any more management then that. Maybe
filling in the active slot first if possible? That might make sense since you
can't merge items in inventory slots.

Crops grow faster when planted in rows. And digging up crops has a chance of
returning a seed for the crop. Crops that try to grow out of season will die.
I'm not sure I like the "dead crop" graphic yet. I recolored a [DawnLike][]
grass sprite, but it doesn't quite look right.

I fixed image rendering in Firefox so the graphics look pixelated there too.
The bunny flips left to right when moving, which adds a lot more life to the
game.

## 29 August 2020 ##

Day 17 of 31. 13,371 bytes used (100.44%).

Crops will regrow if they're havested with seeds. Harvesting them with the
hoe still destroys them. Crops also stop growing if they're out of season.
The water texture is now randomly rotate. It looks so much better! I'm thinking
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
[key.css]: https://github.com/michaelhue/keyscss "Michael Hue (GitHub): A simple stylesheet to render beautiful keyboard-styled elements"
[webpack]: https://webpack.js.org/ "Various (webpack): webpack is a module bundler for JavaScript"
[Rollup]: https://rollupjs.org/ "Various (rollup.js): Rollup is a module bundler for JavaScript"
