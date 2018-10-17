var createCanvas = function(canvasElem) {
    var canvas = {};
    var context = canvasElem.getContext("2d");

    canvas.draw = function(shape, size, x, y, color) {
        context.beginPath();
        if (shape === 'circle') {
            context.arc(x, y, size / 2, 0, 2*Math.PI);
        } else if (shape === 'square') {
            context.rect(x - (size / 2), y - (size / 2), size, size);
        } else if (shape === 'triangle') {
            var delta = size / (Math.sqrt(3)*2);
            context.moveTo(x - (size / 2), y + delta);
            context.lineTo(x + (size / 2), y + delta);
            context.lineTo(x, y - 2*delta);
        }
        if (color === 'blue') {
            context.fillStyle = '#2c89df';
        } else if (color === 'green') {
            context.fillStyle = '#22ce59';
        } else if (color === 'red') {
            context.fillStyle = '#ff6347';
        } else if (color === 'yellow') {
            context.fillStyle = '#ecd70b';
        } else {
            context.fillStyle = color;
        }
        context.closePath();
        context.fill();
    };

    canvas.getTwoSidedCoords = function(rows, gap, number, size, direction) {
        // a list of coords
        var coords = [];
        var tempCoords = [];
        // the space between the elems
        var margin = size / 2;
        var columns, xStart, yStart;

        // reset the rows if not passed or more than the total elems
        rows = (rows === 0 || rows === undefined) ? 1 : rows;
        rows = (rows > number) ? number : rows;
        // sets a gap if not specified
        gap = (gap <= size + margin || gap === undefined) ? (margin + size) : gap;
        // calculates the total number of columns per side
        columns = Math.ceil(number / rows);
        // gets the first coordinate so that the elems are centered on the canvas
        xStart = (canvasElem.width - (columns * size + (columns - 2) * margin)) / 2 + margin / 2 - gap / 2;
        yStart = (canvasElem.height - (rows * size + (rows - 2) * margin)) / 2 + margin;

        // expands the canvas if needed
        if (xStart < margin) {
            canvasElem.width += -2*xStart;
            xStart = margin;
        }

        // expands the canvas if needed
        if (yStart < margin) {
            canvasElem.height += -2*yStart;
            yStart = margin;
        }

        // generates the coords
        // for each row
        for (var i=0; i<rows; i++) {
            // for each elem
            for (var j=0; j<number; j++) {
                // x position, y position
                var xPos, yPos;
                 // position on the right
                if ((Math.floor(j/columns) === i) && (j%columns >= Math.ceil(columns / 2))) {
                    xPos = xStart + (j%columns)*size + (j%columns)*margin + gap;
                    yPos = yStart + i*size + i*margin;
                    tempCoords.push({x: xPos, y: yPos});
                // position on the left
                } else if (Math.floor(j/columns) === i) {
                    xPos = xStart + (j%columns)*size + (j%columns)*margin;
                    yPos = yStart + i*size + i*margin
                    tempCoords.push({x: xPos, y: yPos});
                }
            }
        }

        // coords' position on the canvas
        /*
            ----------------
            |              |
            |   000  00x   |
            |   xxx  xxx   |
            |   xxx  xxx   |
            |              |
            ----------------
        */ 
        if (direction === 'row' || direction === undefined) {
            coords = tempCoords;
        /*
            ----------------
            |              |
            |   000  xxx   |
            |   00x  xxx   |
            |   xxx  xxx   |
            |              |
            ----------------
        */ 
        } else if (direction === 'sideRow') {
            var leftPart = [];
            var rightPart = [];
            for (var i=0; i<tempCoords.length; i++) {
                if (i%columns < columns/2) {
                    leftPart.push(tempCoords[i]);
                } else {
                    rightPart.push(tempCoords[i]);
                }
            }

            coords = leftPart.concat(rightPart);
        /*
            ----------------
            |              |
            |   00x  xxx   |
            |   00x  xxx   |
            |   0xx  xxx   |
            |              |
            ----------------
        */ 
         } else if (direction === 'column') {
            var idx;

            for (var i=0; i<tempCoords.length; i++) {
                idx = ((i%rows) * columns) + Math.floor(i/rows);
                coords.push(tempCoords[idx]);
            }
        }

        return coords;
    };

    canvas.getRandomCoords = function(number, size) {
        var coords = [];
        var margin = size / 2;

        var generateCoords = function() {
            var maxWidth = canvasElem.width - size;
            var maxHeight = canvasElem.height - size;
            var xPos = Math.floor(Math.random() * (maxWidth - size)) + size;
            var yPos = Math.floor(Math.random() * (maxHeight - size)) + size;
            
            return {x: xPos, y: yPos};
        };

        var checkCoords = function(xPos, yPos) {
            for (var i=0; i<coords.length; i++) {
                if (((xPos + size + margin) > coords[i]["x"])
                    && ((xPos - size - margin) < coords[i]["x"])
                    && ((yPos + size + margin) > coords[i]["y"])
                    && ((yPos - size - margin) < coords[i]["y"])) {
                    return false;
                }
            }
            return true;
        };

        var generatePositions = function() {
            var tempCoords = generateCoords();
            if (checkCoords(tempCoords.x, tempCoords.y)) {
                coords.push(tempCoords);
            } else {
                generatePositions();
            }      
        };

        for (i=0; i<number; i++) {
            generatePositions();
        }

        return coords;
    };

    canvas.getGridCoords = function(rows, number, size) {
        var coords = [];
        var margin = size / 2;
        var columns, xStart, yStart;

        if (rows === 0 || rows === undefined) {
            rows = 1;
        } else if (rows > number) {
            rows = number;
        }
        
        columns = Math.ceil(number / rows);
        xStart = (canvasElem.width - (columns * size + (columns - 2) * margin)) / 2 + margin / 2;
        yStart = (canvasElem.height - (rows * size + (rows - 2) * margin)) / 2 + margin;

        // handles small canvases
        if (xStart < margin) {
            canvasElem.width += -2*xStart;
            xStart = margin;
        }

        if (yStart < margin) {
            console.log('true');
            canvasElem.height += -2*yStart;
            yStart = margin;
        }

        for (var i=0; i<rows; i++) {
            for (var j=0; j<number; j++) {
                if (Math.floor(j/columns) === i) {
                    coords.push({x: xStart + (j%columns)*size + (j%columns)*margin, y: yStart + i*size + i*margin})
                } else {
                    continue;
                }
            }
        }

        return coords;
    };

    return canvas;
};