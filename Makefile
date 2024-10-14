install:
	python3 -m venv venv; \
	source ./venv/bin/activate; \
    pip install -r requirements.txt; \
	npm install;

run:
	set -e; \
	source ./venv/bin/activate; \
	python3 main.py & python_pid=$$!; \
	trap 'kill -TERM $$python_pid' EXIT; \
	echo "Waiting for server to start..."; \
	while ! nc -z localhost 3001; do \
	    sleep 1; \
	done; \
	node index.js; \
	kill -TERM $$python_pid