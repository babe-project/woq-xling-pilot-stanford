// when the DOM is created and JavaScript code can run safely,
// the experiment initialisation is called
$("document").ready(function() {
    // prevent scrolling when space is pressed
    window.onkeydown = function(e) {
        if (e.keyCode == 32 && e.target == document.body) {
            e.preventDefault();
        }
    };

    babeInit({
        views_seq: views_seq,
        deploy: config_deploy,
        progress_bar: {
            in: ["describePicture"],
            style: "default",
            width: 100
        }
    });
});
