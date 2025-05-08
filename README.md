# startpage-ng

Simple HTML Startpage that displays the time, date, weather, a searchbar and customizable (plus hideable) cards.

It is the second iteration of this kind of startpage I made ([see here](https://codeberg.org/b01/startpage)). 
This time the page can be used and configured without any external dependencies like python/jinja2 etc.
Settings can be changed within the startpage and the configuration is stored in LocalStorage of the browser. To not lose any data, one can also export the configuration (as JSON text). This JSON can then be transferred to another browser and imported again.

One major advantage of this system is, that the startpage can now be hosted on Codeberg pages without leaking any private information.

## Demo

The code of this repository is hosted here: [https://b01.codeberg.page/startpage-ng/](https://b01.codeberg.page/startpage-ng/)

## Startpage Configuration

The whole configuration of startpage-ng can be exported to JSON and edited there. In fact, in order to create custom cards, you **must** edit the JSON and import it after, as I did not want to increase complexity of the HTML/Javascript only to edit cards dynamically (which one seldom uses normally).

Below is an example configuration, containing two cards (one normal, one hideable) with three links each. It uses duckduckgo as standard search, hideable cards are hidden.

- [ ] TODO: make weather point configurable!

**Please note, that all settings are required!**

```json
{
  "version": 1,
  "timestamp": 1746735739717,
  "searchEngineURL": "https://duckduckgo.com/?q=",
  "linkGroups": [
    {
      "id": "group1",
      "name": "General",
      "isWorkGroup": false,
      "links": [
        {
          "name": "Google",
          "url": "https://www.google.com",
          "icon": "🔍"
        },
        {
          "name": "YouTube",
          "url": "https://www.youtube.com",
          "icon": "📺"
        },
        {
          "name": "Wikipedia",
          "url": "https://www.wikipedia.org",
          "icon": "📚"
        }
      ]
    },
    {
      "id": "group2",
      "name": "Work",
      "isWorkGroup": true,
      "links": [
        {
          "name": "Gmail",
          "url": "https://mail.google.com",
          "icon": "📧"
        },
        {
          "name": "Drive",
          "url": "https://drive.google.com",
          "icon": "📁"
        },
        {
          "name": "Calendar",
          "url": "https://calendar.google.com",
          "icon": "📅"
        }
      ]
    }
  ],
  "workCardsVisible": false
}
```

Lets dive into the different section:

### Search Engine
The search engine is configured by setting a simple link, **including** the required parameters to work (so for example **q=** for DDG )
```json
"searchEngineURL": "https://duckduckgo.com/?q="
```

### Visibility of Cards
Set this to true/false to show/hide cards. Does not really matter much, as it can then also be set with one click via the checkbox on the site itself.

```json
"workCardsVisible": false
```

### Cards

This section defines new cards to display. Each card has the following attributes:
- `id`: a unique alphanumeric id
- `name`: the name of the card (that is displayed)
- `isWorkGroup`: if it is hideable
- `links`: the links the card shows (see next section)

```json
"linkGroups": [
    {
      "id": "group1",
      "name": "General",
      "isWorkGroup": false,
      "links": [
        {
            ...links...
        }
      ]
    },
    ...more cards...
]
```

### Links

A link has the following attributes:
- `name`: The name of the url
- `url`: The url
- `icon`: The icon (an emoji)


```json
"links": [
    {
        "name": "Gmail",
        "url": "https://mail.google.com",
        "icon": "📧"
    },
    ...more links...
]
```

## Build

Building your own version is simple:

1. Clone this repository
2. Edit the files to your liking
3. Host them on any webserver or Codeberg/Github pages

If you want to minify the sources, you can do the following between steps 2 and 3 above:
1. Download [minify](https://github.com/tdewolff/minify) from Github Releases
2. Put the file into the `build` folder
3. run `build.sh` within the build folder <br> this generates minified versions of all three files and also updates the html to use the smaller files.