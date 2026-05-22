## Instructions to setup and run project

### Prerequisites

Make sure these are installed:

- Node.js
- npm
- MongoDB
- Git

### Setup and Run

1. **Clone the repository**

```bash
 git clone https://github.com/ckane-sbu-s26-cse316/pa04project-s26-overcooked6.git
 cd "pa04project-s26-overcooked6"
```

2. **Install server dependencies**

```bash
 cd server
 npm install
```

3. **Install client dependencies**

```bash
 cd ../client
 npm install
```

4. **Start MongoDB**

- macOS (Homebrew): `brew services start mongodb-community`
- Windows: start MongoDB service in Services or run `mongod`
- Linux: `sudo systemctl start mongod`

5. **Initialize the database**

```bash
 cd ../server
 node init.js admin@example.com admin 'AdminPass!123'
```

The three arguments are the admin email address, admin display name, and admin
password. The script connects to `mongodb://127.0.0.1:27017/phreddit`.

6. **Start the backend server**

```bash
 npm start
```

Backend URL: `http://localhost:8000`

7. **Start the frontend client** (open a new terminal at project root)

```bash
 cd client
 npm run dev
```

Frontend URL: `http://localhost:5173/`

8. **Open the app**
   - Open Chrome and navigate to: `http://localhost:5173/`

---

### Tests and Checks

Run the client lint and production build:

```bash
 cd client
 npm run lint
 npm run build
```

The Playwright project has already been initialized in the `client` directory.
If you need to recreate that setup from scratch, run:

```bash
 cd client
 npm init playwright
```

Run the server lint:

```bash
 cd server
 npx eslint .
```

Run the server unit tests:

```bash
 cd server
 node --test "./tests/*.unit.test.js"
```

Check server unit test coverage:

```bash
 cd server
 node --test --experimental-test-coverage "./tests/*.unit.test.js"
```

Run the server integration tests. MongoDB must already be running at
`127.0.0.1:27017`:

```bash
 cd server
 node --test "./tests/*.int.test.js"
```

Run the end-to-end test. Start MongoDB, the backend server, and the Vite client
first, then run:

```bash
 cd client
 npx playwright test createCommunity.spec.js
```
