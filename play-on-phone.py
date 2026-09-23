#!/usr/bin/env python3
"""Last $100 - play on your phone.
Double-click PLAY-ON-PHONE.bat (Windows) or play-on-phone.command (Mac),
or run:  python3 play-on-phone.py
Then open the printed address on a phone connected to the SAME Wi-Fi."""
import http.server, socket, socketserver, os, sys, webbrowser, functools

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8100

def lan_ips():
    ips = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(("10.255.255.255", 1)); ips.add(s.getsockname()[0]); s.close()
    except Exception: pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET): ips.add(info[4][0])
    except Exception: pass
    return sorted(i for i in ips if not i.startswith("127."))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache"); super().end_headers()

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True; allow_reuse_address = True

def main():
    port = PORT
    for _ in range(20):
        try:
            httpd = Server(("0.0.0.0", port), functools.partial(Handler, directory=ROOT)); break
        except OSError: port += 1
    else:
        print("No free port found."); input("Press Enter to exit"); return
    print("=" * 58)
    print("  Last $100: Swipe to Rich  -  phone server is RUNNING")
    print("=" * 58)
    print("  On this computer :  http://localhost:%d/" % port)
    for ip in lan_ips():
        print("  On your PHONE    :  http://%s:%d/" % (ip, port))
    print("-" * 58)
    print("  1. Phone and computer must be on the SAME Wi-Fi.")
    print("  2. Type the PHONE address into the phone browser.")
    print("  3. If it will not load, allow Python through the")
    print("     firewall (Windows asks the first time: tick Private).")
    print("  Close this window to stop the server.")
    print("=" * 58)
    try: webbrowser.open("http://localhost:%d/" % port)
    except Exception: pass
    try: httpd.serve_forever()
    except KeyboardInterrupt: pass

if __name__ == "__main__":
    main()
