Here's an example of a helper function in C# that parses a TypeScript (.ts) file and lists all duplicate resolvers:

TODO: This will not run for everyone. Verify, fix and add more Regex patterns to handle different code patterns!!

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

public static class ResolverParser
{
    public static List<string> FindDuplicateResolvers(string filePath)
    {
        // Read the TypeScript file contents
        string fileContent = File.ReadAllText(filePath);

        // Use regular expressions to extract resolver names
        Regex regex = new Regex(@"(?<=resolve\(')(\w+)(?='\))");
        MatchCollection matches = regex.Matches(fileContent);

        // Create a dictionary to store resolver names and their counts
        Dictionary<string, int> resolverCounts = new Dictionary<string, int>();

        // Iterate through the matches and count the occurrences of each resolver
        foreach (Match match in matches)
        {
            string resolverName = match.Value;

            if (resolverCounts.ContainsKey(resolverName))
            {
                resolverCounts[resolverName]++;
            }
            else
            {
                resolverCounts[resolverName] = 1;
            }
        }

        // Find duplicate resolver names
        List<string> duplicateResolvers = resolverCounts
            .Where(kv => kv.Value > 1)
            .Select(kv => kv.Key)
            .ToList();

        return duplicateResolvers;
    }
}
```

In this example, the `FindDuplicateResolvers` function takes a file path as input and reads the contents of the TypeScript file. It then uses a regular expression to extract resolver names from the file content.

The function creates a dictionary, `resolverCounts`, to store resolver names and their counts. It iterates through the matches and updates the counts accordingly.

Finally, it filters the `resolverCounts` dictionary to find the duplicate resolver names (i.e., those with counts greater than 1) and returns them as a list.

To use this helper function, you can call it and provide the path to your TypeScript file as an argument:

```csharp
string filePath = "path/to/your/file.ts";
List<string> duplicateResolvers = ResolverParser.FindDuplicateResolvers(filePath);

// Print the duplicate resolver names
foreach (string resolver in duplicateResolvers)
{
    Console.WriteLine(resolver);
}
```

This will output the names of the duplicate resolvers found in the TypeScript file.