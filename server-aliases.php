<?php
declare(strict_types=1);

namespace Adminer;

/** Browser-local display names for database connections. */
class AdminerServerAliases extends Plugin
{
    public function __construct(
        private string $cssFile = 'adminer-plugins/assets/server-aliases.css',
        private string $jsFile = 'adminer-plugins/assets/server-aliases.js',
    ) {
    }

    public function head(?bool $dark = null): void
    {
        $translations = [
            'en' => [
                'rename'       => 'Rename connection',
                'prompt'       => 'Connection name (leave empty to restore the server address):',
                'storageError' => 'The connection name could not be saved. Check whether browser storage is enabled or full.',
            ],
            'pl' => [
                'rename'       => 'Zmień nazwę połączenia',
                'prompt'       => 'Nazwa połączenia (pozostaw puste, aby przywrócić adres serwera):',
                'storageError' => 'Nie można zapisać nazwy połączenia. Sprawdź, czy pamięć przeglądarki jest włączona lub pełna.',
            ],
            'uk' => [
                'rename'       => 'Перейменувати з’єднання',
                'prompt'       => 'Назва з’єднання (залиште порожнім, щоб відновити адресу сервера):',
                'storageError' => 'Не вдалося зберегти назву з’єднання. Перевірте, чи сховище браузера ввімкнено або заповнено.',
            ],
        ];

        $language   = explode('-', strtolower(str_replace('_', '-', LANG)))[0];
        $config     = [
            'drivers' => array_keys(SqlDriver::$drivers),
            'current' => [DRIVER, SERVER, (string) ($_GET['username'] ?? '')],
            'labels'  => $translations[$language] ?? $translations['en'],
        ];
        $cssVersion = crc32((string) file_get_contents(__DIR__ . '/assets/server-aliases.css'));
        $jsVersion  = crc32((string) file_get_contents(__DIR__ . '/assets/server-aliases.js'));

        echo '<meta name="adminer-server-aliases" content="'
            . h((string) json_encode($config, JSON_INVALID_UTF8_SUBSTITUTE)) . '">' . "\n";
        echo '<link rel="stylesheet" href="' . h($this->cssFile . '?v=' . $cssVersion) . '">' . "\n";
        echo script_src($this->jsFile . '?v=' . $jsVersion, true);
    }

    public function serverName(?string $server): string
    {
        $server = $server ?? '';

        return '<span class="server-aliases-name" title="' . h($server) . '">'
            . h($server) . '</span>';
    }
}
