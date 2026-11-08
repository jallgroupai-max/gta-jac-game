import http.server, socketserver, os, sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "site"))
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("", 8000), H) as s:
    print("Sirviendo http://localhost:8000/ (sin caché)"); s.serve_forever()
