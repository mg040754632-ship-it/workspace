#!/usr/bin/env python3
"""本地静态服务器：带正确 MIME，支持 ES Module 与 Service Worker。
用法：python3 serve.py [port]
默认端口 8080。
"""
import http.server
import socketserver
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = os.path.dirname(os.path.abspath(__file__))

MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def guess_type(self, path):
        ext = os.path.splitext(path)[1].lower()
        return MIME.get(ext, super().guess_type(path))

    def end_headers(self):
        # 允许 service worker 作用域与跨域模块
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
        print(f'穿搭工作台已启动 -> http://localhost:{PORT}/')
        print(f'真机访问（同一 WiFi）： http://<本机IP>:{PORT}/')
        print('手机浏览器打开后，点「分享 / 添加到主屏」即可安装。Ctrl+C 停止。')
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\n已停止。')
