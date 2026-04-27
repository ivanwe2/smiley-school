# Smiley School — Makefile
# Usage: make <target>
# Requires bash (Git for Windows provides it at /usr/bin/bash)

SHELL := bash
.SHELLFLAGS := -euo pipefail -c

.DEFAULT_GOAL := help
.PHONY: help install dev build start lint typecheck \
        db-up db-down db-reset db-migrate db-generate db-seed db-studio \
        docker-dev docker-dev-down docker-prod docker-prod-down \
        setup

# ── Colors ────────────────────────────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

# ── Help ──────────────────────────────────────────────────────────────────────

help: ## Show this help message
	@echo ""
	@echo "  Smiley School"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(CYAN)%-20s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# ── App ───────────────────────────────────────────────────────────────────────

install: ## Install dependencies
	npm install

dev: ## Start Next.js dev server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm run start

lint: ## Run ESLint
	npm run lint

typecheck: ## Run TypeScript type checking
	npx tsc --noEmit

# ── Database (local Docker Postgres) ─────────────────────────────────────────
# These targets always target the local Docker Postgres on localhost:5432,
# overriding any production DATABASE_URL that may be set in .env.local.

LOCAL_DB_URL := postgresql://smiley:smiley_dev@localhost:5432/smiley_school

# cross-env works on Windows cmd.exe, PowerShell, and bash
CROSS_ENV := npx cross-env DATABASE_URL="$(LOCAL_DB_URL)" DIRECT_URL="$(LOCAL_DB_URL)"

db-up: ## Start only the Postgres container
	docker compose up db -d

db-down: ## Stop the Postgres container
	docker compose down

db-migrate: ## Create and apply a new migration (usage: make db-migrate name=my_change)
	$(CROSS_ENV) npx prisma migrate dev --name $(or $(name),migration)

db-generate: ## Regenerate the Prisma client
	$(CROSS_ENV) npx prisma generate

db-seed: ## Seed the local Docker database
	$(CROSS_ENV) npx prisma db seed

db-studio: ## Open Prisma Studio against the local Docker database
	$(CROSS_ENV) npx prisma studio

db-reset: ## Drop, recreate and re-seed the local Docker database (destructive!)
	@echo "WARNING: This will delete all local data. Press Ctrl+C to cancel, Enter to continue."
	@read _
	$(CROSS_ENV) npx prisma migrate reset --force

# ── Setup (first-time) ────────────────────────────────────────────────────────

setup: install db-up ## First-time setup: install, start Postgres, migrate, generate, seed
	@echo "Waiting for Postgres to be ready..."
	@sleep 3
	$(CROSS_ENV) npx prisma migrate dev --name init
	$(CROSS_ENV) npx prisma generate
	$(CROSS_ENV) npx prisma db seed
	@echo ""
	@echo "  Ready. Run 'make docker-dev' to start the full stack."
	@echo ""

# ── Docker — dev ──────────────────────────────────────────────────────────────

docker-dev: ## Start full dev stack (Next.js + Postgres) via Docker
	docker compose up --build

docker-dev-down: ## Stop dev Docker stack
	docker compose down

# ── Docker — production ───────────────────────────────────────────────────────

docker-prod: ## Start production stack (Next.js + Postgres + Nginx)
	docker compose -f docker-compose.prod.yml up -d --build

docker-prod-down: ## Stop production Docker stack
	docker compose -f docker-compose.prod.yml down
