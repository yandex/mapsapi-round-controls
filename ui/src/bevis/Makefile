# On development servers we have to use versioned node and a unix-socket.
# Otherwise (for local development) we use the /usr/bin/node and a web-socket (localhost:<port>).
# Bellow you can see this detection.
SERVER_NODE := /opt/nodejs/0.10/bin/node
SERVER_NPM := /opt/nodejs/0.10/bin/npm
LOCAL_NODE := node
LOCAL_NPM := npm

NODE := $(firstword $(shell which $(SERVER_NODE) $(LOCAL_NODE)))
NPM := $(firstword $(shell which $(SERVER_NPM) $(LOCAL_NPM)))

# if server node isn't found then specify PORT for local development
PORT ?= 8081

NODE_MODULES_BIN := node_modules/.bin
ENB := $(NODE_MODULES_BIN)/enb

all: install validate build

# Dependencies
install: npm

# Install npm modules
npm:
	@$(NPM) install --registry http://npm.yandex-team.ru/

# Production npm prune
npm-prune:
	@$(NPM) prune --production

# Build project
build:
	$(ENB) $(ENB_FLAGS) make
	cp -R build/api/layouts/* ../../build/layouts/
	cp -R build/api/fragments/* ../../build/css/

# Clean build results
clean:
	$(ENB) $(ENB_FLAGS) make clean

# Validation
validate: lint test

# Lint js files
lint:
	@$(NODE_MODULES_BIN)/jshint-groups
	@$(NODE_MODULES_BIN)/jscs .
	@$(NODE_MODULES_BIN)/analyze report -r errors -v return-type=-getBlockName:param-type

# Run application in development mode
dev: install
	@PORT=$(PORT) $(NODE_MODULES_BIN)/supervisor -x $(NODE) -w server,configs -- server/boot.js $(USER)

.PHONY: all install npm npm-prune build clean validate lint dev
