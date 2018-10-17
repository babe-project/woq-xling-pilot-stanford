let trials_50 = _.map(
    _.concat(
        0,
        _.map(_.range(12), function(i) {
            return _.random(4 * i + 1, 4 * i + 4);
        }),
        49
    ),
    function(nrFocal) {
        const fc = _.shuffle(['black', 'white'])[0];
        return {
            total: 49,
            size: 10,
            rows: 5,
            focalColor: fc,
            otherColor: fc === 'black' ? 'white' : 'black',
            focalShape: 'circle',
            focalNumber: nrFocal,
            otherShape: 'circle'
        };
    }
);

let trials_10 = _.map(_.range(11), function(nrFocal) {
    const fc = _.shuffle(['black', 'white'])[0];
    return {
        total: 10,
        size: 20,
        rows: 2,
        focalColor: fc,
        otherColor: fc === 'black' ? 'white' : 'black',
        focalShape: 'circle',
        focalNumber: nrFocal,
        otherShape: 'circle'
    };
});

let main_trials = _.shuffle(_.concat(trials_50, trials_10));
