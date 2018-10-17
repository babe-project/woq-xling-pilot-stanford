function fillArray(value, len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr.push(value);
    }
    return arr;
}

function uniform(a, b) {
    return Math.random() * (b - a) + a;
}

function get100Points(n_total, n_target, tcolor, ocolor, w, h, radius) {
    var points = [];
    var targetcolor = tcolor;
    var othercolor = ocolor;
    var pointcolors = _.shuffle(
        fillArray(targetcolor, n_target).concat(
            fillArray(othercolor, n_total - n_target)
        )
    );

    var pcnt = 0;
    var y = 24.5;

    // This is to essentially paint 8 rows of points.
    for (var i = 0; i < 4; i++) {
        for (var x = 23; x < 600; x += 46) {
            points.push({
                x: x + uniform(-13, 13),
                y: y + uniform(-13, 13),
                color: pointcolors[pcnt]
            });
            pcnt++;
        }
        y = y + 49;
        for (var x = 24.5; x < 600; x += 49) {
            points.push({
                x: x + uniform(-13, 13),
                y: y + uniform(-13, 13),
                color: pointcolors[pcnt]
            });
            pcnt++;
        }
        y = y + 49;
    }

    return points;
}

function get5Points(n_total, n_target, tcolor, ocolor, w, h, radius) {
    var points = [];
    var targetcolor = tcolor;
    var othercolor = ocolor;
    var pointcolors = _.shuffle(
        fillArray(targetcolor, n_target).concat(
            fillArray(othercolor, n_total - n_target)
        )
    );

    var pcnt = 0;

    points.push({
        x: 100 + uniform(-70, 70),
        y: 100 + uniform(-60, 60),
        color: pointcolors[pcnt]
    });
    pcnt++;
    points.push({
        x: 300 + uniform(-70, 70),
        y: 100 + uniform(-60, 60),
        color: pointcolors[pcnt]
    });
    pcnt++;
    points.push({
        x: 500 + uniform(-70, 70),
        y: 100 + uniform(-60, 60),
        color: pointcolors[pcnt]
    });
    pcnt++;
    points.push({
        x: 150 + uniform(-90, 90),
        y: 300 + uniform(-60, 60),
        color: pointcolors[pcnt]
    });
    pcnt++;
    points.push({
        x: 350 + uniform(-90, 90),
        y: 300 + uniform(-60, 60),
        color: pointcolors[pcnt]
    });

    return points;
}

function get10Points(n_total, n_target, tcolor, ocolor, w, h, radius) {
    var points = [];
    var targetcolor = tcolor;
    var othercolor = ocolor;
    var pointcolors = _.shuffle(
        fillArray(targetcolor, n_target).concat(
            fillArray(othercolor, n_total - n_target)
        )
    );

    var pcnt = 0;
    var cnt = 0;
    for (var y = 67; y < 400; y += 133) {
        if (cnt % 2 == 0) {
            for (var x = 100; x < 600; x += 200) {
                points.push({
                    x: x + uniform(-80, 80),
                    y: y + uniform(-40, 40),
                    color: pointcolors[pcnt]
                });
                pcnt++;
            }
        } else {
            for (var x = 75; x < 600; x += 150) {
                points.push({
                    x: x + uniform(-60, 60),
                    y: y + uniform(-40, 40),
                    color: pointcolors[pcnt]
                });
                pcnt++;
            }
        }
        cnt++;
    }
    return points;
}

function get25Points(n_total, n_target, tcolor, ocolor, w, h, radius) {
    var points = [];
    var targetcolor = tcolor;
    var othercolor = ocolor;
    var pointcolors = _.shuffle(
        fillArray(targetcolor, n_target).concat(
            fillArray(othercolor, n_total - n_target)
        )
    );

    var pcnt = 0;

    // 5 cycles stopping at 360.
    for (var y = 40; y < 400; y += 80) {
        // 5 cycles stopping at 540
        for (var x = 60; x < 600; x += 120) {
            points.push({
                x: x + uniform(-30, 30),
                y: y + uniform(-25, 25),
                color: pointcolors[pcnt]
            });
            pcnt++;
        }
    }
    return points;
}

// For now let me just use a special method for drawing 50 points anyways, but we need to come up with a generic algorithm for drawing points if this experiment is still to be repeated in the future.
function get50Points(n_total, n_target, tcolor, ocolor, w, h, radius) {
    var points = [];
    var targetcolor = tcolor;
    var othercolor = ocolor;
    var pointcolors = _.shuffle(
        fillArray(targetcolor, n_target).concat(
            fillArray(othercolor, n_total - n_target)
        )
    );

    var pcnt = 0;

    // 5 cycles
    for (var y = 40; y < 400; y += 80) {
        // 10 cycles
        for (var x = 30; x < 600; x += 60) {
            points.push({
                x: x + uniform(-15, 15),
                y: y + uniform(-25, 25),
                color: pointcolors[pcnt]
            });
            pcnt++;
            // This is a hack to accomodate the 49-ball situation. A long-term solution would be to come up with a real generic `getPoints` method.
            if (pcnt > n_total - 1) {
                break;
            }
        }
    }
    return points;
}

function draw(id, n_total, n_target, tcolor, ocolor) {
    var canvas = document.getElementById(id);
    canvas.style.background = 'lightgrey'; // Useful in the case of black/white colors.
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 400;
        var radius = 0;

        if (n_total < 25) {
            radius = 150 / n_total;
        } else {
            if (n_total == 25) {
                radius = 10;
            } else {
                radius = 6;
            }
        }

        //paint the rectangle
        // var x = canvas.width / 2;
        // var y = canvas.height / 4
        var counterClockwise = true;
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.stroke();

        //paint the marbles
        let points;
        if (n_total == 5) {
            points = get5Points(
                n_total,
                n_target,
                tcolor,
                ocolor,
                canvas.width,
                canvas.height,
                radius
            );
        } else if (n_total == 10) {
            points = get10Points(
                n_total,
                n_target,
                tcolor,
                ocolor,
                canvas.width,
                canvas.height,
                radius
            );
        } else if (n_total == 25) {
            points = get25Points(
                n_total,
                n_target,
                tcolor,
                ocolor,
                canvas.width,
                canvas.height,
                radius
            );
            // Hacky. Just trying to play off on the code structure left over from the original woq.
        } else if (n_total == 50 || n_total == 49) {
            points = get50Points(
                n_total,
                n_target,
                tcolor,
                ocolor,
                canvas.width,
                canvas.height,
                radius
            );
        } else {
            points = get100Points(
                n_total,
                n_target,
                tcolor,
                ocolor,
                canvas.width,
                canvas.height,
                radius
            );
        }

        for (var i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, radius, 0, 2 * Math.PI, true);
            ctx.fillStyle = points[i].color;
            ctx.closePath();
            ctx.fill();
        }
    }
}
