# Adminer Server Aliases

Custom connection names in Adminer’s sidebar and breadcrumb, stored in your
browser’s localStorage. Hover over a name to see the original server address.

## Requirements

- Adminer 6.1.2 and PHP 8.1+
- JavaScript and localStorage enabled

## Installation

Copy the files alongside Adminer:

```text
adminer.php
adminer-plugins/
  server-aliases.php
  assets/
    server-aliases.css
    server-aliases.js
```

Standalone Adminer discovers the plugin automatically. Other distributions may
require their own loader. See [Adminer’s plugin documentation](https://www.adminer.org/en/plugins/).

## Usage

Click the pencil beside a saved or active connection to rename it. Leave the name
empty to restore the server address. Duplicate names are allowed.

Saved connection links show only the alias when one is set. The original database
type, username, server address and database name remain available on hover.

Aliases are assigned by database driver, host and username, and shared across
that connection’s databases. Storage is separate for each browser origin and
Adminer URL path. Names do not sync between devices and are removed when site
storage is cleared. No passwords are stored.

Interface languages: English, Polish and Ukrainian, with English fallback.
