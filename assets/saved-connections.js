(() => {
    'use strict';

    const meta = document.querySelector('meta[name="adminer-saved-connections"]');
    const heading = document.querySelector('#menu h1');
    if (!meta || !heading) return;

    const config = JSON.parse(meta.content);
    const labels = config.labels;
    const storageKey = 'adminer-saved-connections:v1:' + location.pathname;
    const legacyPrefix = 'adminer-server-aliases:v1:';
    const nativeList = document.querySelector('#logins');
    const identity = item => JSON.stringify([item.driver, item.server, item.username]);
    let connections;

    function initialConnections() {
        const imported = new Map(config.saved.map(item => [identity(item), item]));

        for (let index = 0; index < localStorage.length; index++) {
            const key = localStorage.key(index);
            if (!key.startsWith(legacyPrefix)) continue;

            let context;

            try {
                context = JSON.parse(key.slice(legacyPrefix.length));
            } catch {
                continue;
            }

            if (!Array.isArray(context) || context.length !== 4
                || !context.every(value => typeof value === 'string')
                || context[0] !== location.pathname) continue;

            const item = { driver: context[1], server: context[2], username: context[3], database: '', alias: '' };
            const existing = imported.get(identity(item)) || item;
            existing.alias = localStorage.getItem(key) || '';
            imported.set(identity(item), existing);
        }

        return [...imported.values()];
    }

    try {
        const stored = localStorage.getItem(storageKey);
        connections = stored === null ? initialConnections() : JSON.parse(stored);

        if (!Array.isArray(connections) || !connections.every(item => item
            && ['driver', 'server', 'username', 'database', 'alias'].every(key => typeof item[key] === 'string'))) {
            throw new Error('Invalid saved connections');
        }

        // Persist even an empty list so removed entries are never imported again.
        if (stored === null) localStorage.setItem(storageKey, JSON.stringify(connections));
    } catch {
        const warning = document.createElement('p');
        warning.className = 'error';
        warning.textContent = labels.storageError;
        heading.after(warning);
        return;
    }

    const section = document.createElement('section');
    section.id = 'saved-connections';
    heading.after(section);
    if (nativeList) nativeList.hidden = true;

    function details(item) {
        return '(' + (config.drivers[item.driver] || item.driver) + ') '
            + item.username + '@' + (item.server || 'localhost')
            + (item.database ? ' - ' + item.database : '');
    }

    function commit(next) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
            window.alert(labels.storageError);
            return;
        }

        connections = next;
        render();
    }

    function button(text, title, action) {
        const element = document.createElement('button');
        element.type = 'button';
        element.textContent = text;
        element.title = title;
        element.setAttribute('aria-label', title);
        element.addEventListener('click', action);
        return element;
    }

    function save(item) {
        const existing = connections.find(saved => identity(saved) === identity(item));
        const alias = window.prompt(labels.prompt, existing ? existing.alias : item.alias);
        if (alias === null) return;

        const saved = { ...item, alias: alias.trim() };
        const next = connections.filter(connection => identity(connection) !== identity(item));
        next.push(saved);
        commit(next);
    }

    function connectionUrl(item) {
        const url = new URL(location.pathname, location.origin);
        const current = new URL(location.href);

        // Preserve Adminer's extension context without copying actions or session IDs.
        if (current.searchParams.has('ext')) url.searchParams.set('ext', current.searchParams.get('ext'));

        url.searchParams.set(item.driver, item.server);
        url.searchParams.set('username', item.username);
        if (item.database) url.searchParams.set('db', item.database);
        return url.href;
    }

    function render() {
        section.replaceChildren();
        const title = document.createElement('h3');
        title.textContent = labels.heading;
        section.append(title);

        const list = document.createElement('ul');

        for (const item of connections) {
            const row = document.createElement('li');
            const link = document.createElement('a');
            link.href = connectionUrl(item);
            link.textContent = item.alias || details(item);
            link.title = details(item);
            row.append(link, ' ', button('✎', labels.rename + ': ' + link.textContent, () => save(item)), ' ',
                button('×', labels.delete + ': ' + link.textContent, () => {
                    if (window.confirm(labels.confirm + '\n' + (item.alias || details(item)))) {
                        commit(connections.filter(saved => identity(saved) !== identity(item)));
                    }
                }));
            list.append(row);
        }

        if (connections.length) {
            section.append(list);
        } else {
            const empty = document.createElement('p');
            empty.textContent = labels.empty;
            section.append(empty);
        }

        if (config.connected) {
            const existing = connections.find(item => identity(item) === identity(config.current));
            const name = document.querySelector('#breadcrumb .saved-connections-name');

            if (name) {
                name.textContent = existing && existing.alias ? existing.alias : config.current.server || 'localhost';
                name.title = config.current.server || 'localhost';
            }

            section.append(button(labels.save, details(config.current), () => save(config.current)));
        }
    }

    render();

    // Save login form parameters independently of authentication success.
    const driverField = document.querySelector('[name="auth[driver]"]');
    const loginForm = driverField && driverField.form;

    if (loginForm) {
        const saveButton = button(labels.save, labels.save, () => {
            const fields = loginForm.elements;
            save({
                driver: fields.namedItem('auth[driver]').value,
                server: fields.namedItem('auth[server]')?.value || '',
                username: fields.namedItem('auth[username]')?.value || '',
                database: fields.namedItem('auth[db]')?.value || '',
                alias: '',
            });
        });
        loginForm.append(saveButton);
    }
})();
