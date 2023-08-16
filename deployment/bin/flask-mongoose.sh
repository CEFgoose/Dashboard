#!/usr/bin/env bash
cd ${HOME}/tabula-rasa/backend
source venv/bin/activate
pip install -r requirements.txt
flask run
