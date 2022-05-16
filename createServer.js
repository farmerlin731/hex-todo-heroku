const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandler = require('./errorHandler');
const todolist = [];


const reqListener = (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }

    let body = "";
    req.on('data', (chunk) => {
        body += chunk;
    });


    if (req.url == '/todos' && req.method == 'GET') {
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todolist,
        }));
        res.end();
    } else if (req.url == '/todos' && req.method == "POST") {
        req.on('end', () => {
            try {
                const title = JSON.parse(body).title;
                if (title != undefined) {
                    res.writeHead(200, headers);
                    todolist.push({ title, "id": uuidv4() });
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todolist,
                    }));
                    res.end();
                } else {
                    errorHandler(res);
                }
            } catch {
                errorHandler(res);
            }
        });
    } else if (req.url == '/todos' && req.method == "DELETE") {
        todolist.length = 0;
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todolist,
        }));
        res.end();
    }
    else if (req.url.startsWith('/todos/') && req.method == "DELETE") {
        const delId = req.url.split('/').pop();
        const index = todolist.findIndex((item) => item.id == delId);
        if (index != -1) {
            res.writeHead(200, headers);
            todolist.splice(index, 1);
            res.write(JSON.stringify({
                "status": "success",
                "data": todolist,
            }));
            res.end();
        } else {
            errorHandler(res);
        }
    } else if (req.url.startsWith('/todos/') && req.method == "PATCH") {
        req.on('end', () => {
            try {
                const title = JSON.parse(body).title;
                const patchId = req.url.split('/').pop();
                const index = todolist.findIndex((item) => item.id == patchId);
                if (title != undefined && index != -1) {
                    res.writeHead(200, headers);
                    todolist[index].title = title;
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todolist,
                    }));
                    res.end();
                } else {
                    errorHandler(res);
                }
            } catch {
                errorHandler(res);
            }
        });
    }
    else if (req.method == 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
    }
    else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "failure",
            "message": "Router Error."
        }));
        res.end();
    }
}

const server = http.createServer(reqListener);

server.listen(process.env.PORT || 9527);