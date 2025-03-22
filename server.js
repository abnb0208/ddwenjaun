const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 定义MIME类型
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 设置CORS头，允许跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求（预检请求）
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 解析URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // 默认加载index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // 提交表单的处理逻辑
    if (req.method === 'POST' && pathname === '/submit') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            console.log('表单提交数据:', body);
            
            let responseData;
            
            try {
                // 尝试解析JSON数据
                const formData = JSON.parse(body);
                
                // 在实际应用中，这里会处理表单数据并存储到数据库
                // 这里我们简单模拟一个处理延迟
                setTimeout(() => {
                    // 返回成功消息
                    responseData = {
                        success: true,
                        message: '问卷提交成功！感谢您的参与！',
                        data: formData
                    };
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(responseData));
                }, 1000); // 1秒延迟模拟服务器处理时间
            } catch (error) {
                console.error('解析JSON失败:', error);
                
                // 返回错误消息
                responseData = {
                    success: false,
                    message: '数据格式错误，请重试'
                };
                
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(responseData));
            }
        });
        
        return;
    }

    // 获取绝对路径
    const filePath = path.join(__dirname, pathname);
    
    // 获取文件扩展名
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // 读取文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 文件不存在，返回404
                console.error(`文件不存在: ${filePath}`);
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                // 服务器错误
                console.error(`服务器错误: ${error.code}`);
                res.writeHead(500);
                res.end('500 Internal Server Error');
            }
        } else {
            // 成功返回文件内容
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// 监听3000端口
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}/`);
    console.log(`您可以在浏览器中访问上述地址查看问卷`);
}); 