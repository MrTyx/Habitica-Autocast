# ![Magic Wand](https://github.com/MrTyx/Habitica-MagicWand/raw/master/source/images/icon32.png "Magic Wand") Habitica Magic Wand

A collection of tools for Habitica to allow a power-user to get more out of the website.

## Installation
### Chrome Web Store
Navigate to the Chrome Web Store and search for "Habitica Magic Wand" (or [click here](https://chrome.google.com/webstore/search/Habitica%20Magic%20Wand))
### Local Copy
```
git clone https://github.com/MrTyx/Habitica-MagicWand
cd Habitica-MagicWand
npm install
npm run build
```
1. Open Chrome, navigate to More Tools > Extensions (or [click here](chrome://extensions/)).
2. Check "Developer Mode" in the top right.
3. Click "Load Unpacked Extension", navigate to where you downloaded Habitica-MagicWand to, and choose the build folder.

## NPM Run

* **build**

  `npm-run-all build:copy build:pug build:app build:popup build:content `

  - **prebuild**

    `rimraf build/*`

    *Clean the build directory (probably unnecessary but good practice)*

  - **build:copy**

    `copyfiles --up 1 source/manifest.json source/images/* source/assets/* source/install.js build`

    *Take the listed files, remove the top relative path (eg source/images/whatever.jpg -> images/whatever.jpg), and then copy to the build folder*

  - **build:pug**

    `pug source/*.pug --out build/`

    *Compile any of the pug files in source, output the contents to build directory*

  - **build:app**

    `cross-env NODE_ENV=production browserify --global-transform=envify --transform babelify source/app.js | uglifyjs --compress warnings=false --mangle > build/app.min.js`

    *Set the NODE_ENV to production so Vue will compile in production mode. Feed our app.js into browserify. In browserify, set envify as a global transform module and babelify as a transform module. Envify will transform all the 'if NODE_ENV === ?' blocks in Vue. This transformed code is feed into uglify to produce a minified app.*

  - **build:popup**

    `cross-env NODE_ENV=production browserify --global-transform=envify --transform babelify source/popup.js | uglifyjs --compress warnings=false --mangle > build/popup.min.js`

    *Exactly the same log as build:app, just seperated for convenience*

  - **build:content**

    `browserify source/content.js | uglifyjs --mangle > build/content.min.js`

* **deploy**

  `bestzip deploy.zip build/`

  *Zip up the build directory for uploading to the Chrome webstore.*

  - **predeploy**

    `rimraf deploy.zip && npm run build`

    *Remove the previous deploy.zip (shouldn't matter but good practice). Then run the build script.




## Credit
  - [Icon Files by Trinh Ho](http://www.flaticon.com/packs/design-5)
