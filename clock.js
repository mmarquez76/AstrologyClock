//// THESE VALUES SHOULD BE EDITED TO MATCH YOUR PERSONAL PREFERENCES ////

// Enable to use the live GPS permissions from your browser to fetch coordinates
// This will override the manually set LATITUDE and LONGITUDE values if enabled
const USE_LIVE_LOCATION = false;
// Edit these to your precise latitude and longitude to get
// the precise live chart for your area
var LATITUDE = 25;
var LONGITUDE = -80;

// Update rate in milliseconds 
// Lowering this number will cause the clock to move more smoothly,
// but will consume more system resources
// To simulate a regular clock that ticks every second, set this to 1000
// For a clock that moves smoothly at 60fps, set this to 16.67
const UPDATE_RATE = 16.67

// Display sun, moon, mercury, venus, and mars
const SHOW_INNER_BODIES = true;
// Display saturn, jupiter, uranus, neptune, pluto, and chiron
const SHOW_OUTER_BODIES = false;
// Display dark moon lilith and ascending lunar node
const SHOW_LUNAR_POINTS = false;
// Display angles (midheaven, ascendant)
const SHOW_MAJOR_ANGLES = true;
// Display parts (part of fortune)
const SHOW_ARABIC_PARTS = false;
// Display phases of the moon
const SHOW_MOON_PHASES = true;

// Activate dark mode on sunset (overrides DARK_MODE)
const AUTO_DARK_MODE = true;
// Invert colors (dark mode)
// If AUTO_DARK_MODE is enabled, this setting is overridden
var DARK_MODE = false;

//// END OF CONFIG VALUES -- START OF SOURCE CODE ////

// Adds functionality to the default Date() class to get the Julian
// date from it as well. This is in UTC by default, since this function
// works based off the UNIX-style "seconds since epoch" timestamp
Date.prototype.getJulian = function () {
    return (this / 86400000) + 2440587.5;
}

// Get current location to display the local chart
if (USE_LIVE_LOCATION) {
    navigator.geolocation.getCurrentPosition(function (position) {
        LATITUDE = position.coords.latitude;
        LONGITUDE = position.coords.longitude;
    });
}

