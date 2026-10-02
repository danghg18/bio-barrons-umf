(function () {
  'use strict';
  window.BioMedHomeQuiz = {
    score(selected, correct) {
      const chosen = new Set(selected);
      const expected = new Set(correct);
      const states = Object.fromEntries(['A', 'B', 'C', 'D', 'E'].map(letter => [letter,
        expected.has(letter) ? chosen.has(letter) ? 'correct' : 'missed' : chosen.has(letter) ? 'extra' : 'neutral'
      ]));
      return {exact: chosen.size === expected.size && [...chosen].every(letter => expected.has(letter)), states};
    }
  };
})();
