Braps (Client)
===

This is the application which is loaded into your browser for the fraps.

Contributing
===

1. Install `XCode` from the `App Store`

2. Intstall `brew`, `node`, `npm`, and other development tools

        /usr/bin/ruby -e "$(curl -fsSL https://raw.github.com/gist/323731)"
        brew install node
        curl http://npmjs.org/install.sh | sh
        npm install -g \
          validate-json \
          pp-json \
          mailed \
          served \
          pakmanager \
          ender \
          jade \
          spark \
          less

3. Install and Test Fraps

        git clone git://github.com/Blyph/fraps
        # For Developers: git clone git@github.com:Blyph/fraps
        cd fraps
        ./deploy.sh
        served 3200
        open "http://localhost:3200"

License
===

PROPRIETARY

Copyright 2011 Blyph LLC, AJ ONeal

All rights reserved.

We will be working on cleaning up our code and making parts of it Open Source,
We do love Open Source, however, 
we still have some code cleanup and legal considerations to work out
before we release any of our code under a permissive licensee.

In the interim please respect our intellectual property.

Note: much of the downloaded and packaged by `./deploy.sh` is Open Source.
We already happily give back to the community on those projects already.
:-D
