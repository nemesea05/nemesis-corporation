# Deploying Nemesis Corporation to Vercel

This is a static site. There is no build step and nothing to install.

## Option A: through GitHub (recommended, updates itself)
1. Create a new GitHub repository and upload everything in this folder to its root.
2. On vercel.com choose **Add New, Project**, then import that repository.
3. Name the project **nemesis-corporation**.
4. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Click **Deploy**.
5. Every time you push a change to GitHub, Vercel publishes it automatically.

## Option B: from your computer
1. Install Node.js, then open a terminal in this folder.
2. Run `npx vercel` and sign in. Accept the defaults. When asked for the project name, use `nemesis-corporation`.
3. Run `npx vercel --prod` to publish.

## Your web address
Vercel gives you `https://<project-name>.vercel.app`. With the project named `nemesis-corporation`
the site uses **https://nemesis-corporation.vercel.app**, and that address is already set in every page,
the sitemap and robots.txt.

If Vercel gives you a different address (the name can be taken), or you later connect your own domain
(Project, Settings, Domains), run this once from this folder so the pages, sitemap and social previews match:

    node set-domain.mjs https://your-real-address

(`set-domain.mjs` and this file are not published; `.vercelignore` keeps them off the live site.)

## After it is live
- Open the About page and check the map pin is on your office. If not, in Google Maps choose Share,
  then Embed a map, and replace the `src` of the iframe in index.html, about.html and community.html.
- Add your site address to your Google Business Profile as the website, and use it for the "Learn more"
  button on your posts.
- Optional: add the site in Google Search Console and submit `/sitemap.xml`.
- Portrait: save the founder photo as `assets/john-lloyd-lacumba.jpg` (4:5 ratio) and redeploy.
