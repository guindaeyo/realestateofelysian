ELYSIAN ESTATES — GitHub + Vercel static website

Upload index.html, style.css, script.js, data.json and favicon.svg to the root of your GitHub repository.

Admin: select a house or out-of-town deed and fill in the new forum-thread URL field (https://...). Save the record, then publish data.json to GitHub with a fine-grained token with Contents: Read and Write. The external link button appears in the record details only when the URL is filled in. This also applies to the Other category.

Updated styling vertically centers icons in the summary counters. Every 60 seconds the site checks data.json for newer published information. No image is shown for Other houses.

Important: the client-side admin password is not secure server-side authentication; GitHub repository permissions control actual data publication. Never commit your GitHub token.
