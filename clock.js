//// THESE VALUES SHOULD BE EDITED TO MATCH YOUR PERSONAL PREFERENCES ////

// Enable to use the live GPS permissions from your browser to fetch coordinates
// This will override the manually set LATITUDE and LONGITUDE values if enabled
var USE_LIVE_LOCATION = true;
// Edit these to your precise latitude and longitude to get
// the precise live chart for your area
var LATITUDE = 25;
var LONGITUDE = -80;

// Setting this to true will cause the clock to tick every second,
// like a real clock, and also save some CPU load.
// Leaving this false allows the second hand to move smoothly.
var TICK_EVERY_SECOND = false;

// Amount of time in seconds to wait between
// updating the ephemeris (an expensive operation)
// Lower values will update more often, but take more resources
// Higher values will update less and are lighter on system resources,
// but the clock may appear to visually jump on each update
var EPHEMERIS_COOLDOWN = 20;

// Controls the diameter of the clock
// Useful for shrinking the clock so that it doesn't overlap the taskbar
// when used as a background for desktops
var SIZE_RATIO = 1;

var SHOW_SUN = true;
var SHOW_MOON = true;
var SHOW_MERCURY = true;
var SHOW_VENUS = true;
var SHOW_MARS = true;
var SHOW_SATURN = false;
var SHOW_JUPITER = false;
var SHOW_URANUS = false;
var SHOW_NEPTUNE = false;
var SHOW_PLUTO = false;
var SHOW_CHIRON = true;
// Display dark moon lilith
var SHOW_LILITH = false;
// Display ascending lunar node
var SHOW_ASC_NODE = false;
var SHOW_MIDHEAVEN = false;
var SHOW_ASCENDANT = false;
// Display arabic part of fortune
var SHOW_PART_FORTUNE = false;
var SHOW_MOON_PHASES = true;
// Display horizontal line representing the horizon
var SHOW_HORIZON = true;

