let introView = babeViews.intro({
    name: 'intro',
    trials: 1,
    title: 'Welcome!',
    text: 'Thanks for taking part in this experiment. .... ',
    buttonText: 'Begin Experiment'
});

// Here the participants indicate their mother tongue.
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

            const prevLanguages = new Set();

            // Nothing will happen if prevResults is empty, I believe.
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

let instructionsView = babeViews.instructions({
    name: 'instructions',
    trials: 1,
    title: 'Instructions',
    text:
        'In this experiment we are interested in how you express quantity in your native language. There are several parts. ...',
    buttonText: 'Go to first part.'
});

//let practiceView = babeViews.forcedChoice({
//    name: 'practice',
//    trials: 2,
//    trial_type: "practice",
//    data: practice_trials
//});

let beginFirstPart = babeViews.begin({
    name: 'beginFirst',
    trials: 1,
    text:
        "In the first part, we will show you pictures of black or white dots on a gray background. Please provide a simple description of this picture, as if you were answering the question 'How many of the dots are COLOR' where COLOR could either be 'white' or 'black' as indicated on each screen. Possible English answers could be 'all/none/some/most ... of the dots are COLOR'. Please try to give a sentence in your native language that provides similar information. Please mark the part that in English would be expressed by words like 'all/none/some/most/ ...' by putting in between @XYZ@."
});

let beginSecondPart = babeViews.begin({
    name: 'Second',
    trials: 1,
    text:
        'Thanks for your answers. We will now show you similar pictures again. We will also show you some of the responses that you (or other speakers of your native language) have given so far. For each picture and sentence, please judge whether the sentence is a good description of the picture.'
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
            
            <h1 class="title">{{ title }}</h1>
                
                <p> How would you describe the quantity of the <i>{{focalColor}}</i> dots in this picture in your native language? Put &#64; (<i>at</i> signs) around each of the words that express quantity. </p>

                <p>Please provide at least one description.</p>

                <br/>

                <canvas id="situation" style="width:600px;height:300px;background:lightgrey"></canvas>

                <br/>

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
                    title: this.title,
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
    title: 'Describe the picture',
    trial_type: 'describePicture',
    data: main_trials,
    trials: 3 // TODO: set eventually to : main_trials.length
});

babeViews.truthValueJudgement = function(config) {
    const _truthValueJudgement = {
        name: config.name,
        title: config.title,
        render(CT, _babe) {
            let startTime = Date.now();

            const viewTemplate = `<p class='view'>
                {{# title }}
                <h1 class="title">{{ title }}</h1>
                {{/ title }}
                
                <p>Would you agree with the following statement about the picture?</p>

                <p class="picturedescription">Here is where the description appears.</p>

                <canvas id="binaryCanvas" style="width:600px;height:300px;background:lightgrey"></canvas>

                <br/>

                <div class="options-container">
                <div>
                    <input type="radio" id="responseTrue"
                        name="response" value="true">
                    <label for="responseTrue">Agree</label>

                    <input type="radio" id="responseFalse"
                        name="response" value="false">
                    <label for="responseFalse">Disagree</label>
                </div>
                </div>

                <br/>

                <p>(Shortcuts: Press "a" to select "Agree"; press "d" to select "Disagree". Press "Enter" to continue.)</p>

                <button id="the-button">Continue</button>

                <p class="error-info err-no-selection">Please select an answer.</p>
            </div>`;

            $('#main').html(
                Mustache.render(viewTemplate, {
                    title: this.title,
                    focalColor: config.data[CT].focalColor,
                    nrTotal: config.data[CT].total,
                    nrFocal: config.data[CT].focalNumber
                })
            );

            // Here is where one accesses the previous results.
            console.table(_babe.prevResults);

            const binaryNext = function(e) {
                if (!someOptionSelected()) {
                    $('.err-no-selection').show();
                } else {
                    _babe.trial_data.push({
                        trial_type: config.trial_type,
                        trial_number: CT + 1,
                        RT: Date.now() - startTime,
                        sentence_shown:
                            'This will be the sentence displayed in this trial',
                        binaryChoice: getResponse(),
                        focalColor: config.data[CT].focalColor,
                        nrTotal: config.data[CT].total,
                        nrFocal: config.data[CT].focalNumber
                    });
                    _babe.findNextView();
                }
            };

            // Should add some listener/event handler on the True and False options.
            document.onkeydown = function(e) {
                e = e || window.event;
                if (e.keyCode == 65) {
                    document.getElementById('responseTrue').checked = true;
                    // Might not automatically advance for now, since it might make it too easy for the participant to skip it immediately.
                    // _s.button();
                } else if (e.keyCode == 68) {
                    document.getElementById('responseFalse').checked = true;
                    // _s.button();
                } else if (e.keyCode == 13) {
                    binaryNext();
                }
            };

            drawOnCanvas(
                document.getElementById('binaryCanvas'),
                config.data[CT],
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
    title: 'is the sentence a good description of the picture',
    trial_type: 'truthValueJudgement',
    data: main_trials,
    trials: 3 // set eventually to : main_trials.length
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
    postTestView,
    thanksView
];
