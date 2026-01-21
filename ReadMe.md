Plugin do pomocy w obsłudze rozwijania pl.wiktionary.org
===

Zestaw pomocnych do użytku narzędzi dla Firefox'a, utworzone na podstawie własnego
doświadczenia podczas wkładu do projektu.

Cytowanie wikisource
---

Rozszerzenie dodaje opcję w menu kontekstowym na stronach `https://pl.wikisource.org/wiki/*`
"Utwórz opis dla wiktionary".
Formatuje on *Dane tekstu* do formatu [Szablon:źródło](https://pl.wiktionary.org/wiki/Szablon:%C5%BAr%C3%B3d%C5%82o).

Cytowanie wikipedii
---

Rozszerzenie dodaje opcję w menu kontekstowym na stronach `https://pl.wikipedia.org/w/indeh.php?oldid=*`
"Utwórz opis referencji".
Formatuje on dane strony do formatu [Szablon:zWikiprojektu](https://pl.wiktionary.org/wiki/Szablon:zWikiprojektu).

Opcje
* Opcjonalne włączenie pochyłej czcionki w tytule.

Wyszukiwanie bezwglęne
---

Na stronach `https://pl.wiktionary.org/wiki/*`, po zaznaczeniu tekstu, możliwe
jest wywołanie wyszukiwania bezpośrednio w DuckDuckGo oraz Google wg dokładnej
frazy (z "").

Budowa i instalacja
===

Środowisko
---

Rozszerzenie napisane jest w TypeScript'ie, wobec czego zakładam, że środowisko
posiada:

1. [npm](www.npmjs.com).
1. Wymagane biblioteki: `npm install typescript @types/firefox-webext-browser --save-dev`

Budowanie, po pobraniu źródeł: ``npm run build``.

Instalacja (na razie z [tymczasowym ID](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/)) odbywa się poprzez:

* Wejście na stronę `about:debugging#/runtime/this-firefox`.
* Wybrać *Tymczasowo wczytaj dodatek…*.
* Wybrać `dist/manifest.json` z projektu.