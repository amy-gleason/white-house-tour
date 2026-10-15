# White House Tour Guide

A phone-friendly guide for leading West Wing and Eisenhower Building tours.

Live app: https://amy-gleason.github.io/white-house-tour/

**You don't need to know any code to update a tour.** Every tour is a plain text file in the [`tours`](tours) folder. Edit the file and the app updates itself.

## Edit a talking point

1. Open the [`tours`](tours) folder and click the tour you want, like `west-wing.md`.
2. Click the **pencil icon** (top right of the file).
3. Find the stop and change the text.
4. Click **Commit changes** at the top, then **Commit changes** again in the pop-up.

The live app updates in a minute or two. Refresh the page on your phone to see it.

## How a tour file is laid out

```
# 🏛️ West Wing Tour                    <- the tour's name, shown at the top of the app

## 🌹 ROSE GARDEN                       <- a stop (one screen in the app)

### 🔴 NOTE:                            <- a red box
The Rose Garden may be closed due to construction.

### What to Say:                        <- a list of talking points
- "The Rose Garden was first created in 1913..."
- "Nixon's daughter Tricia was married here in 1971."

### 🗺️ Wayfinding:                      <- a green box
➡️ Turn back the way you came.
```

The rules:

| You type | You get |
| --- | --- |
| `## 🌹 STOP NAME` | A new stop. The emoji becomes the big icon. Stops appear in the order they're written. |
| `### What to Say:` (or any heading) | A list of talking points with a red heading. |
| `- some text` | One talking point. |
| `### 🗺️ ...` | Green directions box. |
| `### 💡 ...` | Yellow tip box. |
| `### 🔴 ...` | Red warning box. |
| `**words**` | **Bold** words. |
| `<!-- note to self -->` | A hidden comment. Guides never see it. |

The box color comes from the **first emoji** of the `###` line. So `### 💡 Photo Tip:` and `### 💡 Phone Tip:` are both yellow.

## Add a stop

Copy an existing stop (from its `##` line down to just before the next `##`). Paste it where the new stop belongs and change the words. The "3 of 30" counter updates on its own.

## Remove or reorder stops

Delete the stop's lines, or cut and paste them somewhere else in the file.

## Add a whole new tour

1. In the `tours` folder, click **Add file > Create new file**.
2. Name it something like `grounds.md`.
3. Start it with a `#` line for the tour name, then add stops:
   ```
   # 🌳 Grounds Tour

   ## ⛲ NORTH FOUNTAIN
   ### What to Say:
   - "First talking point."
   ```
4. Open [`tours/home.md`](tours/home.md) and add a line for the new tour's button:
   ```
   - [🌳 Grounds Tour](grounds.md)
   ```

The buttons on the home screen alternate red and blue.

## If something looks wrong

* **The app says "Couldn't load the tour files."** A file listed in `home.md` doesn't exist. Check the spelling of the file name.
* **A stop is missing.** Make sure its line starts with `##` and a space.
* **Text landed in the wrong box.** Check the `###` line above it.
* **Changes aren't showing.** Wait a couple of minutes and refresh. You can check progress under the **Actions** tab.

Every change is saved in the file's **History**, so nothing is ever really lost.

## For the rare code change

* `index.html` is the page frame. You'll almost never touch it.
* `css/style.css` holds colors, fonts and spacing.
* `js/app.js` reads the tour files and draws the screens.

To try the app on your own computer, run `python3 -m http.server` in this folder and open http://localhost:8000. Opening `index.html` directly won't work, because browsers block it from reading the tour files.

The app loads every tour as soon as it opens, so it keeps working if your signal drops mid-tour.
