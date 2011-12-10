/*
  var blyphScript;

  blyphScript= document.createElement('script');
  blyphScript.src = "http://alpha.blyph.com/scrapers/ratemyprofessors-jquery-scrape.js";
  document.body.appendChild(blyphScript);
*/
// TODO add departments to professor
// TODO add timestamp to professor
(function () {
  "use strict";

  // http://www.utexas.edu/world/univ/state/
  // http://www.utexas.edu/world/univ/alpha/

  // Unfortunately, wikipedia has mismatch formatting
  // http://en.wikipedia.org/wiki/List_of_universities_and_colleges_by_country
  // http://en.wikipedia.org/wiki/List_of_American_institutions_of_higher_education
  // http://en.wikipedia.org/wiki/List_of_colleges_and_universities_in_Virginia

  var depts = [];
  $('select[name=the_dept] option').each(function (i, data) {
    depts.push($(data).text()) 
  });
  console.log(depts);

  function scrapeBooks(data) {
    // TODO
  }

  function scrapeCourses(data) {
    var course = {};
    course.course = $(data).find('.class').text();
    course.date = $(data).find('.date').text();
    return course;
  }

  function scrapeProf(data) {
    var prof = {};
    prof.name = $(data).find('.profName').text();
    prof.dept = $(data).find('.profDept').text();
    prof.photo = $(data).find('.profPhoto.hasPhoto img').attr('src');
    if (!prof.photo) {
      delete prof.photo;
    }
    prof.link = $(data).find('.profName a').attr('href');
    prof.id = prof.link.match(/tid=(\d+)/)[1];
    return prof;
  }

  var profs = [];
  var profsDeque = [];
  var courses = [];


  // wait a random amount of time
  // to avoid looking like an scrape attempt
  // TODO, try looking like a search engine?
  function waitFor() {
    var max_ms = 2000;
    var min_ms = 300;
    return Math.floor(Math.random() * ((max_ms - min_ms) + 1)) + min_ms;
  }

  function getSchool(sid, callback) {
    var alphas = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('').sort(function() {return 0.5 - Math.random()});

    // TODO scrape simultaneously with getTeacherList
    courses = [];
    function getCourseList() {
      var prof = profs.pop()
        , tid
        , responseTime
        , cache
        ;

      if (!prof) {
        console.log('DONE with getCourseList');
        return;
      }

      tid = prof.id;

      cache = localStorage.getItem('prof:tid:' + tid);
      try {
        cache = JSON.parse(cache);
      } catch(e) {
        cache = undefined;
      }

      // no timestamp or timestamp is fresh
      if (cache && !(cache.timestamp > new Date().valueOf() - (7 * 24 * 60 * 60 * 1000))) {
        if (cache.length) {
          courses = courses.concat(cache);
        }
        console.log('found cache, skipping tid ' + tid);
        getCourseList();
        return;
      }

      console.log('getting professor by tid ' + tid);
      responseTime = new Date().valueOf();
      $.get('ShowRatings.jsp?tid=' + tid, function (page, status, xhr1) {
        console.log('' + courses.length + 'request took ' + (new Date().valueOf() - responseTime)/1000 );
        var set = []
          , waitTime = waitFor()
          ;

        $(page).find('#ratingTable .entry').each(function (i, data) {
          var course = scrapeCourses(data);
          course.tid = tid;
          courses.push(course);
          set.push(course);
        });

        // TODO put timestamp
        localStorage.setItem('prof:tid:' + tid, JSON.stringify(set));
        console.log('got all items for ' + tid + '. Waiting ' + (waitTime / 1000) + " for next run");
        setTimeout(getCourseList, waitTime);
      }, 'xml');
    }

    // try the entire alphabet in random order
    // if the least of teachers for that letter is stale
    // or does not exist, then get the list of teachers
    profs = [];
    function getTeacherList() {
      var alpha = alphas.pop()
        , cache;

      // TODO: the length check is just a SAFETY for testing
      if (!alpha) {
        setTimeout(getCourseList, waitFor());
        console.log('DONE with getTeacherList.');
        console.log('start looking for getCourseList');
        return;
      }

      cache = localStorage.getItem('prof:' + sid + ':' + alpha);
      try {
        cache = JSON.parse(cache);
      } catch(e) {
        cache = undefined;
      }

      // no timestamp or timestamp is fresh
      if (cache && !(cache.timestamp > new Date().valueOf() - (7 * 24 * 60 * 60 * 1000))) {
        if (cache.length) {
          profs = profs.concat(cache);
        }
        console.log('found cache, skipping ' + alpha);
        getTeacherList();
        return;
      } 

      console.log('Requesting ' + alpha);
      $.get('/SelectTeacher.jsp?the_dept=All&sid=' + sid + '&orderby=TLName&letter=' + alpha, function (page, status, xhr1) {
        var set = []
          , waitTime = waitFor();

        if (!page) {
          console.error("Couldn't get page '" + alpha + "':", status, xhr1);
        }

        $(page).find('#ratingTable .entry').each(function (i, data) {
          var scraped = scrapeProf(data);
          scraped.timestamp = new Date().valueOf();
          profs.push(scraped);
          set.push(scraped);
        });

        localStorage.setItem('prof:' + sid + ':' + alpha, JSON.stringify(set));

        console.log('got all items for ' + alpha + '. Waiting ' + (waitTime / 1000) + " for next run");
        setTimeout(getTeacherList, waitTime);
      }, 'xml');
    }

    getTeacherList();
  }

  // BYU === 135
  // UVU === 1584
  getSchool(1584, function (err, data) {
    console.log('All Done');
  });

  // http://en.wikipedia.org/wiki/Data_URI_scheme#JavaScript
  /*
   var lookup = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
      'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
      'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
      'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
      'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
      'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
      'w', 'x', 'y', 'z', '0', '1', '2', '3',
      '4', '5', '6', '7', '8', '9', '+', '/'
    ];

  function clean(length) {
    var i, buffer = new Uint8Array(length);
    for (i = 0; i < length; i += 1) {
      buffer[i] = 0;
    }
    return buffer;
  }

  function stringToUint8 (input, out, offset) {
    var i, length;

    out = out || clean(input.length);

    offset = offset || 0;
    for (i = 0, length = input.length; i < length; i += 1) {
      out[offset] = input.charCodeAt(i);
      offset += 1;
    }

    return out;
  }

  function uint8ToBase64(uint8) {
    var i,
      extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
      output = "",
      temp, length;

    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
    };

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
      temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
      output += tripletToBase64(temp);
    }

    // this prevents an ERR_INVALID_URL in Chrome (Firefox okay)
    switch (output.length % 4) {
      case 1:
        output += '=';
        break;
      case 2:
        output += '==';
        break;
      default:
        break;
    }

    return output;
  }
 
  // application/json
  window.open('data:application/json;base64,' + uint8ToBase64(stringToUint8("hello world!")));
  window.open('data:application/octet-stream;base64,' + uint8ToBase64(stringToUint8("hello world!")));
  */
}());
