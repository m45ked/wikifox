# Plugin do pomocy w obsłudze rozwijania [Wiktionary](pl.wiktionary.org)

Zestaw pomocnych do użytku narzędzi dla Firefox'a, utworzone na podstawie własnego
doświadczenia podczas wkładu do projektu.

## Zmiany

### [Wikisource](pl.wikisource.org)

1. Akcja menu kontekstowym "Utwórz opis dla wiktionary".
Formatuje on *Dane tekstu* do formatu [Szablon:źródło](https://pl.wiktionary.org/wiki/Szablon:%C5%BAr%C3%B3d%C5%82o).

### [Wikipedia](pl.wikipedia.org)

Zmiany

1. Dodano opcję menu po zaznaczeniu frafmentu artykułu *Kopiuj jako wikitext*.
1. Rozszerzenie dodaje opcję w menu kontekstowym na stronach "Utwórz opis referencji".
Formatuje on dane strony do formatu [Szablon:zWikiprojektu](https://pl.wiktionary.org/wiki/Szablon:zWikiprojektu).

Opcje

* Opcjonalne włączenie pochyłej czcionki w tytule.

### [Wiktionary](pl.wiktionary.org)

1. Wyszukiwanie bezwglęne – po zaznaczeniu tekstu, możliwe jest wywołanie
wyszukiwania bezpośrednio w DuckDuckGo oraz Google wg dokładnej frazy (z "").
1. Kopiwanie przykładu – przycisk akcji *Kopiuj*, kopiującego treści przykładu.
1. Pole z informacją o posiadanym źródle.
1. Automatyzacja opisu dla wklejania treści z tekstem "zWikiprojektu" w polu przykładów.

## Budowa i instalacja

## Środowisko

Rozszerzenie napisane jest w TypeScript'ie, wobec czego zakładam, że środowisko
posiada:

1. [npm](www.npmjs.com).
1. Wymagane biblioteki: `npm install typescript @types/firefox-webext-browser vite --save-dev`

Budowanie, po pobraniu źródeł: ``npm run build``.

Instalacja (na razie z [tymczasowym ID](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/)) odbywa się poprzez:

1. Wejście na stronę `about:debugging#/runtime/this-firefox`.
1. Wybrać *Tymczasowo wczytaj dodatek…*.
1. Wybrać `dist/manifest.json` z projektu.
