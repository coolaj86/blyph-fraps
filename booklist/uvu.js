//
// User must login:
// https://uvlink.uvu.edu/cp/home/displaylogin
//
// User must navigate to the booklist:
// https://uvlink.uvu.edu/cp/ip/login?sys=gencpip&url=https://uvu.edu/bookstore/bookmatch.php?connId=place
//
// User must copy and paste script into url bar
// javascript:(var s=document.createElement('script'),sc=document.getElementsByTagName("body")[0] || document.getElementsByTagName("head")[0];s.src="http://blyph.com/booklist/uvu.js");
(function () {
  "use strict";

  alert('hello, loaded once');

  var jqScript = document.createElement('script')
    , scriptContainer = document.getElementsByTagName("body")[0] || document.getElementsByTagName("head")[0]
  //, $
    ;

  function jqFailed() {
    alert('Error + failed to load jQuery. Please call 317-426-6525 and let AJ know about this problem');
  }

  function onBooklist(data, status, xhr) {
    console.log('booklist', arguments);
  }

  /*
  // test cases
  countRanges('0001', '0002');
  countRanges('2101', '2105');
  countRanges('A01', 'A02');
  countRanges('A03', 'A05');
  countRanges('A1B01', 'A1B02');
  countRanges('A1B02', 'A1B05');
  // graceful failures
  countRanges('A1A01', 'A1B01');
  countRanges('A1C03', 'A1C01');
  */
  function reverse(str) {
    return str.split('').reverse().join('');
  }

  function countRanges(s, e) {
    var len
      , a
      , b
      , n
      , m
      , start
      , end
      , x
      , range = [];

    // in case there is a letter, number, letter, numbers case
    start = reverse(s).match(/(\d+)(.*)/)
    end = reverse(e).match(/(\d+)(.*)/)

    a = reverse(start[2]||'');
    b = reverse(end[2]||'');

    n = reverse(start[1]);
    m = reverse(end[1]);

    if (a !== b) {
      //console.log('not attempting to count hexdecimal or whatever', s, e);
      return [s, e];
    }

    len = n.length;
    n = parseInt(n);
    m = parseInt(m);

    if (n >= m) {
      //console.log('unexpected sequnce of numbers', s, e);
      return [s, e];
    }

    while (n <= m) {
      x = n.toString()
      while (x.length < len) {
        x = '0' + x;
      }
      range.push((a + '') + x);
      n += 1;
    }
    //range.push((b + '') +  ('' + m));

    return range;
  }


  //parseSections("001,003-005,\n A10 - A09,B003,   C34");
  function parseSections(sectionsText) {
    var sections = [];

    sectionsText.split(/\s*,\s*/).forEach(function (section) {
      var ranges = section.split(/\s*-\s*/);

      if (1 === ranges.length) {
        sections.push(ranges[0]);
        return;
      }

      if (2 !== ranges.length) {
        console.error('Could not reasonably parse "' + sectionsText + '"');
        return;
      }

      ranges = countRanges(ranges[0], ranges[1]);
      sections = sections.concat(ranges);
    });

    return sections;
  }

  function parseCourse(course) {
    var course;
    // 'SUM11 - EGDT - 1040 - A01-B01'.split(/\s+-\s+/)
    course = course.split(/\s+-\s+/);
    course = {
        term: (course[0]||'').trim() || undefined
      , dept: (course[1]||'').trim() || undefined
      , number: (course[2]||'').trim() || undefined
      , sections: parseSections((course[3]||'').trim()) || undefined
    }
    // TODO parse section properly
    return course;
  }

  function parseBooks(row) {
    var cells = $(row).find('td')
      , book = {
            isbn: $(cells[0]).text().trim()
          , required: $(cells[1]).text().trim()
          , title: $(cells[2]).text().trim()
          , author: $(cells[3]).text().trim()
          , edition: $(cells[4]).text().trim()
          , newPrice: $(cells[5]).text().trim()
          , availableNew: 'outofstock.gif' === $(cells[5]).find('input[type=image]').attr('src').trim()
          , usedPrice: $(cells[6]).text().trim()
          , availableUsed: 'outofstock.gif' === $(cells[6]).find('input[type=image]').attr('src').trim()
        }
      ;

    // cart-buy.gif
    // outofstock.gif
    return book;
  }

  function scrape() {
    // this has a very very very weird double table thing going on...
    var courses = [];
    //$ = jQuery;
    //console.log('scrape', arguments);
    // $('#ctl00_ContentPlaceHolder1_Datalist1')
    // $("#ctl00_ContentPlaceHolder1_Datalist1").find('table');
    var x = $("#ctl00_ContentPlaceHolder1_Datalist1").find('table').each(function (i, data) {
      var id = $(data).attr('id')
        , course
        , rows
        , books = []
        ;
      //console.log(id);
      if (id) {
        return;
      }

      function eachBook(row) {
        var book = parseBooks(row);
        if (book) {
          books.push(book);
        }
      }

      course = $(data).find('span:first');
      course = parseCourse($(course).text().trim());

      rows = $(data).find('table tr');

      // nix header row
      rows[0] = rows[rows.length - 1];
      delete rows[rows.length - 1];
      rows.length -= 1;
      Array.prototype.forEach.call(rows, eachBook);

      course.books = books;
      courses.push(course);
    });

    console.log(courses);
    $('body').html("<pre><code>" + JSON.stringify(courses, null, '  ') + "</code></pre>");
    return courses;
  }

  jqScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.js";
  jqScript.onload = scrape;
  jqScript.onerror = jqFailed;
  scriptContainer.appendChild(jqScript);
}());
