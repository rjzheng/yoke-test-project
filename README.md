## Yoke test project

# Setup

Install dependencies

```
yarn
```

The application uses Firebase Cloud Firestore. Hence it needs a key which is not included in the repo for security measures. Once the key is received, please store in the `.keys` folder like so:

```
test-project/
  .keys/
    yoketestproject-3882a8c06ff6.json
```

Then initialize a `.env` file like so:

```
test-project/
  .env
```

with the contents

```sh
GOOGLE_APPLICATION_CREDENTIALS=.keys/yoketestproject-3882a8c06ff6.json
```

With this, you should be able to start the server and start testing.

```
yarn start
```
