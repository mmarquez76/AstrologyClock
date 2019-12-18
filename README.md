# Astrology Clock

Displays the time, moon phase, and current planetary positions and retrogrades in the zodiac, with additional optional indicators for the outer planets, major angles, lunar points, and part of fortune.

Positions are displayed with the x-axis as the horizon, with the ascendant degree on the left.

The following options can be modified by editing their values in `clock.js`:

* Longitude and latitude
* Update rate
* Toggle indicators for:
    * Inner bodies (Sun, Mercury, Venus, Mars)
    * Outer bodies (Saturn, Jupiter, Uranus, Neptune, Pluto, Chiron)
    * Lunar points (Dark Moon Lilith, Ascending Node)
    * Major angles (Ascendant, Midheaven)
    * Arabic parts (Part of Fortune)
* Manual dark mode
* Automatic dark mode, which toggles dark mode on sunset and overrides the manual dark mode setting

Uses Astro font type by Cosmorama, as well as the Moshier Ephemeris JS fork by @0xStarcat

    git clone git@github.com:mtaylor76/AstrologyClock.git

>**demo** [https://mtaylor76.github.io/AstrologyClock/](https://mtaylor76.github.io/AstrologyClock/)

## TODO

* Move the config values from `clock.js` to their own config file
