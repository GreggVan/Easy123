#!/bin/sh
java -jar compiler.jar --js jquery-1.4.2.js  --js jquery-ui-1.8.13.custom.min.js  --js json2.js  --js jkarma.js  --js utils.js  --js jquery-css-transform.js  --js rotate3Di.js  --js emailHelperFunctions.js  --js emailClickHandlers.js  --js translate.js  --js voice.js  --js swfobject.js  --js contactsModule.js  --js main.js  --js emailModule.js  --js albumModule.js  --js chatModule.js  --js videoChatModule.js  --js screensaver.js  --js rtt/strophe.js  --js rtt/strophe.rtt.js  --js rtt/rtt.js  --js rtt/StropheFunctions.js  --js gallery.js  --js_output_file full.js
cat ../index.html > ../tmp
rm ../index.html
cat header.txt >> ../index.html
tail -n+52 ../tmp >> ../index.html
rm ../tmp
