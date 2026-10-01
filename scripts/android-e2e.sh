#!/usr/bin/env bash
# End-to-end check of the installed TimeZone Exchange APK on an Android emulator, driven over adb.
# Usage: D=emulator-5554 OUT=<results folder> bash scripts/android-e2e.sh
# Every check writes one PASS/FAIL line to $OUT/results.tsv and a screenshot to $OUT/screenshots.
export MSYS_NO_PATHCONV=1 PYTHONIOENCODING=utf-8
D=${D:-emulator-5554}
OUT=${OUT:-test-results/android}
PKG=space.manus.world_clock_app.t20260102193011
mkdir -p "$OUT/screenshots"
RES="$OUT/results.tsv"
printf "id\tresult\tcheck\tdetail\n" > "$RES"
UI="$OUT/.ui.xml"

dump() { adb -s $D shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1; adb -s $D exec-out cat /sdcard/ui.xml > "$UI"; }
# All visible labels (text or accessibility description), one per line
labels() { dump; python - "$UI" <<'PY'
import sys,re,html
x=open(sys.argv[1],encoding='utf-8').read()
for n in re.findall(r'<node [^>]*>',x):
    for a in ('text','content-desc'):
        v=re.search(a+r'="([^"]*)"',n).group(1)
        if v.strip(): print(html.unescape(v))
PY
}
# Centre of the first node whose label fully matches a regex
xy() { dump; python - "$1" "$UI" <<'PY'
import sys,re,html
pat=sys.argv[1]; x=open(sys.argv[2],encoding='utf-8').read()
for n in re.findall(r'<node [^>]*>',x):
    t=html.unescape(re.search(r' text="([^"]*)"',n).group(1)); d=html.unescape(re.search(r'content-desc="([^"]*)"',n).group(1))
    if re.fullmatch(pat,t) or re.fullmatch(pat,d):
        b=list(map(int,re.findall(r'\d+',re.search(r'bounds="([^"]*)"',n).group(1))))
        print((b[0]+b[2])//2,(b[1]+b[3])//2); break
PY
}
tap() { local p; p=$(xy "$1"); [ -z "$p" ] && { echo "  (not found: $1)"; return 1; }; adb -s $D shell input tap $p; sleep ${2:-1.2}; }
longpress() { local p; p=$(xy "$1"); [ -z "$p" ] && return 1; adb -s $D shell input swipe $p $p 1200; sleep 1.5; }
has() { labels | grep -qE -- "$1"; }
value_after() { labels | grep -A${2:-3} -E -- "$1" | tail -n +2; }
shot() { adb -s $D exec-out screencap -p > "$OUT/screenshots/$1.png"; }
check() { # id, description, command...
  local id=$1 desc=$2; shift 2
  if "$@"; then r=PASS; else r=FAIL; fi
  printf "%s\t%s\t%s\t%s\n" "$id" "$r" "$desc" "${DETAIL:-}" >> "$RES"; echo "$r  $id  $desc ${DETAIL:+— $DETAIL}"
  shot "$id"; DETAIL=""
}
top() { for i in 1 2 3 4 5; do adb -s $D shell input swipe 540 600 540 2000 150; done; sleep 0.8; }
down() { adb -s $D shell input swipe 540 1900 540 ${1:-700} 400; sleep 0.8; }
crashed() { adb -s $D logcat -d -b crash | grep -q "Process: $PKG"; }

# ---------- fresh start ----------
adb -s $D logcat -b crash -c
adb -s $D shell pm clear $PKG >/dev/null
adb -s $D shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1
sleep 8

t01() { ! crashed && has "^World Clock$"; }
check T01 "App opens from launcher without crashing, World Clock screen shows" t01

t02() { has "^No timezones added yet$" && has "^Tap the \+ button to add a timezone$"; }
check T02 "First launch shows the empty state with a hint to tap +" t02

# ---------- Add city ----------
t03() { adb -s $D shell input tap 943 2032; sleep 2; has "^Add Timezone$"; }
check T03 "+ button opens Add Timezone" t03

t04() { dump; p=$(python - "$UI" <<'PY'
import sys,re
x=open(sys.argv[1],encoding='utf-8').read()
# back arrow = first clickable node in the header row
for n in re.findall(r'<node [^>]*>',x):
    if 'clickable="true"' in n:
        b=list(map(int,re.findall(r'\d+',re.search(r'bounds="([^"]*)"',n).group(1))))
        if b[1]<300 and b[0]<150: print((b[0]+b[2])//2,(b[1]+b[3])//2); break
PY
); [ -n "$p" ] && adb -s $D shell input tap $p; sleep 1.5; has "^World Clock$" && ! has "^Add Timezone$"; }
check T04 "Back arrow on Add Timezone returns to World Clock" t04

t05() { adb -s $D shell input tap 943 2032; sleep 2; tap "Search city, country or time zone .*" 1; adb -s $D shell input text "sao"; sleep 2; has "^São Paulo$"; }
check T05 "Search without accents ('sao') finds São Paulo" t05

t06() { tap "São Paulo" 3; has "^World Clock$" && has "^São Paulo$"; }
check T06 "First tap on a result (keyboard open) adds the city and returns" t06

t07() { adb -s $D shell input tap 943 2032; sleep 2; tap "Search city, country or time zone .*" 1; adb -s $D shell input text "lond"; sleep 1.5
  has "^London$" || return 1; dump; p=$(python - "$UI" <<'PY'
import sys,re
x=open(sys.argv[1],encoding='utf-8').read()
for n in re.findall(r'<node [^>]*>',x):
    if 'clickable="true"' in n:
        b=list(map(int,re.findall(r'\d+',re.search(r'bounds="([^"]*)"',n).group(1))))
        if 300<b[1]<450 and b[0]>850: print((b[0]+b[2])//2,(b[1]+b[3])//2); break
PY
); [ -n "$p" ] && adb -s $D shell input tap $p; sleep 1.5; has "^Search city, country or time zone .*$" && has "^ASIA$" && has "^Time zones$"; }
check T07 "Clear (x) button empties the search and shows the full list" t07

add_city() { adb -s $D shell input tap 943 2032; sleep 2; tap "Search city, country or time zone .*" 1; adb -s $D shell input text "$1"; sleep 1.5; tap "$2" 3; }
t08() { tap "Tokyo" 3; add_city tokyo Tokyo; n=$(labels | grep -cx "Tokyo"); DETAIL="Tokyo rows after adding it twice: $n"; has "^World Clock$" && [ "$n" -eq 1 ]; }
check T08 "Picking a city already on the list does not add a duplicate" t08

t08b() { add_city bangkok Bangkok; sleep 8; n=$(labels | grep -cx "= 1 USD"); DETAIL="rows with a rate: $n of 3"; has "^Bangkok$" && [ "$n" -eq 3 ] && ! labels | grep -qx "No rate"; }
check T08b "Each city shows its time, date and exchange rate against USD" t08b

t08c() { adb -s $D shell input tap 943 2032; sleep 2; tap "Time zones" 1.5 && has "^Pacific Time$" || return 1; tap "Search city, country or time zone .*" 1; adb -s $D shell input text "mst"; sleep 1.5; ok=1; has "^Mountain Time$" && has "^Arizona Time$" && ok=0; shot T08c-mst; adb -s $D shell input keyevent 4; sleep 0.8; has "^World Clock$" || { adb -s $D shell input keyevent 4; sleep 1.5; }; has "^World Clock$" && return $ok; }
check T08c "Time zones tab lists named zones; searching 'mst' offers both Mountain Time and Arizona's MST" t08c

t08d() { add_city hkt "Hong Kong Time"; sleep 3; has "^Hong Kong Time$" && labels | grep -q "HKD$"; }
check T08d "Adding a time zone by its short name (HKT) puts it on World Clock with its currency" t08d

t09() { adb -s $D shell input swipe 540 700 540 1600 500; sleep 3; ! crashed && has "^World Clock$"; }
check T09 "Pull down to refresh works" t09

t10() { longpress "São Paulo" && has "^Delete Timezone$" && tap "CANCEL" && has "^São Paulo$"; }
check T10 "Long-press → Cancel keeps the city" t10

# ---------- Meeting ----------
# Meeting time of the first row (You) and of every row, as shown above each city's hours
you_time() { labels | grep -E "^[0-9]{1,2}:[0-9]{2}( AM| PM)? – " | head -1 | sed 's/ – .*//'; }
all_times() { labels | grep -E "^[0-9]{1,2}:[0-9]{2}( AM| PM)? – " | tr '\n' '|'; }
header() { labels | grep -E "20[0-9]{2} · [0-9]" | head -1; }
mins() { python -c "import sys,re;m=re.match(r'(\d+):(\d+)(?: (AM|PM))?',sys.argv[1]);h,mi,ap=int(m[1]),int(m[2]),m[3];h=h%12+(12 if ap=='PM' else 0) if ap else h;print(h*60+mi)" "$1"; }
# Vertical centre of the You row's hour strip, for dragging it sideways
strip_y() { xy "You · .* [0-9]{1,2}:00( AM| PM)?" | cut -d' ' -f2; }
drag() { local y; y=$(strip_y); [ -z "$y" ] && return 1; adb -s $D shell input swipe $1 $y $2 $y 500; sleep 2; }

t11() { tap "Meeting" 2.5; has "^Plan a Meeting$" && has "^SUGGESTED TIMES$" && has "^You · " && has "^Bangkok$"; }
check T11 "Meeting tab opens with suggestions and a timeline row for You and each city" t11

# The suggestion that suits the most people: "everyone" first, else the highest "N of M"
best_chip() { python -c "
import sys,re
best=None
for line in sys.stdin.read().splitlines():
    m=re.search(r'(\d+) of \d+$',line)
    n=999 if line.endswith('everyone') else (int(m.group(1)) if m else -1)
    if best is None or n>best[0]: best=(n,line)
print(best[1] if best else '')"; }
t12() { chips=$(labels | grep -E "^[0-9]{1,2}:[0-9]{2}( AM| PM)?, (Morning|Midday|Afternoon|Evening) · "); a=$(you_time); best=$(printf '%s\n' "$chips" | best_chip); DETAIL="suggestions: $(printf '%s' "$chips" | tr '\n' '|') → meeting starts $a"; [ "$(printf '%s\n' "$chips" | grep -c .)" -ge 2 ] && [ "${best%%,*}" = "$a" ]; }
check T12 "Several suggestions across the day; the Meeting opens on the one that suits the most people" t12

t13() { a=$(you_time); ra=$(all_times); drag 300 900; b=$(you_time); rb=$(all_times); m=$(mins "$b"); DETAIL="$a → $b"; [ -n "$b" ] && [ "$a" != "$b" ] && [ $((m % 15)) -eq 0 ] && [ "$ra" != "$rb" ]; }
check T13 "Dragging the hours to the right moves the meeting earlier, snapped to 15 minutes, every city updates" t13

t14() { a=$(you_time); drag 800 450; b=$(you_time); DETAIL="$a → $b"; [ -n "$b" ] && [ "$(mins "$b")" -gt "$(mins "$a")" ] && [ $(( $(mins "$b") % 15 )) -eq 0 ]; }
check T14 "Dragging the hours to the left moves the meeting later, snapped to 15 minutes" t14

t15() { s=$(labels | grep -E "^[0-9]{1,2}:[0-9]{2}( AM| PM)?, (Morning|Midday|Afternoon|Evening) · " | head -1); tap "$(printf '%s' "$s" | sed 's/[.()+*?]/\\&/g')" 2; a=$(you_time); DETAIL="suggestion ${s%%,*} → start $a"; [ -n "$s" ] && [ "${s%%,*}" = "$a" ]; }
check T15 "Tapping a suggested time moves the meeting to it" t15

t16() { cell=$(labels | grep -E "^You · .* [0-9]{1,2}:00( AM| PM)?$" | sed -n 2p); tap "$(printf '%s' "$cell" | sed 's/[.()+*?]/\\&/g')" 2; b=$(you_time); want=$(echo "$cell" | grep -oE "[0-9]{1,2}:00( AM| PM)?$"); DETAIL="cell '$cell' → start $b"; [ -n "$want" ] && [ "$b" = "$want" ]; }
check T16 "Tapping an hour in the timeline moves the meeting to that hour" t16

t17() { p=$(labels | grep -E "^[A-Z][a-z]{2}, [0-9]{1,2}, [A-Z][a-z]{2}$" | sed -n 3p); tap "$p" 1.5; a=$(header); DETAIL="tapped '$p' → $a"; d=$(echo "$p" | cut -d, -f2 | tr -d ' '); echo "$a" | grep -q " $d 20"; }
check T17 "Tapping a date chip selects that date" t17

t18() { tap "Today, .*" 1; ok=0; for pair in "30 min meeting:30 min" "45 min meeting:45 min" "1h 30m meeting:1h 30m" "2h meeting:2h" "1h meeting:1h"; do tap "${pair%%:*}" 0.8 || return 1; header | grep -q "· ${pair#*:}" || { ok=1; DETAIL="$DETAIL ${pair#*:}-missing"; }; done; ! crashed && return $ok; }
check T18 "Duration chips change the meeting length" t18

t19() { tap "Meeting title \(optional\)" 1 || { down 600; tap "Meeting title \(optional\)" 1; }; adb -s $D shell input text "Board%scall"; adb -s $D shell input keyevent 111; sleep 1; has "^Board call$"; }
check T19 "Meeting title can be typed and shows on the meeting card" t19

t20() { top; tap "Add a city" 2 && has "^Add Timezone$" && { adb -s $D shell input keyevent 4; sleep 1.5; has "^Plan a Meeting$"; }; }
check T20 "'Add a city' button on the meeting card opens Add Timezone" t20

t21() { for i in 1 2 3; do down 400; done; tap "Share" 2; has "^MEETING TIMES$" && has "^Board call$" && has "^Share image$" || { DETAIL="share preview did not open"; return 1; }; shot T21-share-preview; tap "Share as text" 3; has "^Sharing text$" && labels | grep -q "Board call" ; }
check T21 "Share opens a preview card; Share as text opens the share sheet with the meeting text" t21

t22() { adb -s $D shell input keyevent 4; sleep 1.5; has "^Share image$" && { tap "Close" 1.5; }; tap "Add to calendar" 5; a=$(adb -s $D shell dumpsys activity activities | grep -m1 topResumedActivity); DETAIL=$(echo "$a" | grep -oE "[a-z]+(\.[a-z]+)+/" | head -1); echo "$a" | grep -qE "calendar|chrome|browser"; }
check T22 "Add to calendar hands off to Google Calendar / browser" t22

fg() { adb -s $D shell dumpsys activity activities | grep -m1 topResumedActivity | grep -q "$PKG"; }
t23() { for i in 1 2 3 4; do fg && break; adb -s $D shell input keyevent 4; sleep 1.5; done
  fg || { DETAIL="Calendar's first-run screen kept Back; returned with the app icon"; adb -s $D shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 3; }
  fg || { DETAIL="could not return to the app"; return 1; }
  has "^Board call$|^Share$" || { DETAIL="app returned but Meeting state was lost"; return 1; }
  has "^Share$" || { for i in 1 2 3 4; do down 400; done; }; tap "Share" 2; tap "Share image" 5; has "^Sharing image$"; }
check T23 "Returning from Calendar keeps the Meeting as it was; Share image (from the preview) opens the share sheet" t23

t24() { adb -s $D shell input keyevent 4; sleep 1.5; has "^Share image$" && adb -s $D shell input keyevent 4 && sleep 1; fg || adb -s $D shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 1; tap "Meeting" 1.5; top
  # Fast fling back to the start of the date strip, then tap a chip straight away
  y=$(xy "Today, .*" | cut -d' ' -f2); adb -s $D shell input swipe 900 $y 200 $y 120; sleep 0.3; adb -s $D shell input swipe 200 $y 1000 $y 80; sleep 0.2
  p=$(labels | grep -E "^[A-Z][a-z]{2}, [0-9]{1,2}, [A-Z][a-z]{2}$" | sed -n 2p); tap "$p" 1.5; a=$(header); d=$(echo "$p" | cut -d, -f2 | tr -d ' '); DETAIL="tapped '$p' → $a"; echo "$a" | grep -q " $d 20"; }
check T24 "Date chips still respond to the first tap right after a fast swipe to the strip edge" t24

t25() { tap "World Clock" 1.5; longpress "Bangkok" && tap "DELETE" 2; tap "Meeting" 2; top; DETAIL="rows: $(all_times)"; ! crashed && has "^Plan a Meeting$" && ! has "^Bangkok$"; }
check T25 "Removing a city on World Clock removes its Meeting row without crashing" t25

# ---------- Settings ----------
t26() { tap "Settings" 2; tap "EUR" 1; tap "World Clock" 5; labels | grep -q "= 1 EUR" && ! labels | grep -q "= 1 USD"; }
check T26 "Base currency EUR applies on World Clock" t26

t27() { ok=0; for c in GBP JPY CNY HKD USD; do tap "Settings" 1.5; tap "$c" 1; tap "World Clock" 5; labels | grep -q "= 1 $c" || { DETAIL="$DETAIL $c-missing"; ok=1; }; done; return $ok; }
check T27 "Every other base currency (GBP JPY CNY HKD USD) applies" t27

t28() { tap "Settings" 1.5; tap "24 Hour" 1; tap "World Clock" 2; ! labels | grep -qE "[0-9].{1,3}(AM|PM)$" && labels | grep -qE "^[0-9]{2}:[0-9]{2}$"; }
check T28 "24 Hour time format applies" t28

t29() { tap "Settings" 1.5; tap "12 Hour" 1; tap "World Clock" 2; labels | grep -qE "^[0-9]{1,2}:[0-9]{2}.{1,3}(AM|PM)$"; }
check T29 "12 Hour time format applies" t29

t30() { ok=0; for f in "DD/MM/YYYY:^[0-9]{2}/[0-9]{2}/20[0-9]{2}$" "YYYY-MM-DD:^20[0-9]{2}-[0-9]{2}-[0-9]{2}$" "MM/DD/YYYY:^[0-9]{2}/[0-9]{2}/20[0-9]{2}$"; do tap "Settings" 1.5; tap "${f%%:*}" 1; tap "World Clock" 2; labels | grep -qE "${f#*:}" || { ok=1; DETAIL="$DETAIL ${f%%:*}"; }; done; return $ok; }
check T30 "All three date formats apply" t30

t30b() { tap "Settings" 1.5; for i in 1 2 3; do down 500; done; has "^APP UPDATES$" || return 1; tap "Check for updates" 1; for i in $(seq 1 20); do r=$(labels | grep -E "^You have the latest version\.$|^A new version has downloaded\.$|^Couldn't check" | head -1); [ -n "$r" ] && break; sleep 1; done; DETAIL="$r"; shot T30b-updates; top; echo "$r" | grep -qE "latest version|has downloaded"; }
check T30b "Settings 'Check for updates' asks Expo's update service and reports the answer" t30b

px() { adb -s $D exec-out screencap -p > "$OUT/.px.png"; python -c "from PIL import Image;im=Image.open(r'$(cygpath -m "$OUT")/.px.png').convert('RGB');print(sum(im.getpixel((540,1500))))"; }
# The theme takes about 0.6-2 s to repaint after a tap, so wait up to 5 s for it.
until_px() { local want=$1 v; for i in $(seq 1 10); do v=$(px); if { [ "$want" = dark ] && [ "$v" -lt 200 ]; } || { [ "$want" = light ] && [ "$v" -gt 600 ]; }; then echo "$v"; return 0; fi; sleep 0.3; done; echo "$v"; return 1; }
t31() { tap "Settings" 1.5; tap "Dark" 0.3; d=$(until_px dark); r1=$?; tap "Light" 0.3; l=$(until_px light); r2=$?; DETAIL="brightness dark=$d light=$l"; [ $r1 -eq 0 ] && [ $r2 -eq 0 ]; }
check T31 "Dark and Light themes apply" t31

t32() { adb -s $D shell cmd uimode night yes >/dev/null; sleep 1; tap "Auto" 0.3; a=$(until_px dark); r1=$?; adb -s $D shell cmd uimode night no >/dev/null; b=$(until_px light); r2=$?; DETAIL="system dark=$a system light=$b"; [ $r1 -eq 0 ] && [ $r2 -eq 0 ]; }
check T32 "Auto theme follows the phone's dark / light setting" t32

# ---------- Persistence ----------
t33() { tap "EUR" 1; tap "24 Hour" 1; adb -s $D shell am force-stop $PKG; adb -s $D shell monkey -p $PKG -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; sleep 9
  has "^Tokyo$" && labels | grep -q "= 1 EUR" && labels | grep -qE "^[0-9]{2}:[0-9]{2}$"; }
check T33 "Cities and settings survive closing and reopening the app" t33

# ---------- Empty state ----------
t34() { for c in "Tokyo" "Bangkok" "São Paulo" "London"; do has "^$c$" && longpress "$c" && tap "DELETE" 1.5; done
  while n=$(labels | grep -E "^[A-Z][^,]+, .* • GMT" | head -1) && [ -n "$n" ]; do longpress "$(printf '%s' "$n" | sed 's/[.()+*?]/\\&/g')" && tap "DELETE" 1.5 || break; done
  has "^No timezones added yet$"; }
check T34 "Deleting every city shows the empty state" t34

t35() { tap "Meeting" 2; ! crashed && has "Add a city"; }
check T35 "Meeting with no cities shows its empty state and an Add a city button" t35

t36() { tap "Add a city" 2; has "^Add Timezone$" && tap "Tokyo" 3 && tap "Meeting" 2 && has "^Tokyo$"; }
check T36 "Add a city from the empty Meeting screen works" t36

t37() { ! crashed; }
check T37 "No crash recorded in the Android crash log during the whole run" t37

echo; echo "PASS: $(grep -c $'\tPASS\t' "$RES")  FAIL: $(grep -c $'\tFAIL\t' "$RES")"
