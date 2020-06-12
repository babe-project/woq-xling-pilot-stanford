let introView = babeViews.intro({
    name: 'intro',
    trials: 1,
    title: '',
    text: 'We invite you to participate in a research study on language production and comprehension. <br><p>There are no risks or benefits of any kind involved in this study.</p><br><p> If you have read this form and have decided to participate in this experiment, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. You have the right to refuse to do particular tasks. Your individual privacy will be maintained in all published and written data resulting from the study.</p><br><p> You may print this form for your records.</p><br><p> If you agree to participate, please proceed to the study tasks.',
    buttonText: 'Begin Experiment'
});

let instructionsView = babeViews.instructions({
    name: 'instructions',
    trials: 1,
    title: 'Instructions',
    text:
        'In this experiment we are interested in <strong>how to express quantity in your native language</strong>. There are two parts. We will explain each part before it begins.',
    buttonText: 'Continue'
});

babeViews.indicateNativeLanguage = function(config) {
    // I don't think there's any other way than to fetch the data in this function, at this moment.

    const _indicateNativeLanguage = {
        name: config.name,
        title: config.title,
        render: async function(CT, _babe) {
            let startTime = Date.now();

            const viewTemplateLoading = `Loading...`;
            $('#main').html(viewTemplateLoading);

            const viewTemplate = `<div class='view'>
                <h1 class="title">${this.title}</h1>
                <p>Please indicate your native language.</p>

                <br>

                <select name="nativeLang" id="lang-select"></select>

                <br>

                <p>If your native language is not yet in the above list, please enter it below:</p>

                <textarea class="native-lang-input" cols="30" ></textarea>

                <button id="the-button">Continue</button>

                <p class="error-info err-no-nativelang">Please indicate your native language</p>
            </div>`;

            const regex = '/submit_experiment/';
            const prevResultsURL = config_deploy.submissionURL.replace(
                regex,
                '/retrieve_experiment/'
            );

            const prevResults = await fetch(prevResultsURL).then((dataLoad) => {
                if (dataLoad.status === 200) {
                    return dataLoad.json();
                } else {
                    return [];
                }
            });

            // This is just a temporary solution. There should be a way to let the frontend framework to fetch the previous results at the beginning of the experiment.
            _babe.prevResults = prevResults;
			_babe.freeProduction = []; // where to store the production data

            const prevLanguages = new Set();

            // Nothing will happen if prevResults is empty.
            for (const experiment of prevResults) {
                // Apparently the first trial should be the trial asking for the native language... This is a bit unreliable. It would be better if we can merge it just like we did it in the additional information trial.
                const thisNativeLanguage = experiment[0].native_language;
                prevLanguages.add(thisNativeLanguage);
            }

            // Set the authentic view template after loading.
            $('#main').html(viewTemplate);

            const langSelect = document.getElementById('lang-select');
            let options =
                '<option value="choose">Please choose a language</option>';
            for (const lang of prevLanguages) {
                options += `<option value="${lang}">${lang}</option>`;
            }
            langSelect.innerHTML = options;

            $('#the-button').on('click', function(e) {
                $('.err-no-nativelang').hide();
                // Check whether they entered a language
                let nativeLang = document.getElementById('lang-select').value;
                // If they didn't make a selection
                if (nativeLang == null || nativeLang === 'choose') {
                    const nativeLangInput = $('.native-lang-input').val();
                    if (nativeLangInput.length <= 0) {
                        $('.err-no-nativelang').show();
                        return;
                    } else {
                        nativeLang = nativeLangInput;
                    }
                }

                _babe.trial_data.push({
                    trial_type: config.trial_type,
                    trial_number: CT + 1,
                    native_language: nativeLang
                });
                _babe.findNextView();
            });
        },
        CT: 0,
        trials: 1
    };

    return _indicateNativeLanguage;
};

let indicateNativeLanguage = babeViews.indicateNativeLanguage({
    name: 'nativeLang',
    trials: 1,
    title: 'Please indicate your native language',
    trial_type: 'nativeLang'
});

