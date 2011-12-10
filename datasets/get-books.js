(function () {
  "use strict";

  require('Array.prototype.forEachAsync');

  var CampusBooks = require('campusbooks')
    , cb = CampusBooks.create("BLCg7q5VrmUBxsrETg5c")
    , ISBN = require('isbn').ISBN
    , fs = require('fs')
    , books = {}
    , newBookCount = 0
    , cacheCount = 0
    ;

  function random() {
    return 0.5 - Math.random();
  }

  function getBooksByIsbn(list) {
    //list.sort(random).forEachAsync(function (next, isbnText) {
    list.forEachAsync(function (next, isbnText) {
      var isbn
        , badIsbn;

      isbnText = isbnText.replace(/\D/g, '');
      isbn = ISBN.parse(isbnText);

      if (isbn) {
        isbnText = isbn.asIsbn13();
      } else {
        //badIsbn = true;
      }

      if (badIsbn || books[isbnText]) {
        if (books[isbnText]) {
          //cacheCount += 1;
          //console.log('[cached] ' + isbnText + ' ' + cacheCount);
        } else {
          cacheCount += 1;
          console.log('[bad isbn] ' + isbnText + ' ' + cacheCount);
        }
        next();
        return;
      }

      console.log('looking for ' + isbnText);
      cb.bookprices({ isbn: isbnText }, { timeout: 120 * 1000 }).when(function (err, ahr, data) {
        var bookinfo
          , book = {};

        console.log('got response for ' + isbnText);
        if (err && !data) {
          console.error(err || data);
          next();
          return;
        }

        if (!(bookinfo = data && data.response && data.response.page)) {
          next();
          return;
        }

        if (!bookinfo.book) {
          next();
          return;
        }


        book.timestamp = new Date().valueOf();
        book.info = bookinfo.book;
        // TODO check for title / author
        if (bookinfo.offers && bookinfo.offers.condition) {
          book.offers = {};
          // XML is so Ghetto...
          if (!Array.isArray(bookinfo.offers.condition)) {
            bookinfo.offers.condition = [bookinfo.offers.condition];
          }
          //console.log(bookinfo.offers.condition);
          bookinfo.offers.condition.forEach(function (offer) {
            if (!offer['@attributes'].name) {
              return;
            }

            delete offer.offer.isbn13;
            delete offer.offer.isbn10;
            delete offer.offer.merchant_name;
            delete offer.offer.merchant_image;
            delete offer.offer.condition_text;
            delete offer.offer.availability_text;

            // TODO add comments and rental details back in?
            delete offer.offer.comments;
            delete offer.offer.rental_detail;

            book.offers[offer['@attributes'].name.toLowerCase()] = offer.offer;
          });
        }
        // for couchdb
        book.type = 'book';

        newBookCount += 1;
        books[isbnText] = book;

        if (0 === (newBookCount % 20)) {
          console.log('saving... ' + newBookCount);
          writeBookPrices()();
        }

        console.log('got book info');
        //console.log('BOOK', data && data.response);
        //setTimeout(next, 2000);
        next();
      });
    }).then(writeBookPrices());
  }

  function writeBookPrices(str) {
    return function (err) {
      var filename
        , timestamp
        ;

      if (err) {
        console.log(err);
      }

      if (str) {
        str += '.';
      } else {
        str = '';
      }

      filename = './bookprices.' + str + 'json';

      //console.log('FILENAME', filename, books);

      timestamp = new Date().valueOf();
      fs.writeFileSync(filename, JSON.stringify(books), 'utf8');
      console.log('write-time', (new Date().valueOf() - timestamp));
    };
  }

  process.on('exit', writeBookPrices('exit'));
  //process.on('uncaughtException', writeBookPrices('threw'));

  try {
    books = JSON.parse(fs.readFileSync('./bookprices.json'));
  } catch(e) {
    // ignore
  }

  getBooksByIsbn(JSON.parse(fs.readFileSync('./byu-uvu-isbns.json')));
}());
