# Variables
DOCKER_COMPOSE_SERVER = docker-compose -f docker-compose.server.yaml
DOCKER_COMPOSE_CLIENT = docker-compose -f docker-compose.client.yaml
FLASK_CONTAINER = server
FLASK = docker exec -it $(FLASK_CONTAINER) flask

# Docker Commands
.PHONY: server-up client-up server-down client-down clean logs server-logs client-logs rebuild
server-up:
	$(DOCKER_COMPOSE_SERVER) up

client-up:
	$(DOCKER_COMPOSE_CLIENT) up

server-down:
	$(DOCKER_COMPOSE_SERVER) down
	$(DOCKER_COMPOSE_CLIENT) down

client-down:
	$(DOCKER_COMPOSE_CLIENT) down

clean:
	$(DOCKER_COMPOSE_SERVER) down -v --rmi all --remove-orphans
	$(DOCKER_COMPOSE_CLIENT) down -v --rmi all --remove-orphans

logs:
	$(DOCKER_COMPOSE_SERVER) logs -f
	$(DOCKER_COMPOSE_CLIENT) logs -f

server-logs:
	docker logs $(FLASK_CONTAINER)

client-logs:
	docker logs client

rebuild:
	$(DOCKER_COMPOSE_SERVER) down
	$(DOCKER_COMPOSE_CLIENT) down
	$(DOCKER_COMPOSE_SERVER) build --no-cache
	$(DOCKER_COMPOSE_CLIENT) build --no-cache
	$(DOCKER_COMPOSE_SERVER) up
	$(DOCKER_COMPOSE_CLIENT) up -d

rebuild-server:
	$(DOCKER_COMPOSE_SERVER) down server
	$(DOCKER_COMPOSE_SERVER) build server
	$(DOCKER_COMPOSE_SERVER) up server 

# Database Management
.PHONY: db-init db-migrate db-upgrade db-downgrade db-reset
db-init:
	$(FLASK) db init

db-migrate:
	$(FLASK) db migrate -m "Migration"

db-upgrade:
	$(FLASK) db upgrade

db-downgrade:
	$(FLASK) db downgrade

db-reset:
	$(FLASK) db downgrade
	$(FLASK) db upgrade
