const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// 设置端口
const port = process.env.PORT || 8531;

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 设置CORS头部
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }
    
    // 解析URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 处理表单提交
    if (req.method === 'POST' && pathname === '/submit-survey') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const formData = JSON.parse(body);
                console.log('提交的调查问卷数据:', formData);
                
                // 模拟延迟处理
                setTimeout(() => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: '表单提交成功' }));
                }, 1000);
            } catch (error) {
                console.error('处理表单数据时出错:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: '表单数据无效' }));
            }
        });
        
        return;
    }
    
    // 处理GET请求
    if (req.method === 'GET') {
        // 如果路径是根目录，默认提供index.html
        if (pathname === '/') {
            pathname = '/index.html';
        }
        
        // 获取文件的完整路径
        const filePath = path.join(__dirname, pathname);
        
        // 获取文件扩展名
        const extname = String(path.extname(filePath)).toLowerCase();
        
        // 获取内容类型
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        // 读取文件
        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    // 文件不存在
                    console.error(`文件不存在: ${filePath}`);
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 Not Found</h1><p>The requested resource was not found on this server.</p>');
                } else {
                    // 服务器错误
                    console.error(`服务器错误: ${error.code}`);
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<h1>500 Internal Server Error</h1><p>Sorry, there was a problem processing your request.</p>');
                }
            } else {
                // 成功返回文件内容
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

// 启动服务器
server.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}/`);
    console.log(`您可以在浏览器中访问上述地址查看问卷`);
}); 