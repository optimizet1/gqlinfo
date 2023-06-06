This is an example how to create an In-Memory LRU Cache. Using const variable you can define how many maximum entries you want this cache to have. 
Also, each entry can expire at a different time. 
This example also shows how you can generate a complex / compound key to store your entries/data. 
The helper class handles setting expiration and checking it before retrieval. 

This is a great easy starting helper if you need to cache some data temporary in memory. This is not a persistant cache, but it will work while your service stays up and running. 

1. Run the following command to execute the Node.js script:

   ```
   node cache-example.js
   ```

   