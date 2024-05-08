build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down -v

test:
	docker compose run --rm app python -m pytest
