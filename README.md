# Crunchysync
Sync the Crunchyroll queue properly

### What is Crunchysync?
Crunchysync is an Extension for Chrome, which uses NodeJS and Angular to access the official Crunchyroll API with your credentials.
It will sync your queue and will provide an easy way to navigate through or manage it.

# Current features:
- Sort your queue in 4 categories
- Complete a episode without watching
- Open episode or serie on Crunchyroll
- Ensures your queue is up-to-date even when the extension isnt open (Can be disabled)
- Get notified when a new episode airs or gets available for free (Can be disabled)

The credentials are stored locally, AES encrypted and are shared only with the official Crunchyroll API!

### How do i compile my own build of Crunchysync?

#### Dependencies:
- NodeJS (used: v12.3.1)
- Angular (used: v8.0.0)
- crypto-ts
- @types/chrome
- Yarn

1. Setup your environment (NodeJS and Yarn)
2. Download the repository
3. Run "yarn" to install missing dependencies
4. Run "ng build" or "ng build --prod --build-optimizer"
5. Wait patiently

Shoutout to OneStay for his great help
