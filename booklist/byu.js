(function () {
  "use strict";

  // for debugging
  var GLOBALS = {};
  var userToken = $.TOKEN;
  var origin = window.ORIGIN || 'http://blyph.com';
  var redirect = origin + '#/?userToken=' + userToken;

  var body = "<div id='logo'></div>\n<div id='container2'>\n<div id='loading-container'><div id='loading-animation'></div><!--container-->\n\n<progress value='1' max='10' id='progress-bar'><span class='loaded'>1</span>/<span class='total'>10</span></progress>\n</div>" +

            "<form id='booklist' method='POST' action='" + origin + "/booklist/" + userToken + "'>" +
              "<textarea id='blyphmas' style='display: none;' name='booklist'></textarea>" +
              "<input type='hidden' name='redirect' value='" + redirect + "' />" +
              //"<input type='submit' value='force submit' />" +
            "</form>";

  var css = "body\n{background-color:#DCF5FC;\n}\n#logo{ background-image:url(http://alpha.blyph.com/images/Blyph-Logo.png);\nwidth:121px;\nheight:37px;\nbackground-repeat:no-repeat;\nvisibility:visible;\n}\n#background-logo{\n\tbackground-image:url(http://alpha.blyph.com/images/background-logos.png);\n\theight:350px;\n\twidth:500px;\n\tleft:350px;\n\tposition:absolute;\n\tz-index:-1;\n\t}\n\t\nli{\n\tmargin:opx;\n\tpadding:0px;\n\tlist-style-type:none;\n}\n\nhr{ text-decoration:none;color:#333;\nborder:solid #EFEFEF 1px;\n}\nh1{color:#8CC63F;\nfont-family: 'Didact Gothic', serif;\n\theight:35px;\n font-size: 35px;\n  font-style: normal;\n  font-weight: 400;\n  text-shadow: none;\n  text-decoration: none;\n  text-transform: none;\n  letter-spacing: -0.015em;\n  word-spacing: 0em;\n  line-height: 1.2;\n}\nh2{color:#8CC63F;\nfont-family: 'Didact Gothic', serif;\n\theight:20px;\n  font-size: 25px;\n  font-style: normal;\n  font-weight: 400;\n  text-shadow: none;\n  text-decoration: none;\n  text-transform: none;\n  letter-spacing: -0.015em;\n  word-spacing: 0em;\n  line-height: 1.2;\n  padding:0px;}\n  \nh3{color:#666;\nfont-family: 'Didact Gothic', serif;\n\theight:30px;\n  font-size: 20px;\n  font-style: normal;\n  font-weight: 400;\n  text-shadow: none;\n  text-decoration: none;\n  text-transform: none;\n  letter-spacing: -0.015em;\n  word-spacing: 0em;\n  line-height: 1.2;\n  margin:20px 0px 0px 0px;\n  padding:0px;}\n  \np{color:#999;\nfont-family: 'Didact Gothic', serif;\n\theight:30px;\n  font-size: 16px;\n  font-style: normal;\n  font-weight: 400;\n  text-shadow: none;\n  text-decoration: none;\n  text-transform: none;\n  letter-spacing: -0.015em;\n  word-spacing: 0em;\n  line-height: 1.2;\n   margin:10px 0px 5px 0px;\n   padding:0px;\n}\n\na {\n\ttext-decoration:;\n\tfont-size:16px;\n}\n\n#container{\n\twidth:740px;\n\theight:auto;\n\tmargin:50px auto 0px auto;\n\tbackground:#FFF;\n\tpadding:10px 30px 10px 30px;\n\n}\n\n#social-media{\n\theight:auto;\n\twidth:auto;\n\tfloat:right;\n\t}\n#text-area{\n\twidth:700px;\n\theight:20px;\n\tborder:solid #CCC 2px;\n\tmargin-top:10px;\n\t\n\t}\n\t\n.screenshot1{\n\tbackground-image:url(http://alpha.blyph.com/images/byu1.png);\n\theight:240px;\n\twidth:350px;\n\tbackground-repeat:no-repeat;\n\tmargin:10px 0px 10px 0px;\n\tborder:solid 2px #CCC;\n\t}\n.screenshot2{\nbackground-image:url(http://alpha.blyph.com/images/byu2.png);\n\theight:62px;\n\twidth:350px;\n\tbackground-repeat:no-repeat;\n\tmargin:10px 0px 10px 0px;\n\tborder:solid 2px #CCC;\n\t}\n.screenshot3{\nbackground-image:url(http://alpha.blyph.com/images/byu3.png);\n\theight:50px;\n\twidth:350px;\n\tbackground-repeat:no-repeat;\n\tmargin:10px 0px 10px 0px;\n\tborder:solid 2px #CCC;\n\t}\n#loading-animation{Height:150px;\nwidth:150px;\nbackground-image:url(http://alpha.blyph.com/images/Blyph-load-animation.gif)\n\t\n}\n#loading-container{\n\theight:auto;\n\twidth:150px;\n\tmargin-left:auto;\n\tmargin-right:auto;\n\t}\n#container2{\n\twidth:200px;\n\theight:auto;\n\tmargin:50px auto 0px auto;\n\tbackground:#FFF;\n\tpadding:10px 30px 10px 30px;}\n#progress-bar{\n\tmargin:10px 0px 0px 0px;\n\twidth:150px;}";

  $('body').html(body);
  $('<style>').text(css).appendTo('body');

  var semesters = [
          "winter"
        , "winter 2"
        , "spring"
        , "summer"
        , "fall"
        , "fall 2"
      ]
    ;

  // this year +1 year or -3 years
  var years = [
      2012
    , 2011
    , 2010
    , 2012
    , 2009
    , 2008
  ]

  var requests = [];
  var allpages = [];

  function requestError() {
    console.error(arguments);
  }

  function scrapeBookList(el) {
    var count = 0
      , id
      , cssClass
      , coursename
      , coursematch
      , materialEls
      , course
      , courses = []
      , materials = []
      ;

    while (true) {
      id = el.attr('id');
      cssClass = el.attr('class');

      // count is effectively the number of classes
      if (0 === el.length || count > 100) {
        break;
      }
      count += 1;

      course = {};
      if ('CourseMaterialTitle' === cssClass) {
        coursename = (el.text()||'').trim();
        console.log('coursename', coursename);
        // "C S 237 R Section 203 B" ->  "C S"   "237 R" "203 B"
        if (coursematch = coursename.match(/^\s*(.*?)\s+(\d[\d\s\w]+)\s*Section\s+([\d\s\w]+)/)) {
          course.department = coursematch[1].trim();
          course.number = coursematch[2].trim();
          course.section = coursematch[3].trim();
        } else {
          course.name = coursename.trim();
        }

        el = el.next();
        id = el.attr('id');
        cssClass = el.attr('class');
      }

      if ('CourseMaterialDiv' === cssClass) {
        materials = [];
        materialEls = el.find('.ItemContainerDiv');
        materialEls.each(function (i, data) {
          var material = {}
            , itemEl = $(data)
            ;;

          if (itemEl.find('.ItemEmpty').length) {
            return;
          }
          material.isbn = $(data).find('.ItemISBNText.Subtext').text().trim();
          material.title = $(data).find('.ItemTitle.Uncompressed').text().trim();
          material.author = $(data).find('.ItemAuthorText.Subtext').text().trim();
          material.newPrice = $(data).find('.BookstorePricingNewPriceText.Subtext').text().trim().replace('$','');
          material.usedPrice = $(data).find('.BookstorePricingUsedPriceText.Subtext').text().trim().replace('$','');
          material.rentalPrice = $(data).find('.BookstorePricingRentalPriceText.Subtext').text().trim().replace('$','');
          material.required = $(data).find('.ItemRequired').text().trim();
          materials.push(material);

          console.log('material.title', material.title);
        });
        course.materials = materials;
      }

      if (course.materials.length) { 
        courses.push(course);
      }

      el = el.next();
    }

    return { courses: courses };
  }

  function requestSuccess(data, status) {
    var head = $(data).find('#buyMyBooksDiv').next()
      , list = {}
      , term
      ;

    try {
      list = scrapeBookList(head);
      if (list.courses.length) {
        allpages.push(list);
      }
    } catch(e) {
      list.error = e;
      console.error(e);
      // TODO
      // send error message to server
    }

    term = this.url.match(/term=(\d+)(\d)/);
    if (term) {
      // YYT
      list.term = term[1].substr(2) + term[2];
      list.season = semesters[term[2] - 1];
      list.year = term[1];
    }
  }

  function flattenList(terms) {
    var materials = {};

    function eachTerm(term) {
      function eachCourse(course) {
        function eachMaterial(material) {
          material.termSeason = term.season;
          material.term = term.term;
          material.termYear = term.year;
          material.courseDept = course.department;
          material.courseNum = course.number;
          material.courseSec = course.section;
          materials[material.isbn] = material;
        }

        course.materials.forEach(eachMaterial);
      }

      term.courses.forEach(eachCourse);
    }

    terms.forEach(eachTerm);

    return materials;
  }

  function sendBooklist(terms) {
    var booklist = {};

    booklist.timestamp = new Date().valueOf();
    booklist.type = 'booklist';
    booklist.school = 'byu';
    booklist.userToken = userToken;
    booklist.booklist = flattenList(terms);

    $('#blyphmas').val(JSON.stringify(booklist));
    $('form#booklist').submit();
  }

  function requestComplete(xhr) {
    requests.pop();
    loadedLists += 1;
    $("progress").attr('value', loadedLists);
    $("progress .loaded").html(loadedLists);
    if (!requests.length) {
      sendBooklist(allpages); 
    }
  }

  var totalLists = 1 + years.length * semesters.length
    , loadedLists = 1;

  $('progress')
    .attr('max', totalLists)
    .attr('value', loadedLists)
    ;
  $('progress .total').html(totalLists);

  years.forEach(function (year) {
    semesters.forEach(function (s, i) {
      var request = "/mybooklist?term=" + year + '' + (i + 1);
      
      requests.push(requests);
      $.ajax({
          url: request
        , error: requestError
        , success: requestSuccess
        , complete: requestComplete
      });
    });
  });

  
}());
