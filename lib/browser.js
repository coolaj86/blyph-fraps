/*jshint jquery:true strict:true browser:true node:true es5:true onevar:true laxcomma:true laxbreak:true eqeqeq:true immed:true latedef:true undef:true unused:true*/
(function () {
  "use strict";

  var shouldPlayAsteroids = false
    , $ = window.jQuery //require('jQuery')
      // for jeesh / jQuery compat
    , domReady = $.domReady || $
    , searchCache = {}
    , searchKeywords = {}
    , userBooks
    , fullBooklist
    , updateListsG
      // Fun Game!
    , currentUser = {}
    , url = require('url')
    , MD5 = require('md5')
    , Join = require('join')
    , localStorage = require('localStorage')
    , JsonStorage = require('json-storage')
    , hasImportedList = false
    , request = require('ahr2')
    , CampusBooks = require('campusbooks')
    , campusbooks = CampusBooks.create("BLCg7q5VrmUBxsrETg5c")
    , ISBN = require('isbn').ISBN
    //, displayItemTemplate
    , form_item_template
    , bookinfoHeader =  [
          'isbn'
        , 'age'
        , 'title'
        , 'author'
        , 'binding'
        , 'msrp'
      //, info.pages
        , 'publisher'
        , 'published_date'
        , 'edition'
      //, info.rank
      //, info.rating
        , 'image'
      ]
    , jsonStorage = JsonStorage.create(localStorage)
    , pending
    , tradersTpl
    , onlineStoresTpl
    , bindingRe
    , patternEdition
    , booklistItemTpl
    , punctRe
    , patternIsbn
    , DBG = window
    ;

  // for debugging
  /*
  window.searchCache = {};//searchCache;
  window.searchKeywords = {}; //searchKeywords;
  window.userBooks = null; // userBooks;
  window.fullBooklist = null; //fullBooklist;
  */
  window.displayItemTemplate = null; //displayItemTemplate;

  function noop() {}

  function playAsteroids() {
    var s = document.createElement('script')
      ;

    s.type='text/javascript';
    window.document.body.appendChild(s);
    s.src='http://erkie.github.com/asteroids.min.js';
    return void(1);
  }

  if (/asteroids/.exec(window.location.hash)) {
    console.log('We shoud play asteroids!');
    shouldPlayAsteroids = true;
  }

  function toUserToken(str) {
    if (!str) {
      return;
    }

    str = str.trim().toLowerCase();

    if (/@/.exec(str)) {
      str = MD5.digest_s(str);
      return str;
    }

    if (/^[a-f0-9]{32}$/.exec(str)) {
      return str;
    }
  }

  function sortBySemester(a, b) {
    // chorological (future -> past)
    if (a.termYear !== b.termYear) {
      return (parseInt(a.termYear, 10) > parseInt(b.termYear, 10)) ? -1 : 1;
    }
    if (a.term !== b.term) {
      return (parseInt(a.term, 10) < parseInt(b.term, 10)) ? -1 : 1;
    }

    // alphabetical (a -> z)
    return a.title.toUpperCase() > b.title.toUpperCase();
  }

  // TODO be efficient-ish
  // delay updates by 5 seconds
  function saveBooklist() {
    if (!currentUser.userToken) {
      return;
    }

    if (pending) {
      console.log('pending');
      clearTimeout(pending);
      pending = setTimeout(function () {
        pending = false;
        saveBooklist();
      }, 5 * 1000);
      return;
    }
    pending = true;

    var booklist;
    // TODO figure this the heck out!!! wtf?
    fullBooklist.userToken = currentUser.userToken;
    fullBooklist.booklist = userBooks;
    fullBooklist.timestamp = new Date().valueOf();
    fullBooklist.type = 'booklist';

    jsonStorage.set('user-booklist', fullBooklist);

    booklist = JSON.stringify(fullBooklist);

    // TODO fix stringify on serverside
    request({
        "method": "POST"
      , "href": "/booklist/" + currentUser.userToken
      , "body": { "booklist": booklist }
      // TODO make a shortcut in ahr for this
      , "contentType": "application/json"
      , "headers": {
          "Content-Type": "application/json"
        }
    }).when(function (err, ahr, data) {
      setTimeout(function () {
        pending = false;
      }, 5 * 1000);
      console.log('saveBooklist', err, ahr, data);
    });
  }

  function reconstituteBookCache(err, ahr, data) {
    data.forEach(function (b) {
      var book = {}
        ;

      bookinfoHeader.forEach(function(header, i) {
        book[header] = b[i]; 
      });

      searchCache[book.isbn13 || book.isbn || book.isbn10] = book;
    });

    // now show my list
    domReady(listUploads);
    $('#loading-mask').fadeOut('fast', function () {
      if (shouldPlayAsteroids) {
        playAsteroids();
      }
    });
  }

  function showTraders(traders) {
    var tradersArea = $('#person-matches ul');

    if (!tradersTpl) {
      tradersTpl = $('#person-matches ul').html();
    }

    tradersArea.find('li').remove();

    traders.forEach(function (trader) {
      var traderHtml = $(tradersTpl)
        , name = trader.nickname
        , gravatar = trader.userToken
        , book = userBooks[trader.isbn13 || trader.isbn]
        , price = Number(book.fairest_price)
        ;

      if (price) {
        price = '$' + Math.round(price);
      } else {
        price = 'Make Offer';
      }

      traderHtml.find('.result-name').text(name);
      traderHtml.find('input.email').val(trader.userToken);

      traderHtml.find('.result-for-price').text(price);
      traderHtml.find('.person img').attr('src', 'http://www.gravatar.com/avatar/' + gravatar + '?s=50&r=pg&d=identicon');
      tradersArea.append(traderHtml);
    });

    if (traders.length) {
      //$('#person-matches').show();
    } else {
      tradersArea.append('<li>No locals to trade with yet...</li>');
      //$('#person-matches').hide();
    }
  }

  function showConsumers(consumers) {
    var storesArea = $('#online-matches ul');

    $('#matches').show();

    if (!onlineStoresTpl) {
      onlineStoresTpl = $('#online-matches ul').html();
    }
    
    storesArea.find('li').remove();

    consumers.retailBuyBack.forEach(function (consumer) {
      var onlineStores;
      onlineStores = $(onlineStoresTpl);
      onlineStores.find('.store-image img').attr('src', consumer.merchant_image);
      onlineStores.find('.result-name').html(consumer.name);
      onlineStores.find('.ols-buy-sell')
        .text('Sell My Book Here')
        .attr('href', consumer.link)
        ;
      onlineStores.find('.result-for-price').html('$' + consumer.prices.sort()[0]);
      onlineStores.find('.ols-edition').text(' ');
      storesArea.append(onlineStores);
    });
  }
  function showProviders(providers) {
    var storesArea = $('#online-matches ul');

    $('#matches').show();

    if (!onlineStoresTpl) {
      onlineStoresTpl = $('#online-matches ul').html();
    }
    
    storesArea.find('li').remove();

    providers.retailSale.forEach(function (provider) {
      provider.total_price = Number(provider.total_price);
      provider.price = Number(provider.price);
    });
    providers.retailSale.sort(function (a, b) {
      return a.total_price < b.total_price ? -1 : 1;
    });
    providers.retailSale.forEach(function (provider) {
      var onlineStores;
      onlineStores = $(onlineStoresTpl);
      onlineStores.find('.store-image img').attr('src', provider.merchant_image);
      onlineStores.find('.result-name').html(provider.merchant_name);
      onlineStores.find('.ols-buy-sell')
        .text('Buy My Book Here')
        .attr('href', provider.link)
        ;
      if (7 === Number(provider.condition_id)) {
        onlineStores.find('.ols-edition').text('Int\'l Edition');
      } else {
        onlineStores.find('.ols-edition').text(' ');
      }
      onlineStores.find('.result-for-price').html('$' + Number(provider.total_price).toFixed(2));
      storesArea.append(onlineStores);
    });
  }

  function showBooks(books) {
    console.log('showBooks', books);
    $('#matches').hide();
    $('#imported-booklist').html('');
    books.forEach(appendBook);
  }

  function showBook(book) {
    var count = 0;

    console.log('showBook');
    console.log(book);
    // TODO make sure this is redundant and remove
    getProviders(book);
    showBooks([book]);

    // Find the Fair Price, if Possible
    book.fairest_price = 0;
    if (book.highest_buyback_price > 0 && book.highest_buyback_price < Infinity) {
      count += 1;
      book.fairest_price += book.highest_buyback_price;
    }
    if (book.lowest_buy_price > 0 && book.lowest_buy_price < Infinity) {
      count += 1;
      book.fairest_price += book.lowest_buy_price;
    }
    if (count) {
      book.fairest_price /= count;
      console.log('fair price: ', book.fairest_price);
    }
    if (!book.fairest_price) {
      delete book.fairest_price;
    }

    // 
    if (book.wantIt && !book.haveIt && book.providers && book.providers()) {
      // TODO get lowest used price
      console.log('showProviders', book.providers());
      showProviders(book.providers());
      showTraders(book.providers().trade); //.concat(book.providers().unsorted));
    }
    if (!book.wantIt && book.haveIt && book.providers && book.providers()) {
      // TODO get highest buyback price
      console.log('showConsumers', book.providers());
      showConsumers(book.providers());
      showTraders(book.providers().need); //.concat(book.providers().unsorted));
    }
  }

  // TODO needs all four options
  function appendBook(book) {
    var bookhtml = $(DBG.displayItemTemplate)
      , isbn
      , image
      ;

    isbn = ISBN.parse(book.isbn13 || book.isbn || book.isbn10);

    if (isbn) {
      book.isbn10 = isbn.asIsbn10();
      book.isbn13 = isbn.asIsbn13();
    } else {
      book.isbn = String(book.isbn||'');

      if (13 === book.isbn.length) {
        book.isbn13 = book.isbn;
        book.isbn10 = book.isbn10 || '';
      } else if (10 === book.isbn.length) {
        book.isbn10 = book.isbn;
        book.isbn13 = book.isbn13 || '';
      } else {
        // need some sort of reference
        book.isbn13 = book.isbn;
      }
    }

    discoverBinding(book);

    book.edition = book.edition || '';

    if (/^amz:/.exec(book.image)) {
      book.image = book.image.substr(4);
      book.image = 'http://ecx.images-amazon.com/images/I/' + book.image + '._SL150_.jpg';
    } else if (!/\w+/.exec(book.image)) {
      delete book.image;
    }

    function onImageLoad(ev) {
      if (ev.target.height > ev.target.width) {
        $(ev.target).addClass('book-image-tall');
      }
    }

    image = bookhtml.find(".item_picture img").attr('src', book.image);
    if (image.load) {
      image.load(onImageLoad);
    }
    bookhtml.find(".item_picture img").attr('src', book.image); //.onload = 
    bookhtml.find(".title").html(truncateTitle(book, 50));
    bookhtml.find(".isbn10").text(book.isbn10);
    bookhtml.find(".isbn13").text(book.isbn13);
    bookhtml.find(".authors").text(book.author);
    bookhtml.find(".edition-data").text(book.edition || '?');
    bookhtml.find(".course").text((book.courseDept||'').toUpperCase() + ' ' + (book.courseNum||''));
    bookhtml.find(".semester").text((book.termSeason||'').toUpperCase() + ' ' + (book.termYear||''));
    //bookhtml.find(".course").text(book.courseDept);

    console.log('appendBook');
    console.log(bookhtml);
    $('#imported-booklist').append(bookhtml);
  }

  bindingRe = [
      /cd/i
    , /dvd/i
    , /pap/i
    , /hard/i
    , /spiral/i
  ];

  function discoverBinding(book) {
    function bookEd(re) {
      if (re.test(book.edition)) {
        book.binding = book.edition;
        delete book.edition;
      }
    }
    bindingRe.forEach(bookEd);
  }

  patternEdition = /(.*)(\(.*?edition.*?\))(.*)/i;
  function truncateTitle(book, len) {
    // TODO sanitize inputs
    len = len || 256;

    var title = book.title
      , colon
      , strarr = []
      , match
      ;

    match = title.match(patternEdition);

    // TODO place 'edition' somewhere useful
    if (match && match[2]) {
      title = "";
      title += match[1] || "";
      title += match[3] || "";
      book.edition = book.edition || match[2];
    }

    if (title.length > len) {
      colon = title.lastIndexOf("(");
      if (colon >= 0 && colon < len) {
        strarr[0] = title.substr(0, colon);
        strarr[1] = "<br/>";
        strarr[2] = title.substr(colon);
        title = strarr.join('');
      }
      //
      //title = title.substr(0,len) + '...';
    }

    return title;
  }

  function templateBooklistItem(book) {
    var item = $(booklistItemTpl)
      ;

    item.find('.bli-title').html(book.title);
    item.find('.bli-isbn').html(book.isbn);
    if (true === book.haveIt && false === book.wantIt) {
      if (book.providers && book.providers()) {
        item.find('.mbl-trade-matches').html(book.providers().need.length);
        item.find('.mbl-online-matches').html(book.providers().retailBuyBack.length);
      }
    } else if (false === book.haveIt && true === book.wantIt) {
      if (book.providers && book.providers()) {
        item.find('.mbl-trade-matches').html(book.providers().trade.length);
        item.find('.mbl-online-matches').html(book.providers().retailSale.length);
      }
    } else {
        item.find('.match-available').hide();
        item.find('.match-online').hide();
    }
    return item;
  }
  function updateLists() {
    if (!booklistItemTpl) {
      booklistItemTpl = $('.booklist-need-data ul')[0].innerHTML;
    }
    
    $('.booklist-unsorted-data .booklist-item').remove();
    $('.booklist-need-data .booklist-item').remove();
    $('.booklist-have-data .booklist-item').remove();
    $('.booklist-keep-data .booklist-item').remove();

    Object.keys(userBooks).forEach(function (isbn) {
      var book = userBooks[isbn]
        ;

      book.isbn = isbn;

      if (false === book.haveIt && true === book.wantIt) {
        $('.booklist-need-data ul').append(templateBooklistItem(book));
      } else if (true === book.haveIt && false === book.wantIt) {
        $('.booklist-have-data ul').append(templateBooklistItem(book));
      } else if (true === book.haveIt && true === book.wantIt) {
        $('.booklist-keep-data ul').append(templateBooklistItem(book));
      } else if (false === book.haveIt && false === book.wantIt) {
        // do nothing
      } else {
        $('.booklist-unsorted-data ul').append(templateBooklistItem(book));
      }
    });

    [
        '.booklist-unsorted-data'
      , '.booklist-need-data'
      , '.booklist-have-data'
      , '.booklist-keep-data'
    ].forEach(function (list) {
      if (0 === $(list + ' .booklist-item').length) {
        $(list).hide();
      } else {
        $(list).show();
      }
    });
  }
  updateListsG = updateLists;

  function create(app) {
    function slowKeyup(wait, getData, shouldWait, cb) {
      var key_timeout = 0
        , ignore_me = false
        , lastData
        ;

      return {
        keyup: function (ev) {
          ev.preventDefault();

          if (ignore_me) {
            ignore_me = false;
            return;
          }

          var data = getData();
          if (lastData === data) {
            return;
          }
          lastData = data;

          clearTimeout(key_timeout);
          if (shouldWait(data)) {
            key_timeout = 0;
            cb(data);
          } else {
            key_timeout = setTimeout(cb, wait, data);
          }
        },
        submit: function (ev) {
          ev.preventDefault();
          clearTimeout(key_timeout);

          var data = getData();
          /*
          if (lastData === data) {
            return;
          }
          lastData = data;
          */

          ignore_me = true;
          cb(data);
        }
      };
    }
    (function () {
  /*
    app.onSearch($("#search").val(), noop);
    $("body").delegate("form#search_form", "submit", function (ev) {
      ev.preventDefault();
    });
  */

      function match(data) {
        if (!data.match(/\w$/) && data.length >= 5) {
          return true;
        }
        return false;
      }

      function pre() {
        return $("#search").val();
      }

      function doStuff(data) {
        console.log("submit: " + data);
        app.onSearch(data, noop);
      }

      var respondon = slowKeyup(500, pre, match, doStuff);
      $("body").delegate("#search", "keyup", respondon.keyup);
      $("body").delegate("form#search_form", "submit", respondon.submit);
    }());
  }

  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  punctRe = /[\.\-_'":!\$\?]/g;
  function searchInCache(title) {
    var results = []
      , pattern
      ;

    title = (title||'').replace(punctRe, '');
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

  patternIsbn = /\d{10}|\d{13}/;
  function run() {
      // This key is a special dummy key from CampusBooks for public testing purposes 
      // Note that it only works with Half.com, not the other 20 textbook sites, 
      // so it's not very useful, but good enough for this demo
    //var campusbooks = CampusBooks.create("BDz21GvuL6RgTKiSbwe3")
      //;

    create({
      onSearch: function (input) {
        var isbn
          , isbnText
          , opts = {}
          , searchType
          , results
          ;

        function onCbSearchComplete(err, xhr, data) {
          var books
            , error
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

          error = err || data && data.repsonse && data.response.errors;

          if (error) {
            // TODO unobtrusive alert('params: ' + JSON.stringify(params));
            console.error("something erred", error);
            return;
          }

          if (!books) {
            books = [];
            console.warn("missing data", data);
            return;
          } else {
            searchKeywords[input] = data;
          }

          function cacheBook(book) {
            searchCache[book.isbn13||book.isbn||book.isbn10] = book;
            book.timestamp = new Date().valueOf();
          }

          books.forEach(cacheBook);


          onSearchComplete(err, books);
        }

        function onSearchComplete(err, books) {
          if (!err && Array.isArray(books)) {
            showBooks(books);
            $("#imported-booklist .book_course").hide();
            $("#imported-booklist .semester").hide();
            $("#imported-booklist .button-ignore2").hide();
          }
        }

        input = String(input||'').toLowerCase().trim();

        // TODO not sure what this commented out part was supposed to mean
        if (!input || isNaN(input.length) /*|| !input.length < 3*/) {
          onSearchComplete(null, []);
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
          searchType = 'search';
          // TODO search school cache
        }

        // TODO merge in both results
        results = results || searchKeywords[input] || searchInCache(input);

        // 150px seems a good size
        opts.image_height = 150;

        if (!results || !results.length) {
          campusbooks[searchType](opts).when(onCbSearchComplete);
        } else {
          onSearchComplete(null, results);
        }
      }
    });
  }

  function listUploads() {
    var books
      , unsorted = []
      , booklist
      ;

    function display() {
      Object.keys(books).forEach(function (isbn) {
        var book = books[isbn];

        if ('undefined' === typeof book.haveIt || 'undefined' === typeof book.wantIt) {
          unsorted.push(book);
        }
      });

      unsorted.sort(sortBySemester);

      //unsorted.forEach(appendBook);
      unsorted.forEach(function (book, i) {
        try {
          appendBook(book, i);
        } catch(e) {
          console.error('TODO', e, book);
        }
      });


      transitionBookList();
    }

    function onBooklist(data) {
        fullBooklist = data;
        books = userBooks = data.booklist || {};

        // TODO this may chance to happen before
        // the bookinfo.table.json is loaded
        Object.keys(books).forEach(function (isbn) {
          var book = books[isbn]
            , bookinfo = searchCache[book.isbn13 || book.isbn || book.isbn10]
            ;

          if (bookinfo) {
            book.image = bookinfo.image;
            book.author = bookinfo.author || book.author;
            book.isbn13 = bookinfo.isbn13 || book.isbn13;
            book.isbn10 = bookinfo.isbn10 || book.isbn10;
            book.edition = bookinfo.edition;
            book.binding = bookinfo.binding;
            book.title = bookinfo.title || book.title;
          }
          book.isbn = book.isbn13 || book.isbn || book.isbn10;

          if (book.haveIt && !book.wantIt) {
            getProviders(book);
          }
          if (!book.haveIt && book.wantIt) {
            getProviders(book);
          }

          if (book.term) {
            hasImportedList = true;
          }
        });

        if (hasImportedList) {
          $('#import-prompt').remove();
        }
        display();
        updateLists();
    }

    function onBooklistHttp(err, ahr, data) {
        if (err) {
          console.error(err);
          window.alert(JSON.stringify(err));
          return;
        }

        if (!data) {
          console.error('onBooklistHttp no data');
          return;
        }

        jsonStorage.set('user-booklist', {
            timestamp: new Date().valueOf()
          , data: data.result
        });

        onBooklist(data.result);
    }

    function getBooklistHttp() {
      // http://localhost:3080
      if (!currentUser.userToken) {
        return;
      }
      request({
          href: "/booklist/" + currentUser.userToken + "?_no_cache_=" + new Date().valueOf()
      /*
        , headers: {
              "X-User-Session": "badSession"
          }
      */
      }).when(onBooklistHttp);
    }

    booklist = undefined; //jsonStorage.get('user-booklist');

    if (!currentUser.userToken) {
      onBooklist({});
    }

    // 10 minutes
    if (!booklist || !booklist.data || new Date().valueOf() - booklist.timestamp > 10 * 60 * 60 * 1000) {
      getBooklistHttp();
    } else {
      console.log('booklist.data', booklist.data);
      onBooklist(booklist.data);
    }

  }

  function transitionBookList() {
    if (!$('.item') || !$('.item').length) {
      $('#list-button-container').fadeOut();
      $('.autoloader').fadeOut();
      if (hasImportedList) {
        $('#import-prompt').remove();
      }
    }
  }

  // TODO move to a campusbooks wrapper library
  function cbPrices(data) {
    var list = []
      , conditions
      ;

    // XML is so fupt...
    conditions = data 
              && data.response 
              && data.response.page 
              && data.response.page.offers 
              && data.response.page.offers.condition
              || []
              ;

    conditions = Array.isArray(conditions) ? conditions : [conditions];
    conditions.forEach(function (offers) {
      offers = offers.offer;
      if (!offers) {
        offers = [];
      }
      offers = Array.isArray(offers) ? offers : [offers];
      offers.forEach(function (offer) {
        list.push(offer);
      });
    });
    return list;
  }
  function cbBuyBackPrices(data) {
    var merchants
      ;

    // XML is so fupt...
    merchants = data 
              && data.response 
              && data.response.page 
              && data.response.page.offers 
              && data.response.page.offers.merchant
              || []
              ;

    merchants = Array.isArray(merchants) ? merchants : [merchants];
    merchants.forEach(function (merchant) {
      merchant.prices = merchant.prices.price;
    });

    return merchants;
  }

  function getProviders(book) {
    var join = Join.create()
      , isbn = book.isbn13 || book.isbn || book.isbn
      , cbProviders
      , cbConsumers
      , blyphProviders
      , blyphConsumers
      , blyphUnsorted
      , staletime = 10 * 60 * 60 * 1000
      , now = Date.now()
      ;

    function sortData(retailSale, trade, retailBuyBack, need, unsorted) {
      var data = {}
        , lowest
        ;

      function sortOnlineBooks(a, b) {
        if (a.total_price && b.total_price) {
          return parseFloat(a.total_price) < parseFloat(b.total_price) ? -1 : 1;
        }
        return parseFloat(a.price) < parseFloat(b.price);
      }

      function sortBuyBackByPrice(o0, o1) {
        var a, b;
        a = parseFloat(o0.prices.sort().reverse()[0], 10)||0;
        b = parseFloat(o1.prices.sort().reverse()[0], 10)||0;
        return a > b ? -1 : 1;
      }

      function getPrivateData() {
        return data;
      }

      data.timestamp = now;
      data.retailSale = retailSale;
      data.trade = trade;
      data.retailBuyBack = retailBuyBack;
      data.need = need;
      data.unsorted = unsorted;

      data.retailSale.sort(sortOnlineBooks);
      data.retailBuyBack.sort(sortBuyBackByPrice);

      lowest = data.retailSale[0] || { price: Infinity, total_price: Infinity };

      // TODO realize that this is the bookstore price
      // and give them credit if they're the best (not likely)
      book.usedPrice = parseFloat(book.usedPrice) || Infinity;
      book.lowest_buy_price = Math.min(book.usedPrice, lowest.total_price || lowest.price);
      book.highest_buyback_price = parseFloat(((data.retailBuyBack[0]||{}).prices||[]).sort().reverse()[0]||0, 10);

      // prevent JSON stringification by using a function
      book.providers = getPrivateData;

      // show matched icon
      updateLists();
    }

    function onProviderDataHttp(retailSales, trade, retailBuyBacks, need, unsorted) {
      book.downloadInProgress = 0;
      console.log('onProviderDataHttp');

      // Rentals don't save you any money. Really.
      function excludeRentals(offer) {
        return 6 !== parseInt(offer.condition_id, 10);
      }

      /* CampusBooks Response */
      console.log('retailSales', retailSales);
      retailSales = cbPrices(retailSales[2]).filter(excludeRentals);

      console.log('retailBuyBacks', retailBuyBacks);
      retailBuyBacks = cbBuyBackPrices(retailBuyBacks[2]);

      /* Blyph Response */
      console.log('trade', trade);
      trade = trade[2] && trade[2].result || {};
      trade = trade.books || [];

      console.log('need', need);
      need = need[2] && need[2].result || {};
      need = need.books || [];

      console.log('unsorted', unsorted);
      unsorted = unsorted[2] && unsorted[2].result || {};
      unsorted = unsorted.books || [];

      jsonStorage.set('cbp:' + isbn, {
          timestamp: now
        , data: retailSales
      });

      jsonStorage.set('blyphp:' + isbn, {
          timestamp: now
        , data: trade
      });

      jsonStorage.set('cbc:' + isbn, {
          timestamp: now
        , data: retailBuyBacks
      });

      jsonStorage.set('blyphc:' + isbn, {
          timestamp: now
        , data: need
      });

      jsonStorage.set('blyphu:' + isbn, {
          timestamp: now
        , data: unsorted
      });

      console.log("Sorting after Retreiving from http");
      sortData(retailSales, trade, retailBuyBacks, need, unsorted);
    }

    function getProviderData() {
      if ('number' !== typeof book.downloadInProgress) {
        /* false and true are evaluated as 0 and 1 in expressions */
        book.downloadInProgress = 0;
      }
      if (now - book.downloadInProgress < 15 * 1000) {
        console.log('waiting on download in progress');
        return;
      }

      book.downloadInProgress = Date.now();
      setTimeout(function () {
        book.downloadInProgress = 0;
      }, 15 * 1000);

      // traders
      campusbooks.prices({isbn: isbn}).when(join.add());
      request({
        "href": "/books/byTrade/" + isbn
      }).when(join.add());

      // needers
      campusbooks.buybackprices({isbn: isbn}).when(join.add());
      request({
        "href": "/books/byNeed/" + isbn
      }).when(join.add());

      // TODO remove
      request({
        "href": "/books/byUnsorted/" + isbn
      }).when(join.add());

      // join all requests
      join.when(onProviderDataHttp);
    }

    cbProviders = jsonStorage.get('cbp:' + isbn);
    blyphProviders = jsonStorage.get('blyphp:' + isbn);

    cbConsumers = jsonStorage.get('cbc:' + isbn);
    blyphConsumers = jsonStorage.get('blyphc:' + isbn);

    blyphUnsorted = jsonStorage.get('blyphu:' + isbn);

    console.log(
        cbProviders
      , blyphProviders
      , cbConsumers
      , blyphConsumers
      , blyphUnsorted
    );

    if (
           !cbProviders || now - cbProviders.timestamp > staletime
        || !blyphProviders || now - blyphProviders.timestamp > staletime
        || !cbConsumers || now - cbConsumers.timestamp > staletime
        || !blyphConsumers || now - blyphConsumers.timestamp > staletime
        || !blyphUnsorted || now - blyphUnsorted.timestamp > staletime
        ) {
      console.log(
          'not cached properly'
        , isbn
        , cbProviders
        , blyphProviders
        , cbConsumers
        , blyphConsumers
        , blyphUnsorted
        , !cbProviders || now - cbProviders.timestamp > staletime
        , !blyphProviders ||  now - blyphProviders.timestamp > staletime
        , !cbConsumers || now - cbConsumers.timestamp > staletime
        , !blyphConsumers || now - blyphConsumers.timestamp > staletime
        , !blyphUnsorted || now - blyphUnsorted.timestamp > staletime
      );
      getProviderData();
    } else {
      console.log("Sorting after Retreiving from Cache");
      sortData(cbProviders.data, blyphProviders.data, cbConsumers.data, blyphConsumers.data, blyphUnsorted.data);
    }
  }


  function addBook(bookEl, haveIt, wantIt) {
    var isbn10 = bookEl.find('.isbn10').text().trim()
      , isbn13 = bookEl.find('.isbn13').text().trim()
      , myBook = userBooks[isbn13] || userBooks[isbn10]
      , book = searchCache[isbn13] || searchCache[isbn10]
      ;

    // TODO move this elsewhere
    $('#matches').hide();

    // TODO where did searchCache go?
    if (book) {
      if (myBook) {
        // TODO
        myBook.image = book.image;
      } else {
        myBook = userBooks[isbn13||isbn10] = book;
      }
    }

    myBook.haveIt = haveIt;
    myBook.wantIt = wantIt;
    if ((haveIt & !wantIt) || (!haveIt & wantIt)) {
      if (!myBook.providers || !myBook.providers()) {
        getProviders(myBook);
      }
    }

    bookEl.addClass('slide-up');
    setTimeout(function () {
      bookEl.remove();
      transitionBookList();
    }, 500);
    updateLists();
    saveBooklist();
  }

  function transitionToUserToken(obj) {
    if (!obj || 'object' !== typeof obj) {
      return;
    }

    if (/@/.exec(obj.token)) {
      obj.userToken = toUserToken(obj.token.trim().toLowerCase());
      delete obj.token;
    }

    if (/@/.exec(obj.email)) {
      obj.userToken = toUserToken(obj.email.trim().toLowerCase());
      delete obj.email;
    }

    return obj;
  }

  function attemptLogin() {
    // TODO move out
    var users
      , user
      ;

    user = transitionToUserToken(jsonStorage.get('user'));
    users = jsonStorage.get('users') || {};
    if ('object' !== typeof users) {
      users = {};
    }

    transitionToUserToken(currentUser);

    Object.keys(users).forEach(function (key) {
      var user = transitionToUserToken(users[key]);
      delete users[key];
      users[user.userToken] = user;
    });

    if (!currentUser.userToken) {
      if (!user || !user.userToken) {
        // could check for most recent of `users`, but nah
        return;
      }

      currentUser.userToken = user.userToken;

      Object.keys(user).forEach(function (key) {
        currentUser[key] = user[key];
      });

    } else {
      user = users[currentUser.userToken] = users[currentUser.userToken] || currentUser;
    }

    if ('object' === typeof user) {
      Object.keys(user).forEach(function (key) {
        currentUser[key] = user[key];
      });
    }

    currentUser.timestamp = new Date().valueOf();

    users[currentUser.userToken] = currentUser;
    jsonStorage.set('users', users);
    jsonStorage.set('user', currentUser);

    if (currentUser.userToken) {
      $(onSuccessfulLogin);
    }
  }

  function parseHash() {
    var urlObj
      , queryObj
      , hashStr = location.hash
      , referrerIdM = /referrerId=(.*)/.exec(hashStr)
      ;

    location.hash = '';

    urlObj = url.parse(hashStr.substr(1), true);
    queryObj = urlObj.query || {};

    if (referrerIdM) {
      currentUser.referredBy = referrerIdM[1];
    } else {
      currentUser.referredBy = queryObj.referredBy;
    }

    currentUser.userToken = currentUser.userToken || toUserToken(queryObj.userToken) || toUserToken(queryObj.token) || toUserToken(queryObj.email);

    attemptLogin();
  }

  function showSocial() {
    var fbScript
      , twScript
      , xfbml
      ;

    currentUser.referrerId = currentUser.userToken.substr(14, 8);

    // TODO we have to use #referrerId here due to some server parse error?
    xfbml = '<fb:send width="200" id="fb-unique-link" href="' + 'blyph.com/#referrerId=' + currentUser.referrerId + '" font=""></fb:send>';
    document.getElementById('fbml').innerHTML = xfbml;

    fbScript = document.createElement('script');
    fbScript.src = 'http://connect.facebook.net/en_US/all.js#xfbml=1';
    fbScript.async = 'async';
    fbScript.defer = 'defer';
    setTimeout(function () {
      document.body.appendChild(fbScript);
    }, 100);

    twScript = document.createElement('script');
    twScript.src = 'http://platform.twitter.com/widgets.js';
    twScript.async = 'async';
    twScript.defer = 'defer';
    setTimeout(function () {
      document.body.appendChild(twScript);
    }, 100);
  }

  function onSuccessfulLogin() {
    var href;

    currentUser.referrerId = currentUser.userToken.substr(14,8);

    href = $(".load-booklist a").attr('href');
    $(".load-booklist a").attr('href', href + '#/?userToken=' + currentUser.userToken);
    $("#fb-unique-link").attr('href', 'blyph.com/#/?referredBy=' + currentUser.userToken);
    $('#saveyourinfo').slideUp();
    $('#logout').show();
    $('.username').text(currentUser.nickname);
    // TODO
    if (false) { showSocial(); }
    listUploads();
  }

  domReady(function () {
    $('body').delegate('.button-want2', 'click', function (ev) {
      ev.stopPropagation();
      addBook($(this).closest('.item'), false, true);
    });
    $('body').delegate('.button-list2', 'click', function (ev) {
      ev.stopPropagation();
      addBook($(this).closest('.item'), true, false);
    });
    $('body').delegate('.button-keep2', 'click', function (ev) {
      ev.stopPropagation();
      addBook($(this).closest('.item'), true, true);
    });
    $('body').delegate('.button-ignore2', 'click', function (ev) {
      ev.stopPropagation();
      addBook($(this).closest('.item'), false, false);
    });

    $('body').delegate('.booklist-item', 'click', function (ev) {
      ev.stopPropagation();

      var isbn = $(this).find('.bli-isbn').text().trim()
        , book = userBooks[isbn]
        ;

      showBook(book);
    });
    $('body').delegate('.booklist_container', 'click', function (ev) {
      ev.stopPropagation();

      var books = []
        , isbnEls = $(this).find('.bli-isbn')
        , i
        ;

      function getEachIsbn(el) {
        var isbnEl = el
          , isbn = isbnEl && isbnEl.innerHTML
          , book
          ;

        isbn = isbn.trim();
        book = userBooks[isbn];

        if (book) {
          books.push(book);
        }
      }

      // forEach isn't part of the dom
      for (i = 0; i < isbnEls.length; i += 1) {
        getEachIsbn(isbnEls[i]);
      }

      books.sort(sortBySemester);
      showBooks(books);
    });
    $('body').delegate('.booklist_container header', 'mouseover', function () {
      $(this).closest('.booklist_container').addClass('booklist_container-whole');
    });
    $('body').delegate('.booklist_container header', 'mouseout', function () {
      $(this).closest('.booklist_container').removeClass('booklist_container-whole');
    });

    $('#person-matches').delegate('.ppl-write-message', 'click', function (ev) {
      var personHtml = $(this).closest('.ppl-widget')
        , msg = {}
        ;

      ev.stopPropagation();

      // There should only be one book displayed at a time
      msg.bookTitle = $('#imported-booklist .item .title').text().trim();
      msg.toName = personHtml.find('.result-name').text().trim();
      msg.fairPrice = personHtml.find('.result-for-price').text().trim();

      msg.body = personHtml.find('textarea').val();

      if (msg.toName) {
        msg.body = msg.body.replace(/@NAME/, msg.toName);
      }
      if (msg.bookTitle) {
        msg.body = msg.body.replace(/@TITLE/, msg.bookTitle);
      }
      if (Number(msg.fairPrice.substr(1))) {
        msg.body = msg.body.replace(/@USD/, msg.fairPrice);
      }

      personHtml.find('textarea').val(msg.body);

      $(this).find('.ppl-message').show();
      $(this).find('.button-get-it').hide();
    });


    $('#person-matches').delegate('.ppl-send-message', 'click', function (ev) {
      var personHtml = $(this).closest('.ppl-widget')
        , message = {}
        ;

      ev.stopPropagation();

      message.note = "Hello firebugger / wiresharker. Yes, we plan on fixing this bug soon. Just trying to release, y'know";
      message.to = personHtml.find('input.email').val(); // TODO rename as userToken
      message.from = currentUser.userToken;
      message.bookTitle = $('#imported-booklist .item .title').text().trim();
      message.body = personHtml.find('textarea').val();
      message.fairPrice = personHtml.find('.result-for-price').text().trim();

      request({
          method: "POST"
        , href: "/match"
        , headers: {
              "Content-Type": "application/json"
          }
        , body: message
      }).when(function (err, ahr, data) {
        var alerted = false;
        if (ahr.status) {
          if (!(ahr.status >= 200 && ahr.status < 300)) {
            console.log(ahr.status, data, data.error);
            window.alert('Error: failed to send message');
            alerted = true;
          }
        }
        if (data && 'string' !== typeof data && !data.error ) {
          personHtml.html('Message sent. :-D');
        } else {
          console.log(ahr.status, data);
          if (!alerted) {
            window.alert('Error: failed to send message');
          }
        }
      });

      personHtml.html('Sending Message...');
    });


    $('body').delegate('form#email_form', 'submit', function (ev) {
      ev.preventDefault();

      var users
        , user
        ;

      // TODO this must be done on the application side as well!!!
      currentUser.email = $('input[name=email]').val().trim().toLowerCase();
      currentUser.school = $('input[name=school]').val().trim().toLowerCase();

      if (!currentUser.email || !/\w+@\w+.\w+/.exec(currentUser.email)) {
        window.alert('bad email address');
        return;
      }
      currentUser.nickname = currentUser.email.replace(/@.*/, '');
      currentUser.userToken = MD5.digest_s(currentUser.email);
      //delete currentUser.email;

      if (!currentUser.school || !/\w+\.(?:edu|gov)\s*$/i.exec(currentUser.school)) {
        window.alert('Put a University url such as "byu.edu"');
        return;
      }

      function onSubscribe(err, ahr, echo) {
        $('saveyourinfo').fadeTo(300, 1);

        if (!echo) {
          $('#email_form').html(
              "Error: A monkey wrench must have gotten stuck in one of the server gizmos." +
              "<br/>" +
              "If it's not working in 5 minutes please call AJ"
            );
          $('#gvoice').click();
          return;
        }

        if (!/(byu|uvu).edu$/.exec(echo.couchdb.school)) {
          window.alert("Currently we only support BYU, and UVU, but USU, and UofU are close behind!");
        } else {
          $('#import-prompt').show();
        }

        Object.keys(echo.couchdb).forEach(function (key) {
          currentUser[key] = echo.couchdb[key];
        });

        jsonStorage.set('user', currentUser);

        onSuccessfulLogin();
      }

      $('saveyourinfo').fadeTo(300, 0.3);
      request({
          method: 'POST'
        , href: '/subscribe'
        , body: currentUser
      }).when(onSubscribe);

      users = jsonStorage.get('users') || '{}';
      user = users[currentUser.userToken] = users[currentUser.userToken];
      if ('object' === typeof user) {
        Object.keys(user).forEach(function (key) {
          currentUser[key] = user[key];
        });
      }
      currentUser.timestamp = new Date().valueOf();
      users[currentUser.userToken] = currentUser;
      jsonStorage.set('users', users);

    });

    $('body').delegate('#logout a', 'click', function (ev) {
      ev.preventDefault();
      currentUser = {};
      jsonStorage.remove('user');
      $('#logout').hide();
      $('#saveyourinfo').slideDown();
      location.reload();
    });

    $('#saveyourinfo').delegate('#gvoice', 'click', function (ev) {
      ev.preventDefault();
      $('#gvoice').hide();
      $('#gvoiceWidget').show();
      $('#gvoiceWidget').click();
    });

  });
  
  domReady(function () {
    console.log('imported-booklist-tpl', $("#js-imported-booklist-tpl").html());
    DBG.displayItemTemplate = $("#imported-booklist").html();
    form_item_template = $("#item_form").html();
    $("div.item").remove();
    $("div.change_item").remove();

    run();

    parseHash();
    request({
      href: "/bookinfo.table.json"
    }).when(reconstituteBookCache);
  });
}());
