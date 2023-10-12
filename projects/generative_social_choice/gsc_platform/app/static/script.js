"use strict";

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
const experimentName = urlParams.get('experiment');
window.float_out_end = 0;

const getQuestion = () => {
    fetch(`/next_question?user_id=${userId}&experiment=${experimentName}`)
        .then(response => response.json())
        .then(data => {
            if (data[0] === "DONE") {
                window.location.href = data[1];
                document.body.innerHTML = `You should be redirected to Prolific. If this does not work, click <a href="${data[1]}">here</a>.`
            } else {
                window.questiontype = data[0];
                document.getElementById("step").value = data[1];
                document.getElementById("experiment").value = experimentName;
                document.getElementById("user_id").value = userId;

                // Wrap in timeout in case the floating out animation is still happening
                setTimeout(function () {
                    document.getElementById('answer').value = '';
                    document.getElementById("buttons").innerHTML = '';
                    document.getElementById('submitbutton').value = 'Submit';

                    document.getElementById('form').className = window.questiontype;
                    document.getElementById('question').innerHTML = data[2];

                    document.getElementById('answer').required = (window.questiontype === "longtext" || window.questiontype === "longtext choice");

                    if (window.questiontype === "reading") {
                        if (data.length === 4) {
                            document.getElementById('submitbutton').value = data[3];
                        }
                    } else if (window.questiontype === "choice" || window.questiontype === "longtext choice") {
                        let buttons = document.getElementById('buttons');
                        for (let i = 3; i < data.length; ++i) {
                            let newinput = document.createElement('input');
                            newinput.type = "radio";
                            newinput.name = "choice";
                            newinput.id = `button${i}`;
                            newinput.value = data[i];
                            newinput.ariaLabel = data[i];
                            newinput.className = "choiceinput";
                            newinput.required = true;
                            buttons.appendChild(newinput);

                            let newdiv = document.createElement('div');
                            newdiv.className = "choicediv";
                            newdiv.ariaHidden = "true";
                            let newlabel = document.createElement('label');
                            newlabel.htmlFor = `button${i}`;
                            newlabel.className = "choicelabel";
                            newlabel.innerHTML = data[i];
                            newdiv.appendChild(newlabel);
                            buttons.appendChild(newdiv);
                        }
                    }

                    const container = document.getElementById('animationcontainer');
                    // Start animation
                    window.waiting_for_response = false;
                    container.style.display = 'block';
                    container.classList.add('float-in');

                    // Remove animation class after it finishes
                    setTimeout(function () {
                        container.classList.remove('float-in');
                    }, 500);
                }, Math.max(0, window.float_out_end - Date.now()));
            }
        });
};

const submitAnswer = (event) => {
    event.preventDefault();

    if (!document.getElementById("form").checkValidity()) {
        document.getElementById("form").reportValidity();
        return;
    }

    const container = document.getElementById('animationcontainer');

    // Start animation
    window.waiting_for_response = true;
    window.float_out_end = Date.now() + 500;
    container.classList.add('float-out');

    // Remove animation class after it finishes
    setTimeout(function() {
        // if response is fast, might have already started reintroducing
        const container = document.getElementById('animationcontainer');
        if (window.waiting_for_response) {
            container.style.display = 'none';
        }
        container.classList.remove('float-out');
    }, 500);

    fetch('/submit_answer', {
        method: 'POST',
        body: new FormData(document.getElementById('form'))
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data[0] === "OK") {
                getQuestion();
            } else if (data[0] === "INVALID_ANSWER") {
                alert("There was an error with your submitted data: " + data[1]);
                window.waiting_for_response = false;
                document.getElementById('animationcontainer').style.display = 'block';
            }
        })
        .catch(error => {
            alert('Something went wrong. Please copy the following error, send it to us as a message on Prolific, and exit the survey (of course, you will be paid):\n---\n' + error + "\n---\n" + (error.stack | "nostack"));
            window.waiting_for_response = false;
            document.getElementById('animationcontainer').style.display = 'block';
        });
};