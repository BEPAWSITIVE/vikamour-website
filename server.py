"""
VIKAMOUR Atelier - Secure Local Web Server
Runs a hardened, lightweight Python HTTP server to preview the Vikamour e-commerce website.
Includes defenses against path traversal, hidden file leakage (.git, .env),
directory listing exposure, unauthorized HTTP methods, and missing security headers.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import urllib.parse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Blocked file patterns and sensitive file targets
BLOCKED_PATTERNS = {'.git', '.env', '.gitignore', '.github', '.ds_store', 'web.config'}

class SecureHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def is_blocked_path(self, path: str) -> bool:
        """Check if request targets sensitive/hidden files or parent directory escape."""
        clean_path = urllib.parse.unquote(path).replace('\\', '/').lower()
        parts = [p for p in clean_path.split('/') if p]
        for part in parts:
            # Block any hidden file or directory or traversal token starting with '.' (e.g. .git, .env, .., .)
            if part.startswith('.'):
                return True
            if part in BLOCKED_PATTERNS:
                return True
        return False

    def do_GET(self):
        if self.is_blocked_path(self.path):
            self.send_error(404, "File not found")
            return
        super().do_GET()

    def do_HEAD(self):
        if self.is_blocked_path(self.path):
            self.send_error(404, "File not found")
            return
        super().do_HEAD()

    def do_POST(self):
        self.send_error(405, "Method Not Allowed")

    def do_PUT(self):
        self.send_error(405, "Method Not Allowed")

    def do_DELETE(self):
        self.send_error(405, "Method Not Allowed")

    def do_OPTIONS(self):
        self.send_error(405, "Method Not Allowed")

    def list_directory(self, path):
        """Prevent directory browsing/indexing - return 404 for security."""
        self.send_error(404, "File not found")
        return None

    def end_headers(self):
        # Security Hardening Headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()')
        self.send_header(
            'Content-Security-Policy',
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https://images.unsplash.com https://*.supabase.co; "
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com; "
            "frame-ancestors 'self'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run_server():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), SecureHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print(f"  VIKAMOUR Atelier Secure Server is live at:")
        print(f"  --> {url}")
        print("=" * 60)
        print("Press Ctrl+C to terminate the server.\n")
        
        # Open in browser automatically if flag passed or standard run
        if "--open" in sys.argv:
            webbrowser.open(url)
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")
            httpd.server_close()

if __name__ == "__main__":
    run_server()
