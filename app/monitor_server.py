#!/usr/bin/env python3
import psutil
import time
import os
from datetime import datetime

def monitor_server():
    process = psutil.Process(os.getpid())
    process.cpu_percent()
    while True:
        try:
            cpu = process.cpu_percent()
            mem = process.memory_info().rss / (1024 * 1024)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_path = "/app/app/monitoring.log"
            with open(log_path, "a") as f:
                f.write(f"[{timestamp}] SERVER CPU: {cpu:.2f}% | RAM: {mem:.2f} MB\n")
        except Exception:
            pass
        time.sleep(5)

if __name__ == "__main__":
    monitor_server() 
