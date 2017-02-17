// Copyright (C) 2016 Louis de Charsonville
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License version 3 as
// published by the Free Software Foundation.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


// EXTERNAL MODULES
var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    timeout = require('connect-timeout'),
    favicon = require('serve-favicon');

// ROUTES 
var fetcher = require('./routes/fetcher'),
    cal = require('./routes/cal'),
    quandl = require('./routes/quandl'),
    bls = require('./routes/bls'),
    fred = require('./routes/fred');

var app = express();

var port = process.env.PORT || 8080;


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/',express.static(__dirname + '/public/'));

// Favicon
app.use(favicon(path.join(__dirname,'public','favicon.ico')));

// TIMEOUT
app.use(timeout(29900,{"respond":true}));

// SDMX PROVIDER
// -----------------------
// Timeseries from supported providers
app.get('/:service/dataflow', fetcher.getAllDataFlow);
app.get('/:service/dataflow/:dataset', fetcher.getDataFlow);
app.get('/:service/dataset/:dataset',fetcher.getDataSet);
app.get('/:service/series/:series',fetcher.getSeries);
app.get('/:service/codelist/:codelist',fetcher.getCodeList);

// Timeseries from sdmx url
app.get('/req',fetcher.getDatafromURL);
app.post('/requestbyURL',fetcher.redirectURL);

// OTHER NON-SDMX PROVIDER
// -----------------------
// Quandl
app.get('/quandl/:apiKey/:dataset/:series',quandl.getSeries);
// BLS
app.get('/bls/:apiKey/:series',bls.getSeries);
// FRED
app.get('/fred/:apiKey/:series',fred.getSeries);

// Calendar
// --------
app.get('/cal/:cals', cal.getCals);
app.get('/cal',cal.getFormCal);
app.post('/createCal',cal.sendCal);
app.post('/cal/createCal',cal.sendCal);

// TIMEOUT
app.use(haltOnTimedout);

function haltOnTimedout(err,req,res,next) {
    if (req.timedout === true) {
        if (res.headersSent) {
            next(err);
        } else {
            res.redirect('/timedout.html');
        }
    } else {
        next();
    }
};

// 404
app.get('*', function(req, res){
    res.status(404).send("ERROR 404");
});

app.listen(port, function() {
    console.log('Our app is running on port '+ port);
});

// Very dangerous
process.on('uncaughtException', (err) => {
     console.log(`Caught exception: ${err}`);
});
