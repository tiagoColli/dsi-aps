# DSI APS - Distributed Image Server & Monitoring

This project is a distributed system for image reconstruction and server monitoring, built with Python (Flask, RQ, PostgreSQL, Redis) and Node.js for the client/reporting. It supports:
- Asynchronous image reconstruction jobs
- System resource monitoring (CPU/RAM)
- Automatic PDF report generation for both image and server usage
- Dockerized deployment for easy setup

## How it Works
- **Backend**: Flask API with RQ worker for background image reconstruction jobs. Monitors system usage and logs to a file.
- **Client**: Node.js scripts to simulate users, send signals, and generate PDF reports (image and server usage).
- **Reports**: PDF reports are generated for both image reconstructions and server usage, saved in `client/image_reports/` and `client/server_reports/`.
- **Database**: PostgreSQL for persistent storage. Redis for job queue.

## Main Makefile Commands

### Restart Backend (cleans everything)
```sh
make restart-backend
```
- Stops all containers
- Cleans database, results, monitoring log, and all reports
- Restarts backend services and waits for readiness

### Rebuild Client
```sh
make rebuild-client
```
- Rebuilds the client Docker image from scratch

### Run Client
```sh
make run-client
```
- Starts the client container and follows its logs

### Generate All Reports
#### Image Reconstruction Report (PDF)
```sh
make generate-report
```
- Generates a PDF report of all reconstructed images in `client/image_reports/`

#### Server Usage Report (PDF)
```sh
make generate-server-report
```
- Generates a PDF report of server CPU/RAM usage in `client/server_reports/`

## Git Tips
- To commit changes:
  ```sh
  git add .
  git commit -m "your message"
  git push
  ```
- Large files (like model CSVs) are kept locally and ignored by git.

## Project Structure
- `app/` - Python backend (Flask, RQ, monitoring, models)
- `client/` - Node.js client and reporting scripts
- `docker-compose.server.yaml` - Backend services
- `docker-compose.client.yaml` - Client service
- `Makefile` - Main automation commands

## Repository
[https://github.com/tiagoColli/dsi-aps](https://github.com/tiagoColli/dsi-aps) 