// Activate dark mode on sunset (overrides DARK_MODE)
var AUTO_DARK_MODE = false;
// Invert colors (dark mode)
// If AUTO_DARK_MODE is enabled, this setting is overridden
var DARK_MODE = true;

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

    window.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        let menu = document.getElementById("menu");
        menu.style.color = darkify('#333333');
        menu.style.backgroundColor = darkify('#e4e4e4');
        // Boundary logic
        if (event.pageX + menu.offsetWidth > window.innerWidth) {
            menu.style.left = (window.innerWidth - menu.offsetWidth) + 'px';
        }
        else {
            menu.style.left = event.pageX + 'px';
        }
        if (event.pageY + menu.offsetHeight > window.innerHeight) {
            menu.style.top = (window.innerHeight - menu.offsetHeight) + 'px';
        }
        else {
            menu.style.top = event.pageY + 'px';
        }
        menu.style.visibility = 'visible';
        menu.style.opacity = 1;
        return false;
    }, false);
    
    
    window.addEventListener('click', function(event) {
        switch (event.target.id) {
            case "tick-every-second":
                TICK_EVERY_SECOND = !TICK_EVERY_SECOND;
                break;
            case "show-moon-phases":
                SHOW_MOON_PHASES = !SHOW_MOON_PHASES;
                break;
            case "show-horizon":
                SHOW_HORIZON = !SHOW_HORIZON;
                break;
            case "show-sun":
                SHOW_SUN = !SHOW_SUN;
                break;
            case "show-moon":
                SHOW_MOON = !SHOW_MOON;
                break;
            case "show-mercury":
                SHOW_MERCURY = !SHOW_MERCURY;
                break;
            case "show-venus":
                SHOW_VENUS = !SHOW_VENUS;
                break;
            case "show-mars":
                SHOW_MARS = !SHOW_MARS;
                break;
            case "show-saturn":
                SHOW_SATURN = !SHOW_SATURN;
                break;
            case "show-jupiter":
                SHOW_JUPITER = !SHOW_JUPITER;
                break;
            case "show-uranus":
                SHOW_URANUS = !SHOW_URANUS;
                break;
            case "show-neptune":
                SHOW_NEPTUNE = !SHOW_NEPTUNE;
                break;
            case "show-pluto":
                SHOW_PLUTO = !SHOW_PLUTO;
                break;
            case "show-chiron":
                SHOW_CHIRON = !SHOW_CHIRON;
                break;
            case "show-lilith":
                SHOW_LILITH = !SHOW_LILITH;
                break;
            case "show-asc-node":
                SHOW_ASC_NODE = !SHOW_ASC_NODE;
                break; 
            case "show-midheaven":
                SHOW_MIDHEAVEN = !SHOW_MIDHEAVEN;
                break;
            case "show-ascendant":
                SHOW_ASCENDANT = !SHOW_ASCENDANT;
                break;
            case "show-part-fortune":
                SHOW_PART_FORTUNE = !SHOW_PART_FORTUNE;
                break;
            default:
                let menu = document.getElementById('menu');
                if (menu.style.visibility == 'visible') {
                    menu.style.visibility = 'hidden';
                    menu.style.opacity = 0;
                }
        }
        redraw();
    });

    // bgCanvas and outerCanvas are for things that should never be redrawn (background, borders for outer clock face)
    // innerCanvas is for things that should be redrawn every minute or so (numerals on clock face, inner clock face borders)
    // signCanvas redraws every time a new ephemeris is fetched (sign hands, moon phase, horizon)
    // timeCanvas is for things that should be redrawn every frame (second/minute/hour hands)
    var bgCanvas = document.getElementById('background-layer'), 
    outerCanvas = document.getElementById('outer-face-layer'),
    innerCanvas = document.getElementById('inner-face-layer'),
    signCanvas = document.getElementById('sign-layer'),
    timeCanvas = document.getElementById('time-layer'),
        signs = ['L', 'K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'],
        symbols = {
            sun: 'Q', moon: 'R', mercury: 'S', venus: 'T', mars: 'U',
            saturn: 'V', jupiter: 'W', uranus: 'X', neptune: 'Y', pluto: 'Z',
            chiron: 't', ascNode: '<', lilith: '⚸',
            ascendant: 'a', midheaven: 'b', retro: 'M', fortune: '?'
        },
        radius, date, seconds, illumFraction, offsetAscendant,
        signSun, signMercury, signVenus, signMars, signMoon,
        signJupiter, signSaturn, signUranus, signNeptune, signPluto, signChiron,
        signAscNode, signLilith,
        signMidheaven, signAscendant,
        signFortune,
        retroMerc, retroVenus, retroMars,
        retroJupiter, retroSaturn, retroUranus, retroNeptune, retroPluto, retroChiron,
        isNight = false, updateRate = (TICK_EVERY_SECOND) ? 1000 : 16.67; // ms delay for 60fps

    var first = true; // initialized to true and set to false after the first ephemeris generation

    window.addEventListener('resize', redraw);
    
    redraw();

    window.wallpaperPropertyListener = {
        applyUserProperties: function(properties) {
            if (properties.tick_every_second) {
                TICK_EVERY_SECOND = properties.tick_every_second.value;
                updateRate = (TICK_EVERY_SECOND) ? 1000 : 16.67;
            }
    
            if (properties.size_ratio) {
                radius = getCircleRadius(20) * properties.size_ratio.value;
                SIZE_RATIO = properties.size_ratio.value;
                redraw();
            }
    
            if (properties.use_live_location) {
                USE_LIVE_LOCATION = properties.use_live_location.value;
                redraw();
            }
    
            if (properties.latitude && properties.longitude) {
                LATITUDE = parseFloat(properties.latitude.value);
                LONGITUDE = parseFloat(properties.longitude.value);
                redraw();
            }
    
            if (properties.ephemeris_cooldown) {
                EPHEMERIS_COOLDOWN = properties.ephemeris_cooldown.value;
                redraw();
            }
    
            if (properties.show_inner_bodies) {
                SHOW_INNER_BODIES = properties.show_inner_bodies.value;
                redraw();
            }
    
            if (properties.show_outer_bodies) {
                SHOW_OUTER_BODIES = properties.show_outer_bodies.value;
                redraw();
            }
    
            if (properties.show_lunar_points) {
                SHOW_LUNAR_POINTS = properties.show_lunar_points.value;
                redraw();
            }
    
            if (properties.show_major_angles) {
                SHOW_MAJOR_ANGLES = properties.show_major_angles.value;
                redraw();
            }
    
            if (properties.show_arabic_parts) {
                SHOW_ARABIC_PARTS = properties.show_arabic_parts.value;
                redraw();
            }
    
            if (properties.show_moon_phases) {
                SHOW_MOON_PHASES = properties.show_moon_phases.value;
                redraw();
            }
    
            if (properties.show_horizon) {
                SHOW_HORIZON = properties.show_horizon.value;
                redraw();
            }
    
            if (properties.auto_dark_mode) {
                AUTO_DARK_MODE = properties.auto_dark_mode.value;
                redraw();
            }
    
            if (!AUTO_DARK_MODE && properties.dark_mode) {
                DARK_MODE = properties.dark_mode.value;
                redraw();
            }
        },
        applyGeneralProperties: function(properties) {
            if (properties.fps) {
                if (!TICK_EVERY_SECOND)
                    updateRate = 1000.0 / properties.fps;
            }
        }
    };

    (function drawFrame() {
        // Only draw a frame once every time 
        // period specified in updateRate
        setTimeout(function () {
            requestAnimationFrame(drawFrame);
            date = new Date();
            // Redraw time hands every tick
            clearCanvas(timeCanvas);
            drawTimeHands();
            // Only get a new ephemeris every cooldown period to save resources
            // When a new ephemeris is fetched, redraw all resources that depend on it
            if (Math.floor(seconds / EPHEMERIS_COOLDOWN) != Math.floor(date.getSeconds() / EPHEMERIS_COOLDOWN)) {
                getSigns();
                clearCanvas(signCanvas);
                seconds = date.getSeconds();
                drawInnerFace();
                drawInnerSigns();
                drawMoonPhase();
                drawSignHands();
            }
            // Only redraw innerCanvas to highlight new numbers every minute
            if (Math.floor(seconds) % 60 == 0) {
                clearCanvas(innerCanvas);
                drawNumerals();
            }
        }, updateRate);
    })();

    function redraw() {
        date = new Date();
        radius = getCircleRadius(20) * SIZE_RATIO;
        // Clear all canvases for a complete redraw
        let canvases = [bgCanvas, innerCanvas, outerCanvas, timeCanvas, signCanvas];
        for (let canvas of canvases) {
            let ctx = canvas.getContext('2d');
            ctx.canvas.width = window.innerWidth;
            ctx.canvas.height = window.innerHeight;
            ctx.translate(canvas.width / 2, canvas.height / 2);
        }
        //updateMenu();
        getSigns();
        fillBackground();
        drawCenter();
        drawOuterFace();
        drawNumerals();
        drawInnerFace();
        drawInnerSigns();
        drawMoonPhase();
        drawSignHands();
        drawTimeHands();
    }

    // Invert a hex color string (i.e. #FFFFFF -> #000000)
    function darkify(color) {
        if (DARK_MODE) {
            if(color.length != 7) {
                console.error("Hex color must be seven characters in length (e.g. #FFFFFF).");
                return false;
            }
            
            color = color.toUpperCase();
            let splitnum = color.split("");
            let resultnum = "#";
            let simplenum = "FEDCBA9876".split("");
            let complexnum = new Array();
            complexnum.A = "5";
            complexnum.B = "4";
            complexnum.C = "3";
            complexnum.D = "2";
            complexnum.E = "1";
            complexnum.F = "0";
            
            for(i=1; i<7; i++){
                if(!isNaN(splitnum[i])) {
                resultnum += simplenum[splitnum[i]]; 
                } else if(complexnum[splitnum[i]]){
                resultnum += complexnum[splitnum[i]]; 
                } else {
                console.error("Hex colors must only include the leading # and hex numbers 0-9, A-F");
                return false;
                }
            }
            
            return resultnum;
        } 
        else
            return color;
    }

    function getCircleRadius(padding) {
        if (window.innerWidth < window.innerHeight)
            return Math.round(((window.innerWidth / 2) - padding));
        else
            return Math.round(((window.innerHeight / 2) - padding));
    }

    /*// Highlights enabled options in the context menu
    function updateMenu() {
        Reflect.set(window, 'SHOW_SUN', false);
    }*/

    // Draws the center stellated dodecahedron
    function drawCenter() {
        let ctx = outerCanvas.getContext('2d'),
            gradient = ctx.createRadialGradient(0, 0, radius * .1, 0, 0, radius * .4)
        // Stellated dodecahedron inner circle fill
        gradient.addColorStop(0, darkify('#cccccc'));
        gradient.addColorStop(.7, darkify('#e3e3e3'));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius * .402, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = darkify('#ffffff');
        // Stellated dodecahedron
        ctx.lineWidth = radius * .008;
        for (let i = 0; i < 12; i++) {
            ctx.rotate(i * Math.PI / 6);
            ctx.moveTo(radius * .36, 0);
            ctx.rotate(1.0471975511965976);
            ctx.lineTo(-radius * .36, 0);
            ctx.rotate(-(i * Math.PI / 6));
            ctx.rotate(-1.0471975511965976);
        }
        ctx.stroke();
    }

    // If enabled, drawn over the inner concentric rings
    function drawMoonPhase() {
        let ctx = signCanvas.getContext('2d');
        let gradient = ctx.createRadialGradient(0, 0, radius * .1, 0, 0, radius * .4)
        // Stellated dodecahedron inner circle fill
        gradient.addColorStop(0, darkify('#cccccc'));
        gradient.addColorStop(.7, darkify('#e3e3e3'));
        ctx.strokeStyle = darkify('#ffffff');
        ctx.lineWidth = radius * .016;
        ctx.beginPath();
        ctx.arc(0, 0, radius * .15, 0, 2 * Math.PI);
        ctx.stroke();
        if (SHOW_MOON_PHASES) {
            // Normalize moon phase just in case it gets passed some weird value
            illumFraction = Math.abs(illumFraction % 1);
            // Dark mode requires us to draw the moon differently, so that there's proper
            // contrast between the light and dark parts of the moon, meaning we don't use darkify for the moon
            if (DARK_MODE) {
                ctx.fillStyle = darkify('#ffffff');
                ctx.arc(0, 0, radius * .143, 0, 2 * Math.PI);
                ctx.fill();
                ctx.beginPath();
                // Draw phase of moon inverted, for dark mode
                if (illumFraction >= 0.5) {
                    // Fill with light-yellow tinge on full moon
                    ctx.fillStyle = (illumFraction >= 0.99) ? '#ffb' : gradient;
                    ctx.ellipse(0, 0, radius * .145, radius * .145, 0, -Math.PI / 2, Math.PI / 2, true);
                    ctx.ellipse(0, 0, radius * (.145 * ((illumFraction - 0.5) / 0.5)), radius * .145, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.fill();
                } else if (illumFraction < 0.5) {
                    ctx.fillStyle = gradient;
                    ctx.arc(0, 0, radius * .143, 0, 2 * Math.PI);
                    ctx.fill();
                    // Fill with slight dark blue tinge on new moon
                    ctx.fillStyle = (illumFraction <= 0.01) ? '#001' : '#000';
                    ctx.beginPath();
                    ctx.ellipse(0, 0, radius * .145, radius * .145, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.ellipse(0, 0, radius * (.145 * ((0.5 - illumFraction) / 0.5)), radius * .145, 0, -Math.PI / 2, Math.PI / 2, true);
                    ctx.fill();
                }
            } else {
                ctx.beginPath();
                // Draw phase of moon
                if (illumFraction >= 0.5) {
                    // Fill with light-yellow tinge on full moon
                    ctx.fillStyle = (illumFraction >= 0.99) ? '#ffb' : '#fff';
                    ctx.ellipse(0, 0, radius * .145, radius * .145, 0, -Math.PI / 2, Math.PI / 2, true);
                    ctx.ellipse(0, 0, radius * (.145 * ((illumFraction - 0.5) / 0.5)), radius * .145, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.fill();
                } else if (illumFraction < 0.5) {
                    ctx.fillStyle = '#fff';
                    ctx.arc(0, 0, radius * .15, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = (illumFraction <= 0.01) ? '#888' : gradient;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, radius * .145, radius * .145, 0, -Math.PI / 2, Math.PI / 2);
                    ctx.ellipse(0, 0, radius * (.145 * ((0.5 - illumFraction) / 0.5)), radius * .145, 0, -Math.PI / 2, Math.PI / 2, true);
                    ctx.fill();
                }
            }
        } else {
            // Draw stellated dodecahedron inner rings; Eye of the Sahara
            ctx.moveTo(radius * .093, 0);
            ctx.arc(0, 0, radius * .093, 0, 2 * Math.PI);
            ctx.moveTo(radius * .047, 0);
            ctx.arc(0, 0, radius * .047, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    // Clears a given canvas
    function clearCanvas(canvas) {
        ctx = canvas.getContext('2d');
        ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
    }

    // Fills the background with a color
    function fillBackground() {
        let bgctx = bgCanvas.getContext('2d');
    
        bgctx.fillStyle = darkify('#ffffff');
        bgctx.fillRect(-bgCanvas.width, -bgCanvas.height, bgCanvas.width * 2, bgCanvas.height * 2);   
    }

    // Draw outlines of cells in inner clock face (surrounding the signs).
    function drawInnerFace() {
        // Indices for signs
        let signctx = signCanvas.getContext('2d');
        signctx.strokeStyle = darkify('#cccccc');
        signctx.lineWidth = radius * .005;
        signctx.beginPath();
        for (let i = 0; i < 12; i++) {
            angle = (i + offsetAscendant + .5) * Math.PI / 6;
            signctx.rotate(angle);
            signctx.moveTo(radius * .4, 0);
            signctx.lineTo(radius * .7, 0);
            signctx.rotate(-angle);     
        }
        signctx.stroke();
    }

    function drawOuterFace() {
        let ctx = outerCanvas.getContext('2d'),
            angle; 

        // Rings
        ctx.strokeStyle = darkify('#cccccc');
        ctx.lineWidth = radius * .005;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.moveTo(radius * .4, 0);
        ctx.arc(0, 0, radius * .4, 0, 2 * Math.PI);
        ctx.moveTo(radius * .7, 0);
        ctx.arc(0, 0, radius * .7, 0, 2 * Math.PI);
        ctx.moveTo(radius * .9, 0);
        ctx.arc(0, 0, radius * .9, 0, 2 * Math.PI);
        // Indices for hours
        for (let i = 0; i < 12; i++) {
            angle = i * Math.PI / 6;
            ctx.rotate(angle);
            ctx.moveTo(radius * .7, 0);
            ctx.lineTo(radius * .9, 0);
            ctx.rotate(-angle);
        }
        // Indices for minutes / seconds
        for (let i = 0; i < 60; i++) {
            angle = i * Math.PI / 30;
            ctx.rotate(angle);
            ctx.moveTo(radius * .9, 0);
            ctx.lineTo(radius, 0);
            ctx.rotate(-angle);
        }
        ctx.stroke();
    }

    function drawInnerSigns() {
        let currentSign = Math.floor(signSun);
        let ctx = signCanvas.getContext('2d');
        let main = darkify('#333333');
        let alternateMain = darkify('#777777');
        let other = darkify('#aaaaaa');
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        // 12 signs
        ctx.font = radius * 0.12 + 'px Astro';
        for (let i = 1; i < 13; i++) {
            angle = (i - 3 + offsetAscendant) * Math.PI / 6;
            if (i == currentSign) {
                ctx.fillStyle = main;
            } else if (currentSign % 2 == i % 2) {
                ctx.fillStyle = alternateMain;
            } else {
                ctx.fillStyle = other;
            }
            let length = radius * 0.55;
            ctx.fillText(signs[i - 1], length * Math.cos(angle), length * Math.sin(angle));
        }
    }

    function drawNumerals() {
        let hour = date.getHours(),
            minute = date.getMinutes(),
            ctx = innerCanvas.getContext('2d'),
            angle;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        let main = darkify('#333333');
        let other = darkify('#aaaaaa');
        // 12 hours
        ctx.font = radius * 0.1 + 'px Astro';
        for (let i = 1; i < 13; i++) {
            angle = (i - 2.5) * Math.PI / 6;
            ctx.fillStyle = (i === ((hour === 0 || hour === 12) ? 12 : hour % 12)) ? main : other;
            let length = radius * 0.8;
            ctx.fillText(i, length * Math.cos(angle), length * Math.sin(angle));
        }
        // 60 minutes / seconds
        ctx.font = radius * 0.04 + 'px arial';
        for (let i = 0; i < 60; i++) {
            angle = (i - 14.5) * Math.PI / 30;
            ctx.fillStyle = (i === (minute)) ? main : other;
            let length = radius * 0.95;
            ctx.fillText((i < 10) ? '0' + i : i, length * Math.cos(angle), length * Math.sin(angle));
        }
    }

    function drawTimeHands() {
        let hour = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds(),
            millisec = date.getMilliseconds(),
            ctx = timeCanvas.getContext('2d');
        ctx.strokeStyle = darkify('#555555');
        // Draw hour hand
        hour = ((hour) * Math.PI / 6) +
            (minute * Math.PI / (6 * 60)) +
            (second * Math.PI / (360 * 60));
        drawHand(ctx, hour, radius * 0.7, radius * 0.0035);
        // Draw minute hand
        minute = ((minute) * Math.PI / 30) +
            (second * Math.PI / (30 * 60)) +
            (millisec * Math.PI / (30 * 60000));
        drawHand(ctx, minute, radius * 0.9, radius * 0.003);
        // Draw second hand; if update rate is 1000, snap the second hand to edges
        if (TICK_EVERY_SECOND)
            second = ((second) * Math.PI / 30);
        else
            second = ((second) * Math.PI / 30) + (millisec * Math.PI / (30 * 1000));
        drawHand(ctx, second, radius, radius * 0.002);
        // Draw center dot
        ctx.fillStyle = darkify('#bbbbbb');
        ctx.beginPath();
        ctx.arc(0, 0, radius * .008, 0, 2 * Math.PI);
        ctx.fill();
    }

    function drawSignHands() {
        let ctx = signCanvas.getContext('2d'),
            drawSign, allSigns = [];
        ctx.strokeStyle = darkify('#bbbbbb');        
        // Horizon line
        if (SHOW_HORIZON) {
            ctx.lineWidth = radius * 0.005
            ctx.beginPath();
            ctx.moveTo(-radius * .4, 0);
            ctx.lineTo(radius * .4, 0);
            ctx.stroke();
        }
        if (SHOW_SUN) {
            // Draw sun sign hand
            drawSign = ((signSun + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.sun});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_MOON) {
            // Draw moon sign hand
            drawSign = ((signMoon + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.moon});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_MERCURY) {
            // Draw mercury sign hand
            drawSign = ((signMercury + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.mercury, retro: retroMerc});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_VENUS) {
            // Draw venus sign hand
            drawSign = ((signVenus + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.venus, retro: retroVenus});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_MARS) {
            // Draw mars sign hand
            drawSign = ((signMars + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.mars, retro: retroMars});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_JUPITER) {
            // Draw jupiter sign hand
            drawSign = ((signJupiter + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.jupiter, retro: retroJupiter});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_SATURN) {
            // Draw saturn sign hand
            drawSign = ((signSaturn + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.saturn, retro: retroSaturn});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_URANUS) {
            // Draw uranus sign hand
            drawSign = ((signUranus + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.uranus, retro: retroUranus});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_NEPTUNE) {
            // Draw neptune sign hand
            drawSign = ((signNeptune + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.neptune, retro: retroNeptune});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_PLUTO) {
            // Draw pluto sign hand
            drawSign = ((signPluto + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.pluto, retro: retroPluto});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_CHIRON) {
            // Draw chiron sign hand
            drawSign = ((signChiron + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.chiron, retro: retroChiron});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_ASC_NODE) {
            // Draw ascending node sign hand
            drawSign = ((signAscNode + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.ascNode});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_LILITH) {
            // Draw lilith sign hand
            drawSign = ((signLilith + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.lilith});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_ASCENDANT) {
            // Draw ascendant sign hand
            drawSign = ((signAscendant + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.ascendant});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_MIDHEAVEN) {
            // Draw midheaven sign hand
            drawSign = ((signMidheaven + offsetAscendant - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.midheaven});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }
        if (SHOW_PART_FORTUNE) {
            // Draw part of fortune sign hand
            drawSign = ((signFortune - .5) * Math.PI / 6);
            allSigns.push({pos: drawSign, symbol: symbols.fortune});
            drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        }

        // Sort by ascending order of position
        allSigns.sort(function(a, b) {
            return a.pos - b.pos;
        });

        let dirty = true;
        while (dirty) {
            // Assumes allSigns is now sorted in ascending order of position
            dirty = false;
            // Go through each sign, check if it's too close to the next sign, 
            // and separate them slightly if so
            for (let i = 0; i < allSigns.length - 1; i++) {
                if (allSigns[i+1].pos - allSigns[i].pos < .15) {
                    allSigns[i].pos -= .01;
                    allSigns[i+1].pos += .01;
                    dirty = true; // Run the loop once more if a position was changed
                }
            }
        }

        // Draw the symbols for each hand.
        for (let i = 0; i < allSigns.length; i++) {
            drawSymbol(ctx, allSigns[i].pos, radius * 0.4, allSigns[i].symbol, allSigns[i].retro);
        }
    }

    function drawSymbol(ctx, pos, length, symbol = "", isRetro = false) {
        ctx.moveTo(0, 0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.textBaseline = 'middle';
        ctx.textAlign = "center";
        if (symbol) {
            ctx.font = radius * 0.10 + 'px Astro';
            ctx.fillStyle = darkify('#666666');
            ctx.fillText(symbol, 0, -length);
        }
        // Draw retrograde symbol underneath planet
        if (isRetro) {
            ctx.font = radius * 0.08 + 'px Astro';
            ctx.fillStyle = '#c66'
            ctx.fillText(symbols.retro, 0, -length + (radius * 0.07));
        }
        ctx.rotate(-pos);
    }

    function drawHand(ctx, pos, length, width) {
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.textBaseline = 'middle';
        ctx.textAlign = "center";
        ctx.rotate(-pos);
    }

    function getSigns() {
        let ephemeris = getEphemeris();

        // This part is done independently of any if-statement, because
        // offsetAscendant is necessary to display every other indicator
        ascendantDeg = getAscendant();
        signAscendant = (Math.abs(ascendantDeg - 360) / 30) + 1;
        offsetAscendant = 9.5 - signAscendant;

        // For each sign index, we calculate the abs of the inverse of the longitude to effectively
        // mirror the position, so that the signs progress properly over the ascendant.
        if (SHOW_SUN || first) {
            
            signSun = (Math.abs(ephemeris.sun.position.apparentLongitude - 360) / 30) + 1;
        }
        if (SHOW_MOON || first) {
            signMoon = (Math.abs(ephemeris.moon.position.apparentLongitude - 360) / 30) + 1;
        }
        if (SHOW_MERCURY || first) {
            signMercury = (Math.abs(ephemeris.mercury.position.apparentLongitude - 360) / 30) + 1;
            retroMerc = ephemeris.mercury.motion.isRetrograde;
        }
        if (SHOW_VENUS || first) {
            signVenus = (Math.abs(ephemeris.venus.position.apparentLongitude - 360) / 30) + 1;
            retroVenus = ephemeris.venus.motion.isRetrograde;
        }
        if (SHOW_MARS || first) {
            signMars = (Math.abs(ephemeris.mars.position.apparentLongitude - 360) / 30) + 1;
            retroMars = ephemeris.mars.motion.isRetrograde;
        }
        if (SHOW_JUPITER|| first) {
            signJupiter = (Math.abs(ephemeris.jupiter.position.apparentLongitude - 360) / 30) + 1;
            retroJupiter = ephemeris.jupiter.motion.isRetrograde;
        }
        if (SHOW_SATURN || first) {
            signSaturn = (Math.abs(ephemeris.saturn.position.apparentLongitude - 360) / 30) + 1;
            retroSaturn = ephemeris.saturn.motion.isRetrograde;
        }
        if (SHOW_URANUS || first) {
            signUranus = (Math.abs(ephemeris.uranus.position.apparentLongitude - 360) / 30) + 1;
            retroUranus = ephemeris.uranus.motion.isRetrograde;
        }
        if (SHOW_NEPTUNE || first) {
            signNeptune = (Math.abs(ephemeris.neptune.position.apparentLongitude - 360) / 30) + 1;
            retroNeptune = ephemeris.neptune.motion.isRetrograde;
        }
        if (SHOW_PLUTO || first) {
            signPluto = (Math.abs(ephemeris.pluto.position.apparentLongitude - 360) / 30) + 1;
            retroPluto = ephemeris.pluto.motion.isRetrograde;
        }
        if (SHOW_CHIRON || first) {
            signChiron = (Math.abs(ephemeris.chiron.position.apparentLongitude - 360) / 30) + 1;
            retroChiron = ephemeris.chiron.motion.isRetrograde;
        }
        if (SHOW_ASC_NODE || first) {
            signAscNode = (Math.abs(ephemeris.moon.orbit.meanAscendingNode.apparentLongitude - 360) / 30) + 1;
        }
        if (SHOW_LILITH || first) {
            signLilith = (Math.abs(ephemeris.moon.orbit.meanApogee.apparentLongitude - 360) / 30) + 1;
        }
        if (SHOW_MOON_PHASES || first) {
            illumFraction = ephemeris.moon.position.illuminatedFraction;
        }
        if (SHOW_MIDHEAVEN || first) {
            signMidheaven = (Math.abs(getMidheavenSun() - 360) / 30) + 1;
        }
        if (SHOW_PART_FORTUNE || first) {
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
        first = false;
    }

    // Returns true if the sun is below the horizon as defined by the ascendant degree
    // Returns false otherwise (i.e. if the sun is above the horizon
    function isNightChart(sun, ascendant) {
        let prevIsNight = isNight;
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
        // Re-render the entire scene if switching from day to night, to handle auto dark mode
        if (prevIsNight != isNight) {
            redraw();
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
            key: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "chiron"]
        };

        const ephemeris = new Ephemeris.default(input);
        return ephemeris;
    }

}, true);