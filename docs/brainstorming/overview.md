Here is a highly efficient, idiomatic project structure for a small Axum + Datastar + Hypertext + SQLx (SQLite)application.

This design keeps your views close to your business logic, separates your data migrations, and leaves a dedicated spot for your production configuration (like Litestream).

```
my-datastar-app/
├── .github/workflows/       # CI/CD (Runs test suite and `cargo sqlx prepare`)
├── .sqlx/                   # Automatic SQLx offline metadata (checked into git)
├── migrations/              # Plain text SQL migration scripts (.sql files)
│   ├── 20260101000000_init.sql
│   └── 20260215123456_add_todos.sql
├── src/
│   ├── main.rs              # Application entry point, DB setup, & router initialization
│   ├── routes/              # Axum request handlers & routing logic
│   │   ├── mod.rs
│   │   ├── dashboard.rs     # Main dashboard route
│   │   └── todos.rs         # Datastar SSE CRUD endpoints (PATCH/POST/DELETE)
│   ├── views/               # Hypertext HTML markup layouts & components
│   │   ├── mod.rs           # Core skeleton layouts (Header, Footer, Document)
│   │   ├── dashboard_v.rs   # Dashboard specific page views
│   │   └── todos_v.rs       # Reusable Datastar fragment "islands"
│   └── database.rs          # Database helper utilities (optional)
├── static/                  # Vanilla assets (CSS, Datastar JS bundle)
│   └── datastar.js          # The tiny client-side Datastar core library
├── Cargo.toml               # Rust dependencies
├── litestream.yml           # Production configuration for automated S3/R2 backups
└── .env                     # Local environment file (DATABASE_URL=sqlite://dev.db)
```

Key Architectural Choices in this Setup
📦 views/ vs routes/ Separation
While some developers like putting HTML macros straight inside their Axum handlers, separating them into views/keeps code cleaner as your app grows.

- todos.rs (Route): Handles HTTP extraction, interacts with the SQLx database pool, handles errors, and calls your view functions.
- todos_v.rs (View): Pure hypertext macro code. It takes raw Rust structs/data as arguments and returns type-safe HTML layouts.
  🔄 The migrations/ Folder
  SQLx automatically looks for this folder. Running sqlx migrate add <name> will drop a timestamped .sql file here. When your Axum app spins up in main.rs, you can call sqlx::migrate!().run(&pool).await? to automatically update your development or production SQLite file on boot.
  💾 The .sqlx/ Cache Directory
  When you run cargo sqlx prepare, SQLx saves your query schemas here as JSON. This is what allows your CI/CD pipeline or Docker builder to compile your application cleanly without needing the live dev.db file present.
  🚀 litestream.yml at the Root
  This sits in your root directory so your deployment environment can pick it up. A simple configuration watches production.db and securely chunks it up to a free Cloudflare R2 bucket continuously in the background.

—-

If you choose Tailwind CSS (Option 1) for your project layout, you can create a seamless, single-command development workflow using standard Rust tooling without touching an NPM configuration.

1. Install cargo-watch and the Tailwind CLI.
2. Create a basic automated task runner script or a simple Makefile at your repository root to launch both processes simultaneously:

```
makefile
dev:
	# Run tailwind engine and rust live-reload compiler side-by-side
	@tailwindcss -i ./src/input.css -o ./static/styles.css --watch &
	@cargo watch -x run
```

This ensures that whenever you tweak a hypertext macro layout inside views/todos_v.rs, your backend binary automatically recompiles, your Tailwind CSS bundle automatically updates, and Datastar updates your client browser view seamlessly.

—-

```
UI
  hypertext
  Datastar
  vanilla CSS or Tailwind

Server
  axum
  tokio
  serde
  tracing

Data
  sqlx
  SQLite
  sqlx migrations

Persistence
  local SSD
  Litestream → Cloudflare R2

Deployment
  Hetzner ARM
  Caddy
  Docker Compose OR systemd

CI/CD
  GitHub Actions
```

And I’d add just a few boring Rust crates as recurring defaults: thiserror, tracing, tower-http, and probably uuid + time.

—-

I’d keep SQLite as the default and make Postgres the “graduate when needed” option. I’d also make Coolify optional, not part of the core stack.

