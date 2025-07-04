#!/usr/bin/env python3
import psutil
import time
from datetime import datetime

def monitor_system():
    while True:
        try:
            cpu = psutil.cpu_percent(interval=1)
            mem = psutil.virtual_memory().used / (1024 * 1024)
            total_mem = psutil.virtual_memory().total / (1024 * 1024)
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log_path = "/app/app/monitoring.log"
            with open(log_path, "a") as f:
                f.write(f"[{timestamp}] SYSTEM CPU: {cpu:.2f}% | RAM: {mem:.2f} MB / {total_mem:.2f} MB\n")
        except Exception:
            pass
        time.sleep(5)

if __name__ == "__main__":
    monitor_system() 
