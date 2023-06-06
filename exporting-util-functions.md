To export multiple helper functions from a `utils.js` file and use them in a different file, you can follow these steps:

1. In your `utils.js` file, define your helper functions:

   ```javascript
   function helper1() {
     // ...
   }

   function helper2() {
     // ...
   }

   // Export the helper functions
   module.exports = {
     helper1,
     helper2,
   };
   ```

2. Save the `utils.js` file.

3. In the file where you want to use the helper functions, import them using the `require` function:

   ```javascript
   // Import the helper functions
   const { helper1, helper2 } = require('./utils');

   // Use the helper functions
   helper1();
   helper2();
   ```

   In the above example, the `helper1` and `helper2` functions are imported using destructuring assignment from the exported object. The `require('./utils')` statement assumes that the `utils.js` file is in the same directory as the file you're working on. Adjust the file path if it's different.

4. Run the file where you're using the helper functions, and you can use the imported functions as needed.

   Note: Make sure that the file paths and names are accurate, and that you have the necessary setup in your project to support module imports and exports.

This approach allows you to export multiple helper functions from a single file and import them individually in other files using destructuring assignment.