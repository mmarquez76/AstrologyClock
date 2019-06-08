window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);

    var canvas = document.createElement('canvas'),
        ctx    = canvas.getContext('2d'),
        signs  = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
        radius, date, day, sign;

    document.body.appendChild(canvas);
    window.addEventListener('resize', resize);
    resize();

    (function drawFrame() {
        requestAnimationFrame(drawFrame);
        date = new Date();
        getSign();
        drawFace();
        drawNumerals();
        drawTime();
        // Draw center dot
        ctx.fillStyle = '#bbb';
        ctx.beginPath();
        ctx.arc(0, 0, radius * .008, 0, 2 * Math.PI);
        ctx.fill();
    })();

    function resize() {
        radius = getCircleRadius(20);
        ctx.canvas.width  = window.innerWidth;
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
        // ctx.fillStyle = '#f3f3f3';
        gradient.addColorStop(0, '#ddd');
        gradient.addColorStop(.7, '#f3f3f3');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius * .4, 0, 2 * Math.PI);
        ctx.fill();
        // Stellated dodecahedron inner rings; Eye of the Sahara
        ctx.strokeStyle = '#fff';
        ctx.lineWidth   = radius * .016;
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
        ctx.strokeStyle = '#eee';
        ctx.lineWidth   = radius * .005;
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
        for (let i = 0; i < 24; i++) {
            angle = (i + .5) * Math.PI / 12;
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
        let hour   = date.getHours(),
            minute = date.getMinutes(),
            angle;
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'center';
        ctx.fillStyle    = '#ddd';
        // 12 signs
        ctx.font = radius * 0.12 + 'px Astro';
        ctx.beginPath();
        for (let i = 1; i < 13; i++) {
            angle = i * Math.PI / 6;
            ctx.fillStyle = (i === Math.floor(sign)) ? '#555' : '#ccc';
            ctx.rotate(angle);
            ctx.translate(0, -radius * 0.55);
            ctx.rotate(-angle);
            ctx.fillText(signs[i - 1], 0, 0);
            ctx.rotate(angle);
            ctx.translate(0, radius * 0.55);
            ctx.rotate(-angle);
        }
        // 24 hours
        ctx.font = radius * 0.1 + 'px Astro';
        ctx.beginPath();
        for (let i = 1; i < 25; i++) {
            angle = i * Math.PI / 12;
            ctx.fillStyle = (i === ((hour === 0) ? 24 : hour)) ? '#555' : '#ccc';
            ctx.rotate(angle);
            ctx.translate(0, -radius * 0.8);
            ctx.rotate(-angle);
            ctx.fillText(String(i), 0, 0);
            ctx.rotate(angle);
            ctx.translate(0, radius * 0.8);
            ctx.rotate(-angle);
        }
        // 60 minutes / seconds
        ctx.font = radius * 0.04 + 'px arial';
        ctx.beginPath();
        for (let i = 1; i < 61; i++) {
            angle = i * Math.PI / 30;
            ctx.fillStyle = (i === ((minute === 0) ? 60 : minute)) ? '#555' : '#ccc';
            ctx.rotate(angle);
            ctx.translate(0, -radius * 0.95);
            ctx.rotate(-angle);
            ctx.fillText(String(i), 0, 0);
            ctx.rotate(angle);
            ctx.translate(0, radius * 0.95);
            ctx.rotate(-angle);
        }
    }

    function drawTime() {
        let hour     = date.getHours(),
            minute   = date.getMinutes(),
            second   = date.getSeconds(),
            millisec = date.getMilliseconds(),
            drawSign;
        // Draw sign hand
        drawSign = ((sign - .5) * Math.PI / 6);
        ctx.strokeStyle = '#c3c3c3';
        drawHand(ctx, drawSign, radius * 0.4, radius * 0.004);
        // Draw hour hand
        hour = ((hour - 0.5) * Math.PI / 12) +
               (minute * Math.PI / (12 * 60)) +
               (second * Math.PI / (720 * 60));
        ctx.strokeStyle = '#bbb';
        drawHand(ctx, hour, radius * 0.7, radius * 0.0035);
        // Draw minute hand
        minute = ((minute - 0.5) * Math.PI / 30) +
                 (second * Math.PI / (30 * 60)) +
                 (millisec * Math.PI / (30 * 60000));
        ctx.strokeStyle = '#b3b3b3';
        drawHand(ctx, minute, radius * 0.9, radius * 0.003);
        // Draw second hand
        second = ((second - 0.5) * Math.PI / 30) + (millisec * Math.PI / (30 * 1000));
        ctx.strokeStyle = '#aaa';
        drawHand(ctx, second, radius, radius * 0.002);
    }

    function drawHand(ctx, pos, length, width) {
        ctx.lineWidth = width;
        ctx.lineCap   = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.rotate(-pos);
    }

    function getSign() {
        if (day != date.getDate()) {
            day       = date.getDate();
            let month = date.getMonth();
            switch (month) {
                case 0: // January
                    if (day <= 19) {
                        // Capricon
                        // Dec 22 - Jan 19
                        // 9 (Dec) + 19 (Jan) = 28
                        sign = 10 + ((day + 8) / 28);
                    } else {
                        // Aquarius
                        // Jan 20 - Feb 18
                        // 11 (Jan) + 18 (Feb) = 29
                        sign = 11 + ((day - 20) / 29);
                    }
                    break;
                case 1: // February
                    if (day <= 18) {
                        // Aquarius
                        // Jan 20 - Feb 18
                        // 11 (Jan) + 18 (Feb) = 29
                        sign = 11 + ((day + 10) / 29);
                    } else {
                        // Pisces
                        // Feb 19 - Mar 20
                        // 9/10 (Feb) + 20 (Mar) = 29/30
                        sign = 12 + ((day - 19) / (isLeapYear(date.getYear()) ? 29 : 30));
                    }
                    break;
                case 2:  // March
                    if (day <= 20) {
                        // Pisces
                        // Feb 19 - Mar 20
                        // 9/10 (Feb) + 20 (Mar) = 29/30
                        let leapYear = isLeapYear(date.getYear());
                        sign = 12 + ((day + (leapYear ? 8 : 9)) / (leapYear ? 29 : 30));
                    } else {
                        // Aries
                        // Mar 21 - Apr 19
                        // 10 (Mar) + 19 (Apr) = 29
                        sign = 1 + ((day - 21) / 29);
                    }
                    break;
                case 3: // April
                    if (day <= 19) {
                        // Aries
                        // Mar 21 - Apr 19
                        // 10 (Mar) + 19 (Apr) = 29
                        sign = 1 + ((day + 9) / 29);
                    } else {
                        // Taurus
                        // Apr 20 - May 20
                        // 10 (Apr) + 20 (May) = 30
                        sign = 2 + ((day - 20) / 30);
                    }
                    break;
                case 4: // May
                    if (day <= 20) {
                        // Taurus
                        // Apr 20 - May 20
                        // 10 (Apr) + 20 (May) = 30
                        sign = 2 + ((day + 9) / 30);
                    } else {
                        // Gemini
                        // May 21 - Jun 20
                        // 10 (May) + 20 (Jun) = 30
                        sign = 3 + ((day - 21) / 30);
                    }
                    break;
                case 5: // June
                    if (day <= 20) {
                        // Gemini
                        // May 21 - Jun 20
                        // 10 (May) + 20 (Jun) = 30
                        sign = 3 + ((day + 9) / 30);
                    } else {
                        // Cancer
                        // Jun 21 - Jul 22
                        // 9 (Jun) + 22 (Jul) = 31
                        sign = 4 + ((day - 21) / 31);
                    }
                    break;
                case 6: // July
                    if (day <= 22) {
                        // Cancer
                        // Jun 21 - Jul 22
                        // 9 (Jun) + 22 (Jul) = 31
                        sign = 4 + ((day + 8) / 31);
                    } else {
                        // Leo
                        // Jul 23 - Aug 22
                        // 7 (Jul) + 22 (Aug) = 29
                        sign = 5 + ((day - 23) / 29);
                    }
                    break;
                case 7:  // August
                    if (day <= 22) {
                        // Leo
                        // Jul 23 - Aug 22
                        // 7 (Jul) + 22 (Aug) = 29
                        sign = 5 + ((day + 6) / 29);
                    } else {
                        // Virgo
                        // Aug 23 - Sep 22
                        // 8 (Aug) + 22 (Sep) = 30
                        sign = 6 + ((day - 23) / 30);
                    }
                    break;
                case 8: // September
                    if (day <= 22) {
                        // Virgo
                        // Aug 23 - Sep 22
                        // 8 (Aug) + 22 (Sep) = 30
                        sign = 6 + ((day + 7) / 30);
                    } else {
                        // Libra
                        // Sep 23 - Oct 22
                        // 8 (Sep) + 22 (Oct) = 30
                        sign = 7 + ((day - 23) / 30);
                    }
                    break;
                case 9: // October
                    if (day <= 22) {
                        // Libra
                        // Sep 23 - Oct 22
                        // 8 (Sep) + 22 (Oct) = 30
                        sign = 7 + ((day + 7) / 30);
                    } else {
                        // Scorpio
                        // Oct 23 - Nov 21
                        // 8 (Oct) + 21 (Nov) = 29
                        sign = 8 + ((day - 23) / 29);
                    }
                    break;
                case 10: // November
                    if (day <= 21) {
                        // Scorpio
                        // Oct 23 - Nov 21
                        // 8 (Oct) + 21 (Nov) = 29
                        sign = 8 + ((day + 7) / 29);
                    } else {
                        // Sagittarius
                        // Nov 22 - Dec 21
                        // 8 (Nov) + 21 (Dec) = 29
                        sign = 9 + ((day - 22) / 29);
                    }
                    break;
                case 11: // December
                    if (day <= 21) {
                        // Sagittarius
                        // Nov 22 - Dec 21
                        // 8 (Nov) + 21 (Dec) = 29
                        sign = 9 + ((day + 7) / 29);
                    } else {
                        // Capicorn
                        // Dec 22 - Jan 19
                        // 9 (Dec) + 19 (Jan) = 28
                        sign = 10 + ((day - 22) / 28);
                    }
            }
        }
    }

    function isLeapYear(year) {
        return (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) ? true : false;
    }

}, true);
