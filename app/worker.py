import redis
from rq import Queue, Worker
import logging
import sys

from app.tasks import rebuild_image

redis_conn = redis.Redis(host="redis", port=6379)
task_queue = Queue(connection=redis_conn)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    stream=sys.stdout
)

if __name__ == '__main__':
    worker = Worker(['default'], connection=redis_conn)
    worker.work()
