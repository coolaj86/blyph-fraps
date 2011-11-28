// Book Exchange (isbn + course):
var allBookIds = []
  , db = {}
  ;
(function () {
  "use strict";

  var jqScript
    // , db = {}
    , memDb = {}
      // 3 days
    , maxAge = 3 * 24 * 60 * 60 * 1000
    ;

  function noop(a, b, c, d) {
    // do nothing
    console.log(a, b, c, d);
  }

  db.get = function (key) {
    var value;
    try {
      value = JSON.parse(localStorage.getItem(key));
    } catch(e) {
      console.error("[localStorage] couldn't parse " + localStorage.getItem(key));
    }
    if (!value) {
      try {
        value = JSON.parse(sessionStorage.getItem(key));
      } catch(e) {
        console.error("[sessionStorage] couldn't parse " + sessionStorage.getItem(key));
        return null;
      }
    }
    if (!value && key in memDb) {
      value = memDb[key];
      if ('undefined' === value) {
        value = null;
      }
    }
    return value;
  };

  db.set = function (key, value) {
    try {
      value = localStorage.setItem(key, JSON.stringify(value));
    } catch(e) {
      if (!22 === e.code) {
        console.error("[db] couldn't stringify (or OOM) " + JSON.stringify(value));
        return;
      }
      try {
        value = sessionStorage.setItem(key, JSON.stringify(value));
      } catch(e) {
        if (22 === e.code) {
          memDb[key] = value;
        } else {
          console.error("[db] couldn't stringify (or OOM) " + JSON.stringify(value));
        }
      }
    }
  };

  db.keys = function () {
    var len
      , i
      , keys = [];

    len = localStorage.length;
    for (i = 0; i < len; i += 1) {
      keys.push(localStorage.key(i));
    }
    keys = Object.keys(memDb).concat(keys);
    return keys;
  }

  function cachetize(name, fn, cb, a, b, c, d) {
    var container = db.get(name) || { timestamp: 0 };

    // cache
    if (container.timestamp > (new Date().valueOf() - maxAge)) {
      // fix error with recursive stack overflow
      //setTimeout(function () {
        cb(null, container.items);
      //}(), 0);
      return;
    }

    fn(function (err, data) {
      if (!err && data) {
        container.items = data;
        container.timestamp = new Date().valueOf();
      }
      db.set(name, container);

      cb(err, container.items);
    }, a, b, c, d);
  }






  //
  //
  // Scrape Department Names and links to Courses in that department
  // returns an array of objects like this:
  //
  //
  /*
    {
        name: "Physical Science"
      , abbr: "PHY S"
      , escaped: "PHY%20S" // optional
    }
  */
  function scrapeDepartmentLinksFromHome(page) {
    var depts = [];

    // The actual scraping
    $(page).find('table a.body[href^=course]').each(function (i, link) {
      var name = $(link).text().split(/\s*-\s*/)
        , encoded = $(link).attr('href').match(/dept=(.*)/)[1]
        , dept = {}
        ;

      // A few of the values aren't escaped properly
      if (encoded !== escape(name[0])) {
        dept.escaped = encoded;
        console.log('improper escaping: ', name[0], name[1], encoded);
      }

      dept.abbr = name[0];
      dept.name = name[1];

      depts.push(dept);
    });

    return depts;
  }
  // https://bookexchange.byu.edu/cas/department.cfm
  function fetchDepartmentList(cb, page) {
    console.log('Fetching fresh list of Departments (Teaching Areas)');
    cb(null, scrapeDepartmentLinksFromHome(page));
  }
  // test case:
  // fetchDepartmentList(function () { console.log(arguments) }, $('body'));






  //
  //
  // Scrape Course names and links to the list of links to Postings
  // returns an array of objects like this:
  //
  //
  /*
    {
        dept: [object dept]
      , number: "100R"
      , name: "Honrs Physical Science"
      , bookCount: 23
      , curicId: "06509"
    }
  */
  function scrapeCourseLinksFromDepartment(page, dept) {
    var courses = [];

    // I don't know how to get the next sibling when it's a text node
    // otherwise I would just select the 'a' and get the book count as .next()

    $(page).find('table li').each(function (i, li) {
      var course = {}
        , text = $(li).text()
        , link = $(li).find('a').attr('href').match(/curric=(\d+).*dept=(.*)&?/)
        , parsed
        ;

        // course category is all caps, no numbers
        // course number is mixed numbers and letters
        // course name starts with alpha,
        //   but can have special characters
        // number of books is surrounded by parens

      parsed = text.match(/([A-Z\s]+) ([\d\w]+) - (\w+.+)\((\d+)\)/);

      if (!parsed) {
        // this one doesn't fit the regular pattern
        if (!text.match(/Oth - Other Books/)) {
          console.error('unparsable course listing', text);
          return;
        } else {
          parsed = [
              ''
            , '***'
            , 'Oth'
            , 'Other Books'
            , text.trim().match(/\((\d+)\)$/)[1]
          ];
        }
      }

      //course.dept = dept;
      // course.deptName = parsed[1];
      course.number = parsed[2];
      course.name = parsed[3];
      course.bookCount = parseInt(parsed[4]);
      course.curricId = link[1];
      //course.deptEscaped = link[2];

      courses.push(course);
    });

    return courses;  
  }
  // "https://bookexchange.byu.edu/cas/" + "course.cfm?dept=" + dept.escaped || escape(dept.abbr)
  // https://bookexchange.byu.edu/cas/course.cfm?dept=BUS%20M
  function fetchCourseLinksFromDepartments(cb, dept) {
    console.log('Fetching fresh list of Courses in ' + dept.abbr + ' (' + dept.name + ')');
    var href = "course.cfm?dept=" + (dept.escaped || escape(dept.abbr))
    $.ajax({
        url: href
      , complete: function (xhr) {
          var page = xhr.responseText;
          // HEADACHE ALERT: the response is malformed and doesn't parse as valid HTML
          // $.get wasn't working and it took me embarrassingly long to figure out why
          page = (page||'').match(/<body.*?>([\w\W]+)<\/body/i)[1];
          cb(null, scrapeCourseLinksFromDepartment(page, dept));
       }
     , dataType: 'text'
    });
  }
  //fetchCourseLinksFromDepartments(function () { console.log(arguments); }, { abbr: "A HTG", name: "American Heritage"});






  //
  //
  // Scrape List of Listings from Course Page
  // returns a string for each Listing
  //
  //
  /*
    "A16536FB3FF1E531ED03C1508CC44BE1"
  */
  function scrapeListOfListingsFromCourse(page, course) {
    var bookIds = []
      , anchors = $(page).find('a[href^=book_details]')
      ;

    anchors.each(function (i, anchor) {
      var book_id = $(anchor).attr('href').match(/book_id=(\w+)/);
      book_id = book_id && book_id[1];

      if (book_id) {
        allBookIds.push(book_id);
        bookIds.push(book_id);
      }
    });
    return bookIds;
  }
  // "https://bookexchange.byu.edu/cas/books.cfm?curric=" + course.curricId + "&pageid=1&numpg=1000&hideHeader=true&hideBreadcrumbs=true"
  // https://bookexchange.byu.edu/cas/books.cfm?curric=00804&pageid=1&numpg=1000&hideHeader=true&hideBreadcrumbs=true
  function fetchCoursePostings(cb, course) {
    if (!course.bookCount) {
      console.log('\t\tSkipping fetch (no books listed)');
      cb(null, []);
    }

    console.log('Fetching fresh list of Postings in ' + course.name + ' ' + course.number);
    var href = "books.cfm?curric=" + course.curricId +
          "&pageid=1&numpg=" + ((1 + course.bookCount) * 2) +
          "&hideHeader=true&hideBreadcrumbs=true";
    $.ajax({
        url: href
      , complete: function (xhr) {
          var page = xhr.responseText;
          // HEADACHE ALERT: the response is malformed and doesn't parse as valid HTML
          // $.get wasn't working and it took me embarrassingly long to figure out why
          page = (page||'').match(/<cf.*?>([\w\W]+)/i)[1];
          
          cb(null, scrapeListOfListingsFromCourse(page, course));
       }
     , dataType: 'text'
    });
  }
  // test case: 
  // fetchCoursePostings(function () { console.log(arguments) }, { curricId: 99999, bookCount: 500 });






  //
  //
  // Scrape a single full book listing
  // returns an object like this (isbn and edition formatting changes)
  //
  //
  /*
    {
        title: "Boom start"
      , author: "Michael Swenson"
      , isbn: "9780757566233"
      , edition: "1st"
      , studentPrice: "25.00"
      , description: "Brand new!! no highlighting, no underlining, no writing"
      , added: "4/27/2010"
      , expires: "8/20/2011"
      , views: 19
    };
    }
  */
  function scrapeBookListing(_page) {
    var posting = {}
      , page = $(_page)
      , stats = $(page.find('table')[1]).text()
      , info = $(page.find('table')[2]).text().replace(/\n\s+/g, '\n')
      , parsedInfo
      , parsedStats
      //, userLink = $($('table')[2]).find('a').attr('href')
      ;

    // Very simple title + colon delimited
    parsedStats = stats.match(/Added:\s+(.*)\s+Expires:\s+(.*)\s+Views:\s+(\d+)/);

    if (!parsedStats) {
      console.log('couldn\'t parse stats ' + stats);
      parsedStats = ['', '', '', ''];
    }

    // Title + Newline delimited. Description may span multiple lines?
    parsedInfo = info.match(/Title\s+(.*)\s+Author\s+(.*)\s+ISBN\s+(.*)\s+Edition\s+(.*)\s+Price\s+\$?(.*)\s+Description\s+([\w\W]*)\s+Seller Contact[\w\W]*buying process.\s+(\d+)/);

    if (!parsedInfo) {
      console.log('couldn\'t parse info ' + info);
      parsedInfo = ['', '', '', '', '', '', ''];
    }

    /*
    userLink = userLink.match(/book_id=([A-Za-z0-9]+)/);
    if (userLink) {
      posting.postId = userLink[1];
    }
    */

    return {
      // book info
        title: parsedInfo[1].trim()
      , author: parsedInfo[2].trim()
      , isbn: parsedInfo[3].trim()
      , edition: parsedInfo[4].trim()
      , studentPrice: parsedInfo[5].trim()
      , description: parsedInfo[6].trim()

      // stats
      , added: parsedStats[1].trim()
      , expires: parsedStats[2].trim()
      , views: parseInt(parsedStats[3].trim())
    };
  }
  function scrapeBookOwnerName(page) {
    var name = $(page).find('textarea').val().match("Dear (.*),\n");

    if (!name) {
      console.error("could not parse text area" + $('textarea').val());
      name = ["", ""]
    }

    return name[1].replace(/\s+/, ' ');
  }
  // "https://bookexchange.byu.edu/cas/book_details.cfm?book_id=" + postId
  // https://bookexchange.byu.edu/cas/book_details.cfm?book_id=26EE11AE3FF582D8ABCD4007BAA6649B
  function fetchBookPosting(cb, postId) {
    var href = "book_details.cfm?book_id=" + postId;
    $.ajax({
        url: href
      , complete: function (xhr) {
          var page = xhr.responseText;
          // HEADACHE ALERT: the response is malformed and doesn't parse as valid HTML
          // $.get wasn't working and it took me embarrassingly long to figure out why
          page = (page||'').match(/<cf.*?>([\w\W]+)/i)[1];

          cb(null, scrapeBookListing(page, postId));
       }
     , dataType: 'text'
    });
  }
  // "https://bookexchange.byu.edu/cas/startbuy.cfm?book_id=" + postId;
  // https://bookexchange.byu.edu/cas/startbuy.cfm?book_id=26EE11AE3FF582D8ABCD4007BAA6649B
  function fetchBookOwner(cb, postId) {
    var href = "startbuy.cfm?book_id=" + postId;
    $.ajax({
        url: href
      , complete: function (xhr) {
          var page = xhr.responseText;
          // HEADACHE ALERT: the response is malformed and doesn't parse as valid HTML
          // $.get wasn't working and it took me embarrassingly long to figure out why
          page = (page||'').match(/<cf.*?>([\w\W]+)/i)[1];

          cb(null, scrapeBookOwnerName(page, postId));
       }
     , dataType: 'text'
    });
  }
  function fetchFullPosting(cb, postId) {
    console.log('Fetching fresh book posting ' + postId);
    fetchBookOwner(function (err, owner) {
      fetchBookPosting(function (err2, bookinfo) {
        bookinfo.owner = owner;
        cb(null, bookinfo);
      }, postId);
    }, postId);
    // "https://bookexchange.byu.edu/cas/" +
  }
  // test case:
  // fetchBookPosting(function () { console.log(arguments) }, "26EE11AE3FF582D8ABCD4007BAA6649B");
  // fetchBookOwner(function () { console.log(arguments) }, "26EE11AE3FF582D8ABCD4007BAA6649B");
  // fetchFullPosting(function () { console.log(arguments) }, "26EE11AE3FF582D8ABCD4007BAA6649B");






  // randomize an array
  function randomize() {
    return 0.5 - Math.random();
  }

  function scraper() {
    

    // 3
    // The data is so heirarchical, next we can get just a list of postings, but not the postings...
    // since this doesn't branch out (all 3 links deep describe one posting), only the top layer
    // will be cached
    //
    function getFullPosting(err, postings, course) {
      var fullPostings = []
        , posting
        ;

      console.log('### START: postings.length', postings.length);

      function getNextFullPosting(err, oneFullPosting) {
        fullPostings.push(oneFullPosting);
        posting = postings.pop()

        if (!posting) {
          console.log('!!! DONE: getFullPosting');
          console.log('HOLY CRAP! What a lot of data!');
          return;
        }

        // TODO attach course to posting
        if (0 === postings.length % 100) {
          console.log(postings.length + ' postings left');
        }
        setTimeout(function () {
          cachetize('posting:' + posting, fetchFullPosting, getNextFullPosting, posting);
        }(), 0);
      }

      postings.sort(randomize);
      getNextFullPosting(null, []);
    }
    // getFullPosting(null, ["DE8289083FF582D8A11D4A727CAE3D4E","C0BD115FEA584D4324CF3C351E2EB94B","0960DCEDC00C310738408F9C0D3646F8"], {});


    // 2
    // This gets the book listing for each course
    function getPostLists(err, courses) {
      var postings = []
        , startedNextRequest = false
        , course
        ;

      console.log('### START: courses.length', courses.length);

      function onFetchedPosting(err, somePostings) {
        postings = somePostings.concat(postings);
        getNextPosting();
      }

      function getNextPosting() {
        course = courses.pop()

        if (!course) {
          console.log('!!! DONE: getPostLists');
          if (!startedNextRequest) {
            getFullPosting(null, postings, course);
            startedNextRequest = true;
          }
          return;
        }

        //console.log('Found ' + somePostings.length + ' postings in previous, now checking ' + course.name + ' ' + course.number);

        // TODO attach course to posting
        if (0 === courses.length % 100) {
          console.log(courses.length + ' courses left');
        }
        setTimeout(function () {
          cachetize('courses:' + course.curricId, fetchCoursePostings, onFetchedPosting, course);
        }, 0);
      }

      courses.sort(randomize);
      getNextPosting();
    }

    // 1
    // Next we get a list of courses from each department page
    // https://bookexchange.byu.edu/cas/course.cfm?dept=BUS%20M
    function getCourses(err, depts) {
      var courses = []
        , dept
        ;

      console.log('### START: depts.length', depts.length);

      function getNextCourse(err, someCourses) {
        courses = someCourses.concat(courses);
        dept = depts.pop()

        if (!dept) {
          console.log('!!! DONE: getCourses');
          getPostLists(null, courses);
          return;
        }
        //console.log('Found ' + someCourses.length + ' courses in ' + dept.name);

        dept.escaped = dept.escaped || escape(dept.abbr);
        //console.log('departments left:', depts.length);
        //setTimeout(function () {
          cachetize('departments:' + dept.abbr, fetchCourseLinksFromDepartments, getNextCourse, dept);
        //}, 300);
        // TODO randomize timeout
      }

      depts.sort(randomize);
      getNextCourse(null, []);
    }

    // 0
    // We start on this page with a list of all departments
    // https://bookexchange.byu.edu/cas/department.cfm -- all departments
    cachetize('departments', fetchDepartmentList, getCourses, $('body'));
  }

  var allData;
  var userNames = {};
  function aggregate() {
    var depts = db.get('departments');
    depts = depts.items;
    if (!depts || !depts.length) {
      console.log('bad depts');
      return;
    }
    depts.forEach(function (dept) {
      console.log('dept: ' + dept.abbr);
      var courses = db.get('departments:' + dept.abbr);
      if (!courses || !courses.items.length) {
        console.log('empty dept: ' + dept.abbr);
        return;
      }
      courses = courses.items;

      courses.forEach(function (course) {
        //console.log('course: ' + course.name);
        var postIds = db.get('courses:' + course.curricId)
          , posts = [];

        //course.dept = 'a';
        course.dept = undefined;
        //delete course.dept;

        if (!postIds) {
          return;
        }
        if (!postIds.items.length) {
          // most courses have (0) postings right now
          //console.log('empty course: ' + course.name);
          return;
        }
        postIds = postIds.items;
        postIds.forEach(function (postId) {
          var post = db.get('posting:' + postId);
          if (!post) {
            console.log('empty post: ' + postId);
            return;
          }
          post = post.items;
          post.id = postId;
          posts.push(post);
          userNames[post.owner] = true;
        });

        course.posts = posts;
      });

      dept.courses = courses;
    });
    allData = depts;
  }
  // aggregate();
  // javascript:$('body').html("<pre>" + JSON.stringify(allData, null, '  ') + "</pre>");

  function cacheCoursesInMemory() {
    var len = localStorage.length
      , keys = coursesKeys = []
      , key
      , i
      ;

    for (i = 0; i < len; i +=1) {
      key = localStorage.key(i);
      if (key.match(/^courses:/)) {
        keys.push(key);
        coursesMap[key] = JSON.parse(localStorage.getItem(key));
      }
    }
  }



  var coursesMap = {}
    , coursesKeys = []
    ;

  function cacheCoursesInMemory() {
    var len = localStorage.length
      , keys = coursesKeys = []
      , key
      , i
      ;

    for (i = 0; i < len; i +=1) {
      key = localStorage.key(i);
      if (key.match(/^courses:/)) {
        keys.push(key);
        coursesMap[key] = JSON.parse(localStorage.getItem(key));
      }
    }
  }
  function clearCoursesFromLocalStorage() {
    coursesKeys.forEach(function (key) {
      localStorage.removeItem(key);
    });
  }


  function clearBadKeys() {
    var len = localStorage.length
      , keys = []
      , count = 0
      , key
      , i
      ;

    for (i = 0; i < len; i +=1) {
      key = localStorage.key(i);
      try {
        if (key.match(/^courses:.*[a-zA-Z].*/)) {
          count += 1;
          keys.push(key);
        }
      } catch(e) {
        console.log(key);
      }
    }

    keys.forEach(function (key) {
      try {
        localStorage.removeItem(key);
      } catch(e) {
        console.log(key);
      }
    });

    console.log(count + ' matching keys removed');
  }

  jqScript = document.createElement('script');
  jqScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.js";
  jqScript.onload = scraper;
  document.body.appendChild(jqScript);
}());
/*

    var emails = {}
    function getBook(next, bookId) {
      // "1DA03DEFE3900CA8D9A2AD12CF72575E"
      var args
        ;

      $.ajax({
          url: "startbuyAction.cfm"
        , type: "POST"
        , data: {
              "book_id": bookId
            , "email_text": "Hey," +
                  "\n\nI'm a former BYU student working with my friend, a current BYU-er, on Blyph, a local book exchange, " + 
                  "and I want to invite you to list your book here as well (it's pretty quick and painless)." + 
                  "\n\nhttp://blyph.com" + 
                  "\n\nWe have lots of other BYU students currently listing books as well as the best prices from online stores." +
                  "\n\nI'd appreciate any feedback you have for us." +
                  "\n\n\/=8^D" +
                  "\n\nAJ ONeal" +
                  "\nBlyph Techie Co-founder" + 
                  "\n@coolaj86" + 
                  "\nfb.com/coolaj86"
            , "submit": "Sumbit"
          }
        , complete: function () {
            args = arguments;
            txt = args[0].responseText;
            addr = /mailto:(.*)?"/.exec(txt);
            if (addr) {
              addr = addr[1];
            }
            emails[addr] = true;
            console.log(addr);
            next();
          }
      });
    }

function getNext() {
  console.log(allBookIds.length);

  var bookId = allBookIds.pop();
  
  if (!bookId) {
    return;
  }

  getBook(getNext, bookId);
}

allBookIds = [];
db.keys().forEach(function (key) {
  var item;

  if (!/courses/.exec(key)) {
    return;
  }

  course = db.get(key);
  if (!course.items || !course.items.length) {
    return;
  } 

  courses.items.forEach(function (item) {
    allBookIds.push(item);
  });
});

var lemails = {};
Object.keys(emails).forEach(function (email) {
  lemails[email.trim().toLowerCase()] = true;
});
delete lemails['null'];
Object.keys(lemails).join(',');

emails
emailed = {};
notEmailed = {};


*/
// javascript:window.blys=document.createElement('script');blys.src="http://alpha.blyph.com/scrapers/byu-bookexchange.js";document.body.appendChild(blys)
