#!/bin/bash
MSYS_NO_PATHCONV=1 docker run -it --rm -p 5432:5432 -v %cd%/data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=easyqyuiz -e POSTGRES_DB=easyqyuiz -e POSTGRES_USER=easyqyuiz postgres:12