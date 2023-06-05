Certainly! Here's the updated code that includes the requested changes:

```javascript
const { ApolloServer, gql } = require('apollo-server');
const axios = require('axios');

// GraphQL schema
const typeDefs = gql`
  type Book {
    title: String!
    yearPublished: Int!
    author: Author!
    statePublished: String!
    stateCodePublished: String!
  }

  type Author {
    fullName: String!
    yearBorn: Int!
    stateBorn: String!
    stateCodeBorn: String!
  }

  type State {
    stateCode: String!
    stateName: String!
  }

  type Query {
    books: [Book!]!
  }
`;

// Fetch states data from the API endpoint
const fetchStatesData = async () => {
  try {
    const response = await axios.get('https://www.statenamesapi.com/getallstates');
    return response.data.map(state => ({
      stateCode: state.abbreviation,
      stateName: state.name
    }));
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

// Resolver functions
const resolvers = {
  Query: {
    books: () => {
      // Replace this with your logic to fetch books data
      const booksData = [
        {
          title: 'Book 1',
          yearPublished: 2021,
          author: {
            fullName: 'Author 1',
            yearBorn: 1980,
            stateBorn: 'California',
            stateCodeBorn: ''
          },
          statePublished: 'New York',
          stateCodePublished: ''
        },
        {
          title: 'Book 2',
          yearPublished: 2022,
          author: {
            fullName: 'Author 2',
            yearBorn: 1990,
            stateBorn: 'Texas',
            stateCodeBorn: ''
          },
          statePublished: 'California',
          stateCodePublished: ''
        }
        // Add more book objects as per your data
      ];

      return booksData;
    }
  },
  Book: {
    author: (parent) => parent.author,
    statePublished: async (parent) => {
      const statesData = await fetchStatesData();
      const state = statesData.find(state => state.stateCode === parent.stateCodePublished);
      return state ? state.stateName : '';
    }
  },
  Author: {
    stateBorn: async (parent) => {
      const statesData = await fetchStatesData();
      const state = statesData.find(state => state.stateCode === parent.stateCodeBorn);
      return state ? state.stateName : '';
    }
  }
};

// Create the Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});
```

In this updated code, we add the properties `stateCodePublished` to the `Book` type and `stateCodeBorn` to the `Author` type. These properties represent the state codes associated with the publication and birth states.

The `fetchStatesData` function is modified to return an array of `State` objects, where each object contains the `stateCode` and `stateName`.

In the resolvers, we use the `stateCodePublished` and `stateCodeBorn` values to find the corresponding state in the `statesData` fetched from `fetchStatesData`. We then extract the `stateName` and return it as the resolved value for `statePublished` and `stateBorn`, respectively.

If a matching state is not found in the `statesData`, an empty string is returned.

Please note that you need to update the