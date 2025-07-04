DOCKER_COMPOSE_SERVER = docker-compose -f docker-compose.server.yaml
DOCKER_COMPOSE_CLIENT = docker-compose -f docker-compose.client.yaml
FLASK_CONTAINER = server

.PHONY: follow-all-logs follow-backend restart-backend run-client rebuild-client stop-all generate-server-report

follow-all-logs:
	@echo "Following all container logs (Ctrl+C to stop):"
	@echo "Server logs:"
	docker logs -f $(FLASK_CONTAINER) &
	@echo "Worker logs:"
	docker logs -f worker &
	@echo "Client logs:"
	docker logs -f client &
	wait

follow-backend:
	@echo "Following backend logs only (Ctrl+C to stop):"
	@echo "Server logs:"
	docker logs -f $(FLASK_CONTAINER) &
	@echo "Worker logs:"
	docker logs -f worker &
	wait

follow-client:
	@echo "Following client logs only (Ctrl+C to stop):"
	docker logs -f client &
	wait

restart-backend:
	@echo "Restarting full backend with database clear and results cleanup..."
	$(DOCKER_COMPOSE_SERVER) down -v
	$(DOCKER_COMPOSE_CLIENT) down
	docker rm -f client || true
	@echo "Clearing app/results folder..."
	rm -rf app/results/*
	@echo "✅ Results folder cleared!"
	@echo "Clearing monitoring log..."
	rm -f monitoring.log
	@echo "✅ Monitoring log cleared!"
	@echo "Clearing server reports..."
	rm -rf client/server_reports/*
	@echo "✅ Server reports cleared!"
	@echo "Clearing image reconstruction reports..."
	rm -rf client/image_reports/*
	@echo "✅ Image reconstruction reports cleared!"
	$(DOCKER_COMPOSE_SERVER) up -d
	@echo "Waiting for server to be ready..."
	sleep 15
	@echo "Creating database tables..."
	docker exec $(FLASK_CONTAINER) python -c "from app import create_app; from app.database import db; app = create_app(); app.app_context().push(); db.create_all(); print('Database cleared and tables recreated successfully!')"
	@echo "✅ Backend restarted, database cleared, and all reports cleaned!"
	make follow-backend

run-client:
	@echo "Starting client..."
	docker rm -f client || true
	$(DOCKER_COMPOSE_CLIENT) up -d
	@echo "✅ Client started!"
	make follow-client

rebuild-client:
	@echo "🔨 Rebuilding client container..."
	$(DOCKER_COMPOSE_CLIENT) down
	docker rm -f client || true
	docker rmi dis-app-server_client || true
	@echo "Building client with no cache..."
	$(DOCKER_COMPOSE_CLIENT) build --no-cache
	@echo "Starting rebuilt client..."

generate-report:
	@echo "📄 Generating PDF report..."
	@echo "Installing dependencies..."
	docker run --rm -v $(PWD)/client:/app -w /app node:18 npm install
	@echo "Generating report..."
	docker run --rm -v $(PWD)/client:/app -w /app --network host -e SERVER_URL=http://localhost:8080 node:18 npm run generate-report
	@echo "✅ PDF report generated in client/image_reports/"

generate-report-container:
	@echo "📄 Generating PDF report using existing client container..."
	@echo "Installing dependencies..."
	docker exec client npm install
	@echo "Generating report..."
	docker exec client npm run generate-report
	@echo "✅ PDF report generated in client/image_reports/"

stop-all:
	@echo "🛑 Stopping all containers..."
	$(DOCKER_COMPOSE_SERVER) down
	$(DOCKER_COMPOSE_CLIENT) down
	docker rm -f client || true
	@echo "✅ All containers stopped!"

generate-server-report:
	@echo "📊 Generating server usage report and PDF..."
	docker run --rm -v $(PWD)/client:/app -w /app --network host -e SERVER_URL=http://localhost:8080 node:18 node src/serverReport.js
