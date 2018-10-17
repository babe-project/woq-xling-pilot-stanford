function validButNoAtSign(responseInput) {
    return (
        responseInput.length > 0 &&
        (responseInput.split('@').length - 1 <= 1 &&
            (responseInput.indexOf('No') == -1 ||
                responseInput.indexOf('no') == -1))
    );
}

function someOptionSelected() {
    return (
        document.getElementById('responseTrue').checked ||
        document.getElementById('responseFalse').checked
    );
}

function getResponse() {
    if (document.getElementById('responseTrue').checked) {
        return 'true';
    } else if (document.getElementById('responseFalse').checked) {
        return 'false';
    }
}

// Function from canvasTemplate
// draws the shapes on the canvas
// gets the canvas element and the trial info as arguments
//
// canvas.draw expects the following arguments:
// shape (circle, sqaure or triangle)
// size of the shape
// x and y coords
// color
//
// canvas.getCoords expects the following arguments:
// the number of the elements to be drawn (int)
// the size of a sinlgle elemen (int)
// returns: a list of objects with x and y properties
var drawOnCanvas = function(canvasElem, trialInfo, displayType) {
    var canvas = createCanvas(canvasElem);
    var coords =
        displayType == 'grid'
            ? canvas.getGridCoords(
                  trialInfo.rows,
                  trialInfo.total,
                  trialInfo.size
              )
            : displayType == 'gridSplit'
                ? canvas.getTwoSidedCoords(
                      trialInfo.rows,
                      trialInfo.gap,
                      trialInfo.total,
                      trialInfo.size,
                      'sideRow'
                  )
                : canvas.getRandomCoords(trialInfo.total, trialInfo.size);
    //    var coords = canvas.getRandomCoords(trialInfo.total, trialInfo.size);
    // var coords = canvas.getGridCoords(trialInfo.rows, trialInfo.total, trialInfo.size);
    // var coords = canvas.getTwoSidedCoords(trialInfo.rows, trialInfo.gap, trialInfo.total, trialInfo.size, 'sideRow');

    for (var i = 0; i < trialInfo.total; i++) {
        if (i < trialInfo.focalNumber) {
            canvas.draw(
                trialInfo.focalShape,
                trialInfo.size,
                coords[i].x,
                coords[i].y,
                trialInfo.focalColor
            );
        } else {
            canvas.draw(
                trialInfo.otherShape,
                trialInfo.size,
                coords[i].x,
                coords[i].y,
                trialInfo.otherColor
            );
        }
    }
};
