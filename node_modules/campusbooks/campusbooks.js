/*jslint es5: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, strict: true */
(function () {
  "use strict";

  var jsonapi = require('jsonapi'),
    CampusBooks = {},
    documentation;

  /**
   * Documention
   * TODO: list all params
   * 
   */
  documentation = {
    requests: [
      {
        name: "constants",
        description: "The Constants call just returns a list of each of the types of constants, and their available id/value pairs",
        parameters: {
          oneOf: []
        }
      },
      {
        name: "prices",
        parameters: {
          oneOf: [
            "isbn"
          ],
          required: [
            "isbn"
          ]
        },
        description: "The prices call requires a single valid ISBN to be passed in via a 'isbn' parameter:\n" +
          "<br/>\n" +
          "<pre>http://api.campusbooks.com/10/rest/prices?key=YOUR_API_KEY_HERE&isbn=ISBN_HERE</pre>\n" +
          "<br/>\n" +
          "It returns groupings for each condition where each group contains multiple offers.\n" + 
          "Each offer contains the following fields:",
        response: [
          {
            name: "isbn",
            description: "The thirteen digit ISBN for this offer"
          },
          {
            name: "merchant_id",
            description: "A numeric merchant ID (Note, this value may be signed)"
          },
          {
            name: "merchant_name",
            description: "The Name of the merchant (looked up from the defined constants)"
          },
          {
            name: "merchant_image",
            description: "URL of the merchant logo"
          },
          {
            name: "price",
            description: "The price that this merchant is listing this item for"
          },
          {
            name: "shipping_ground",
            description: "The cost to ship to an address in the US via ground services"
          },
          {
            name: "total_price",
            description: "Seller price plus the ground shipping price"
          },
          {
            name: "link",
            description: "Link to purchase the book"
          },
          {
            name: "condition_id",
            description: "Numeric representation of the condition (see constants)"
          },
          {
            name: "condition_text",
            description: "Text representation of the condition"
          },
          {
            name: "availability_id",
            description: "Numeric representation of the availability (how long it takes for the seller to ship it)"
          },
          {
            name: "availability_text",
            description: "Text representation of the availability"
          },
          {
            name: "location",
            description: "Geographic location where this item ships from (not always present)"
          },
          {
            name: "their_id",
            description: "The merchant's id for this offer (not always present)"
          },
          {
            name: "comments",
            description: "Comments about this offering"
          },
          {
            name: "condition_text",
            description: "Text representation of the condition"
          },
          {
            name: "rental_detail",
            description: "This node is available only for offers from book rental companies.\n" + 
              "If available, each sub-node indicates a price for one of three rental periods (SEMESTER, TERM, or SUMMER)",
            values: [
              {
                name: "days",
                description: "The exact number of days that this book may be rented for"
              },
              {
                name: "price",
                description: "The price for this rental period"
              },
              {
                name: "link",
                description: "A link that will take the visitor to a page specific to this rental period\n" + 
                  "(if supported by the merchant)"
              }
            ]
          }
        ]
      },
      {
        name: "bookinfo",
        parameters: {
          oneOf: [
            "isbn",
            "image_height",
            "image_width"
          ],
          required: [
            "isbn"
          ]
        },
        description: "The bookinfo call requires a single valid ISBN to be passed in via a 'isbn' parameter:\n" +
          "<br/>\n" +
          "<pre>http://api.campusbooks.com/10/rest/bookinfo?key=YOUR_API_KEY_HERE&isbn=0824828917[&image_height=HEIGHT][&image_width=WIDTH]</pre>\n" +
          "<br/>\n" +
          "It returns a 'page' element with all of the book attributes.",
        response: [
          {
            name: "isbn10",
            description: "Ten-Digit ISBN for this book"
          },
          {
            name: "isbn13",
            description: "Thirteen-Digit ISBN for this book"
          },
          {
            name: "title",
            description: "Book Title"
          },
          {
            name: "author",
            description: "Book Author"
          },
          {
            name: "binding",
            description: "Book Binding"
          },
          {
            name: "msrp",
            description: "List price for the book"
          },
          {
            name: "pages",
            description: "Number of pages in the book"
          },
          {
            name: "publisher",
            description: "Book Publisher"
          },
          {
            name: "published_date",
            description: "Published Date"
          },
          {
            name: "edition",
            description: "Book Edition (ie: 2nd, 3rd, etc)"
          },
          {
            name: "description",
            description: "A text description for the book"
          }
        ]
      },
      {
        name: "search",
        cimplate: "div.book",
        values: {
          "image": ".image[src={value}]",
          "title": ".title",
          "author": ".author",
          "isbn10": ".isbn10",
          "isbn13": ".isbn13",
          "edition": ".edition"
        },
        render: function (result) {
          var me = this,
            dimplset = [];

          function find_or_create(css) {
            // parse css
            // loop through from parentto child
            // find
            // if length 0, create in parent (or body)
          }
          //try {
            result.response.page.results.book.forEach(function (book) {
              var html = $('#templates ' + me.cimplate).clone();
              Object.keys(book).forEach(function (key) {
                // TODO parse css to produce subtemplates
                if ("image" === key) {
                  html.find('.'+key).attr("src", book[key]);
                  return;
                }
                html.find('.'+key).html(book[key]);
              });
              dimplset.push(html);
            });
          //} catch(e) {}
          return dimplset;
        },
        parameters: {
          oneOf: [
            "author",
            "title",
            "keywords",
            "page",
            "image_height",
            "image_width"
          ],
          validation: function(parameters) {
            var msg = true;
            if (0 === parameters.length) {
              msg = "you must specify at least one search parameter";
            }
            return msg;
          }
        },
        description: "The search call can be used to do an author, title, or keyword search.\n" +
          "It returns a list of books that match the search criteria\n" +
          "<br/>\n" +
          "<pre>http://api.campusbooks.com/10/rest/search?key=YOUR_API_KEY_HERE&[&author=AUTHOR][&title=TITLE][&keywords=KEYWORDS][&page=1][&image_height=HEIGHT][&image_width=WIDTH]</pre>\n" +
          "<br/>\n" +
          "At least one of 'author', 'title', or 'keywords' must be specified.\n" +
          "The result contains up to 10 results on the page. You can specify a page with the 'page' parameter'",
        response: [
          {
            name: "count",
            description: "The number of results for your search results (only 10 are displayed on this page)"
          },
          {
            name: "pages",
            description: "The number of pages of results available"
          },
          {
            name: "current_page",
            description: "The current page you are on"
          },
          {
            name: "results",
            description: "A list of books. The format of each is the same as from the bookinfo call defined above"
          }
        ]
      },
      {
        name: "bookprices",
        parameters: {
          oneOf: [
            "isbn",
            "image_height",
            "image_width"
          ],
          required: [
            "isbn"
          ]
        },
        description: "This function combines the bookinfo and prices functions into a single call.\n" +
          " It requires an ISBN and returns the book information as well as all of the pricing data\n" +
          "<br/>\n" +
          "<pre>http://api.campusbooks.com/10/rest/bookprices?key=YOUR_API_KEY_HERE&isbn=ISBN[&image_height=HEIGHT][&image_width=WIDTH]</pre>\n",
        response: [
          {
            name: "book",
            description: "A book item. The contents of this item are the same as which is returned with the bookinfo function"
          },
          {
            name: "offers",
            description: "This node contains all of the pricing data that a call to the price function returns"
          }
        ]
      },
      {
        name: "buybackprices",
        parameters: {
          oneOf: [
            "isbn",
            "image_height",
            "image_width"
          ],
          required: [
            "isbn"
          ]
        },
        description: "This function combines the bookinfo request with buyback pricing information.\n" +
          "It requires an ISBN and returns buyback prices for all of the merchants that you have enabled." +
          "<br/>\n" +
          "<pre>http://api.campusbooks.com/10/rest/buybackprices?key=YOUR_API_KEY_HERE&isbn=ISBN[&image_height=HEIGHT][&image_width=WIDTH]</pre>\n",
        response: [
          {
            name: "book",
            description: "A book item. The contents of this item are the same as which is returned with the bookinfo function"
          },
          {
            name: "offers",
            description: "This node contains an array of merchant nodes, each with the following structure",
            values: [
              {
                name: "merchant_id",
                description: "A numeric merchant ID"
              },
              {
                name: "merchant_image",
                description: "URL of the merchant logo"
              },
              {
                name: "name",
                description: "The name of the merchant"
              },
              {
                name: "notes",
                description: "A text description about this merchant. It contains payment and shipping information about this merchant"
              },
              {
                name: "prices",
                description: "prices contains a price node for each condition (new and used)"
              },
              {
                name: "link",
                description: "The link for directing visitors to this merchant."
              }
            ]
          }
        ],
        example: "<pre><code>" +
          "&lt;merchant&gt;" +
          "    &lt;merchant_id&gt;108&lt;/merchant_id&gt;" +
          "    &lt;merchant_image&gt;http://www.campusbooks.com/images/markets/firstclassbooks.gif&lt;/merchant_iamge&gt;" +
          "    &lt;name&gt;First Class Books&lt;/name&gt;" +
          "    &lt;notes&gt;Free shipping via USPS or FedEx. Books must be ....&lt;/notes&gt;" +
          "    &lt;prices&gt;" +
          "        &lt;price condition=\"new\"&gt;13.55&lt;/price&gt;" +
          "        &lt;price condition=\"used\"&gt;13.55&lt;/price&gt;" +
          "        &lt;/prices&gt;" +
          "    &lt;link&gt; http://partners.campusbooks.com/link.php?params=b3...&lt;/link&gt;" +
          "&lt;/merchant&gt;" +
        "</code></pre>"
      },
      {
        name: "merchant",
        parameters: {
          oneOf: [
            "buyback",
            "coupons"
          ]
        },
        description: "This function returns a list of merchants and their home page links you can use for direct promotions.\n" +
          "It can also return a list of available coupons for that merchant" +
          "<br/>\n" +
          "<pre>http://api.campusbooks.com/10/rest/merchants?key=YOUR_API_KEY_HERE[&coupons][&buyback=TYPE]</pre>\n",
        response: [
          {
            name: "name", 
            description: "The name of the merchant"
          },
          {
            name: "type",
            description: "The type of the merchant (BUY, BUYBACK)"
          },
          {
            name: "merchant_id",
            description: "A numeric merchant ID"
          },
          {
            name: "homepage_link",
            description: "A link for directing visitors to this merchants homepage"
          },
          {
            name: "coupon",
            description: "This node contains the coupon information"
          }
        ]
      }
    ],
    version: "10",
    compatible: ["10","9","8","7","6","5","4","3","2","1"],
    jsonp_callback: "callback",
    api_url: "http://api.campusbooks.com/10/rest/",
    api_params: {
      format: "json"
    },
    required_keys: [
      "api"
    ],
    key: {
      name: "key"
    }
  };

  CampusBooks = jsonapi.createRestClient(documentation);
  CampusBooks.documentation = documentation;

  module.exports = CampusBooks
}());
