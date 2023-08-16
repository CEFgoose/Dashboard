#!/usr/bin/env sh
set -ex

function variables() {
	# This must be set to 0 when not testing a "new" setup
	DEBUG=0

	DATABASE_DIR="$(pwd)/test_db"
	POSTGRES_DB="devel_tabularasa"
	POSTGRES_USER="devel_tabularasa"
	#TODO change the password
	POSTGRES_PASSWORD="tabularasa"
	POSTGRES_ENDPOINT="localhost"
	POSTGRES_PORT=5000
    if [ -f "tabula-rasa.env" ]; then
	    source tabula-rasa.env
       fi
}

function check_dependencies() {
	if [ ! -f "$(which brew)" ]; then
		echo "We need brew ( go to https://brew.sh/ to get it )"
	fi
	echo "We are now installing python (with pip), postgres, postgis, and geos from homebrew"
	brew install python postgres postgis geos || echo "We couldn't install all the dependencies. Issues may occur."
}

function database_setup() {
	export PGDATA="${DATABASE_DIR}"
	# IMPORTANT TODO REMOVE
	if [ -d "${PGDATA}" ] && [ ${DEBUG} -gt 0 ]; then
		rm -rf "${PGDATA}"
	fi

	if [ ! -d "${PGDATA}" ]; then
		mkdir -p "${PGDATA}"
		initdb "${PGDATA}"
		pg_ctl -D "${PGDATA}" -l logfile start
		createdb "${POSTGRES_DB}"
		createdb "$(whoami)"
		local commands=("CREATE USER \"${POSTGRES_USER}\" PASSWORD '${POSTGRES_PASSWORD}';"
				"CREATE DATABASE \"${POSTGRES_DB}\" OWNER \"${POSTGRES_USER}\";"
				"\\c \"${POSTGRES_DB}\";"
				"CREATE EXTENSION postgis;")
		for command in "${commands[@]}"; do
			psql --dbname="${POSTGRES_DB}" --command="${command}" || echo "${command} didn't work"
		done
		export tabula-rasa_DB="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_ENDPOINT}/${POSTGRES_DB}"
	else
		pg_ctl -D "${PGDATA}" -l logfile start
		export tabula-rasa_DB="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_ENDPOINT}/${POSTGRES_DB}"
	fi
	setup_python
	flask db upgrade
	#python3 manage.py db upgrade
}

function database_shutdown() {
	pg_ctl -D "${PGDATA}" stop -s -m fast
}

function setup_python() {
	local VENV="./venv"
	if [ -d "${VENV}" ] && [ ${DEBUG} -gt 1 ]; then
		rm -rf "${VENV}"
	fi
	if [ ! -d "${VENV}" ]; then
		python3 -m venv "${VENV}"
		. "${VENV}/bin/activate"
		pip install -r requirements.txt
	else
		. "${VENV}/bin/activate"
	fi
}

function start_server() {
	setup_python
	FLASK_ENV=development flask run
	#python3 manage.py runserver -d -r
}

function main() {
	trap "database_shutdown; jobs -p | xargs kill -QUIT" EXIT SIGTERM
	variables
	check_dependencies
	database_setup
	start_server
}
main $@

