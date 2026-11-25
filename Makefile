build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down -v

dev:
	cd web && npm run dev

test:
	cd web && npm test
