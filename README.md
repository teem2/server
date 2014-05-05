## Teem Server

### Prerequisites

[Node.js v0.10.x](http://nodejs.org/download/)

Also, run
    npm install

### Starting the server

DREEM_ROOT specifies the root to your local dreem installation

    ROVI_SEARCH_SECRET=XXX ROVI_SEARCH_KEY=XXX DREEM_ROOT=../dreem/ node server.js

### Running demos
Once your server is running, the directory specified by DREEM_ROOT is served from the root URL, e.g. http://localhost:8080/

To use Rovi APIs,prepend /api/ to the URL, e.g. http://localhost:8080/api/search/v2.1/music/search?query=eric+clapton&entitytype=artist&size=1&include=memberof

See http://prod-doc.rovicorp.com/mashery/index.php/Rovi-Data for more info.


