# Deployment

## Setup

First copy the files in the `bin` directory to a path in the `PATH` environment variable.

Then, copy the `systemd` directory to the systemd config path for the user that the server will be running as (for example, `/home/$(whoami)/.config/systemd/user`).

## Install

As the user that you installed the systemd units as, run

```
$ systemctl --user enable --now tabula-rasa-update.timer
$ systemctl --user enable --now tabula-rasa-flask.service
$ systemctl --user enable --now tabula-rasa-npm.service # This is currently broken
```

While the `tabula-rasa-npm.service` is broken, you _must_ run `npm install && npm run start` in the tabula-rasa `front-end/viewer` directory.
