# Development Diary #

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
