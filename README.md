# Crunchysync

### What is Crunchysync?
Crunchysync is an Extension for Chrome, which uses nodejs, angular, crypto-ts to access the official Crunchyroll API with your credentials or cookies.
The credentials are stored locally and AES encrypted and are shared only with the official Crunchyroll API!

### How do i add Crunchysync to chrome?
1. Download or compile the newest version of the extension
2. Extract it
3. Open chromes extension site
4. Enable the developer mode (top right corner)
5. Click on "Load extracted extensions"
6. Locate the Crunchysync folder
7. Click on "Ok"

### How do i use Crunchysync? *WIP*
After you added the extension to chrome, click on the little crown icon.
Crunchysync will present you 5 tabs, which will categorize your animes.
To select a episode just click on it.
To get a detailed description of the episode select it.
To watch an episode just click on the play button, while hovering your mouse over the episode or after selecting it.
To complete an episode without watching select an episode and click on the little eye icon in the top right corner.
To get an overview of the complete serie select an anime and click on the open icon in the top right corner.
To change settings click on the gear icon in the top right corner.
To save settings click on the save button on the settings page and confirm the security warning.

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
