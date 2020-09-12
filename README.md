# Dewdrop Farm #

This game was built for [js13kGames 2020][js13k].

## Inspiration ##

## Graphics ##

Graphics were created in [Aseprite][] and compressed with [ImageOptim][].
Colors came from Adigun A. Polack's [AAP-64][] color palette.

The crops, land, water droplets, fertilizer, wildflower seeds, and dead crops
are edits and recolors of work by [josehzz][]. The originals are in the public
domain. My versions are licensed under the same [CC BY 4.0][cc4] license as
the game itself.

The hoe was inspired by tools in Jerom's [32x32 Fantasy Tileset][Jerom]. It's
licensed under the same [CC BY-SA 3.0][cc3] license as that work.

The bunny, cow, coins, and sprinkler are edits and recolors of sprites from
DragonDePlatino's [DawnLike][] tileset. They're licensed under the same
[CC BY 4.0][cc4] license as that work.

The seed envelope and garden hose are my own creations. They're licensed under
the same [CC BY 4.0][cc4] license as the game itself.

## Development ##

[Node][] versions are managed via [NVM][].

```bash
nvm install
npm install
```

The `dev` script will launch a development server on 127.0.0.1:3000.

```bash
npm run dev
```

The `build` script will package the project.

```bash
npm run build
```

## License ##

All code is licensed under a MIT license. See the LICENSE.md file for more
details. Most graphics are licensed under some form of Creative Commons license.
See the "Graphics" section of this README for more details. The game and text
are licensed under a [Creative Commons Attribution 4.0 International License][cc4].


[js13k]: https://2020.js13kgames.com/ "Andrzej Mazur (js13kGames): HTML5 and JavaScript game development competition in just 13 kB"
[Aseprite]: https://www.aseprite.org/ "David Capello (Aseprite): Animated Sprite Editor and Pixel Art Tool"
[ImageOptim]: https://imageoptim.com/ "Kornel Lesinski: (ImageOptim): Save disk space & bandwidth by compressing images without losing quality"
[AAP-64]: https://lospec.com/palette-list/aap-64 "Adigun A. Polack (LOWSPEC): The AAP-64 Color Palette"
[josehzz]: https://opengameart.org/users/josehzz "josehzz (OpenGameArt.org): Farming crops 16x16 and related tiles"
[Jerom]: https://opengameart.org/content/32x32-fantasy-tileset "Jerom (OpenGameArt.org): 32x32 Fantasy Tileset"
[DawnLike]: https://opengameart.org/content/dawnlike-16x16-universal-rogue-like-tileset-v181 "Dragon DePlatino (OpenGameArt.org): DawnLike - 16x16 Universal Rogue-like tileset v1.81"
[Node]: https://nodejs.org/ "Various (Node.js Foundation): Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine"
[NVM]: https://github.com/nvm-sh/nvm "Various (GitHub): Node Version Manager"
[cc3]: https://creativecommons.org/licenses/by-sa/3.0/ "Creative Commons Attribution Share Alike 3.0 Unported"
[cc4]: https://creativecommons.org/licenses/by/4.0/ "Creative Commons Attribution 4.0 International"
