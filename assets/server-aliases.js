(() => {
    'use strict';

    const meta = document.querySelector('meta[name="adminer-server-aliases"]');
    if (!meta) return;

    const config = JSON.parse(meta.content);
    const entries = [];

    function register(name, context) {
        const key = 'adminer-server-aliases:v1:' + JSON.stringify([location.pathname, ...context]);
        const original = context[1] || 'localhost';
        let alias = '';

        try {
            alias = localStorage.getItem(key) || '';
        } catch {
            // Keep the original address usable when browser storage is blocked.
        }

        name.textContent = alias || original;
        name.title = original;
        const entry = { name, key, original, alias };
        entries.push(entry);
        return entry;
    }

    function addRenameButton(container, entry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'server-aliases-rename';
        button.textContent = '✎';
        button.title = config.labels.rename;
        button.setAttribute('aria-label', config.labels.rename + ': ' + entry.original);
        button.addEventListener('click', () => {
            const value = window.prompt(config.labels.prompt, entry.alias);
            if (value === null) return;

            const alias = value.trim();

            try {
                if (alias) {
                    localStorage.setItem(entry.key, alias);
                } else {
                    localStorage.removeItem(entry.key);
                }
            } catch {
                window.alert(config.labels.storageError);
                return;
            }

            for (const item of entries) {
                if (item.key === entry.key) {
                    item.alias = alias;
                    item.name.textContent = alias || item.original;
                }
            }
        });
        container.append(' ', button);
    }

    for (const link of document.querySelectorAll('#logins li > a')) {
        const url = new URL(link.href, location.href);
        const driver = config.drivers.find(driver => url.searchParams.has(driver));
        if (!driver) continue;

        const context = [driver, url.searchParams.get(driver), url.searchParams.get('username') || ''];
        let name = link.querySelector('.server-aliases-name');

        // Adminer omits serverName() for an empty host in saved logins.
        if (!name) {
            if (context[1] !== '') continue;

            name = document.createElement('span');
            name.className = 'server-aliases-name';
            const text = link.firstChild;
            const marker = ') ' + context[2] + '@';
            const index = text && text.nodeType === Node.TEXT_NODE
                ? text.textContent.indexOf(marker)
                : -1;
            if (index < 0) continue;

            const suffix = text.splitText(index + marker.length);
            link.insertBefore(name, suffix);
        }

        const entry = register(name, context);
        link.title = '(' + driver + ') ' + context[2] + '@' + entry.original;
        addRenameButton(link.parentElement, entry);
    }

    const breadcrumb = document.querySelector('#breadcrumb .server-aliases-name');

    if (breadcrumb) {
        register(breadcrumb, config.current);

        const heading = document.querySelector('#menu h1');

        if (heading) {
            const row = document.createElement('p');
            const name = document.createElement('span');
            row.className = 'server-aliases-current';
            name.className = 'server-aliases-name';
            row.append(name);
            addRenameButton(row, register(name, config.current));
            heading.after(row);
        }
    }
})();
