const { createServer } = require('http');
const fs = require("fs");
const dbrCPP = require("barcode4nodejs");
dbrCPP.initLicense("t0074oQAAABz1tASEoWT4IIp00emVmVI9CDkIbZtyKBCrSbAZcltlVnqIuM6/r5afZwkP60uzSrBlN5kTWD1Y2IIawWEUYSDZAwjyIxQ=");

const HOST = 'localhost';
const PORT = '8080';

const server = createServer((req, resp) => {
  if (req.url === "/index.html") {
    resp.writeHead(200, { "Content-Type": "text/html" });
    fs.readFile("index.html", (err, data) => {
      if (err) {
        console.error(
          "an error occurred while reading the html file content: ",
          err
        );
        throw err;
      }
      resp.write(data);
      resp.end();
    });
  }else if (req.url === "/readBarcodes") {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString(); // at this point, `body` has the entire request body stored in it as a string
      const base64 = JSON.parse(body).base64;
      const startTime = (new Date()).getTime();
      dbrCPP.decodeBase64Async(base64, dbrCPP.formats.OneD | dbrCPP.formats.PDF417 | dbrCPP.formats.QRCode | dbrCPP.formats.DataMatrix | dbrCPP.formats.Aztec, function(msg, results){
        const elapsedTime = (new Date()).getTime() - startTime;
        const response = {};
        response.results = [];
        for (let index = 0; index < results.length; index++) {
          const result = results[index];
          console.log(result);
          response.results.push({
            barcodeText: result.value,
            barcodeFormat: result.format,
            x1: result.x1,
            x2: result.x2,
            x3: result.x3,
            x4: result.x4,
            y1: result.y1,
            y2: result.y2,
            y3: result.y3,
            y4: result.y4
          })
        }
        response.elapsedTime = elapsedTime;
        resp.write(JSON.stringify(response));
        resp.end();
      }, "");
    });
  }else{
    resp.end();
  }
});

server.listen(PORT, HOST, (error) => {
  if (error) {
    console.log('Something wrong: ', error);
    return;
  }

  console.log(`server is listening on http://${HOST}:${PORT} ...`);
});