window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);

    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        signs = ['L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
        symbols = {
            sun: 'Q', moon: 'R', mercury: 'S', venus: 'T', mars: 'U',
            saturn: 'V', jupiter: 'W', uranus: 'X', neptune: 'Y', pluto: 'Z',
            chiron: 't', ascNode: '<', lilith: '⚸',
            ascendant: 'a', midheaven: 'b', retro: 'M', fortune: '?'
        },
        radius, date, illumFraction, offsetAscendant,
        signSun, signMercury, signVenus, signMars, signMoon,
        signJupiter, signSaturn, signUranus, signNeptune, signPluto, signChiron,
        signAscNode, signLilith,
        signMidheaven, signAscendant,
        signFortune,
        retroMerc, retroVenus, retroMars,
        retroJupiter, retroSaturn, retroUranus, retroNeptune, retroPluto, retroChiron;

    document.body.appendChild(canvas);
    window.addEventListener('resize', resize);
    resize();

    (function drawFrame() {
        // Only draw a frame once every time 
        // period specified in UPDATE_RATE
        setTimeout(function () {
            requestAnimationFrame(drawFrame);
            date = new Date();
            clearCanvas();
            getSigns();
            drawCenter();
            drawFace();
            drawNumerals();
            drawAllHands();
            if (DARK_MODE)
                invertColors();
            // Draw center dot
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(0, 0, radius * .008, 0, 2 * Math.PI);
            ctx.fill();
        }, UPDATE_RATE);
    })();

    // Invert the colors of everything drawn on the canvas
    // (effectively activating dark mode)
    function invertColors() {
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'white';
        ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
        ctx.globalCompositeOperation = 'source-over';
    }

    function resize() {
        radius = getCircleRadius(20);
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        ctx.translate(canvas.width / 2, canvas.height / 2);
    }

    function getCircleRadius(padding) {
        if (window.innerWidth < window.innerHeight)
            return Math.round((window.innerWidth / 2) - padding);
        else
            return Math.round((window.innerHeight / 2) - padding);
    }

    // Draws the center stellated dodecahedron and moon phase
    // If moon phases are disabled, concentric circles are drawn instead
    function drawCenter() {
        let gradient = ctx.createRadialGradient(0, 0, radius * .1, 0, 0, radius * .4)
        // Stellated dodecahedron inner circle fill
        gradient.addColorStop(0, '#ccc');
        gradient.addColorStop(.7, '#e3e3e3');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius * .4, 0, 2 * Math.PI);
        ctx.fill();
        // Outer circle of inner section
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = radius * .016;
        ctx.beginPath();
        ctx.arc(0, 0, radius * .15, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        if (SHOW_MOON_PHASES) {
            // Normalize moon phase just in case it gets passed some weird value
            illumFraction = Math.abs(illumFraction % 1);
            // Dark mode requires us to draw the moon differently, so that there's proper
            // contrast between the light and dark parts of the moon
            if (DARK_MODE) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, radius * .143, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                // Draw phase of moon inverted, for dark mode
                if (illumFraction >= 0.5) {
                    // Fill with light-blue tinge on full moon, which gets inverted to yellow
                    ctx.fillStyle = (illumFraction >= 0.99) ? '#bbf' : gradient;
                    ctx.ellipse(0, 0, radius * .143, radius * .143, 0, -Math.PI / 2, Math.PI / 2, true);
                    ctx.ellipse(0, 0, radius * (.143 * ((illumFraction - 0.5) / 0.5)), radius * .143, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.fill();
                } else if (illumFraction < 0.5) {
                    ctx.fillStyle = gradient;
                    ctx.arc(0, 0, radius * .143, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = (illumFraction <= 0.01) ? '#eee' : '#fff';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, radius * .143, radius * .143, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.ellipse(0, 0, radius * (.143 * ((0.5 - illumFraction) / 0.5)), radius * .143, 0, -Math.PI / 2, Math.PI / 2, true);
                    ctx.fill();
                }
            } else {
                // Draw phase of moon
                if (illumFraction >= 0.5) {
                    // Fill with light-yellow tinge on full moon
                    ctx.fillStyle = (illumFraction >= 0.99) ? '#ffb' : '#fff';
                    ctx.ellipse(0, 0, radius * .143, radius * .143, 0, -Math.PI / 2, Math.PI / 2, true);
                    ctx.ellipse(0, 0, radius * (.143 * ((illumFraction - 0.5) / 0.5)), radius * .143, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.fill();
                } else if (illumFraction < 0.5) {
                    ctx.fillStyle = '#fff';
                    ctx.arc(0, 0, radius * .15, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = (illumFraction <= 0.01) ? '#888' : gradient;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, radius * .143, radius * .143, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.ellipse(0, 0, radius * (.143 * ((0.5 - illumFraction) / 0.5)), radius * .143, 0, -Math.PI / 2, Math.PI / 2, true);
                    ctx.fill();
                }
            }
        } else {
            // No moon phases; draw stellated dodecahedron inner rings; Eye of the Sahara
            ctx.arc(0, 0, radius * .093, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, radius * .047, 0, 2 * Math.PI);
            ctx.stroke();
        }
        // Stellated dodecahedron
        ctx.lineWidth = radius * .008;
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            ctx.rotate(i * Math.PI / 6);
            ctx.moveTo(radius * .36, 0);
            ctx.rotate(1.0471975511965976);
            ctx.lineTo(-radius * .36, 0);
            ctx.stroke();
            ctx.rotate(-(i * Math.PI / 6));
            ctx.rotate(-1.0471975511965976);
        }
    }

    function clearCanvas() {
        // Clear canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
    }

    function drawFace() {
        let angle;
        // Rings
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = radius * .005;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius * .4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius * .7, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius * .9, 0, 2 * Math.PI);
        ctx.stroke();
        // Indices for signs
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            angle = (i + offsetAscendant + .5) * Math.PI / 6;
            ctx.rotate(angle);
            ctx.moveTo(radius * .4, 0);
            ctx.lineTo(radius * .7, 0);
            ctx.stroke();
            ctx.rotate(-angle);
        }
        // Indices for hours
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            angle = i * Math.PI / 6;
            ctx.rotate(angle);
            ctx.moveTo(radius * .7, 0);
            ctx.lineTo(radius * .9, 0);
            ctx.stroke();
            ctx.rotate(-angle);
        }
        // Indices for minutes / seconds
        ctx.beginPath();
        for (let i = 0; i < 60; i++) {
            angle = (i + .5) * Math.PI / 30;
            ctx.rotate(angle);
            ctx.moveTo(radius * .9, 0);
            ctx.lineTo(radius, 0);
            ctx.stroke();
            ctx.rotate(-angle);
        }
    }

    function drawNumerals() {
        let currentSign = Math.floor(signSun),
            hour = date.getHours(),
            minute = date.getMinutes(),
            angle;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ddd';
        // 12 signs
        ctx.font = radius * 0.12 + 'px Astro';
        ctx.beginPath();
        for (let i = 1; i < 13; i++) {
            angle = (i + offsetAscendant) * Math.PI / 6;
            if (i == currentSign) {
                ctx.fillStyle = '#333';
            } else if (currentSign % 2 == i % 2) {
                ctx.fillStyle = '#777';
            } else {
                ctx.fillStyle = '#aaa';
            }
            ctx.rotate(angle);
            ctx.translate(0, -radius * 0.55);
            ctx.rotate(-angle);
            ctx.fillText(signs[i - 1], 0, 0);
            ctx.rotate(angle);
            ctx.translate(0, radius * 0.55);
            ctx.rotate(-angle);
        }
        // 12 hours
        ctx.font = radius * 0.1 + 'px Astro';
        ctx.beginPath();
        for (let i = 1; i < 13; i++) {
            angle = (i + .5) * Math.PI / 6;
            ctx.fillStyle = (i === ((hour === 0 || hour === 12) ? 12 : hour % 12)) ? '#333' : '#bbb';
            ctx.rotate(angle);
            ctx.translate(0, -radius * 0.8);
            ctx.rotate(-angle);
            ctx.fillText(i, 0, 0);
            ctx.rotate(angle);
            ctx.translate(0, radius * 0.8);
            ctx.rotate(-angle);
        }
        // 60 minutes / seconds
        ctx.font = radius * 0.04 + 'px arial';
        ctx.beginPath();
        for (let i = 1; i < 61; i++) {
            angle = i * Math.PI / 30;
            ctx.fillStyle = (i === ((minute === 0) ? 60 : minute)) ? '#333' : '#bbb';
            ctx.rotate(angle);
            ctx.translate(0, -radius * 0.95);
            ctx.rotate(-angle);
            ctx.fillText((i < 10) ? '0' + i : i, 0, 0);
            ctx.rotate(angle);
            ctx.translate(0, radius * 0.95);
            ctx.rotate(-angle);
        }
    }

    function drawAllHands() {
        let hour = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds(),
            millisec = date.getMilliseconds(),
            drawSign;
        if (SHOW_INNER_BODIES) {
            // Draw sun sign hand
            drawSign = ((signSun + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.sun);
            // Draw moon sign hand
            drawSign = ((signMoon + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.moon);
            // Draw mercury sign hand
            drawSign = ((signMercury + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.mercury, retroMerc);
            // Draw venus sign hand
            drawSign = ((signVenus + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.venus, retroVenus);
            // Draw mars sign hand
            drawSign = ((signMars + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.mars, retroMars);
        }
        if (SHOW_OUTER_BODIES) {
            // Draw jupiter sign hand
            drawSign = ((signJupiter + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.jupiter, retroJupiter);
            // Draw saturn sign hand
            drawSign = ((signSaturn + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.saturn, retroSaturn);
            // Draw uranus sign hand
            drawSign = ((signUranus + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.uranus, retroUranus);
            // Draw neptune sign hand
            drawSign = ((signNeptune + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.neptune, retroNeptune);
            // Draw pluto sign hand
            drawSign = ((signPluto + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.pluto, retroPluto);
            // Draw chiron sign hand
            drawSign = ((signChiron + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.chiron, retroChiron);
        }
        if (SHOW_LUNAR_POINTS) {
            // Draw ascending node sign hand
            drawSign = ((signAscNode + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.ascNode);
            // Draw lilith sign hand
            drawSign = ((signLilith + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.lilith);
        }
        if (SHOW_MAJOR_ANGLES) {
            // Draw ascendant sign hand
            drawSign = ((signAscendant + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.ascendant);
            // Draw midheaven sign hand
            drawSign = ((signMidheaven + offsetAscendant - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.midheaven);
        }
        if (SHOW_ARABIC_PARTS) {
            // Draw part of fortune sign hand
            drawSign = ((signFortune - .5) * Math.PI / 6);
            ctx.strokeStyle = '#bbb';
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, symbols.fortune);
        }
        // Draw hour hand
        hour = ((hour) * Math.PI / 6) +
            (minute * Math.PI / (6 * 60)) +
            (second * Math.PI / (360 * 60));
        ctx.strokeStyle = '#555';
        drawHand(ctx, hour, radius * 0.7, radius * 0.0035);
        // Draw minute hand
        minute = ((minute - 0.5) * Math.PI / 30) +
            (second * Math.PI / (30 * 60)) +
            (millisec * Math.PI / (30 * 60000));
        ctx.strokeStyle = '#555';
        drawHand(ctx, minute, radius * 0.9, radius * 0.003);
        // Draw second hand
        second = ((second - 0.5) * Math.PI / 30) + (millisec * Math.PI / (30 * 1000));
        ctx.strokeStyle = '#555';
        drawHand(ctx, second, radius, radius * 0.002);
    }

    function drawHand(ctx, pos, length, width, symbol = "", isRetro = false) {
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        // Draw the given symbol at the end of the hand
        if (symbol) {
            ctx.font = radius * 0.10 + 'px Astro';
            ctx.fillStyle = '#666'
            ctx.fillText(symbol, 0, -length);
        }
        // Draw retrograde symbol underneath planet
        if (isRetro) {
            if (DARK_MODE) {
                ctx.font = radius * 0.09 + 'px Astro';
                ctx.fillStyle = '#399'
                ctx.fillText(symbols.retro, 0, -length + (radius * 0.07));
            } else {
                ctx.font = radius * 0.09 + 'px Astro';
                ctx.fillStyle = '#c66'
                ctx.fillText(symbols.retro, 0, -length + (radius * 0.07));
            }
        }
        ctx.rotate(-pos);
    }

    function getSigns() {
        let ephemeris = getEphemeris();

        // This part is done independently of the SHOW_ANGLES if-statement, because
        // offsetAscendant is necessary to display every other indicator
        ascendantDeg = getAscendant();
        signAscendant = (Math.abs(ascendantDeg - 360) / 30) + 1;
        offsetAscendant = 9.5 - signAscendant;

        if (SHOW_INNER_BODIES) {
            // For each sign index, we calculate the abs of the inverse of the longitude to effectively
            // mirror the position, so that the signs progress properly over the ascendant.
            signSun = (Math.abs(ephemeris.sun.position.apparentLongitude - 360) / 30) + 1;
            signMoon = (Math.abs(ephemeris.moon.position.apparentLongitude - 360) / 30) + 1;
            signMercury = (Math.abs(ephemeris.mercury.position.apparentLongitude - 360) / 30) + 1;
            signVenus = (Math.abs(ephemeris.venus.position.apparentLongitude - 360) / 30) + 1;
            signMars = (Math.abs(ephemeris.mars.position.apparentLongitude - 360) / 30) + 1;
            retroMerc = ephemeris.mercury.motion.isRetrograde;
            retroVenus = ephemeris.venus.motion.isRetrograde;
            retroMars = ephemeris.mars.motion.isRetrograde;
        }
        if (SHOW_OUTER_BODIES) {
            signJupiter = (Math.abs(ephemeris.jupiter.position.apparentLongitude - 360) / 30) + 1;
            signSaturn = (Math.abs(ephemeris.saturn.position.apparentLongitude - 360) / 30) + 1;
            signUranus = (Math.abs(ephemeris.uranus.position.apparentLongitude - 360) / 30) + 1;
            signNeptune = (Math.abs(ephemeris.neptune.position.apparentLongitude - 360) / 30) + 1;
            signPluto = (Math.abs(ephemeris.pluto.position.apparentLongitude - 360) / 30) + 1;
            signChiron = (Math.abs(ephemeris.chiron.position.apparentLongitude - 360) / 30) + 1;
            retroJupiter = ephemeris.jupiter.motion.isRetrograde;
            retroSaturn = ephemeris.saturn.motion.isRetrograde;
            retroUranus = ephemeris.uranus.motion.isRetrograde;
            retroNeptune = ephemeris.neptune.motion.isRetrograde;
            retroPluto = ephemeris.pluto.motion.isRetrograde;
            retroChiron = ephemeris.chiron.motion.isRetrograde;
        }
        if (SHOW_LUNAR_POINTS) {
            signAscNode = (Math.abs(ephemeris.moon.orbit.meanAscendingNode.apparentLongitude - 360) / 30) + 1;
            signLilith = (Math.abs(ephemeris.moon.orbit.meanApogee.apparentLongitude - 360) / 30) + 1;
        }
        if (SHOW_MOON_PHASES) {
            illumFraction = ephemeris.moon.position.illuminatedFraction;
        }
        if (SHOW_MAJOR_ANGLES) {
            signMidheaven = (Math.abs(getMidheavenSun() - 360) / 30) + 1;
        }
        if (SHOW_ARABIC_PARTS) {
            // As per https://cafeastrology.com/partoffortune.html, the part of fortune
            // is calculated different depending on whether we are currently in a day
            // or night chart. 
            //
            // At night, the part of fortune's longitude is equal to Ascendant + Sun - Moon
            // In the day, it's equal to Ascendant + Moon - Sun
            let sunDeg = ephemeris.sun.position.apparentLongitude,
                moonDeg = ephemeris.moon.position.apparentLongitude,
                night = isNightChart(sunDeg, ascendantDeg);
            if (night)
                signFortune = (Math.abs(ascendantDeg + sunDeg - moonDeg - 360) / 30) + 1;
            else
                signFortune = (Math.abs(ascendantDeg + moonDeg - sunDeg - 360) / 30) + 1;
        }
        if (AUTO_DARK_MODE) {
            // Enable dark mode at night, disable it in the day.
            DARK_MODE = isNightChart(ephemeris.sun.position.apparentLongitude, ascendantDeg);
        }
    }

    // Returns true if the sun is below the horizon as defined by the ascendant degree
    // Returns false otherwise (i.e. if the sun is above the horizon
    function isNightChart(sun, ascendant) {
        let isNight = false;
        let lower = ascendant;
        let upper = (ascendant + 180) % 360;
        // Handles the case where the upper bound wraps around 360 degrees
        if (upper < lower) {
            if (sun > lower || sun < upper)
                isNight = true;
        } else if (upper > lower) {
            if (sun > lower && sun < upper)
                isNight = true;
        }
        return isNight;
    }

    function getMidheavenSun(obliquityEcliptic = 23.4367) {
        // Also known as: Medium Coeli or M.C.
        //////////
        // * float localSiderealTime = local sidereal time in degrees
        // * float obliquityEcliptic = obliquity of ecpliptic in degrees
        // => returns Float as degrees
        /////////
        // Source: Astronomical Algorithims by Jean Meeus (1991) Ch 24 pg 153 - formula 24.6
        // verified with https://astrolibrary.org/midheaven-calculator/ and https://cafeastrology.com/midheaven.html
        // Default obliquityEcliptic value from http://www.neoprogrammics.com/obliquity_of_the_ecliptic/
        // for Mean Obliquity on Sept. 22 2019 at 0000 UTC

        const localSiderealTime = getLocalSiderealTime();
        const tanLST = Math.tan(toRadians(localSiderealTime));
        const cosOE = Math.cos(toRadians(obliquityEcliptic));
        let midheaven = toDegrees(Math.atan(tanLST / cosOE));

        // Correcting the quadrant
        if (midheaven < 0) {
            midheaven += 360;
        }

        if (midheaven > localSiderealTime) {
            midheaven -= 180;
        }

        if (midheaven < 0) {
            midheaven += 180;
        }

        if (midheaven < 180 && localSiderealTime >= 180) {
            midheaven += 180;
        }

        return modulo(midheaven, 360);
    }

    function getAscendant(obliquityEcliptic = 23.4367) {
        latitude = LATITUDE;
        localSiderealTime = getLocalSiderealTime();

        const a = -Math.cos(toRadians(localSiderealTime));
        const b = Math.sin(toRadians(obliquityEcliptic)) * Math.tan(toRadians(latitude));
        const c = Math.cos(toRadians(obliquityEcliptic)) * Math.sin(toRadians(localSiderealTime));
        const d = b + c;
        const e = a / d;
        const f = Math.atan(e);

        let ascendant = toDegrees(f);

        // modulation from wikipedia
        // https://en.wikipedia.org/wiki/Ascendant
        // citation Peter Duffett-Smith, Jonathan Zwart, Practical astronomy with your calculator or spreadsheet-4th ed., p47, 2011

        if (d < 0)
            ascendant += 180;
        else
            ascendant += 360;

        if (ascendant < 180)
            ascendant += 180;
        else
            ascendant -= 180;

        return modulo(ascendant, 360);
    }

    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    function toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    function modulo(number, mod) {
        // Modulo function which works with negative numbers
        // https://dev.to/maurobringolf/a-neat-trick-to-compute-modulo-of-negative-numbers-111e
        ///////////
        // * float number = the primary number to compute on
        // * float mod = the modulating number
        // => Returns Float
        ///////////

        return (number % mod + mod) % mod
    }

    function getLocalSiderealTime() {
        // Also gives: Right Ascension of M.C. or RAMC
        /////////
        // * float jd = julian date decimal
        // * float longitude = local longitude in decimal form
        // => returns Float || the sidereal time in arc degrees (0...359)
        /////////
        // Source: Astronomical Algorithims by Jean Meeus (1991) - Ch 11, pg 84 formula 11.4
        // verified with http://neoprogrammics.com/sidereal_time_calculator/index.php
        const julianDaysJan1st2000 = 2451545.0;
        const julianDaysSince2000 = date.getJulian() - julianDaysJan1st2000;
        const tFactor = (julianDaysSince2000) / 36525; // centuries
        const degreesRotationInSiderealDay = 360.98564736629;
        const lst = 280.46061837 +
            (degreesRotationInSiderealDay * (julianDaysSince2000)) +
            0.000387933 * Math.pow(tFactor, 2) -
            (Math.pow(tFactor, 3) / 38710000) +
            LONGITUDE;

        const modLst = modulo(parseFloat(lst), 360);
        return modLst;
    }

    function getEphemeris() {
        let input = {
            year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate(),
            hours: date.getUTCHours(), minutes: date.getUTCMinutes(),
            latitude: LATITUDE, longitude: LONGITUDE,
            key: ["sun", "moon", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "chiron"]
        };

        const ephemeris = new Ephemeris.default(input);
        return ephemeris;
    }

}, true);