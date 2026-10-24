# Adminer Saved Connections

Browser-local favorite connections for Adminer, with custom names and removal
controls. The plugin replaces the visible built-in connection list. Favorites
remain saved after a failed login.

## Requirements

- Adminer 6.1.2 and PHP 8.1+
- JavaScript and localStorage enabled

## Installation

Copy the files alongside Adminer:

```text
adminer.php
adminer-plugins/
  saved-connections.php
  assets/
    saved-connections.css
    saved-connections.js
```

Standalone Adminer discovers the plugin automatically. Other distributions may
require their own loader. Remove `server-aliases.php` if previously installed.
For explicit configuration, use `Adminer\AdminerSavedConnections`.

## Usage

- Click **Save connection** in the login form or sidebar to save its parameters
  and choose a name. Saving from the sidebar uses the current database.
- Use the pencil to rename a favorite or the cross to remove it after confirmation.
- Leave the name empty to show connection details. Duplicate names are allowed.
- Hover over a favorite to see its database type, username, host and database.

Favorites are identified by driver, host and username. Each stores one database
as its destination. Saving the same connection updates that destination. Aliases
also appear in breadcrumbs.

Existing Adminer entries and previous server aliases are imported once, on first
use. Deleted favorites are not automatically imported again. Removing a favorite
does not log out or clear credentials remembered by Adminer.

Only connection parameters and names are stored, never passwords. Adminer handles
authentication and remembered logins. Favorites are isolated by browser origin
and Adminer URL path. They do not sync between devices. Clearing site storage
removes them and allows the initial import again.

Interface languages: English, Polish and Ukrainian, with English fallback.
If storage cannot be read, the plugin shows a warning and leaves Adminer's list
available.
