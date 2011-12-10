/*
  var jqScript = document.createElement('script');
  jqScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.js";
  document.body.appendChild(jqScript);


  var uvuScript = document.createElement('script');
  uvuScript.src = "http://alpha.blyph.com/booklist/uvu.js";
  document.body.appendChild(uvuScript);
 */


// Got the booklist from
// http://www.uvu.edu/bookstore/images/SummerBookList2011c.pdf
// 
// The used this pdf to html converter
// http://www.pdfonline.com/convert-pdf-to-html/
//
// then unpacked the .zip and ran this sript as show above
//(function () {
  "use strict";

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

  function parseCourse() {
    var course = {
            course: ''
          , section: ''
          , books: []
        }
      , cleanSecEnd = false // prevent pushing the first empty course object
      , courses = []
      , rows = $('tr')
      ;

    function newCourse() {
      course.sections = parseSections(course.section);
      // TODO handle cases such as A01-A03
      courses.push(course);
      course = {
          dept: ''
        , course: ''
        , section: ''
        , books: []
      };
    }

    // if the last row did not have a trailing - or ,
    // and the current row does not have a leading - or ,
    // and the current row is not blank
    // then this current row is a new course
    //
    // "A01"
    // "A01," "A02"
    // "A01" ",A02"
    // "A01" ",A02," "A03"
    // "A01," "A02" ",A03"
    //
    // "A01" | "W01,W06" ",SA6," "UA1,UB1" | "A01-" 
    function isNewCourse(section, i, row) {
      var cleanSecStart
        , curCleanSecEnd = cleanSecEnd
        ;

      if (0 === section.length) {
        // we can't tell anything useful from a blank row
        return false;
      }

      // must be grouped to match the ^ operator equally
      cleanSecStart = !section.match(/^(-|,)/) && !!section.match(/^\w/);
      cleanSecEnd = !!section.match(/\w$/);

      if (!curCleanSecEnd) {
        // if the last section didn't end cleanly,
        // we expect this one to start cleanly // TODO check that?
        // and we know it's not a new course
        if (!cleanSecStart) {
          console.error('parse error: unclean end and unclean start');
          console.error(i, row);
        }
        return false;
      }

      if (!cleanSecStart) {
          return false;
      }

      // is not empty
      // had cleanSecEnd last time  (no trailing , or -)
      // has cleanSecStart this time (no leading , or -)
      return true;
    }

    function parseRow(i, row) {
      var cells = $(row).find('td')
        , info = {}
        , book = {}
        , dept
        ;

      info.dept = dept = $(cells[0]).text().trim();
      if (dept.match(/^Dept$/) || dept.match(/^Prices and Titles are Subject to Change$/)) {
        console.log('useless line');
        return;
      }

      info.course = $(cells[1]).text().trim();
      info.section = $(cells[2]).text().trim();
      // skip author
      // skip title
      book.isbn = $(cells[5]).text().trim();
      // skip $
      book.newPrice = $(cells[7]).text().trim();
      // skip $
      book.usedPrice = $(cells[9]).text().trim();

      if (isNewCourse(info.section, i)) {
        //course.dept = info.dept || course.dept;
        //course.course = info.course ||  course.course;
        newCourse();
      }
      course.dept = info.dept || course.dept;
      course.course = info.course ||  course.course;
      course.section += info.section;

      if (book.isbn.match(/^\d{13}$/)) {
        // uvu's internal fake isbn for no textbook
        // all isbn 13s start with 978-
        if ("9780840004925" !== book.isbn) {
          course.books.push(book);
        }
      }
    }

    var catchresult = rows.each(parseRow);
    // get the very last course
    newCourse();

    return courses;
  }

  parseCourse();

  function getAllIsbns() {
    var isbns = {};

    $('td').each(function (i, el) {
      var text = $(el).text().trim();
      if (text.match(/^\d{13}$/)) {
        isbns[text] = true;
      }
    });

    delete isbns["9780840004925"];
    return Object.keys(isbns);
  }

  //getAllIsbns();

//}());
