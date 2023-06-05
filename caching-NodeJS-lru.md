`lru-cache` is a popular caching library for Node.js that implements the Least Recently Used (LRU) cache eviction strategy. It provides an in-memory cache with a fixed maximum size, automatically evicting the least recently used items when the cache reaches its capacity.

Here are some key features and characteristics of `lru-cache`:

1. **Efficient LRU Eviction:** `lru-cache` maintains a doubly linked list to track the usage order of cached items. When the cache exceeds its maximum size, it removes the least recently used item from the cache, ensuring efficient memory utilization.

2. **Simple and Lightweight:** `lru-cache` is designed to be simple and lightweight, providing a minimalistic API for caching data in memory. It has a small footprint and minimal dependencies.

3. **Flexible Cache Configuration:** The cache size can be set during initialization, allowing you to control the maximum number of items that can be stored in the cache. You can configure the cache to limit the size based on the number of items or the memory consumed by the cache.

4. **Key-Value Storage:** `lru-cache` stores data in a key-value format, allowing you to store any type of data as values and access them using unique keys.

5. **Get and Set Operations:** You can retrieve values from the cache using the `get` method by providing the corresponding key. If the key exists in the cache, the associated value is returned. If the key is not found, `undefined` is returned. The `set` method allows you to add or update items in the cache by providing a key-value pair.

6. **Additional Features:** `lru-cache` offers additional features such as cache size monitoring, event-based hooks, and customizable options for item expiration and stale-while-revalidate caching patterns.

Here's an example demonstrating the usage of `lru-cache`:

```javascript
const LRU = require('lru-cache');

// Initialize an LRU cache with a maximum size of 100 items
const cache = new LRU(100);

// Add an item to the cache
cache.set('key1', 'value1');

// Retrieve an item from the cache
const value = cache.get('key1');
console.log(value); // Output: value1

// Remove an item from the cache
cache.del('key1');

// Check if an item exists in the cache
const exists = cache.has('key1');
console.log(exists); // Output: false
```

In the above example, we create an `lru-cache` instance with a maximum size of 100 items. We then use the `set` method to add an item to the cache with a key-value pair. Later, we retrieve the value using the `get` method and remove the item using the `del` method. Finally, we check if an item exists using the `has` method.

`lru-cache` is a simple and effective caching solution for in-memory data caching in Node.js applications. It provides a convenient way to manage and optimize data access by storing frequently used items in memory.

In the below example, we create an lru-cache instance with a maximum size of 100 items and show how to expire cached items after some specifed time.

The lru-cache instance is initialized with an additional option maxAge, which represents the expiration time for cache entries in seconds (1 hour in this case).

When using the set method to add an item to the cache, you can specify an optional third argument representing the expiration time in seconds for that specific item. This allows you to set different expiration times for different cache entries.

After the expiration time elapses, the cache entry is automatically evicted from the cache. 
Three helper example functions are created for managing caching of different objects with different expiration values:

    cacheWithDefaultExpiration: This function caches the provided key-value pair with the default expiration time of 15 minutes (1000 * 60 seconds * 15). It uses the set method of the cache object to store the value with the specified key and expiration.

    cacheWithTwoMinuteExpiration: This function caches the provided key-value pair with an expiration time of 2 minutes (1000 * 60 seconds * 2). It overrides the default expiration value by passing the expiration as the third argument to the set method.

    cacheWithThirtyMinuteExpiration: This function caches the provided key-value pair with an expiration time of 30 minutes (1000 * 60 seconds * 30). It also overrides the default expiration value by passing the expiration as the third argument to the set method.

You can use these helper functions to conveniently cache different objects with their respective expiration times without explicitly specifying the expiration value each time.
To enhance the helper functions for cache retrieval and check if an item is expired, here's an updated version:

```javascript
const LRU = require('lru-cache');

// Initialize an LRU cache with a maximum size of 100 items
const cache = new LRU({
  max: 100,
  maxAge: 1000 * 60, // Default expiration time in seconds
});

// Helper function for caching with default expiration
function cacheWithDefaultExpiration(key, value) {
  cache.set(key, value, 1000 * 60 * 15); // Override expiration to 15 minutes
}

// Helper function for caching with expiration of 2 minutes
function cacheWithTwoMinuteExpiration(key, value) {
  cache.set(key, value, 1000* 60 * 2); // Override expiration to 2 minutes
}

// Helper function for caching with expiration of 30 minutes
function cacheWithThirtyMinuteExpiration(key, value) {
  cache.set(key, value, 1000 * 60 * 30); // Override expiration to 30 minutes
}

// Helper function to retrieve cached values and check expiration
function getCachedValue(key) {
  const value = cache.get(key);
  if (value && cache.has(key)) {
    if (cache.isExpired(key)) {
      // Item is expired
      return '';
    } else {
      // Item is not expired
      return value;
    }
  } else {
    // Item does not exist in the cache
    return '';
  }
}

// Example usage of the helper functions
cacheWithDefaultExpiration('key1', 'value1');
cacheWithTwoMinuteExpiration('key2', 'value2');
cacheWithThirtyMinuteExpiration('key3', 'value3');

// Retrieve cached values and check expiration
const value1 = getCachedValue('key1');
const value2 = getCachedValue('key2');
const value3 = getCachedValue('key3');

console.log(value1); // Output: value1
console.log(value2); // Output: value2
console.log(value3); // Output: ''
```

In the updated example, a new helper function called `getCachedValue` is added to retrieve cached values while checking if an item is expired. Here's how it works:

1. The `getCachedValue` function takes a `key` parameter and attempts to retrieve the corresponding value from the cache using `cache.get(key)`.
2. It then checks if the value exists in the cache and if the cache still has the key using `cache.has(key)`.
3. If the value exists and the key is still present in the cache, it checks if the item is expired using `cache.isExpired(key)`.
4. If the item is expired, the function returns an empty string `''`, indicating that the value is expired.
5. If the item is not expired, it returns the cached value.
6. If the item does not exist in the cache or the key is not present, the function also returns an empty string `''`.

By using the `getCachedValue` helper function, you can retrieve cached values while automatically checking for expiration. If an item is expired, it will return an empty string, allowing you to handle expired cache entries accordingly.

In the example, after caching the values, the `getCachedValue` function is used to retrieve the values for each key. The corresponding values are printed to the console, with the expired item (`key3`) returning an empty string `''`.