# Reading Habits WebExtension

## What it does
A webextension to help visualizing in browser reading habits.
This code does not rely on any third party. The storage of the queued and archived items is performed in local bookmarks, which can eventually be synchronized using browser sync functionalities.

## Build and package
You need [NodeJS](https://nodejs.org/en/) and [npm](http://npmjs.com/) ready environment. After that, change into project directory and install dependencies with:

    npm install

Start the continuous build process to transpile the code into something that can run in Firefox or Chrome:

    npm run build

This creates a WebExtension in the `extension` subdirectory.
Any time you edit a file, it will be rebuilt automatically.

In another shell window, run the extension in Firefox using a wrapper
around [web-ext][web-ext]:

    npm start

Any time you edit a file, [web-ext][web-ext] will reload the extension
in Firefox. 

When you want to package the extension run:

    npm run package

### OS Compability
 Linux, Windows and Mac OS X