let beginFirstPart = babeViews.instructions({
    name: 'instructionsPart1',
    trials: 1,
	title: 'Instructions for Part I',
    text:
        "In the first part, we will show you pictures of black or white dots on a gray background. For each picture, please provide at least one simple description, as if you were answering the question <strong>'How many of the dots are COLOR?'</strong> where COLOR could either be 'white' or 'black' as indicated on each screen. You can provide up to three answers to this question, but you must minimally provide one in order to be able to proceed. <br> <br> Possible English answers could be <strong>'all/none/some/most ... of the dots are COLOR'</strong>. Please try to give a sentence in your native language that provides similar information. <br><br> It is important that you <strong>avoid using numbers</strong>, either as integers or spelled out as words. Please <strong>use expressions that do not involve any reference to numbers</strong>. <br><br> Please mark the part that in an English sentence would be expressed by words like 'all', 'none', 'some', 'most', etc. by putting it between @XYZ@. For example, if English answers were allowed in this experiment, we could type '@Most@ of the dots are black'. But remember: <strong>type a sentence or expression in your native language</strong>, which you have indicated on the previous screen.",
    buttonText: 'Continue'
});

let beginSecondPart = babeViews.instructions({
    name: 'Second',
    trials: 1,
	title: 'Instructions for Part II',
    text:
        'Thanks for your answers! We will now move on to Part II of the experiment. Please take a short break if you want. Make sure you are focused on the following instructions and the second part. <br> <br> Part II will now show you descriptions which you have typed in during Part I. For each description you gave, we will show you a number of pictures similar to those in Part I again. For each picture and sentence, please <strong>judge whether the description is a good description of the picture</strong>.',
	buttonText: 'Continue'
});

let beginThirdPart = babeViews.instructions({
    name: 'Third',
    trials: 1,
	title: 'Instructions for Part III',
    text:
        'Thanks for your work so far! We are almost done. Please take a short break if you want. <br> <br> The third and last part of this experiment will ask you for English translations of your input from Part I. Please <strong>type in a single English paraphrase for the descriptions shown on each screen</strong>.',
	buttonText: 'Continue'
});

let mainView = babeViews.forcedChoice({
    name: 'main',
    trials: 2,
    trial_type: 'main',
    data: main_trials
});

let postTestView = babeViews.postTest({
    name: 'posttest',
    trials: 1,
    title: 'Additional Info',
    text:
        'Answering the following questions is optional, but will help us understand your answers.'
});

let thanksView = babeViews.thanks({
    name: 'thanks',
    trials: 1,
    title: 'Thank you for taking part in this experiment!'
});

