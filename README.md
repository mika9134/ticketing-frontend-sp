# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```
## Folder structure
```
    ├───src
    │   ├───actions
    │   ├───apis
    │   ├───lib
    │   │   ├───charts
    │   │   └───uis
    │   ├───routes
    │   │   ├───(auth)
    │   │   │   └───register
    │   │   ├───(dashboard)
    │   │   │   ├───dashboard
    │   │   │   ├───employees
    │   │   │   ├───products
    │   │   │   └───topPerformance
    │   │   ├───(sales)
    │   │   │   ├───point-of-sale
    │   │   │   └───sales
    │   │   ├───address
    │   │   ├───catagories
    │   │   ├───classification
    │   │   ├───complaints
    │   │   ├───components
    │   │   │   ├───buttons
    │   │   │   ├───calendar
    │   │   │   ├───cards
    │   │   │   ├───charts
    │   │   │   ├───endPointModules
    │   │   │   │   ├───addresses
    │   │   │   │   ├───catagories
    │   │   │   │   ├───classifications
    │   │   │   │   ├───complaints
    │   │   │   │   ├───dashboard
    │   │   │   │   ├───Deposit
    │   │   │   │   ├───employees
    │   │   │   │   ├───marketingVisit
    │   │   │   │   ├───orders
    │   │   │   │   ├───organization
    │   │   │   │   ├───penetration
    │   │   │   │   ├───periods
    │   │   │   │   ├───point-of-sale
    │   │   │   │   ├───products
    │   │   │   │   ├───reportForm
    │   │   │   │   ├───route
    │   │   │   │   ├───sales
    │   │   │   │   ├───territory
    │   │   │   │   ├───top-performance
    │   │   │   │   ├───travel
    │   │   │   │   └───warehouse
    │   │   │   ├───filter
    │   │   │   ├───forms
    │   │   │   ├───header
    │   │   │   ├───modals
    │   │   │   ├───profile
    │   │   │   ├───sidebar
    │   │   │   ├───signin
    │   │   │   └───tables
    │   │   ├───deposit
    │   │   ├───marketingVisit
    │   │   ├───order
    │   │   ├───organization
    │   │   ├───penetration
    │   │   ├───periods
    │   │   ├───route
    │   │   ├───signin
    │   │   ├───territory
    │   │   ├───travel
    │   │   └───warehouse
    │   └───stores
    ├───static
    │   ├───assets
    │   │   └───admin
    │   │       └───dashboard
    │   ├───gifs
    │   ├───images
    │   │   ├───brand
    │   │   ├───country
    │   │   ├───error
    │   │   ├───grid-image
    │   │   ├───icons
    │   │   ├───logo
    │   │   ├───product
    │   │   ├───shape
    │   │   ├───user
    │   │   └───video-thumb
    │   ├───landingPage
    │   └───svgs
    └───temp
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
