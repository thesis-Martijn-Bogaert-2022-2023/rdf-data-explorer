# RDF Data Explorer

## How to run
1. Navigate to the repository's root directory.
2. If you run the app for the first time, run the following command:
```bash
yarn install
```
3. To start the application (on port 8001), run:
```bash
yarn run dev --port 8001
```

## How to use
1. Enter a link to an RDF resource.
2. Select a resource's node and enter a datasource to fetch the resource's direct predicates and objects.
3. See the tree grow (resource nodes are pink, while the others are yellow).
4. Repeat from step 2 to grow the tree further.