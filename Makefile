.DEFAULT_GOAL := all

# Переменные окружения
include make/variables.mk

all: deps release

deps:
	@PHANTOMJS_CDNURL="http://download.cdn.yandex.net/phantomjs" $(NPM) --registry http://npm.yandex-team.ru/ install

release: deps
	@$(NODE) $(YMB) build builder/ -m release

debug: deps
	@$(NODE) $(YMB) build builder/

YMB_PID_FILE=.ymb.pid
YMS_PID_FILE=.yms.pid

dev.builder: dev.builder.stop
	$(NODE) $(YMB) watch builder/ &> ymb.log & \
		echo $$! > $(YMB_PID_FILE)

dev.builder.stop:
	cat $(YMB_PID_FILE) 2> /dev/null | xargs -r kill || true
	rm -f $(YMB_PID_FILE)

dev.server: dev.server.stop
	CLUSTER_WORKERS=1 $(NODE) $(YMS) server server/ --development &> yms.log & \
		echo $$! > $(YMS_PID_FILE)

dev.server.stop:
	cat $(YMS_PID_FILE) 2> /dev/null | xargs -r kill || true
	rm -f $(YMS_PID_FILE)

dev: dev.builder dev.server
dev.stop: dev.builder.stop dev.server.stop

.PHONY: all deps release debug dev dev.stop

#
# Установка окружения и его настройка API.
#
api.enterprise.alias:
	cd .. && ln -s jsapi ~/www/enterprise

.PHONY: api.enterprise.alias

#
# Базовая сборка API
#
package: release

build.clean:
	@$(NODE) $(YMB) clean builder/

clean: build.clean

.PHONY: package build.clean clean

#
# Документация и локализация
#
documentation:
	node tools/mapOptionMaker/map-option-maker.js -i lib/jsmap

localization:
	node tools/localizator/localizator.js tanker-api.tools.yandex.net 3000

.PHONY: documentation localization

#
# Работа с debian пакетами.
#
+major: release_type = major
+major: update_debian_changelog

+minor: release_type = minor
+minor: update_debian_changelog

+patch: release_type = patch
+patch: update_debian_changelog

+build: release_type = build
+build: udpate_debian_changelog

update_debian_changelog:
	$(NODE) tools/debian/updateChangelog.js $(release_type)

ui:
	# Очистка предыдущих результатов
	rm -rf ui/build/layouts/*
	rm -rf ui/build/css/*
	# Сборка
	make bevis
	make ui.clean

bevis:
	cd ui/src/bevis && make clean && node copyfiles.js && make build

ui.clean:
	# Выпиливаем служебный мусор
	rm -f ui/build/css/common.* ui/build/css/fragments.*
	rm -f ui/build/layouts/*/*.js ui/build/layouts/*/*.tmp ui/build/layouts/*/*.yaml ui/build/layouts/*/*.css

#
# Установка компонентов сборщиков вёрстки
#
ui.install:
	cd ui/src/bevis/ && make npm;

.PHONY: ui ui.clean ui.install

# Собирает debian пакет на основе последней версии из debian/changelog.
deb: api_version = $(shell dpkg-parsechangelog | sed -n 's/^Version: //p' | sed -e 's/-.*$///')
deb:
	# Генерируем файлы в каталоге debian: подставляем версию апи в файлах debian/*.in
	for file in `echo debian/*.in`; do \
		sed -e 's/{{API_VERSION}}/$(api_version)/g' "$$file" > $${file%.*} ; \
	done
	API_VERSION=$(api_version) debuild -b
