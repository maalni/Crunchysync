# Crunchysync

The credentials are stored locally, AES encrypted and are shared only with the official Crunchyroll API!

### What is Crunchysync?
Crunchysync is an Extension for Chrome, which uses NodeJS and Angular to access the official Crunchyroll API with your credentials or cookies.
It will sync your queue and will provide an easy way to navigate through or manage it.

### How do i use Crunchysync without providing my credentials?
You need to visit (and log in to) Crunchyroll once a day before you can use Crunchysync.
Crunchysync will remind you if your session provided by the cookie is invalid and needs to be refreshed.

### How do i compile my own build of Crunchysync?

#### Dependencies:
- NodeJS LTS (currently used: v8.11.4)
- Yarn
- crypto-ts
- Angular (currently used: v6.1.5)
- @types/chrome

1. Setup your environment (NodeJS and Yarn)
2. Download the repository
3. Run "yarn" to install missing dependencies
4. Run "ng build" or "ng build --prod --build-optimizer"
5. Wait patiently
6. ???
7. Profit

### How do i add my own compiled version of Crunchysync to chrome?
1. Download or compile the newest version of the extension
2. Extract it
3. Open chromes extension site
4. Enable the developer mode (top right corner)
5. Click on "Load extracted extensions"
6. Locate the Crunchysync folder
7. Click on "Ok"
