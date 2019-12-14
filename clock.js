window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);

    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        signs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
        planets = { sun: 'Q', moon: 'R', mercury: 'S', venus: 'T', mars: 'U', 
            saturn: 'V', jupiter: 'W', uranus: 'X', neptune: 'Y', pluto: 'Z',
            chiron: 't', ascNode: '<' },
        retro = 'M',
        radius, date, minutes, 
        signSun, signMercury, signVenus, signMars, signMoon,
        signJupiter, signSaturn, signUranus, signNeptune, signPluto, signAscNode, signChiron,
        retroMerc, retroVenus, retroMars,
        retroJupiter, retroSaturn, retroUranus, retroNeptune, retroPluto, retroChiron;

    document.body.appendChild(canvas);
    window.addEventListener('resize', resize);
    resize();

    (function drawFrame() {
        requestAnimationFrame(drawFrame);
        date = new Date();
        getSigns();
        drawFace();
        drawNumerals();
        drawTime();
        // Draw center dot
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(0, 0, radius * .008, 0, 2 * Math.PI);
        ctx.fill();
    })();

    function resize() {
        radius = getCircleRadius(20);
        ctx.canvas.width = window.innerWidth;
        ctx.canvas.height = window.innerHeight;
        ctx.translate(canvas.width / 2, canvas.height / 2);
    }

    function getCircleRadius(padding) {
        if (window.innerWidth < window.innerHeight) {
            return Math.round((window.innerWidth / 2) - padding);
        } else {
            return Math.round((window.innerHeight / 2) - padding);
        }
    }

    function drawFace() {
        let angle,
            gradient = ctx.createRadialGradient(0, 0, radius * .1, 0, 0, radius * .4);
        // Clear canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
        // Stellated dodecahedron inner circle fill
        gradient.addColorStop(0, '#ddd');
        gradient.addColorStop(.7, '#f3f3f3');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius * .4, 0, 2 * Math.PI);
        ctx.fill();
        // Stellated dodecahedron inner rings; Eye of the Sahara
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = radius * .016;
        ctx.beginPath();
        ctx.arc(0, 0, radius * .14, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius * .093, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius * .047, 0, 2 * Math.PI);
        ctx.stroke();
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
            angle = (i + .5) * Math.PI / 6;
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
            angle = i * Math.PI / 6;
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
            ctx.fillStyle = (i === ((hour === 0) ? 12 : hour % 12)) ? '#333' : '#777';
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
            ctx.fillStyle = (i === ((minute === 0) ? 60 : minute)) ? '#333' : '#777';
            ctx.rotate(angle);
            ctx.translate(0, -radius * 0.95);
            ctx.rotate(-angle);
            ctx.fillText((i < 10) ? '0' + i : i, 0, 0);
            ctx.rotate(angle);
            ctx.translate(0, radius * 0.95);
            ctx.rotate(-angle);
        }
    }

    function drawTime() {
        let hour = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds(),
            millisec = date.getMilliseconds(),
            drawSign;
        // Draw sun sign hand
        drawSign = ((signSun - .5) * Math.PI / 6);
        ctx.strokeStyle = '#bbb';
        drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.sun);
        // Draw moon sign hand
        drawSign = ((signMoon - .5) * Math.PI / 6);
        ctx.strokeStyle = '#bbb';
        drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.moon);
        // Draw mercury sign hand
        drawSign = ((signMercury - .5) * Math.PI / 6);
        ctx.strokeStyle = '#bbb';
        drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.mercury, retroMerc);
        // Draw venus sign hand
        drawSign = ((signVenus - .5) * Math.PI / 6);
        ctx.strokeStyle = '#bbb';
        drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.venus, retroVenus);
        // Draw mars sign hand
        drawSign = ((signMars - .5) * Math.PI / 6);
        ctx.strokeStyle = '#bbb';
        drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.mars, retroMars);
        // Uncomment below blocks to add outer planets/asc node
        // // Draw jupiter sign hand
        // drawSign = ((signJupiter - .5) * Math.PI / 6);
        // ctx.strokeStyle = '#bbb';
        // drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.jupiter, retroJupiter);
        // // Draw saturn sign hand
        // drawSign = ((signSaturn - .5) * Math.PI / 6);
        // ctx.strokeStyle = '#bbb';
        // drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.saturn, retroSaturn);
        // // Draw uranus sign hand
        // drawSign = ((signUranus - .5) * Math.PI / 6);
        // ctx.strokeStyle = '#bbb';
        // drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.uranus, retroUranus);
        // // Draw neptune sign hand
        // drawSign = ((signNeptune - .5) * Math.PI / 6);
        // ctx.strokeStyle = '#bbb';
        // drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.neptune, retroNeptune);
        // // Draw pluto sign hand
        // drawSign = ((signPluto - .5) * Math.PI / 6);
        // ctx.strokeStyle = '#bbb';
        // drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.pluto, retroPluto);
        // // Draw chiron sign hand
        // drawSign = ((signChiron - .5) * Math.PI / 6);
        // ctx.strokeStyle = '#bbb';
        // drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.chiron, retroChiron);
        // // Draw asc node sign hand
        // drawSign = ((signAscNode - .5) * Math.PI / 6);
        // ctx.strokeStyle = '#bbb';
        // drawHand(ctx, drawSign, radius * 0.4, radius * 0.004, planets.ascNode);
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

    function drawHand(ctx, pos, length, width, symbol="", isRetro=false) {
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        // Draw planet symbol at sign
        if (symbol)
        {
            ctx.font = radius * 0.10 + 'px Astro';
            ctx.fillText(symbol, 0, -length);
        }
        // Draw retrograde symbol underneath planet
        if (isRetro)
        {
            ctx.font = radius * 0.09 + 'px Astro';
            ctx.fillText(retro, 0, -length + (radius * 0.07));
        }
        ctx.rotate(-pos);
    }

    function getSigns() {
        var ephemeris;
        if (minutes != date.getMinutes()) {
            minutes = date.getMinutes();
            ephemeris = getEphemeris();
            signSun = (ephemeris.sun.position.apparentLongitude / 30) + 1;
            signMoon = (ephemeris.moon.position.apparentLongitude / 30) + 1;
            signMercury = (ephemeris.mercury.position.apparentLongitude / 30) + 1;
            signVenus = (ephemeris.venus.position.apparentLongitude / 30) + 1;
            signMars = (ephemeris.mars.position.apparentLongitude / 30) + 1;
            // Uncomment the commented blocks below to add the outer planets/asc node
            // signJupiter = (ephemeris.jupiter.position.apparentLongitude / 30) + 1;
            // signSaturn = (ephemeris.saturn.position.apparentLongitude / 30) + 1;
            // signUranus = (ephemeris.uranus.position.apparentLongitude / 30) + 1;
            // signNeptune = (ephemeris.neptune.position.apparentLongitude / 30) + 1;
            // signPluto = (ephemeris.pluto.position.apparentLongitude / 30) + 1;
            // signAscNode = (ephemeris.moon.orbit.meanAscendingNode.apparentLongitude / 30) + 1;
            // signChiron = (ephemeris.chiron.position.apparentLongitude / 30) + 1;
            retroMerc = ephemeris.mercury.motion.isRetrograde;
            retroVenus = ephemeris.venus.motion.isRetrograde;
            retroMars = ephemeris.mars.motion.isRetrograde;
            // retroJupiter = ephemeris.jupiter.motion.isRetrograde;
            // retroSaturn = ephemeris.saturn.motion.isRetrograde;
            // retroUranus = ephemeris.uranus.motion.isRetrograde;
            // retroNeptune = ephemeris.neptune.motion.isRetrograde;
            // retroPluto = ephemeris.pluto.motion.isRetrograde;
            // retroChiron = ephemeris.chiron.motion.isRetrograde;
        }
    }

    function getEphemeris() {
        // INSERT YOUR LATITUDE AND LONGITUDE BELOW
        var input = {year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), 
            hours: date.getHours(), minutes: date.getMinutes(), latitude: 25, 
            longitude: -80, key: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "chiron"] };

        const ephemeris = new Ephemeris.default(input);
        return ephemeris;
    }

}, true);