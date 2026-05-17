"""
scheduler.py — Runs the full pipeline on a configurable interval.

Usage:
    python scheduler.py              # runs every POLL_INTERVAL_HOURS hours
    python scheduler.py --once       # single run, then exit
"""
import sys
import time
import logging
import schedule
import argparse
import threading
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

import config
from config import setup_logging

logger = setup_logging("scheduler")


class DummyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"OK")
        
def start_dummy_server():
    port = int(os.environ.get("PORT", 10000))
    server = HTTPServer(("0.0.0.0", port), DummyHandler)
    logger.info(f"Started dummy HTTP server on port {port} to satisfy Render health checks")
    server.serve_forever()


def run_pipeline() -> None:
    """Import and execute the main pipeline."""
    # Import here so logging is already configured
    from main import run_once
    run_once()


def main() -> None:
    parser = argparse.ArgumentParser(description="AI Job Tracker Scheduler")
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run once immediately and exit (no scheduling loop)",
    )
    args = parser.parse_args()

    if args.once:
        logger.info("Running pipeline once…")
        run_pipeline()
        logger.info("Done.")
        return

    # Start dummy web server in a background thread
    threading.Thread(target=start_dummy_server, daemon=True).start()

    hours = config.POLL_INTERVAL_HOURS
    logger.info("Scheduler started — will run every %.1f hour(s).", hours)

    # Run immediately on startup, then on schedule
    run_pipeline()
    schedule.every(hours).hours.do(run_pipeline)

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()