babeViews.describePicture = function(config) {
    const _describePicture = {
        name: config.name,
        title: config.title,
        render(CT, _babe) {
            let startTime = Date.now();

            const viewTemplate = `<div class='view'>
            
            <h1 class="title">{{{ title }}}</h1>

 				<canvas id="situation" style="width:600px;height:300px;background:lightgrey"></canvas>

                <br/>
                
                <p> Describe the quantity of <i>{{focalColor}}</i> dots in this picture in your native language. Give one or up to three descriptions. Put &#64; (<i>at</i> signs) around each of the words that express quantity. </p>

                <br>

                <textarea class="response-input response-input-1" cols="40"></textarea>
                <br>
                <textarea class="response-input response-input-2" cols="40"></textarea>
                <br>
                <textarea class="response-input response-input-3" cols="40"></textarea>

                <p class="error-info err-no-input">Please fill in at least one textarea.</p>
                <p class="error-info err-no-quantifier">Please use @ @ around the corresponding words to indicate them. It doesn't have to be a one-to-one correspondence; you may mark multiple words, if needed.</p>

                <button id="the-button">Press me!</button>
            </div>`;

            $('#main').html(
                Mustache.render(viewTemplate, {
                    title: this.title + "<strong>" + config.data[CT].focalColor + "</strong>" + "?",
                    focalColor: config.data[CT].focalColor,
                    nrTotal: config.data[CT].total,
                    nrFocal: config.data[CT].focalNumber
                })
            );

            drawOnCanvas(
                document.getElementById('situation'),
                config.data[CT],
                'random'
            );

            $('#the-button').on('click', function(e) {
                // First hide the error info in case there's a previous error already shown.
                $('.error-info').hide();
                // Collect the responses
                const responseInput1 = $('.response-input-1').val();
                const responseInput2 = $('.response-input-2').val();
                const responseInput3 = $('.response-input-3').val();

                if (
                    responseInput1.length <= 0 &&
                    responseInput2.length <= 0 &&
                    responseInput3.length <= 0
                ) {
                    $('.err-no-input').show();
                } else if (
                    validButNoAtSign(responseInput1) ||
                    validButNoAtSign(responseInput2) ||
                    validButNoAtSign(responseInput3)
                ) {
                    $('.err-no-quantifier').show();
                } else {
                    _babe.trial_data.push({
                        trial_type: config.trial_type,
                        trial_number: CT + 1,
                        RT: Date.now() - startTime,
                        response1: responseInput1,
                        response2: responseInput2,
                        response3: responseInput3,
                        focalColor: config.data[CT].focalColor,
                        nrTotal: config.data[CT].total,
                        nrFocal: config.data[CT].focalNumber
                    });
					// prepare seperate data storage for reuse in Part II
					var descriptions = [];
					responseInput1.length > 0 ? descriptions.push(responseInput1) : false
					responseInput2.length > 0 ? descriptions.push(responseInput2) : false
					responseInput3.length > 0 ? descriptions.push(responseInput3) : false
					_.map(descriptions, function(d) {
						var dIndex = _babe.freeProduction.length ==0 ? -1 : _.findIndex(_babe.freeProduction, function(p) {return(p.description == d & p.nrTotal == config.data[CT].total) });
						if (dIndex >= 0) { // existing description
							_babe.freeProduction[dIndex].observations[0][config.data[CT].focalNumber] += 1;
						} else { // new description
							// this matrix will hold the observations of TRUE and FALSE answers for each state
							var observations = [Array.apply(null, Array(config.data[CT].total+1)).map(Number.prototype.valueOf,0),
							Array.apply(null, Array(config.data[CT].total+1)).map(Number.prototype.valueOf,0)];
							observations[0][config.data[CT].focalNumber] = 1;
							_babe.freeProduction.push({
								description: d,
								nrTotal: config.data[CT].total,
								focalColor: config.data[CT].focalColor,
								observations: observations
							});	
						}
							
					})
//					console.log(_babe.freeProduction);
					// hacky way of adjusting length of Part II (todo: improve on this!)
					// five trials for each unique given description for each TSS
					_babe.views_seq[6].trials = _babe.freeProduction.length * 5; // part II
					_babe.views_seq[8].trials = _babe.freeProduction.length;     // part I
                    _babe.findNextView();
                }
            });
        },
        CT: 0,
        trials: config.trials
    };

    return _describePicture;
};

let describePicture = babeViews.describePicture({
    name: 'describePicture',
    title: 'How many of the dots are ',
    trial_type: 'describePicture',
    data: main_trials,
    trials: main_trials.length // TODO: set eventually to : main_trials.length
});