Postgres is a better default when you expect multiple app instances, meaningful concurrent writes, background workers touching the same DB, richer operational tooling, or a realistic chance you’ll need HA/failover. It also becomes attractive when the app is already complex enough that running a separate database service is not materially increasing your mental load. For a SaaS app with billing, queues, admin jobs, webhooks, and multiple replicas, I’d probably start Postgres immediately. For a personal tool, game, small CRUD app, or modest paid product running on one box, SQLite is usually simpler and plenty capable.

Coolify is better when you want the platform experience: several apps on one server, automatic domains/TLS, environment-variable management, deploy-from-Git, logs, databases, scheduled jobs, preview-ish workflows, and less bespoke server administration. If you foresee a Hetzner box becoming your little personal Heroku, Coolify is a strong choice. If each project is basically “run this binary and keep this directory alive,” Coolify is optional infrastructure you now have to operate.

So I would not add Postgres now just to standardize. You’d be giving up one of the best properties of this stack: the database is literally a file next to the application.

I’d define three levels:

1. Tiny Axum + hypertext + CSS + SQLite Deploy one binary with systemd. Caddy in front. Back up SQLite periodically. You might not even need Datastar, Tailwind, Docker, Litestream, or R2 yet.
2. Normal small production app Datastar + hypertext + Tailwind + Axum + SQLx + SQLite + Litestream/R2 + Caddy + Hetzner This is the sweet spot I’d choose as your reusable template.
3. Growing SaaS Datastar/hypertext + Axum + SQLx + Postgres + object storage + Coolify At that point Coolify and Postgres start earning their keep. 
   There’s actually an even simpler variation I find appealing:

```
Cloudflare
   ↓
Caddy
   ↓
single Axum binary
   ↓
SQLite file
```

With:
systemd
rsync/restic/Litestream backups

GitHub Actions → scp binary → systemctl restart
No Docker. No Docker Compose. No Coolify. No Node runtime. No database server. Potentially no Tailwind build if you use plain CSS.

For a Rust app, that simplicity is particularly compelling because cargo build --release already gives you the deployment artifact other ecosystems invent containers to approximate.

The decision rule I’d use is:
Add infrastructure because the app requires it, not because it might someday require it.
SQLite → Postgres is a well-understood migration. systemd → Coolify is easy. one server → multiple servers is possible.
But every project you start with Postgres + Docker + Coolify pays that complexity tax immediately.

So my “new normal” would actually be slightly simpler than your original proposal:
Axum + hypertext + Datastar + CSS/Tailwind + SQLx + SQLite, deployed as a binary to Hetzner with Caddy + systemd. Litestream → R2 once the data matters.
Then treat Coolify and Postgres as the first two upgrades, rather than defaults. That gives you a remarkably low-complexity baseline without painting yourself into a corner.

—

