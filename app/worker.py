import redis
from rq import Queue, Worker
import logging
import sys

# Connect to Redis using the service name from docker-compose.yml
redis_conn = redis.Redis(host="redis", port=6379)
task_queue = Queue(connection=redis_conn)

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    stream=sys.stdout  # Ensure logs go to stdout
)

# Start the worker with logging
if __name__ == '__main__':
    worker = Worker(['default'], connection=redis_conn)
    worker.work()
