# Bookshelf API

The source in this directory is deployed as a workbook-bound Apps Script web app. The endpoint is `GET /exec?route=v1%2Fbookshelf`.

1. In Apps Script, open **Project settings → Script properties** and set `WORKBOOK_ID` to the workbook ID. The script reads the `Bookshelf` tab through the Google Sheets API with read-only access.
2. Copy `Code.gs` and `appsscript.json` from this directory into the Apps Script editor. To view the manifest, enable **Show "appsscript.json" manifest file in editor** in Project settings.
3. Open **Deploy → Manage deployments**, edit the existing web app, and select **New version**. Deploy it as the owner with access set to **Anyone**. Test the existing URL without signing in.

Set `NEXT_PUBLIC_APPS_SCRIPT_URL` to the web app's base `/exec` URL in `.env.local` for local development and in GitHub Actions repository variables for Pages builds. The client appends the route. Updating the existing Apps Script deployment preserves its URL. If you create a different deployment, update the variable and rebuild the site.
