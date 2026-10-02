/* The separate homepage consumes the canonical site data without modifying it.
 * It never reads or writes personal records, quiz attempts, or authentication.
 */
(function () {
  'use strict';
  const question = window.BB_NERVOUS_QUIZ.questions.find(item => item.id === 'sn-058');
  if (!question) throw new Error('Missing presentation question sn-058');
  window.BIOMED_HOME_DATA = {
    question,
    chapters: CHAPTERS.filter(chapter => chapter.done && chapter.url)
  };
})();
