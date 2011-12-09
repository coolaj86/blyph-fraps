(function () {
  "use strict";


  var CampusBooks = require('campusbooks')
    //, campusbooks = CampusBooks.create("BLCg7q5VrmUBxsrETg5c")
    , campusbooks = CampusBooks.create("BDz21GvuL6RgTKiSbwe3")
    , ISBN = require('isbn').ISBN
    , searchCache = {}
    , patternIsbn = /\d{10}|\d{13}/
    , punctRe = /[\.\-_'":!\$\?]/g
    , escapeRegExp = require('./regexp-escape')
    , keywordCache = {}
    ;

  function searchInCache(title) {
    var results = []
      , pattern
      ;

    title = (title || '').replace(punctRe, '');
    pattern = new RegExp('\\b' + escapeRegExp(title), 'i');

    if (pattern.exec('zzzzz')) {
      return [];
    }

    Object.keys(searchCache).forEach(function (isbn) {
      // TODO romanize titles (as does mediabox)
      var book = searchCache[isbn]
        , title = (book.title||'').replace(punctRe, '')
        ;

      if (pattern.exec(title)) {
        results.push(book);
      }
    });

    return results.slice(0, 10);
  }


  function normalizeCampusBookResult(searchType, input, data) {
    var books
      , error
      , now = new Date().valueOf()
      ;

    books = data 
        && data.response 
        && data.response.page 
        && data.response.page.results 
        && data.response.page.results.book
        || undefined;

    if ('bookinfo' === searchType) {
      books = data 
          && data.response 
          && data.response.page
          || undefined;
    }

    books = books && (Array.isArray(books) ? books : [books]);

    error = data && data.repsonse && data.response.errors;

    if (error) {
      // TODO unobtrusive alert('params: ' + JSON.stringify(params));
      console.error("something erred", error);
      return { error: error };
    }

    if (!books) {
      books = [];
      console.warn("missing data", data);
      return { error: "missing data" };
    } else {
      keywordCache[input] = data;
    }

    function cacheBook(book) {
      searchCache[book.isbn13||book.isbn||book.isbn10] = book;
      book.timestamp = new Date().valueOf();
    }

    books.forEach(cacheBook);

    return books;
  }

  function searchForBook(callback, input) {
    var isbn
      , isbnText
      , opts = {}
      , searchType
      , results
      ;

    input = String(input||'').toLowerCase().trim();

    if (!(input.length >= 3)) {
      callback(null, []);
      return;
    }

    isbnText = input.replace(/[\s\.\-_]/g, '');
    isbn = ISBN.parse(isbnText);

    if (isbn || patternIsbn.exec(isbnText)) {
      opts.isbn = isbnText;
      searchType = 'bookinfo';
      results = searchCache[isbnText];
      results = results && [results];
    } else {
      opts.title = input;
      searchType = 'search'
      // TODO search school cache
    }

    // TODO merge in both results
    results = results || keywordCache[input] || searchInCache(input);

    // 150px seems a good size
    opts.image_height = 150;

    if (!results || !results.length) {
      console.log('options', opts);
      campusbooks[searchType](opts).when(function (err, ahr, data) {
        results = normalizeCampusBookResult(searchType, input, data);
        callback(results.error, results);
      });
    } else {
      callback(results.error, results);
    }
  }

  module.exports = searchForBook;
}());
