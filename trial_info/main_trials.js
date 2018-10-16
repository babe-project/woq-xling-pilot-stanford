let trials_50 = _.map(_.concat(0, _.map(_.range(12), function(i) {return _.random(4*i +1, 4*i+4)}), 49),
					   function(nrFocal) {return {nrTotal: 49, nrFocal: nrFocal, focalColor: _.shuffle(["black", "white"])[0]}});

let trials_10 = _.map(_.range(11),
					   function(nrFocal) {return {nrTotal: 10, nrFocal: nrFocal, focalColor: _.shuffle(["black", "white"])[0]}});


let main_trials = _.shuffle(_.concat(trials_50, trials_10));