Here are two clean, straightforward templates designed to keep Rust simple. They completely avoid complex lifetimes (<'a>), custom traits, and strict micro-optimizations so you can focus on building your puzzle site.

1. The Batch Script (Fetch & Parse Data)

This script uses reqwest to fetch data and serde to parse it. Notice that everything uses owned data types like String and i32 so you never have to deal with borrowing or reference headaches.

Add this to your Cargo.toml dependencies:

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.12", features = ["json"] }
serde = { version = "1.0", features = ["derive"] }
```

```rust
use serde::Deserialize;

// 1. Define your data shape. Everything is an owned type (String, i32, bool).
// No lifetimes (<'a>) allowed here!
#[derive(Deserialize, Debug)]
struct PuzzleData {
    id: i32,
    title: String,
    difficulty: String,
    grid_size: i32,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // A sample public API for demonstration
    let url = "https://example.com";

    println!("Fetching puzzle data...");

    // 2. Fetch and parse in one clean step.
    // Serde automatically maps the JSON keys to your struct fields.
    let puzzle: PuzzleData = reqwest::get(url)
        .await?
        .json()
        .await?;

    println!("Successfully parsed puzzle: '{}' ({})", puzzle.title, puzzle.difficulty);

    // 3. Output or process your data safely
    if puzzle.grid_size > 15 {
        println!("This is a large puzzle!");
    }

    Ok(())
}
```

2. The Web Backend (Axum Server)

This backend uses axum. To keep things incredibly simple, we wrap our database or application state in an Arc (Atomic Reference Counter) and .clone() it. This completely bypasses the borrow checker when sharing data between different web routes.

Add this to your Cargo.toml dependencies:

```toml
[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
```

```rust
use axum::{routing::get, Extension, Json, Router};
use serde::Serialize;
use std::sync::Arc;

// 1. Create a simple struct for your shared state (like a DB pool or cache)
struct AppState {
    site_name: String,
}

#[derive(Serialize)]
struct StatusResponse {
    status: String,
    site: String,
}

#[tokio::main]
async fn main() {
    // 2. Wrap state in an Arc so it can be safely shared across multiple threads
    let shared_state = Arc::new(AppState {
        site_name: String::from("The Daily Puzzle Hub"),
    });

    // 3. Build the app and inject the state using 'Extension'
    let app = Router::new()
        .route("/", get(home_handler))
        .route("/status", get(status_handler))
        .layer(Extension(shared_state)); // This makes state available to all routes

    // 4. Run the server
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
    println!("Server running on http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}

// A simple text route
async fn home_handler() -> &'static str {
    "Welcome to the Puzzle Site!"
}

// A route that reads the shared state and outputs JSON
async fn status_handler(
    Extension(state): Extension<Arc<AppState>>, // Extract the state here
) -> Json<StatusResponse> {

    // Use .clone() freely to avoid borrowing conflicts
    let site_name_clone = state.site_name.clone();

    let response = StatusResponse {
        status: String::from("OK"),
        site: site_name_clone,
    };

    Json(response) // Axum automatically turns this into a JSON response
}
```

Why this approach keeps you sane:

1. No lifetimes (<'a>): By using String everywhere instead of &str, you don't have to track how long a piece of text lives.
2. Explicit Cloning: If status_handler needs a piece of AppState, we just .clone() it. Memory is cheap; your hobby development time is expensive.
3. No custom traits: We just write ordinary functions and structs.

Would you like to explore how you plan to store the puzzle data (like using a simple SQLite database with SQLx) or should we look at how to schedule the batch jobs?

…

For a hobby puzzle site, SQLite via the sqlx crate is the absolute best storage choice.
It requires zero server configuration (it is just a single file on your disk), it is incredibly fast, and sqlx lets you write raw SQL rather than learning a complicated ORM.

To keep your code simple, we will use sqlx::FromRow to automatically map database rows directly into simple Rust structs, avoiding any complex pointer mapping or borrowing issues.

1. Update your dependencies

Add these lines to your Cargo.toml. We include runtime-tokio and sqlite features, along with chrono to make handling dates and times easy and string-convertible:

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.8", features = ["runtime-tokio", "sqlite", "chrono"] }
chrono = { version = "0.4", features = ["serde"] }
serde = { version = "1.0", features = ["derive"] }
```

2. Complete Database & API Template

This complete script shows you how to initialize an SQLite database, create a puzzles table, insert a batch job entry, and fetch it back.

```rust
use sqlx::{SqlitePool, FromRow};
use chrono::{Utc, NaiveDateTime};

// 1. Define your database structure.
// Adding #[derive(FromRow)] allows SQLx to automatically populate this from a query.
#[derive(Debug, FromRow)]
struct PuzzleRow {
    id: i32,
    title: String,
    grid_data: String,       // Storing complex grid shapes as a simple JSON string
    difficulty: String,
    created_at: NaiveDateTime, // Handled automatically by the chrono crate
}

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    // 2. Connect to the database file.
    // If "puzzles.db" doesn't exist, SQLx will create it automatically.
    let db_url = "sqlite://puzzles.db";
    let pool = SqlitePool::connect(db_url).await?;

    println!("Connected to SQLite database successfully.");

    // 3. Create your table if it doesn't exist.
    // In simple Rust, running raw SQL blocks like this keeps setup lightweight.
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS puzzles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            grid_data TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )"
    )
    .execute(&pool)
    .await?;

    // 4. BATCH JOB WORKLOAD: Insert parsed puzzle data.
    // Use the `?` operator to pass variables cleanly and safely protect against SQL injection.
    let sample_title = "Crossword No. 42";
    let sample_grid = r#"{"rows":15,"cols":15,"cells":[]}"#; // Raw JSON string
    let sample_diff = "Medium";

    println!("Batch script: Inserting a new puzzle...");
    sqlx::query("INSERT INTO puzzles (title, grid_data, difficulty) VALUES (?, ?, ?)")
        .bind(sample_title)
        .bind(sample_grid)
        .bind(sample_diff)
        .execute(&pool)
        .await?;

    // 5. WEB BACKEND WORKLOAD: Fetch a puzzle to serve to a user.
    // `query_as` maps the database result directly into our simple PuzzleRow struct.
    println!("Web server: Fetching the latest puzzle...");
    let puzzle: PuzzleRow = sqlx::query_as("SELECT id, title, grid_data, difficulty, created_at FROM puzzles ORDER BY id DESC LIMIT 1")
        .fetch_one(&pool)
        .await?;

    println!("Successfully retrieved puzzle row:");
    println!(" - ID: {}", puzzle.id);
    println!(" - Title: {}", puzzle.title);
    println!(" - Difficulty: {}", puzzle.difficulty);
    println!(" - Created At: {}", puzzle.created_at);

    Ok(())
}
```

Why this approach keeps data storage simple:

1. No complex ORM mappings: You don't have to learn a massive framework like Diesel that heavily abuses Rust's advanced type systems and generates confusing compiler errors. You just write normal SQL.
2. SqlitePool clones cheaply: You can easily take that pool variable and put it straight into the AppStatestruct from our previous Axum example. Because it implements a cheap .clone() under the hood, passing it around your routes won't trigger borrow checker arguments.
3. JSON as text: Instead of building intricate relational schemas for puzzle geometries or grid designs, your batch scripts can just stringify the puzzle layout into a String (using serde_json::to_string), dump it in a TEXT column, and let your frontend decode it.

If you are ready to stitch these pieces together, we can look at how to structure your project directory (like using Cargo workspaces so your web server and batch scripts can share this data model code), or we can look at how to run the batch scraper on a schedule. Which path makes sense next?

…

Combining Datastar (a lightweight hypermedia library that merges the backend capabilities of HTMX with client-side signals like Alpine.js) with hypertext (a blazing-fast, type-checked Rust macro crate for HTML) is an incredible architectural stack. It delivers Single-Page Application (SPA) interactivity with zero JavaScript build steps and massive performance.

Here is how you can sketch this setup into your Axum web server and link it to the SQLite database layout.

1. Update Dependencies

Add hypertext to your Cargo.toml. hypertext uses an rsx! macro that compiles HTML tags into highly optimized, string-pushing code at compile time.

```toml
[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.8", features = ["runtime-tokio", "sqlite", "chrono"] }
hypertext = "0.7"
serde = { version = "1.0", features = ["derive"] }
```

2. The Interactive Puzzle Page View

This template combines Server-Side Rendering (SSR) via hypertext and embeds Datastar attributes.

We will render a basic interactive crossword grid where clicking a puzzle cell updates a frontend reactive signal (activeCell), and typing handles an answer checker without resetting the page state.

```rust
use axum::{routing::get, Extension, Router, response::Html};
use hypertext::{html, rsx, Renderable}; // hypertext prelude
use std::sync::Arc;
use sqlx::SqlitePool;

// Re-using our database row struct from the SQLite setup
#[derive(sqlx::FromRow)]
struct PuzzleRow {
    id: i32,
    title: String,
    grid_data: String,
    difficulty: String,
}

struct AppState {
    pool: SqlitePool,
}

#[tokio::main]
async fn main() {
    let db_url = "sqlite://puzzles.db";
    let pool = SqlitePool::connect(db_url).await.unwrap();
    let shared_state = Arc::new(AppState { pool });

    let app = Router::new()
        .route("/puzzle", get(puzzle_handler))
        .layer(Extension(shared_state));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
    println!("Puzzle UI serving at http://127.0.0");
    axum::serve(listener, app).await.unwrap();
}

async fn puzzle_handler(
    Extension(state): Extension<Arc<AppState>>,
) -> Html<String> {
    // 1. Fetch data from SQLite
    let puzzle: PuzzleRow = sqlx::query_as("SELECT id, title, grid_data, difficulty FROM puzzles ORDER BY id DESC LIMIT 1")
        .fetch_one(&state.pool)
        .await
        .unwrap();

    // 2. Render the layout using hypertext's rsx! macro.
    // Note: hypertext uses parentheses (expr) for interpolating Rust variables.
    let page = rsx! {
        <!DOCTYPE html>
        <html>
        <head>
            <title>(puzzle.title)</title>
            <!-- Load Datastar via CDN -->
            <script type="module" src="https://jsdelivr.net"></script>
            <style>
                .grid { display: grid; grid-template-columns: repeat(3, 50px); gap: 5px; }
                .cell { width: 50px; height: 50px; text-align: center; border: 1px solid black; font-size: 20px; }
                .selected { background-color: #e0f2fe; }
            </style>
        </head>
        <!-- 3. Initialize Datastar Global Signals -->
        <!-- data-signals defines reactive client state variables -->
        <body data-signals="{ activeCell: 0, statusMessage: 'Select a cell to begin' }">

            <h1>(puzzle.title) - <small>(puzzle.difficulty)</small></h1>

            <!-- Reactive status text that shifts immediately when frontend signals mutate -->
            <p data-text="$statusMessage"></p>

            <!-- A mockup 3x3 interactive puzzle grid -->
            <div class="grid">
                <!-- Cell 1 -->
                <input class="cell"
                       type="text"
                       maxlength="1"
                       data-bind-cell1=""
                       data-on-focus="$$activeCell = 1; $$statusMessage = 'Typing in Cell 1...'" />

                <!-- Cell 2 -->
                <input class="cell"
                       type="text"
                       maxlength="1"
                       data-bind-cell2=""
                       data-on-focus="$$activeCell = 2; $$statusMessage = 'Typing in Cell 2...'" />

                <!-- Cell 3 -->
                <input class="cell"
                       type="text"
                       maxlength="1"
                       data-bind-cell3=""
                       data-on-focus="$$activeCell = 3; $$statusMessage = 'Typing in Cell 3...'" />
            </div>

            <br />
            <!-- 4. Datastar Action trigger -->
            <!-- data-on-click will execute an HTTP post backend request seamlessly -->
            <button data-on-click="@post('/puzzle/check')">
                Check Answers
            </button>

        </body>
        </html>
    };

    // Convert the type-safe hypertext output directly to an Axum HTML string response
    Html(page.render().into_string())
}
```

Why this structure matches your "Simple Rust" criteria:

1. No Frontend Complexities: You do not need to deal with npm, Webpack/Vite, or single-page framework routing setups. Your Rust code remains the single repository of truth for markup.
2. Local Declarative State: Datastar attributes like data-signals and data-on-focus allow you to implement instant focus styles and change client labels entirely on the user's browser without triggering immediate network requests.
3. Type-Safe Views: The hypertext macro validates your HTML tags and formatting during compilation (cargo build), ensuring that a broken layout element crashes your compile phase rather than silently failing inside a user's web browser.

Would you like to build out the next routing component showing how Datastar processes the Server-Sent Events (SSE)response when checking answers via that @post('/puzzle/check') endpoint?

…

Here is how to handle the backend Datastar response.

Datastar does something unique: when you trigger @post('/puzzle/check'), the browser automatically bundles up all the local webpage signals (the input text fields) and sends them to the server as a JSON payload. The server then responds using Server-Sent Events (SSE) (text/event-stream).

Instead of dealing with a full-blown SSE streaming framework, we can build a lightweight wrapper function that handles the exact plain-text protocol Datastar expects. This keeps the setup simple and easy to maintain.

1. The Route Handler Setup

Add the new routing endpoint "/puzzle/check" to your Router inside main():

```rust
let app = Router::new()
    .route("/puzzle", get(puzzle_handler))
    .route("/puzzle/check", axum::routing::post(check_answers_handler)) // Add this
    .layer(Extension(shared_state));
```

2. Processing incoming signals and returning Datastar SSE

This handler accepts the incoming signal JSON sent by Datastar, checks the puzzle values, and yields custom Datastar backend events (datastar-patch-elements or datastar-patch-signals).

```rust
use axum::{
    response::{IntoResponse, Response},
    Json,
};
use hypertext::{rsx, Renderable};
use serde::Deserialize;

// 1. Model the exact JSON structure of the frontend Datastar signals
#[derive(Deserialize)]
struct PuzzleSignals {
    cell1: String,
    cell2: String,
    cell3: String,
}

// 2. A simple custom response type that sets the required text/event-stream headers
struct DatastarSse(String);

impl IntoResponse for DatastarSse {
    fn into_response(self) -> Response {
        Response::builder()
            .header("Content-Type", "text/event-stream")
            .header("Cache-Control", "no-cache")
            .body(axum::body::Body::from(self.0))
            .unwrap()
    }
}

// 3. The check route endpoint
async fn check_answers_handler(
    // Axum automatically extracts the incoming JSON body containing Datastar signals
    Json(signals): Json<PuzzleSignals>,
) -> impl IntoResponse {

    // Hardcoded answers for this 3-cell puzzle mockup (e.g., spelling "C-A-T")
    let is_correct = signals.cell1.to_uppercase() == "C"
                  && signals.cell2.to_uppercase() == "A"
                  && signals.cell3.to_uppercase() == "T";

    // 4. Construct the Datastar SSE Payload
    // Datastar events use a predictable text format terminated by TWO newlines (\n\n)
    let sse_output = if is_correct {
        // Option A: Update client-side signals (reactive text)
        format!(
            "event: datastar-patch-signals\ndata: signals {{ statusMessage: '🎉 Correct! You solved the puzzle!' }}\n\n"
        )
    } else {
        // Option B: Render an HTML fragment dynamically into the DOM using hypertext
        let error_toast = rsx! {
            <div id="error-alert" style="color: red; font-weight: bold; margin-top: 10px;">
                ❌ Some answers are incorrect. Try again!
            </div>
        };

        format!(
            "event: datastar-patch-elements\ndata: elements {}\n\n",
            error_toast.render().into_string()
        )
    };

    // Return our custom response type
    DatastarSse(sse_output)
}
```

3. Update your Frontend HTML to catch the Element Patch

To allow Option B (the error element patch) to render correctly, add an empty placeholder wrapper with a matching idsomewhere inside the <body> of your original /puzzle route template:

```html
// Inside puzzle_handler rsx! macro:
<button data-on-click="@post('/puzzle/check')">Check Answers</button>

<!-- Datastar will automatically scan the incoming SSE, see id="error-alert", 
     and target this div out-of-band without reloading your board inputs -->
<div id="error-alert"></div>
```

Why this approach keeps your project lightweight:

1. Zero state-sync overhead: You don't have to write JavaScript code to grab individual DOM elements via selectors or serialize form fields. Datastar does it transparently on the browser side. [1]
2. Simple string protocols: Rather than adding dependencies for large server-sent event crates, you can format simple multi-line strings. [8]
3. Out-of-band updates: When answers fail validation, Datastar injects the new error message directly into <div id="error-alert"> without wiping clean the puzzle entries the user already typed. [5]

Would you like to wrap this up by showing how your batch script can bundle up raw text into this database format, or should we look at compiling the application into a single binary?

…

You are completely correct, and you hit on exactly what makes Datastar’s core philosophy—the "Tao of Datastar"—so distinct from other tools.

Datastar’s core tenant is that most state should live on the backend, using signals sparingly only as an epiphenomenal pass-through layer. In their favored Command Query Responsibility Segregation (CQRS) architectural pattern:

1. A page opens a long-lived, open GET request via Server-Sent Events (SSE).
2. The browser pipes user actions back to the server using debounced, asynchronous POST/PATCH commands as they type.
3. The server updates the centralized database/session state and instantly pushes the new puzzle state back down the open SSE pipe to mutate the screen.

By moving the user's active "playing" state into Rust, you protect the game loop from being manipulated on the client side, and you can auto-save their progress or seamlessly support multiplayer mechanics.

Here is how you structure that exact backend-driven, reactive loop in simple Rust.

1. The HTML View: Initializing the Open Pipe

Your page layout initializes the client-side attributes and immediately hits an endpoint to open the continuous SSE stream using data-on-load.

```rust
async fn puzzle_page_handler() -> Html<String> {
    let page = rsx! {
        <!DOCTYPE html>
        <html>
        <head>
            <title>CQRS Puzzle</title>
            <script type="module" src="https://jsdelivr.net"></script>
        </head>
        <!-- State is omitted here because the server will populate it over the SSE pipe -->
        <body data-signals="{}">

            <h1>The Daily Crossword</h1>

            <!-- Target wrapper where the backend will inject the active grid state -->
            <div id="puzzle-container">Loading interactive board...</div>

            <!-- On load, establish the long-lived, continuous read pipe to the backend -->
            <div data-on-load="@get('/puzzle/stream')"></div>

        </body>
        </html>
    };
    Html(page.render().into_string())
}
```

2. The Command: Debouncing Guesses to the Backend

When the server streams the board layout into #puzzle-container, every puzzle square input uses data-on-input.

By modifying it with @post('/puzzle/input').debounce.500ms, Datastar waits until the user pauses typing for half a second before sending a lightweight command to the server.

```rust
// This is the HTML chunk the backend dynamically patches into the DOM over SSE
fn render_backend_grid(cell_1_val: &str, cell_2_val: &str) -> String {
    let fragment = rsx! {
        <div id="puzzle-container">
            <!-- Cell 1 -->
            <input class="cell"
                   type="text"
                   value=(cell_1_val)
                   data-on-input="@post('/puzzle/input', {headers: {'X-Cell-Id': '1'}}).debounce.500ms" />

            <!-- Cell 2 -->
            <input class="cell"
                   type="text"
                   value=(cell_2_val)
                   data-on-input="@post('/puzzle/input', {headers: {'X-Cell-Id': '2'}}).debounce.500ms" />
        </div>
    };
    fragment.render().into_string()
}
```

3. The Axum Backend: Managing the State Machine

To handle this cleanly in Rust without complex asynchronous locks (Mutex), you can use crossbeam or standard tokio::sync::broadcast channels to pass messages from your POST command route straight into your open GET stream.

```
use axum::{
    response::{IntoResponse, Response},
    extract::HeaderMap,
    Extension, Json,
};
use tokio::sync::broadcast;
use std::sync::Arc;
use serde::Deserialize;

// Simple structure tracking what the user typed
#[derive(Deserialize)]
struct InputPayload {
    // Datastar automatically passes the active input value in the JSON payload
    value: String,
}

struct AppState {
    // Broadcast channel to send UI state patches instantly to the open SSE stream
    tx: broadcast::Sender<String>,
}

// COMMAND ROUTE: Debounced key strokes hit this endpoint
async fn handle_input_command(
    headers: HeaderMap,
    Extension(state): Extension<Arc<AppState>>,
    Json(payload): Json<InputPayload>,
) -> impl IntoResponse {

    // Extract which cell was typed into from custom headers
    let cell_id = headers.get("X-Cell-Id").unwrap().to_str().unwrap();
    let user_char = payload.value;

    // 1. UPDATE BACKEND STATE HERE
    // (e.g., sqlx::query("UPDATE user_sessions SET cell_? = ?..."))
    println!("User typed '{}' into Cell {}", user_char, cell_id);

    // 2. TRIGGER THE CQRS RESPONSE
    // Generate an SSE patch telling Datastar to morph the grid with the new values
    let sse_patch = format!(
        "event: datastar-patch-elements\ndata: elements {}\n\n",
        render_backend_grid("C", "A") // Fetch actual state from DB in real app
    );

    // Push it to the broadcast channel so the open stream picks it up
    let _ = state.tx.send(sse_patch);

    // Commands don't need to return a direct body response to the triggering element
    axum::http::StatusCode::OK
}

// QUERY STREAM ROUTE: The continuous open pipe
async fn handle_query_stream(
    Extension(state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    let mut rx = state.tx.subscribe();

    // Create an asynchronous stream that listens for broadcast messages
    // and continuously feeds them down to the browser window
    let stream = async_stream::stream! {
        // Immediately feed the current initial layout on connection
        yield Ok::<_, axum::Error>(format!(
            "event: datastar-patch-elements\ndata: elements {}\n\n",
            render_backend_grid("", "")
        ));

        // Loop indefinitely keeping the connection open, waiting for typing events
        while let Ok(sse_patch) = rx.recv().await {
            yield Ok::<_, axum::Error>(sse_patch);
        }
    };

    // Return the response configured with "text/event-stream" headers
    Response::builder()
        .header("Content-Type", "text/event-stream")
        .header("Cache-Control", "no-cache")
        .body(axum::body::Body::from_stream(stream))
        .unwrap()
}
```

Why this design vindicates your architecture choice:

- The "Zero-JS" Reality: Your interactive loop is 100% Rust code. The browser functions purely as a rendering terminal.
- No local signal sprawl: You don't have to initialize or maintain hundreds of tracking variables on the frontend data-signals dictionary for massive puzzle grids. The server tracks coordinates and values using normal data types. [1, 2, 6]
- State Preservation via Morphing: Because Datastar defaults to a deep DOM-morphing merge strategy, when the server pushes a re-rendered grid chunk down the SSE line, the user's active text cursor focus and selection states are perfectly preserved. [1, 7]

Would you like to look at how we can gracefully handle session management (like using cookies to give every distinct visitor their own separate state channel on the backend)?

…
