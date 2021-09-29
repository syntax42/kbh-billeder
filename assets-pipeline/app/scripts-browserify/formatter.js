const Formatter = require('formatter');

function checkDateInput() {
  var input = document.createElement('input');
  input.setAttribute('type', 'date');

  var notADateValue = 'not-a-date';
  input.setAttribute('value', notADateValue);

  return (input.value !== notADateValue);
}

if (checkDateInput() === false) {
  Array.prototype.forEach.call(document.querySelectorAll('input[type="date"]'), (dateInput) => {
    new Formatter(dateInput, {
      'pattern': '{{99}}/{{99}}/{{9999}}'
    });
  });
}
