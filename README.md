# startpage-ng

Simple HTML Startpage that displays the time, date, weather, a searchbar and customizable (plus hideable) cards.

It is the second iteration of this kind of startpage I made ([Startpage](https://github.com/b-01/startpage)). 
This time the page can be used and configured without any external dependencies like python/jinja2 etc.
Settings can be changed directly within the startpage and the configuration is stored in LocalStorage of the browser. To not lose any data, one can also export the configuration (as JSON text). This JSON can then be transferred to another browser and imported again.

Startpage-ng is designed, without any dependencies in the hopes of near instant loading times. The only external request the site generates is to [https://corsproxy.io](https://corsproxy.io) in order to load the weather data. Weather is also cached within LocalStorage for the rest of the day, so startpage-ng should only load weather data once a day. 

One major advantage of this system is, that the startpage can now be hosted on Codeberg pages without leaking any private configuration.

**Please note:**
 - Hideable cards are still present in the DOM and only hidden via CSS. So any tool that inspects the dynamically generated HTML (e.g. locally installed security software, browser extensions etc.) might still be able to see the links and act acordingly.

## Demo

The minified code of this repository is hosted here: [https://b-01.github.io/startpage-ng/](https://b-01.github.io/startpage-ng/)

If you want to use the startpage-ng as is without any modifications, you can just use this link and be done. Personal configuration is stored in the browser and never transmitted.

## Startpage Configuration

The whole configuration of startpage-ng can be exported to JSON and edited there. In fact, in order to create custom cards, you **must** edit the JSON and import it after, as I did not want to increase complexity of the HTML/Javascript only to edit cards dynamically (which one seldom uses normally).

Below is an example configuration, containing two cards (one normal, one hideable) with three links each. It uses duckduckgo as standard search, hideable cards are hidden.

**Please note:**
- Import settings requires that all settings are present

```json
{
  "version": 1,
  "timestamp": 1746950766786,
  "searchEngineURL": "https://duckduckgo.com/?q=",
  "workCardsVisible": true,
  "weatherPointID": "2193",
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
  ]
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

### Weather Information
**Important Note**: Weather functionality is only available for locations within Austria, as startpage-ng uses data from GeoSphere Austria's internal API.

Weather data is loaded from Austria's national service for geology, geophysics, climate and meteorology (GeoSphere Austria). By default, the weather data for Vienna (Point ID 2193) is displayed.

To configure weather for a different Austrian location:

1. Visit the [GeoSphere weather forecast site](https://www.geosphere.at/en/maps/weather-forecast)
2. Search for your desired location within Austria
3. Look at the resulting URL and extract the `point_id` parameter
4. Enter this ID in your startpage-ng configuration

Example:
- Search for "Graz" and hit Enter
- Resulting URL: https://www.geosphere.at/en/maps/weather-forecast#tab=chart&point_id=1531
- Point ID is 1531
- Enter 1531 into the configuration of startpage-ng

```json
"weatherPointID": "1531"
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
2. Edit the files to your liking ([src/](src/) folder)
3. Host them on any webserver or Codeberg/Github pages

If you want to minify the sources, you can do the following between steps 2 and 3 above:
1. Download [minify](https://github.com/tdewolff/minify) from Github Releases
2. Put the file into the [build/](build/) folder
3. Run [build.sh](build/build.sh) within the build folder <br> This generates minified versions of all three files and also updates the HTML to use the smaller files.
