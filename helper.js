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

var createPic10 = function(nrFocal) {
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
}

var createPic49 = function(nrFocal) {
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


var binomial = function(n, k) {
     if ((typeof n !== 'number') || (typeof k !== 'number')) 
  return false; 
    var coeff = 1;
    for (var x = n-k+1; x <= n; x++) coeff *= x;
    for (x = 1; x <= k; x++) coeff /= x;
    return coeff;
}

var vector_sum = function(vector) {
	var sum = 0
	_.map(vector, function(i) {sum = sum+i})
	return(sum)
}

var vector_prod = function(vector) {
	var prod = 1
	_.map(vector, function(i) {prod = prod*i})
	return(prod)
}

var vector_normalize = function(vector) {
	var v_sum = vector_sum(vector)
	return(_.map(vector, function(i) {return(i/v_sum)}))
}

var discrete_sample = function(prob_vector) {
	prob_vector = vector_normalize(prob_vector)
	var cumulative_vector = _.map(_.range(prob_vector.length), function(i) {
		return(vector_sum(_.slice(prob_vector, 0, i+1)))
	})
	var my_sample = _.random(0,1.0, true)
	var boolean_vector = _.map(cumulative_vector, function(i) {
		return(i < my_sample)
	})
	return(vector_sum(boolean_vector))
}


// returns an approximately optimal stimulus based on a production trial
var sampleFocalNumber_simple = function(productionTrial) {
	
	// total set size
	var TSS = productionTrial.nrTotal;

	// global error probability
	var eps = 0.000001

	// all hypotheses (= all pairs (u,l) of lower+upper bound with 0 <= l <= u <= TSS )
	var hypotheses = _.flatten(_.map(_.range(TSS+1), 
									 function(lower) {return(_.map(_.range(TSS+1-lower), 
																   function(upper) {return([lower,lower+upper])}))} ));
	
	var observations = productionTrial.observations;
	
	var get_likelihood_for_hypo_and_state = function(h,s,obs) {
		var true_description = h[0] <= s && s <= h[1]
		var true_factor  =  obs[0] == 0 ? 1 :  true_description ? (1-eps) ** obs[0] : eps ** obs[0]
		var false_factor =  obs[1] == 0 ? 1 : !true_description ? (1-eps) ** obs[1] : eps ** obs[1]
		return(binomial(obs[0] + obs[1], obs[0]) * true_factor * false_factor)	
	}	
	
	var get_likelihoods = function(observations) {
		var llh = _.map(hypotheses, function(h) {
							return(vector_prod(_.map(_.range(TSS+1), function(s) {
								var local_prob = get_likelihood_for_hypo_and_state(h,s,_.map([0,1], function(x) {return(observations[x][s])}))								
								return(local_prob);
								})))
							})
		return(llh)
	}

	var non_normalized_lh = get_likelihoods(observations);
	
	var posterior = vector_normalize(non_normalized_lh);

	var get_state_predictions = function(posterior) {
		return(_.map(_.range(TSS+1), function(s) {
			// weighted sum over all hypotheses 
			return(vector_sum(_.map(_.range(hypotheses.length), function(hindex) {
				var h = hypotheses[hindex];
				var hPost = posterior[hindex];	
				var prob_true = h[0] <= s && s <= h[1] ? 1-eps : eps
				return(hPost * prob_true)
			})))}))
	}

	var state_predictions = get_state_predictions(posterior)
	
//	console.log(state_predictions)

	var softmax_sample = function(prob_vector, alpha) {
		var softmax_probs = vector_normalize(_.map(prob_vector, function(s) {
			return(Math.exp(alpha * (0.5 - Math.abs(s-0.5))))
		}))
		return(discrete_sample(softmax_probs))
	}
	
//	return(softmax_sample(state_predictions, 10))
//	return(_.map(_.range(50), function(x) {return(softmax_sample(state_predictions, 100))}))
	return(softmax_sample(state_predictions, 10))
	
}

// returns an approximately optimal stimulus based on a production trial
var sampleFocalNumber_KL = function(productionTrial) {
	// dev file for opt exp design 4 Stanford pilot
	
	// total set size
	var TSS = productionTrial.nrTotal;

	// global error probability
	var eps = 0.000001

	// all hypotheses (= all pairs (u,l) of lower+upper bound with 0 <= l <= u <= TSS )
	var hypotheses = _.flatten(_.map(_.range(TSS+1), 
									 function(lower) {return(_.map(_.range(TSS+1-lower), 
																   function(upper) {return([lower,lower+upper])}))} ));

	var observations = productionTrial.observations;

	var get_likelihood_for_hypo_and_state = function(h,s,obs) {
		var true_description = h[0] <= s && s <= h[1]
		var true_factor  =  obs[0] == 0 ? 1 :  true_description ? (1-eps) ** obs[0] : eps ** obs[0]
		var false_factor =  obs[1] == 0 ? 1 : !true_description ? (1-eps) ** obs[1] : eps ** obs[1]
		return(binomial(obs[0] + obs[1], obs[0]) * true_factor * false_factor)	
	}	
	
	var get_likelihoods = function(observations) {
		var llh = _.map(hypotheses, function(h) {
							return(vector_prod(_.map(_.range(TSS+1), function(s) {
								var local_prob = get_likelihood_for_hypo_and_state(h,s,_.map([0,1], function(x) {return(observations[x][s])}))								
								return(local_prob);
								})))
							})
		return(llh)
	}

	var non_normalized_lh = get_likelihoods(observations);
	
	var posterior = vector_normalize(non_normalized_lh);

	var get_state_predictions = function(posterior) {
		return(_.map(_.range(TSS+1), function(s) {
			// weighted sum over all hypotheses 
			return(vector_sum(_.map(_.range(hypotheses.length), function(hindex) {
				var h = hypotheses[hindex];
				var hPost = posterior[hindex];	
				var prob_true = h[0] <= s && s <= h[1] ? 1-eps : eps
				return(hPost * prob_true)
			})))}))
	}

	var state_predictions = get_state_predictions(posterior)

	var softmax_sample_KL = function(vector, alpha) {
		var softmax_probs = vector_normalize(_.map(vector, function(s) {
			return(Math.exp(alpha * s))
		}))
		return(discrete_sample(softmax_probs))
	}
	
//	return(softmax_sample(state_predictions, 10))
	
	
	var KL = function(p, q){
  		var KLdiv = vector_sum(_.map(_.range(p.length), function(cell) {
  			if (p[cell] == 0 || q[cell] == 0) {
      			return(0) // actually, if q == 0 this should be -Inf, but this case cannot arise
    		} else {
      			return(p[cell] * Math.log(p[cell] / q[cell]))
    		}
  		}))
//		console.log(KLdiv)
		return(KLdiv)
  	};
	
	var get_expected_information_gain = function(non_normalized_lh, posterior, state_predictions) {
		// for each state:
		// - probability of each outcome TRUE or FALSE
		// - times KL-divergence current state to new state after hypothetical outcome
		return(_.map(_.range(TSS+1), function(s) {
			var obs = [observations[0][s], observations[1][s]]
			var obs_true = [observations[0][s] + 1, observations[1][s]]
			var obs_false = [observations[0][s], observations[1][s] + 1]
			var posterior_true = vector_normalize(_.map(_.range(hypotheses.length), function(h) {
				return(non_normalized_lh[h] / get_likelihood_for_hypo_and_state(h,s,obs) *
					   get_likelihood_for_hypo_and_state(h,s,obs_true))
			})); //hypothetical posterior after another TRUE observation
			var posterior_false = vector_normalize(_.map(_.range(hypotheses.length), function(h) {
				return(non_normalized_lh[h] / get_likelihood_for_hypo_and_state(h,s,obs) *
					   get_likelihood_for_hypo_and_state(h,s,obs_false))
			})); //hypothetical posterior after another FALSE observation
			return(state_predictions[s] * KL(posterior_true, posterior) + 
				   (1-state_predictions[s]) * KL(posterior_false, posterior))
		}))
	}
	
//	console.log(posterior)
	var exp_info_gain = get_expected_information_gain(non_normalized_lh, posterior, state_predictions)
	
//	console.log("expected info gain: " + exp_info_gain)
	
//	return(_.map(_.range(50), function(x) {return(softmax_sample_KL(vector_normalize(exp_info_gain), 100))}))
	
	return(softmax_sample_KL(vector_normalize(exp_info_gain), 100))
}

