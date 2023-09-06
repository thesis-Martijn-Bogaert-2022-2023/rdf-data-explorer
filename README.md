# RDF Data Explorer

## How to run
1. The application depends on the [SPARQL Query Builder](https://github.com/thesis-Martijn-Bogaert-2022-2023/sparql-query-builder) application.
   1. Clone the repository:
      ```bash
      git clone https://github.com/thesis-Martijn-Bogaert-2022-2023/sparql-query-builder.git
      ```
   2. Navigate to its root and run:
      ```bash
      yarn install
      ```
   3. To use it as a local package for the SPARQL Query Builder (UI) application, run:
      ```bash
      yarn link
      ```
2. Clone **this** repository and navigate to its root.
3. Run:
   ```bash
   yarn install
   ```
4. (Optional) the previous command should automatically link the local package, but it you want to be sure, run:
   ```bash
   yarn link "sparql-query-builder"
   ```
5. To start the application (on port 8001), run:
   ```bash
   yarn run dev --port 8001
   ```

## How to use
1. Enter a link to an RDF resource.
2. Select a resource's node and enter a datasource to fetch the resource's direct predicates and objects.
3. See the tree grow (resource nodes are pink, while the others are yellow).
4. Repeat from step 2 to grow the tree further.
5. Select properties (nodes) of interest and add them to the query.
6. Optionally, set filters for properties.
7. Optionally, set a limit and offset.
8. Generate the query.