# Makefile for nodejs-backend-20260321
# Common development tasks

.PHONY: help install dev test lint docker-build docker-run clean

help:
	@echo "Available commands:"
	@echo "  make install        - Install dependencies"
	@echo "  make dev            - Run development server"
	@echo "  make test           - Run tests"
	@echo "  make lint           - Run linting"
	@echo "  make docker-build   - Build Docker image"
	@echo "  make docker-run     - Run Docker container"
	@echo "  make clean          - Clean temporary files"

install:
	npm install

dev:
	npm run dev

test:
	npm test

lint:
	npm run lint || npx eslint . --fix

docker-build:
	docker build -t alexkore12/nodejs-backend:latest .

docker-run:
	docker run -p 3000:3000 alexkore12/nodejs-backend:latest

clean:
	rm -rf node_modules/
	rm -rf .coverage
	rm -rf coverage/
	find . -name "*.log" -delete
