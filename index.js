const http = require('http')

http.createServer((request, response)=>{
    response.write('hello world');
    response.end();
}).listen(9090)