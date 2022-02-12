import http from 'http'

http.createServer((clientReq, clientRes) => {
    console.log('serve: ' + clientReq.url);
    const proxyHeaders = {};
    for (let k in clientReq.headers) {
        if (k != 'proxy-connection') {
            proxyHeaders[k]=clientReq.headers[k];
        }
    }

    const host = clientReq.url.split('/')[2];
    const path = '/' + clientReq.url.split('/').slice(3).join('/');
    const urlAndPort = clientReq.url.split(':');
    const port = urlAndPort.length == 3 ? Number(urlAndPort[2]) : 80;
    
    const options = {
        hostname: host,
        port: port,
        path: path,
        method: clientReq.method,
        headers: proxyHeaders
    };

    console.log(options)

    const proxy = http.request(options, function (res) {
        // Отправляем так же информацию из заголовков, можно получать или через curl -v или писать тут 
        // const extraInfo = 'HTTP/' + res.httpVersion + ' ' + res.statusCode.toString() + ' ' + res.statusMessage + '\n' +
        // JSON.stringify(res.headers) + '\n';
        // res.headers['content-length'] = Number(res.headers['content-length']) + Number(extraInfo.length);
        clientRes.writeHead(res.statusCode, res.headers);
        // clientRes.write(extraInfo);
        res.pipe(clientRes, {
            end: true
        });
    });

    clientReq.pipe(proxy, {
        end: true
    });
}).listen(8080);