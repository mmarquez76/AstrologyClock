window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);

    var canvas = document.createElement('canvas'),
        ctx    = canvas.getContext('2d'),
        signs  = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
        radius, date, sign;

    document.body.appendChild(canvas);
    window.addEventListener('resize', resize);
    resize();

    (function drawFrame() {
        requestAnimationFrame(drawFrame);
        date = new Date();
        sign = getSign(date);
        drawFace();
        drawNumerals(date, sign);
        drawTime(date, sign);
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
        var angle;
        ctx.fillStyle   = '#fff';
        ctx.strokeStyle = '#eee';
        ctx.lineWidth   = 1.5;
        ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();
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
        // Indices for Signs
        for (var i = 0; i < 12; i++) {
            angle = (i + .5) * Math.PI / 6;
            ctx.rotate(angle);
            ctx.moveTo(radius * .4, 0)
            ctx.lineTo(radius * .7, 0);
            ctx.stroke();
            ctx.rotate(-angle);
        }
        // Indices for Hours
        for (var i = 0; i < 24; i++) {
            angle = (i + .5) * Math.PI / 12;
            ctx.rotate(angle);
            ctx.moveTo(radius * .7, 0)
            ctx.lineTo(radius * .9, 0);
            ctx.stroke();
            ctx.rotate(-angle);
        }
        // Indices for Minutes / Seconds
        for (var i = 0; i < 60; i++) {
            angle = (i + .5) * Math.PI / 30;
            ctx.rotate(angle);
            ctx.moveTo(radius * .9, 0)
            ctx.lineTo(radius, 0);
            ctx.stroke();
            ctx.rotate(-angle);
        }
    }

    function drawNumerals(date, sign) {
        let hour   = date.getHours(),
            minute = date.getMinutes(),
            angle;
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'center'
        ctx.fillStyle    = '#ddd';
        ctx.font         = radius * 0.12 + 'px Astro';
        // 12 signs
        for (var i = 1; i < 13; i++) {
            angle = i * Math.PI / 6;
            ctx.fillStyle = (i === Math.floor(sign)) ? '#999' : '#ddd';
            ctx.rotate(angle);
            ctx.translate(0, -radius * 0.55);
            ctx.rotate(-angle);
            ctx.fillText(signs[i - 1], 0, 0);
            ctx.rotate(angle);
            ctx.translate(0, radius * 0.55);
            ctx.rotate(-angle);
        }
        // 24 hours
        ctx.font = radius * 0.12 + 'px Astro';
        for (var i = 1; i < 25; i++) {
            angle = i * Math.PI / 12;
            ctx.fillStyle = (i === ((hour === 0) ? 24 : hour)) ? '#999' : '#ddd';
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
        for (var i = 1; i < 61; i++) {
            angle = i * Math.PI / 30;
            ctx.fillStyle = (i === ((minute === 0) ? 60 : minute)) ? '#999' : '#ddd';
            ctx.rotate(angle);
            ctx.translate(0, -radius * 0.95);
            ctx.rotate(-angle);
            ctx.fillText(String(i), 0, 0);
            ctx.rotate(angle);
            ctx.translate(0, radius * 0.95);
            ctx.rotate(-angle);
        }
    }

    function drawTime(date, sign) {
        var hour     = date.getHours(),
            minute   = date.getMinutes(),
            second   = date.getSeconds(),
            millisec = date.getMilliseconds();
        // sign
        sign = ((sign - .5) * Math.PI / 6);
        ctx.strokeStyle = '#ddd';
        drawHand(ctx, sign, radius * 0.4, radius * 0.005);
        // hour
        hour = ((hour - 0.5) * Math.PI / 12) +
               (minute * Math.PI / (12 * 60)) +
               (second * Math.PI / (720 * 60));
        ctx.strokeStyle = '#ccc';
        drawHand(ctx, hour, radius * 0.7, radius * 0.004);
        // minute
        minute = ((minute - 0.5) * Math.PI / 30) +
                 (second * Math.PI / (30 * 60)) +
                 (millisec * Math.PI / (30 * 60000));
        ctx.strokeStyle = '#bbb';
        drawHand(ctx, minute, radius * 0.9, radius * 0.003);
        // second
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

    function getSign(date) {
        var month = date.getMonth(),
            day   = date.getDate(),
            sign;
        switch (month) {
            case 0: // Jan
                if (day <= 19) {
                    // Capricon
                    // Dec 22 - Jan 19
                    // 9 (Dec) + 19 (Jan) = 28
                    sign = 10 + ((day + 9) / 28);
                } else {
                    // Aquarius
                    // Jan 20 - Feb 18
                    // 11 (Jan) + 18 (Feb) = 29
                    sign = 11 + ((day - 20) / 29);
                }
                break;
            case 1: // Feb
                if (day <= 18) {
                    // Aquarius
                    // Jan 20 - Feb 18
                    // 11 (Jan) + 18 (Feb) = 29
                    sign = 11 + ((day + 11) / 29);
                } else {
                    // Pisces
                    // Feb 19 - Mar 20
                    // 9/10 (Feb) + 20 (Mar) = 29/30
                    sign = 12 + ((day - 19) / (isLeapYear(date.getYear()) ? 29 : 30));
                }
                break;
            case 2:  // Mar
                if (day <= 20) {
                    // Pisces
                    // Feb 19 - Mar 20
                    // 9/10 (Feb) + 20 (Mar) = 29/30
                    var leapYear = isLeapYear(date.getYear());
                    sign = 12 + ((day + (leapYear ? 9 : 10)) / (leapYear ? 29 : 30));
                } else {
                    // Aries
                    // Mar 21 - Apr 19
                    // 10 (Mar) + 19 (Apr) = 29
                    sign = 1 + ((day - 21) / 29);
                }
                break;
            case 3: // Apr
                if (day <= 19) {
                    // Aries
                    // Mar 21 - Apr 19
                    // 10 (Mar) + 19 (Apr) = 29
                    sign = 1 + ((day + 10) / 29);
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
                    sign = 2 + ((day + 10) / 30);
                } else {
                    // Gemini
                    // May 21 - Jun 20
                    // 10 (May) + 20 (Jun) = 30
                    sign = 3 + ((day - 21) / 30);
                }
                break;
            case 5: // Jun
                if (day <= 20) {
                    // Gemini
                    // May 21 - Jun 20
                    // 10 (May) + 20 (Jun) = 30
                    sign = 3 + ((day + 10) / 30);
                } else {
                    // Cancer
                    // Jun 21 - Jul 22
                    // 9 (Jun) + 22 (Jul) = 31
                    sign = 4 + ((day - 21) / 31);
                }
                break;
            case 6: // Jul
                if (day <= 22) {
                    // Cancer
                    // Jun 21 - Jul 22
                    // 9 (Jun) + 22 (Jul) = 31
                    sign = 4 + ((day + 9) / 31);
                } else {
                    // Leo
                    // Jul 23 - Aug 22
                    // 7 (Jul) + 22 (Aug) = 29
                    sign = 5 + ((day - 23) / 29);
                }
                break;
            case 7:  // Aug
                if (day <= 22) {
                    // Leo
                    // Jul 23 - Aug 22
                    // 7 (Jul) + 22 (Aug) = 29
                    sign = 5 + ((day + 7) / 29);
                } else {
                    // Virgo
                    // Aug 23 - Sep 22
                    // 8 (Aug) + 22 (Sep) = 30
                    sign = 6 + ((day - 23) / 30);
                }
                break;
            case 8: // Sep
                if (day <= 22) {
                    // Virgo
                    // Aug 23 - Sep 22
                    // 8 (Aug) + 22 (Sep) = 30
                    sign = 6 + ((day + 8) / 30);
                } else {
                    // Libra
                    // Sep 23 - Oct 22
                    // 8 (Sep) + 22 (Oct) = 30
                    sign = 7 + ((day - 23) / 30);
                }
                break;
            case 9: // Oct
                if (day <= 22) {
                    // Libra
                    // Sep 23 - Oct 22
                    // 8 (Sep) + 22 (Oct) = 30
                    sign = 7 + ((day + 8) / 30);
                } else {
                    // Scorpio
                    // Oct 23 - Nov 21
                    // 8 (Oct) + 21 (Nov) = 29
                    sign = 8 + ((day - 23) / 29);
                }
                break;
            case 10: // Nov
                if (day <= 21) {
                    // Scorpio
                    // Oct 23 - Nov 21
                    // 8 (Oct) + 21 (Nov) = 29
                    sign = 8 + ((day + 8) / 29);
                } else {
                    // Sagittarius
                    // Nov 22 - Dec 21
                    // 8 (Nov) + 21 (Dec) = 29
                    sign = 9 + ((day - 22) / 29);
                }
                break;
            case 11: // Dec
                if (day <= 21) {
                    // Sagittarius
                    // Nov 22 - Dec 21
                    // 8 (Nov) + 21 (Dec) = 29
                    sign = 9 + ((day + 8) / 29);
                } else {
                    // Capicorn
                    // Dec 22 - Jan 19
                    // 9 (Dec) + 19 (Jan) = 28
                    sign = 10 + ((day - 22) / 28);
                }
        }
        return sign;
    }

    function isLeapYear(year) {
        return (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) ? true : false;
    }

}, true);
