build:
	@npm install

clean:
	@rm -rf node_modules bower_components dist
	
.PHONY: build clean