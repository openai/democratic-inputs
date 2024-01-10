'use strict';

function boldNameAndAffiliation(id) {
  document.getElementById(id).style.fontWeight = 700;
  if (id === "king") {
    document.getElementsByClassName("independent")[0].style.fontWeight = 700;
  } else {
    document.getElementsByClassName("uw")[0].style.fontWeight = 700;
  }
}

function unboldNameAndAffiliation(id) {
  document.getElementById(id).style.fontWeight = 400;
  if (id === "king") {
    document.getElementsByClassName("independent")[0].style.fontWeight = 400;
  } else {
    document.getElementsByClassName("uw")[0].style.fontWeight = 400;
  }
}

function fetchDimensions(input_id) {
  return fetch('https://social.cs.washington.edu/case-law-ai-policy/assets/cases.json')
  .then(function (response) {
    return response.json();
  })
  .then (function (data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === input_id) {
        let target = document.getElementById('dimensions-display');
        let dimensions = data[i].dimensions;
        let innerHTML = "";
        for (let j = 0; j < dimensions.length; j++) {
          let dimension = dimensions[j];
          let cardHTML = `<div class="card dimension-card" style="width: 18rem;"><div class="card-header">${dimension.description}</div><ul class="list-group list-group-flush"><li class="list-group-item"><span class="quote-text">${dimension.quote}</span></li></ul></div>`;
          innerHTML += cardHTML;
        }
        target.innerHTML = innerHTML;
        document.getElementById('dimensions-placeholder').style.display = "none";
      }
    }
  })
}

function revealDimensionSelector(input_id) {
  document.getElementById('generated-case').style.display = "none";
  document.getElementById('level-selector').style.display = "none";

  sessionStorage.setItem('selectedCaseID', input_id);
  return fetch('https://social.cs.washington.edu/case-law-ai-policy/assets/cases.json')
  .then(function (response) {
    return response.json();
  })
  .then (function (data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === input_id) {
        let target = document.getElementById('dimension-selector');
        let dimensions = data[i].dimensions;
        let innerHTML = "<option selected>Select dimension</option>";
        for (let j = 0; j < dimensions.length; j++) {
          let dimension = dimensions[j];
          let formOptionHTML = `<option value=${j+1}>${dimension.description}</option>`;
          innerHTML += formOptionHTML;
        }
        target.innerHTML = innerHTML;
        document.getElementById('dimension-selector').style.display = "block";
      }
    }
  })
}

function revealLevelSelector() {
  document.getElementById('dimension-selector').addEventListener('change', function () {
    document.getElementById('generated-case').style.display = "none";
    let dimensionSelector = document.getElementById('dimension-selector');
    let selectedDimensionIndex = dimensionSelector.value;
    if (dimensionSelector.options[selectedDimensionIndex]) {
      sessionStorage.setItem('selectedDimension', dimensionSelector.options[selectedDimensionIndex].text);
      let target = document.getElementById('level-selector');

      return fetch('https://social.cs.washington.edu/case-law-ai-policy/assets/cases.json')
      .then(function (response) {
        return response.json();
      })
      .then (function (data) {
        let selectedCaseID = sessionStorage.getItem('selectedCaseID');
        let generatedAssets = data.find(x => x.id === selectedCaseID).dimensions[selectedDimensionIndex-1].generated
        let innerHTML = "<option selected>Select level</option>";
        for (let j = 0; j < generatedAssets.length; j++) {
          let level = generatedAssets[j].level;
          let formOptionHTML = `<option value=${j+1}>${level}</option>`;
          innerHTML += formOptionHTML;
        }
        target.innerHTML = innerHTML;
        document.getElementById('level-selector').style.display = "block";
      })

    } else {
      document.getElementById('level-selector').style.display = "none";
    }

  })
}

function generatedCaseSelector() {
  document.getElementById('level-selector').addEventListener('change', function () {
    let levelSelector = document.getElementById('level-selector');
    let selectedLevelIndex = levelSelector.value;
    let target = document.getElementById('generated-case');
    let targetWrapper = document.getElementsByClassName('chat-ui-wrapper')[1];
    if (levelSelector.options[selectedLevelIndex]) {
      target.innerHTML = "";

      return fetch('https://social.cs.washington.edu/case-law-ai-policy/assets/cases.json')
      .then(function (response) {
        return response.json();
      })
      .then (function (data) {
        let selectedCaseID = sessionStorage.getItem('selectedCaseID');
        let findCase = data.find(x => x.id === selectedCaseID)
        let selectedDimension = sessionStorage.getItem('selectedDimension');
        let findDimension = findCase.dimensions.find(x => x.description === selectedDimension);
        let generatedCase = findDimension.generated[selectedLevelIndex-1].response;
        target.style.display = "block";
        targetWrapper.style.display = "block";

        let i = 0;
        function typewriterEffect() {
          if (i < generatedCase.length) {
            target.innerHTML += generatedCase.charAt(i);
            i++;
            setTimeout(typewriterEffect, 10);
          }
        }

        setTimeout(() => { typewriterEffect(); }, 500);

        // target.innerHTML = generatedCase;
      })

    } else {
      target.style.display = "none";
      targetWrapper.style.display = "none";
    }


  })
}

function getResponseFromTemplate(templateID) {
  return fetch('https://social.cs.washington.edu/case-law-ai-policy/assets/mobile-game-responses.json')
  .then(function (response) {
    return response.json();
  })
  .then (function (data) {
    let target = document.getElementById('templated-response');
    target.innerHTML = "";
    document.getElementsByClassName('chat-ui-wrapper')[0].style.display = "block";
    target.style.display = "block";
    let response = data.find(x => x.template === templateID).response;

    if (templateID === "content-violation") {
      target.innerHTML = response;
      console.log(response)
    } else {
      let i = 0, isTag, text;
      // target.innerHTML = response;
      function typewriterEffectFormatted() {
        text = response.slice(0, ++i);
        if (text === response) return;

        target.innerHTML = text;

        var char = text.slice(-1);
        if( char === '<' ) isTag = true;
        if( char === '>' ) isTag = false;

        if (isTag) return typewriterEffectFormatted();
        setTimeout(typewriterEffectFormatted, 10);
      }

      setTimeout(() => { typewriterEffectFormatted();}, 500);
    }


  })
}

// document.addEventListener('load', function () {
//   // Do something here
//   console.log("onload");
// });

window.onload = function () {
  revealLevelSelector();
  generatedCaseSelector();
  // fetchDimensions("mobile-game");
}

// document.addEventListener('load', function () {
//   // Do something here
//   console.log("onload");
//   fetchDimensions("mobile-game");
// });



// (function () {



  // function fetchCaseExamples() {
  //   return fetch('./assets/cases.json').then(function (resp) {
  //     return resp.json();
  //   });
  // }

  // function DemoVisualizeExperts() {

  // }

  // DemoVisualizeExperts.prototype.renderExpertDimensions = function(caseId) {

  // }

  // function DemoGenerateCases() {
  //   // The generated cases are static since it is released to the internet and we don't want to exhaust our API calls

  // }

  // DemoGeneratedCases.prototype.setInput = function () {

  // }

  // DemoGenerateCases.prototype.setDimension = function () {

  // }

  // DemoGenerateCases.prototype.setLevels = function () {

  // }

  // DemoGenerateCases.prototype.generate = function () {

  // }

  // DemoGenerateCases.prototype.reset = function () {

  // }

//   document.addEventListener('load', function () {
//     // Do something here
//     console.log("onload");
//     fetchDimensions("mobile-game");
//   });
// })();

