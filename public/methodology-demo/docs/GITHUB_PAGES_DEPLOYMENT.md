# GitHub Pages deployment

## Recommended repository settings

| Setting | Recommendation |
|---|---|
| Repository name | `fabin-aec-methodology-demo` |
| Description | `Interactive MSc demonstrator of normalized shared AEC data across architecture, structural engineering and construction.` |
| Visibility | Public, if the goal is a freely viewable academic portfolio site |
| Initialize with README | No — this package already contains `README.md` |
| Add `.gitignore` | No — the static package has no build output or dependencies |
| License | Choose “None”; `LICENSE-NOTE.md` preserves copyright until Fabin selects a license |

## Browser-only upload

1. Sign in to GitHub and choose **New repository**.
2. Enter `fabin-aec-methodology-demo`.
3. Choose the visibility.
4. Leave **Add a README**, **Add .gitignore** and **Choose a license** unset.
5. Create the empty repository.
6. Extract the delivered ZIP on your computer.
7. In the empty repository, choose **uploading an existing file** or
   **Add file → Upload files**.
8. Drag the extracted *contents*—`index.html`, `data/`, `css/`, `js/`, `docs/`,
   and the other root files—into the upload area. Do not upload the enclosing
   folder or the ZIP as the only repository file.
9. Commit the upload to `main`.

## Enable Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Select branch `main`.
4. Select folder `/(root)`.
5. Save and wait for GitHub to report the published URL.

Expected URL pattern:

```text
https://USERNAME.github.io/fabin-aec-methodology-demo/
```

For the expected account name, that becomes:

```text
https://fabingurung.github.io/fabin-aec-methodology-demo/
```

GitHub documents branch/folder publication in
[Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Why the project works under a repository subpath

- `index.html` is at the repository root.
- CSS and JavaScript references use `./css/...`, `./js/...` and `./data/...`.
- No root-relative `/css/...` or `/js/...` URL is used.
- No runtime fetch, API, environment variable, localhost URL or npm install is
  required.
- `.nojekyll` asks Pages to serve the static files without Jekyll processing.

## Post-deployment check

- Open the root URL and confirm the graph renders.
- Select Beam BC and confirm every section follows.
- Open local graph mode and change depth.
- Switch plan/elevation/3D views.
- Open the Engineering section and inspect BMD/SFD/AFD.
- Enable and reset the sandbox.
- Repeat once in a phone-sized browser window.

