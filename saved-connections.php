<?php
declare(strict_types=1);

namespace Adminer;

/** Browser-local saved database connections. */
class AdminerSavedConnections extends Plugin
{
    private bool $connected = false;

    public function afterConnect(): void
    {
        $this->connected = true;
    }

    public function __construct(
        private string $cssFile = 'adminer-plugins/assets/saved-connections.css',
        private string $jsFile = 'adminer-plugins/assets/saved-connections.js',
    ) {
    }

    public function head(?bool $dark = null): void
    {
        $translations = [
            'en' => [
                'heading'      => 'Saved connections',
                'save'         => 'Save connection',
                'rename'       => 'Rename connection',
                'delete'       => 'Remove connection',
                'confirm'      => 'Remove this saved connection?',
                'empty'        => 'No saved connections.',
                'prompt'       => 'Connection name (leave empty to use connection details):',
                'storageError' => 'Saved connections could not be read or saved. Check browser storage settings and available space.',
            ],
            'pl' => [
                'heading'      => 'Zapisane połączenia',
                'save'         => 'Zapisz połączenie',
                'rename'       => 'Zmień nazwę połączenia',
                'delete'       => 'Usuń połączenie',
                'confirm'      => 'Usunąć to zapisane połączenie?',
                'empty'        => 'Brak zapisanych połączeń.',
                'prompt'       => 'Nazwa połączenia (pozostaw puste, aby użyć danych połączenia):',
                'storageError' => 'Nie można odczytać lub zapisać połączeń. Sprawdź ustawienia pamięci przeglądarki i dostępne miejsce.',
            ],
            'uk' => [
                'heading'      => 'Збережені з’єднання',
                'save'         => 'Зберегти з’єднання',
                'rename'       => 'Перейменувати з’єднання',
                'delete'       => 'Видалити з’єднання',
                'confirm'      => 'Видалити це збережене з’єднання?',
                'empty'        => 'Немає збережених з’єднань.',
                'prompt'       => 'Назва з’єднання (залиште порожнім, щоб використати дані з’єднання):',
                'storageError' => 'Не вдалося прочитати або зберегти з’єднання. Перевірте налаштування сховища браузера та вільне місце.',
            ],
        ];

        $saved = [];

        foreach ((array) ($_SESSION['pwds'] ?? []) as $driver => $servers) {
            foreach ($servers as $server => $users) {
                foreach ($users as $username => $password) {
                    if ($password === null || !isset(SqlDriver::$drivers[$driver])) {
                        continue;
                    }

                    $databases = $_SESSION['db'][$driver][$server][$username] ?? [];
                    $saved[]   = [
                        'driver'   => (string) $driver,
                        'server'   => (string) $server,
                        'username' => (string) $username,
                        'database' => (string) array_key_first($databases),
                        'alias'    => '',
                    ];
                }
            }
        }

        $language   = explode('-', strtolower(str_replace('_', '-', LANG)))[0];
        $config     = [
            'drivers'   => SqlDriver::$drivers,
            'connected' => $this->connected,
            'saved'     => $saved,
            'current'   => [
                'driver'   => DRIVER,
                'server'   => SERVER,
                'username' => (string) ($_GET['username'] ?? ''),
                'database' => DB,
                'alias'    => '',
            ],
            'labels'    => $translations[$language] ?? $translations['en'],
        ];
        $cssVersion = crc32((string) file_get_contents(__DIR__ . '/assets/saved-connections.css'));
        $jsVersion  = crc32((string) file_get_contents(__DIR__ . '/assets/saved-connections.js'));

        echo '<meta name="adminer-saved-connections" content="'
            . h((string) json_encode($config, JSON_INVALID_UTF8_SUBSTITUTE)) . '">' . "\n";
        echo '<link rel="stylesheet" href="' . h($this->cssFile . '?v=' . $cssVersion) . '">' . "\n";
        echo script_src($this->jsFile . '?v=' . $jsVersion, true);
    }

    public function serverName(?string $server): string
    {
        $server = $server ?? '';

        return '<span class="saved-connections-name" title="' . h($server) . '">'
            . h($server) . '</span>';
    }
}
