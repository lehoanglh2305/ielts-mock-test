/* IELTS Writing band descriptors (public version), Academic wording, as supplied by the teacher.
   Used only by the teacher dashboard. Keys: t1 and t2 are the tasks; ta is Task Achievement (Task 1)
   or Task Response (Task 2); cc, lr and gra are the other three criteria; each maps a band to its points. */
(function () {
  var zero = ['does not attend', 'does not attempt the task in any way', 'writes a totally memorised response'];

  var lr = {
    9: ['uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors occur only as ‘slips’'],
    8: ['uses a wide range of vocabulary fluently and flexibly to convey precise meanings', 'skilfully uses uncommon lexical items but there may be occasional inaccuracies in word choice and collocation', 'produces rare errors in spelling and/or word formation'],
    7: ['uses a sufficient range of vocabulary to allow some flexibility and precision', 'uses less common lexical items with some awareness of style and collocation', 'may produce occasional errors in word choice, spelling and/or word formation'],
    6: ['uses an adequate range of vocabulary for the task', 'attempts to use less common vocabulary but with some inaccuracy', 'makes some errors in spelling and/or word formation, but they do not impede communication'],
    5: ['uses a limited range of vocabulary, but this is minimally adequate for the task', 'may make noticeable errors in spelling and/or word formation that may cause some difficulty for the reader'],
    4: ['uses only basic vocabulary which may be used repetitively or which may be inappropriate for the task', 'has limited control of word formation and/or spelling; errors may cause strain for the reader'],
    3: ['uses only a very limited range of words and expressions with very limited control of word formation and/or spelling', 'errors may severely distort the message'],
    2: ['uses an extremely limited range of vocabulary; essentially no control of word formation and/or spelling'],
    1: ['can only use a few isolated words'],
    0: zero
  };

  var gra = {
    9: ['uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as ‘slips’'],
    8: ['uses a wide range of structures', 'the majority of sentences are error-free', 'makes only very occasional errors or inappropriacies'],
    7: ['uses a variety of complex structures', 'produces frequent error-free sentences', 'has good control of grammar and punctuation but may make a few errors'],
    6: ['uses a mix of simple and complex sentence forms', 'makes some errors in grammar and punctuation but they rarely reduce communication'],
    5: ['uses only a limited range of structures', 'attempts complex sentences but these tend to be less accurate than simple sentences', 'may make frequent grammatical errors and punctuation may be faulty; errors can cause some difficulty for the reader'],
    4: ['uses only a very limited range of structures with only rare use of subordinate clauses', 'some structures are accurate but errors predominate, and punctuation is often faulty'],
    3: ['attempts sentence forms but errors in grammar and punctuation predominate and distort the meaning'],
    2: ['cannot use sentence forms except in memorised phrases'],
    1: ['cannot use sentence forms at all'],
    0: zero
  };

  var cc1 = {
    9: ['uses cohesion in such a way that it attracts no attention', 'skilfully manages paragraphing'],
    8: ['sequences information and ideas logically', 'manages all aspects of cohesion well', 'uses paragraphing sufficiently and appropriately'],
    7: ['logically organises information and ideas; there is clear progression throughout', 'uses a range of cohesive devices appropriately although there may be some under-/over-use'],
    6: ['arranges information and ideas coherently and there is a clear overall progression', 'uses cohesive devices effectively, but cohesion within and/or between sentences may be faulty or mechanical', 'may not always use referencing clearly or appropriately'],
    5: ['presents information with some organisation but there may be a lack of overall progression', 'makes inadequate, inaccurate or over-use of cohesive devices', 'may be repetitive because of lack of referencing and substitution'],
    4: ['presents information and ideas but these are not arranged coherently and there is no clear progression in the response', 'uses some basic cohesive devices but these may be inaccurate or repetitive'],
    3: ['does not organise ideas logically', 'may use a very limited range of cohesive devices, and those used may not indicate a logical relationship between ideas'],
    2: ['has very little control of organisational features'],
    1: ['fails to communicate any message'],
    0: zero
  };

  /* Task 2 adds the paragraphing points to bands 4 to 7 */
  var cc2 = {};
  Object.keys(cc1).forEach(function (b) { cc2[b] = cc1[b].slice(); });
  cc2[7].push('presents a clear central topic within each paragraph');
  cc2[6].push('uses paragraphing, but not always logically');
  cc2[5].push('may not write in paragraphs, or paragraphing may be inadequate');
  cc2[4].push('may not write in paragraphs or their use may be confusing');

  var ta1 = {
    9: ['fully satisfies all the requirements of the task', 'clearly presents a fully developed response'],
    8: ['covers all requirements of the task sufficiently', 'presents, highlights and illustrates key features/ bullet points clearly and appropriately'],
    7: ['covers the requirements of the task', 'presents a clear overview of main trends, differences or stages', 'clearly presents and highlights key features/bullet points but could be more fully extended'],
    6: ['addresses the requirements of the task', 'presents an overview with information appropriately selected', 'presents and adequately highlights key features/ bullet points but details may be irrelevant, inappropriate or inaccurate'],
    5: ['generally addresses the task; the format may be inappropriate in places', 'recounts detail mechanically with no clear overview; there may be no data to support the description', 'presents, but inadequately covers, key features/ bullet points; there may be a tendency to focus on details'],
    4: ['attempts to address the task but does not cover all key features/bullet points; the format may be inappropriate', 'may confuse key features/bullet points with detail; parts may be unclear, irrelevant, repetitive or inaccurate'],
    3: ['fails to address the task, which may have been completely misunderstood', 'presents limited ideas which may be largely irrelevant/repetitive'],
    2: ['answer is barely related to the task'],
    1: ['answer is completely unrelated to the task'],
    0: zero
  };

  var tr2 = {
    9: ['fully addresses all parts of the task', 'presents a fully developed position in answer to the question with relevant, fully extended and well supported ideas'],
    8: ['sufficiently addresses all parts of the task', 'presents a well-developed response to the question with relevant, extended and supported ideas'],
    7: ['addresses all parts of the task', 'presents a clear position throughout the response', 'presents, extends and supports main ideas, but there may be a tendency to over-generalise and/or supporting ideas may lack focus'],
    6: ['addresses all parts of the task although some parts may be more fully covered than others', 'presents a relevant position although the conclusions may become unclear or repetitive', 'presents relevant main ideas but some may be inadequately developed/unclear'],
    5: ['addresses the task only partially; the format may be inappropriate in places', 'expresses a position but the development is not always clear and there may be no conclusions drawn', 'presents some main ideas but these are limited and not sufficiently developed; there may be irrelevant detail'],
    4: ['responds to the task only in a minimal way or the answer is tangential; the format may be inappropriate', 'presents a position but this is unclear', 'presents some main ideas but these are difficult to identify and may be repetitive, irrelevant or not well supported'],
    3: ['does not adequately address any part of the task', 'does not express a clear position', 'presents few ideas, which are largely undeveloped or irrelevant'],
    2: ['barely responds to the task', 'does not express a position', 'may attempt to present one or two ideas but there is no development'],
    1: ['answer is completely unrelated to the task'],
    0: zero
  };

  window.BAND_DESC = {
    t1: { ta: ta1, cc: cc1, lr: lr, gra: gra },
    t2: { ta: tr2, cc: cc2, lr: lr, gra: gra }
  };
})();