babeViews.truthValueJudgement = function(config) {
    const _truthValueJudgement = {
        name: config.name,
        title: config.title,
        render(CT, _babe) {
			var currentDescriptionIndex = _.floor(CT/5)
			var currentFocalNumber = sampleFocalNumber_KL(_babe.freeProduction[currentDescriptionIndex]);
			var currentTotal = _babe.freeProduction[currentDescriptionIndex].nrTotal;
			var currentDescription = _babe.freeProduction[currentDescriptionIndex].description;
			var currentFocalColor = _babe.freeProduction[currentDescriptionIndex].focalColor;
			var trialInfo = currentTotal == 49 ? createPic49(currentFocalNumber) : createPic10(currentFocalNumber);
			console.table(trialInfo)
			console.table(_babe.freeProduction[currentDescriptionIndex].observations)
			trialInfo.focalColor = currentFocalColor; // override the random choice of focal color
			trialInfo.otherColor = currentFocalColor === 'black' ? 'white' : 'black'; // override the random choice of focal color
			
            let startTime = Date.now();

            const viewTemplate = `<p class='view'>
                {{# title }}
                <h1 class="title">{{{ title }}}</h1>
                {{/ title }}

                <br>

                <p class="picturedescription"> {{ description }} </p>

				<br>


				<br>

                <canvas id="binaryCanvas" style="width:600px;height:300px;background:lightgrey"></canvas>

                <br>

				<br>

                <p> Is this a good description of the picture as an answer to the question?</p>

                <div class="options-container">
                <div>
                    <input type="radio" id="responseTrue"
                        name="response" value="true">
                    <label for="responseTrue">affirm</label>

                    <input type="radio" id="responseFalse"
                        name="response" value="false">
                    <label for="responseFalse">deny</label>
                </div>
                </div>

                <br/>

                <p>(Press <strong>a</strong> to select "affirm", <strong>d</strong> for "deny", and <strong>Enter</strong> to continue.)</p>

                <button id="the-button">Continue</button>

                <p class="error-info err-no-selection">Please select an answer.</p>
            </div>`;

            $('#main').html(
                Mustache.render(viewTemplate, {
                    title: "How many of the dots are <strong>" +  currentFocalColor + "</strong>?",
					description: currentDescription
                })
            );

            // Here is where one accesses the previous results.
//            console.table(_babe.prevResults);
//			console.table(_babe.trial_data);
//			console.log(_babe.freeProduction);
			
            const binaryNext = function(e) {
                if (!someOptionSelected()) {
                    $('.err-no-selection').show();
                } else {
                    _babe.trial_data.push({
                        trial_type: config.trial_type,
                        trial_number: CT + 1,
                        RT: Date.now() - startTime,
                        sentence_shown:
                            currentDescription,
                        binaryChoice: getResponse(),
                        focalColor: currentFocalColor,
                        nrTotal: currentTotal,
                        nrFocal: currentFocalNumber
                    });
					_babe.freeProduction[currentDescriptionIndex].observations[getResponse() == "true" ? 0 : 1][currentFocalNumber] += 1;
                    _babe.findNextView();
                }
            };

            // Should add some listener/event handler on the True and False options.
            document.onkeydown = function(e) {
                e = e || window.event;
                if (e.keyCode == 65) {
                    document.getElementById('responseTrue').checked = true;
                } else if (e.keyCode == 68) {
                    document.getElementById('responseFalse').checked = true;
                } else if (e.keyCode == 13) {
                    binaryNext();
                }
            };

            drawOnCanvas(
                document.getElementById('binaryCanvas'),
                trialInfo,
                'random'
            );

            $('#the-button').on('click', binaryNext);
        },
        CT: 0,
        trials: config.trials
    };

    return _truthValueJudgement;
};

let truthValueJudgement = babeViews.truthValueJudgement({
    name: 'truthValueJudgement',
    title: 'Is this a good description of the picture?',
    trial_type: 'truthValueJudgement',
    data: main_trials,
    trials: 3 // this is set automatically
});


babeViews.translateInput = function(config) {
    const _translateInput = {
        name: config.name,
        title: config.title,
        render(CT, _babe) {
			var currentDescription = _babe.freeProduction[CT].description;
			
            let startTime = Date.now();

            const viewTemplate = `<p class='view'>
                {{# title }}
                <h1 class="title">{{ title }}</h1>
                {{/ title }}
                
                <br>

                <p class="picturedescription"> {{ description }} </p>

				<br>
				<br>

				<textarea class="response-input response-input-1" cols="40"></textarea>
                <br>

                <button id="the-button">Continue</button>

                <p class="error-info err-no-input">Please fill in an English translation.</p>
            </div>`;

            $('#main').html(
                Mustache.render(viewTemplate, {
                    title: this.title,
					description: currentDescription
                })
            );
			
            $('#the-button').on('click', function(e) {
                // First hide the error info in case there's a previous error already shown.
                $('.error-info').hide();
                // Collect the responses
                const responseInput1 = $('.response-input-1').val();

                if (
                    responseInput1.length <= 0 
                ) {
                    $('.err-no-input').show();
                } else {
                    _babe.trial_data.push({
                        trial_type: config.trial_type,
                        trial_number: CT + 1,
                        RT: Date.now() - startTime,
                        translation: responseInput1
                    });
                    _babe.findNextView();
                }
			});
				
        },
        CT: 0,
        trials: config.trials
    };

    return _translateInput;
};

let translateInput = babeViews.translateInput({
    name: 'translateInput',
    title: 'Please type a good English translation of ... ',
    trial_type: 'translateInput',
    data: main_trials,
    trials: 3 // this is set automatically
});

// customize the experiment by specifying a view order and a trial structure
// specify view order
const views_seq = [
    introView,
    instructionsView,
    indicateNativeLanguage,
    //    practiceView,
    beginFirstPart,
    describePicture,
    beginSecondPart,
    truthValueJudgement,
	beginThirdPart,
    translateInput,
    postTestView,
    thanksView
];
