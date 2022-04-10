const http = require('http')
const { v4: uuidv4 } = require('uuid');
const errorHandler = require('./errorHandler')

const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
}

const todos = []

const requestListener = (request, res) => {

    let body = ''
    request.on('data', chunk => {
        body += chunk
    })

    // todos: GET
    if (request.url === "/todos" && request.method === "GET") {
        res.writeHead(200, headers)
        res.write(JSON.stringify({
            status: 'success',
            data: todos
        }))
        res.end()
    } else if (request.url === "/todos" && request.method === "POST") {
        // todos: POST
        request.on('end', () => {
            try {
                const {title} = JSON.parse(body)
                if (title) {
                    const todo = {
                        title,
                        uuid: uuidv4()
                    }
                    todos.push(todo)
                    res.writeHead(200, headers)
                    res.write(JSON.stringify({
                        status: 'success',
                        data: todos
                    }))
                    res.end()
                } else {
                    errorHandler(res, "title欄位未填寫正確，或無此 todo id")
                }
            } catch (err) {
                errorHandler(res, "新增失敗")
            }
        })
    } else if (request.url === "/todos" && request.method === "DELETE") {
        // todos: DELETE ALL
        todos.length = 0
        res.writeHead(200, headers)
        res.write(JSON.stringify({
            status: 'success',
            data: todos
        }))
        res.end()
    } else if (request.url.startsWith("/todos/") && request.method === "DELETE") {
        // todos: DELETE One
        const id = request.url.split("/").pop()
        const index = todos.findIndex(element => element.uuid === id)
        if (index !== -1) {
            todos.splice(index, 1)
            res.writeHead(200, headers)
            res.write(JSON.stringify({
                status: 'success',
                data: todos
            }))
            res.end()
        } else {
            errorHandler(res, "找不到對應的UUID")
        }
    } else if (request.url.startsWith("/todos/") && request.method === "PATCH") {
        // todos: PATCH One
        request.on('end', () => {
            try {
                const { title } = JSON.parse(body)
                const id = request.url.split("/").pop()
                const index = todos.findIndex(element => element.uuid === id)
                if (title && index !== -1) {
                    todos[index].title = title
                    res.writeHead(200, headers)
                    res.write(JSON.stringify({
                        status: 'success',
                        data: todos
                    }))
                    res.end()
                } else {
                    errorHandler(res, "找不到對應的UUID")
                }
            } catch (err) {
                errorHandler(res, "修改失敗")
            }
        })
    }else if (request.method === "OPTIONS") {
        // todos: OPTIONS
        res.writeHead(200, headers)
        res.end()
    } else {
        res.writeHead(404, headers)
        res.write(JSON.stringify({
            status: 'error',
            message: '無此路由'
        }))
        res.end()
    }

}

const server = http.createServer(requestListener)
server.listen(process.env.PORT || 8080)
