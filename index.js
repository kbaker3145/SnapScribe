
/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2023 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

(() => {
  'use strict'

  const getStoredTheme = () => localStorage.getItem('theme')
  const setStoredTheme = theme => localStorage.setItem('theme', theme)

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme()
    if (storedTheme) {
      return storedTheme
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  };

  const setTheme = theme => {
    if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-bs-theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme)
    }
  };

  setTheme(getPreferredTheme());

  const showActiveTheme = (theme, focus = false) => {
    const themeSwitcher = document.querySelector('#bd-theme')

    if (!themeSwitcher) {
      return
    }

    const themeSwitcherText = document.querySelector('#bd-theme-text')
    const activeThemeIcon = document.querySelector('.theme-icon-active use')
    const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)
    const svgOfActiveBtn = btnToActive.querySelector('svg use').getAttribute('href')

    document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
      element.classList.remove('active')
      element.setAttribute('aria-pressed', 'false')
    })

    btnToActive.classList.add('active')
    btnToActive.setAttribute('aria-pressed', 'true')
    activeThemeIcon.setAttribute('href', svgOfActiveBtn)
    const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`
    themeSwitcher.setAttribute('aria-label', themeSwitcherLabel)

    if (focus) {
      themeSwitcher.focus()
    };
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const storedTheme = getStoredTheme()
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme())
    }
  })

  window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme())

    document.querySelectorAll('[data-bs-theme-value]')
      .forEach(toggle => {
        toggle.addEventListener('click', () => {
          const theme = toggle.getAttribute('data-bs-theme-value')
          setStoredTheme(theme)
          setTheme(theme)
          showActiveTheme(theme, true)
        })
      })
  })
})()




/* 
 * Defining constants
 */
const inputPic = document.getElementById('uploadButton');
const submitButton = document.getElementById('submitButton');
const textBox = document.getElementById('floatingTextarea');
const textSummaryButton = document.getElementById('summaryButton');


/* 
 * Ensure a file is uploaded
 */
function checkFile() {
  if (inputPic.files.length === 0) {
    textBox.value = 'Please select a file.';
    alert('Please select a file.');
    return;
  }
  fileName = inputPic.files[0].name;
  alert('File selected: ' + fileName); // confirm the file selection
  uploadPDF();
}

submitButton.addEventListener('click', checkFile);



/* 
 * Upload PDF and send to server
 */

function uploadPDF() {

  const formData = new FormData();  // holds file data
  formData.append('file', inputPic.files[0]);  // append file to the FormData object

  // send the file to the server using fetch API
  fetch('get-text', {
      method: 'POST',
      body: formData  
  })
  .then(response => response.json())  // parse the JSON response from the server and parse the JSON into a JavaScript object
  .then(data => {
      // display text in the textarea 
      textBox.value = data.text;

      console.log("RESPONSE: ", data.text);

      // automatic resizing
      textBox.style.height = 'auto';
      textBox.style.height = (textBox.scrollHeight) + 'px';
  })
  .catch(error => {
      console.error('Error uploading file:', error);  
      textBox.value = 'Error uploading file:';
  });
};


/* 
 * Events for uploading the pdf 
 */

inputPDF.addEventListener('change', () => {
  // TODO have a check here to make sure the file is a PDF / right format
  uploadPDF();
});



/* 
 * Summarizing the text
 */


// function summarizeText() {
//   alert("THE BUTTON HAS BEEN CLICKED");

//   const text = textBox.value;
//   if (text == "") {
//     alert("Please upload a pdf first");
//     return;
//   }

//   summarizer = pipeline("summarization", model="facebook/bart-large-cnn");
//   summary = summarizer(text, max_length=150, min_length=40, do_sample=False);

//   console.log("SUMMARY OF TEXT: ", text);
// }

// textSummaryButton.addEventListener('click', alert("THE BUTTON HAS BEEN CLICKED"));

textSummaryButton.addEventListener('click', function() {
  alert("THE BUTTON HAS BEEN CLICKED");
});
