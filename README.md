## Teem Server

### Prerequisites

[Node.js v0.10.x](http://nodejs.org/download/)

Also, run
    npm install

### Starting the server

DREEM_ROOT specifies the root to your local dreem installation

    ROVI_SEARCH_SECRET=XXX ROVI_SEARCH_KEY=XXX DREEM_ROOT=../dreem/ node server.js

### Running demos
Once your server is running, the directory specified by DREEM_ROOT is served from the root URL, e.g. [http://localhost:8080/](http://localhost:8080/)

To use Rovi APIs, prepend /api/ to the URL, e.g. 

[Top movies](http://wafer.local:8080/api/search/v2.1/amgvideo/filterbrowse?entitytype=movie&filter=editorialrating>8&filter=releaseyear>1500&&include=cast,images&size=1000)
[Top movie](http://wafer.local:8080/api/search/v2.1/amgvideo/filterbrowse?entitytype=movie&filter=editorialrating>8&filter=releaseyear>1500&&include=cast,images&size=1)
[Pivot to actor](http://wafer.local:8080/api/search/v2.1/amgvideo/search?entitytype=credit&include=filmography&query=Yoko+Maki)
[Pivot to other film](http://wafer.local:8080/api/search/v2.1/amgvideo/search?entitytype=video&include=cast&query=Hard+Romanticker)

See the [Rovi docs](http://prod-doc.rovicorp.com/mashery/index.php/Rovi-Data) for more info.


