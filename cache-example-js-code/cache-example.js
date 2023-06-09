const _featureFlag_isConsoleLogEnabled = true;

//---------------------------------------------
// LRU CLASS Implementation
//---------------------------------------------

const _resetHoursInterval = 1; // In PROD set it to at least 24 hours
const _resetStatInterval = _resetHoursInterval * 60 * 60 * 1000; // Run every X hours (X hours * 60 minutes * 60 seconds * 1000 milliseconds)
//const _resetStatInterval = 10 * 1000; // For testing, clear every 30 seconds
const _defaultLRUStage = '_def_';

class MyLRU {
    constructor(capacity) {
      this.cache = new Map();
      this.capacity = capacity;
      this.cacheStats = {
        _setCount: 0,
        _hitCount: 0,
        _missCount: 0,
        _expiredCount: 0,
      };

      // Setup interval to reset cache stats
      setInterval(() => {
        this.logCacheStats();
        this.resetCacheStats();
      }, _resetStatInterval);
    }

    isExpired(date) {
        let currentDate = new Date();
        return date < currentDate;
      }

    get(key) {
      if (!this.cache.has(key)) return '';
  
        let data = this.cache.get(key);
        if (data){
            if (this.isExpired(data.exp))
            {
              this.cacheStats._expiredCount++;

              consolelog(`cache.get - key: ${key}, seconds expired: ${calculateSecondsDifferenceFromDate(data.exp)}, full date expired: ${data.exp}`);

              this.cache.delete(key);
              return '';
            }

            this.cacheStats._hitCount++;
            return data.v;
        }
        else {
            this.cacheStats._missCount++;

            return '';
        }
    }
  
    // Setting value with default expiration of 60 seconds
    set(key, value, expirationInSeconds = 60) {
      this.cache.delete(key);
  
      if (this.cache.size === this.capacity) {
        consolelog('cache.set - Cache reached capacity. Deleting one entry.');

        this.cache.delete(this.cache.keys().next().value);
      } 

      let dtWhenToExpire = addSecondsToCurrentDateTime(expirationInSeconds);

      // Create object with additional info to store
      let o = { 
        v: value,
        exp: dtWhenToExpire
      };

      this.cache.set(key, o);

      consolelog(`cache.set - key: ${key}, expiration: ${dtWhenToExpire}`);
    }

    resetCacheStats() {
      this.cacheStats._setCount = 0;
      this.cacheStats._hitCount = 0;
      this.cacheStats._missCount = 0;
      this.cacheStats._expiredCount = 0;
      
      consolelog(`cache.resetCacheStats`);
    }

    formatCacheStats() {
      return `cache.CacheStats: {_setCount: ${this.cacheStats._setCount}, _hitCount: ${this.cacheStats._hitCount}, _missCount: ${this.cacheStats._missCount}, _expiredCount: ${this.cacheStats._expiredCount}}`;
    }
    
    logCacheStats() {
      consolelog(this.cacheStats);
    }
  }

//---------------------------------------------
// LRU Manager CLASS Implementation
//---------------------------------------------
// This internally can manage 1+ LRU Classes. This allows a client to manage multiple LRU Caches. Each instance is assigned a key/category/area/stage depending 
// how a client needs to use it.
// For example in a workflow given a key ('73804BF6-4386-4053-98F3-CBE6F879BA20') has data that needs to cached. This data goes through a pipeline/workflow stage 
// that transforms the data. If the transformed data also needs to be cached we'd need to create unique key with the workflow stage 
// such as: 'stage1-73804BF6-4386-4053-98F3-CBE6F879BA20', 'stage2-73804BF6-4386-4053-98F3-CBE6F879BA20'. This introduces a complexity of managing unique key creation. 
// LRU Manager class simplfies it. The client just needs to keep track for the actual key which will change for different data, but the stage/area/category will likely 
// stay static or even hardcoded in the code. 
//
// Overview and Usage:
// Constructor parameter provides default maximum LRU capacity. 
// It can be overridden with a helper to create a new LRU instance
// LRU Manager doesn't have a capacity limit


  class LRUManager {
    constructor(defaultMaxLRUCapacity = 1000) {
      //this._lrus = new Array<MyLRU>(10);
      this._lrus = new Map();

      this._defaultMaxLRUCapacity = defaultMaxLRUCapacity;
      this._lrus.set(_defaultLRUStage, new MyLRU(this._defaultMaxLRUCapacity));
      this.cacheManagerStats = {
        _setCount: 0,
        _hitCount: 0,
        _missCount: 0,
        _overwriteExistingCount: 0,
      };
    };
  
    // Sets data to default LRU stage
      set(key, value, expirationInSeconds = 60) {
      let lru = this._lrus.get(_defaultLRUStage);
      lru.set(key, value, expirationInSeconds);
    };
  
    // Sets data to a specific LRU stage
    // If that state doesn't exist, it will create it 
    setWithStage(key, value, expirationInSeconds = 60, stage = _defaultLRUStage) {
      if (!stage || stage === '') {
        stage = _defaultLRUStage
      }

      if (!this._lrus.has(stage)) {
        this._lrus.set(stage, new MyLRU(this._defaultMaxLRUCapacity));
      }
  
      let tempLru = this._lrus.get(stage);
      if (tempLru) {
        tempLru.set(key, value, expirationInSeconds);
      }
      else {
        consolelog(`stagedCache.setWithStage - FAILED to find key for stage ${stage} after set`);
      }


    };
  
    // Return an empty string if a key's data isn't cached. 
    get(key, stage = _defaultLRUStage) {
      if (this._lrus.has(stage)) {
        return this._lrus.get(stage).get(key);
      }
      else {
        return '';  
      };
    };
  
    // Create a new LRU category with specific max capacity
    // Allows a client to set max capacity or clear it via override/clear option
    createCategoryLRU(stage, maxCapacity = 1000, overwriteExisting = false) {
      if (overwriteExisting) {
        this._lrus[stage] = new MyLRU(maxCapacity);
        _overwriteExistingCount++;
      }
      else if (!this._lrus.has(stage)) {
        this._lrus[stage] = new MyLRU(maxCapacity);
    }
    };
  };

//----------------------------------
// Utility helpers
//----------------------------------
  
  function consolelog(value) {
    if (value && _featureFlag_isConsoleLogEnabled) {
      console.log(value);
    }
  }
  
  function calculateSecondsDifferenceFromDate(date) {
    const currentDate = new Date();
    const differenceInSeconds = Math.floor((date - currentDate) / 1000);
    return differenceInSeconds;
  }
  
  function addSecondsToCurrentDateTime(seconds) {
    let currentDateTime = new Date();
    let updatedDateTime = new Date(currentDateTime.getTime() + seconds * 1000);
    return updatedDateTime;
  }

// Helper function for caching with default expiration (default expiration is 1 minute)
function cacheWithDefaultExpiration(key, value, expirationInSeconds = 60) {
  cache.set(key, value, expirationInSeconds); // Override expiration to seconds
}

// Additional example helpers in case different category of data requires different expiration duration
// Helper function for caching with expiration of 5 minutes with clear naming
function cacheWithFiveMinuteExpiration(key, value) {
  cache.set(key, value, 5 * 60); // Override expiration to 5 minutes
}

// Helper function for caching with expiration of 30 minutes with clear naming
function cacheWithThirtyMinuteExpiration(key, value) {
  cache.set(key, value, 30 * 60); // Override expiration to 30 minutes
}

// Helper function to retrieve cached values
// expiration is handled by MyLRU and will either return data or an empty string ''
function getCachedValue(key) {
  let value = cache.get(key);
  return value;
}

function getStagedDefaultCachedValue(key) {
  let value = stagedCache.get(key);
  return value;
}

function getStagedCachedValue(key, stage = '') {
  let value = stagedCache.get(key, stage);
  return value;
}

function setStagedExpirationCachedValue(key, value, expirationInSeconds = 30) {
 stagedCache.set(key, value, expirationInSeconds);
}

function setStagedSpecificCachedValue(key, value, expirationInSeconds = 30, stage = '') {
  stagedCache.setWithStage(key, value, expirationInSeconds, stage);
}


// Helper function to generate a compound key based on 5 string parameters
function generateCompoundKey(param1 = '', param2 = '', param3 = '', param4 = '', param5 = '') {
  let parameters = [param1 || '', param2 || '', param3 || '', param4 || '', param5 || ''];
  let compoundKey = parameters.join('-');
  return compoundKey;
}

// Helper function to parse a compound key into an object with 5 parameters
function parseCompoundKey(compoundKey) {
  const [param1, param2, param3, param4, param5] = compoundKey.split('-');
  return {
    param1: param1 || '',
    param2: param2 || '',
    param3: param3 || '',
    param4: param4 || '',
    param5: param5 || '',
  };
}

//----------------------------------
// Test helpers
//----------------------------------

// Test helper function to simplify testing cache values
function testCacheValue(key, value, expected) {
  cacheWithDefaultExpiration(key, value);
  let cachedValue = getCachedValue(key);
  console.log(`Key: ${key}`);
  console.log(`Cached Value: ${cachedValue}`);
  console.log(`Expected Value: ${expected}`);
  console.log(`Test Result: ${cachedValue === expected ? 'PASS' : 'FAIL'}`);
  console.log('---');
}

// Test helper function to simplify testing cache values with expiration parameter
function testCacheValueWithExpiration(key, value, expected, expirationInSeconds = 5) {
  cacheWithDefaultExpiration(key, value, expirationInSeconds);
  let cachedValue = getCachedValue(key);
  console.log(`Key: ${key}`);
  console.log(`Cached Value: ${cachedValue}`);
  console.log(`Expected Value: ${expected}`);
  console.log(`Test Result: ${cachedValue === expected ? 'PASS' : 'FAIL'}`);
  console.log('---');
}

// To summarize the `testCacheValueWithExpirationAndWait` function includes the `waitSecondsBeforeGettingValueFromCache` parameter, which specifies the number of seconds to wait before calling `getCachedValue` in the function. 
// Test helper function to simplify testing cache values with expiration and wait time
function testCacheValueWithExpirationAndWait(key, value, expected, expirationInSeconds = 5, waitSecondsBeforeGettingValueFromCache = 0) {
  cacheWithDefaultExpiration(key, value, expirationInSeconds);
  console.log(`Key: ${key}`);
  console.log(`Cached Value: ${getCachedValue(key)}`);
  console.log(`Expected Value: ${expected}`);
  console.log('Waiting for cache expiration...');
  setTimeout(() => {
    console.log('Finished waiting. Getting cached value...');
    let cachedValue = getCachedValue(key);
    console.log(`Cached Value after expiration: ${cachedValue}`);
    console.log(`Test Result: ${cachedValue === expected ? 'PASS' : 'FAIL'}`);
    console.log('---');
  }, waitSecondsBeforeGettingValueFromCache * 1000);
}


function testStagedDefaultCacheValue(key, value, expected) {
  setStagedExpirationCachedValue(key, value);
  let cachedValue = getStagedDefaultCachedValue(key);
  console.log(`Key: ${key}`);
  console.log(`Cached Value: ${cachedValue}`);
  console.log(`Expected Value: ${expected}`);
  console.log(`Test Result: ${cachedValue === expected ? 'PASS' : 'FAIL'}`);
  console.log('---');
}

function testStagedSpecificStageCacheValue(key, value, expected, stage = '') {
  setStagedSpecificCachedValue(key, value, 60, stage);
  let cachedValue = getStagedDefaultCachedValue(key, stage);
  console.log(`Stage: ${stage}`);
  console.log(`Key: ${key}`);
  console.log(`Cached Value: ${cachedValue}`);
  console.log(`Expected Value: ${expected}`);
  console.log(`Test Result: ${cachedValue === expected ? 'PASS' : 'FAIL'}`);
  console.log('---');
}


///////////////////////////////////////////////////
// START of code execution
///////////////////////////////////////////////////

// Initialize an LRU cache with a maximum size of 10 items (Increase value based on your requirements. 10 is good for testing.)
const cache = new MyLRU(10);

// Initialize LRU Manager class with a maximum size of 10 items (Increase value based on your requirements. 10 is good for testing.)
const stagedCache = new LRUManager(10);


///////////////////////////////////////////////////
// TESTS
///////////////////////////////////////////////////

const compoundKey1 = {
  param1: 'a',
  param2: 'b',
  param3: 'c',
  param4: 'd',
  param5: 'e',
};
const compoundKey2 = {
  param1: '',
  param2: '2',
  param3: '',
  param4: '4',
  param5: '',
};

const COMPOUND_KEY_1 = 'a-b-c-d-e';
const COMPOUND_KEY_2 = '-2--4-';

const generatedCK1 = generateCompoundKey(compoundKey1.param1, compoundKey1.param2, compoundKey1.param3, compoundKey1.param4, compoundKey1.param5 );
console.log(`Test 1 generateCompoundKey: ${COMPOUND_KEY_1 === generatedCK1 ? 'PASS' : 'FAIL'}`);


const generatedCK2 = generateCompoundKey(compoundKey2.param1, compoundKey2.param2, compoundKey2.param3, compoundKey2.param4, compoundKey2.param5 );
console.log(`Test 2 generateCompoundKey: ${COMPOUND_KEY_2 === generatedCK2 ? 'PASS' : 'FAIL'}`);

// Example usages and tests
const TEST_VALUE_1 = 'value1';
const TEST_VALUE_2 = 'value2';
const TEST_VALUE_3 = 'value3';
const TEST_VALUE_4 = 'value4';
const TEST_VALUE_EMPTY = '';

// Test cache value with 5-second expiration
testCacheValueWithExpiration('key1', TEST_VALUE_1, TEST_VALUE_1, 5);

// Test cache value with 10-second expiration
testCacheValueWithExpiration('key2', TEST_VALUE_2, TEST_VALUE_2, 10);

// Test with compound key 'abc-def-null-ghi-jkl'
const params1 = parseCompoundKey(generateCompoundKey('abc', 'def', null, 'ghi', 'jkl'));
testCacheValue(params1.param1, TEST_VALUE_1, TEST_VALUE_1);
testCacheValue(params1.param2, TEST_VALUE_2, TEST_VALUE_2);

// Test with compound key 'xyz-pqr-stu-null-vwx'
const params2 = parseCompoundKey(generateCompoundKey('xyz', 'pqr', 'stu', null, 'vwx'));
testCacheValue(params2.param3, TEST_VALUE_2, TEST_VALUE_2);
testCacheValue(params2.param4, TEST_VALUE_3, TEST_VALUE_3);

// Test with 1st key param 
const params3str = generateCompoundKey('foo', 'bar', 'baz', 'qux', 'quux');
const params3 = parseCompoundKey(params3str);
testCacheValue(params3.param2, TEST_VALUE_3, TEST_VALUE_3);

// Test with compound key 'foo-bar-baz-qux-quux'
testCacheValue(params3str, TEST_VALUE_4, TEST_VALUE_4);

// Test with compound key 'abc-def-null-ghi-jkl'
const params4str = generateCompoundKey('abc', 'def', null, 'ghi', 'jkl');
const params4 = parseCompoundKey(params4str);
testCacheValue(params4.param1, TEST_VALUE_1, TEST_VALUE_1);
testCacheValue(params4.param2, TEST_VALUE_2, TEST_VALUE_2);

// Test with compound key 'xyz-pqr-stu-null-vwx'
const params5str = generateCompoundKey('xyz', 'pqr', 'stu', null, 'vwx');
const params5 = parseCompoundKey(params5str);
testCacheValue(params5.param3, TEST_VALUE_2, TEST_VALUE_2);
testCacheValue(params5str, TEST_VALUE_3, TEST_VALUE_3);

// Test with compound key 'foo-bar-baz-qux-quux'
const params6str = generateCompoundKey('foo', 'bat', 'baz', 'qux', 'yz1');
const params6 = parseCompoundKey(params6str);
testCacheValue(params6.param2, TEST_VALUE_3, TEST_VALUE_3);
testCacheValue(params6str, TEST_VALUE_3, TEST_VALUE_3);

cache.logCacheStats();
//cache.resetCacheStats();
consolelog(cache.formatCacheStats());

// Test cache value with 5-second expiration
testCacheValueWithExpiration('key3', TEST_VALUE_1, TEST_VALUE_1, 5);

// Test cache value with 10-second expiration
testCacheValueWithExpiration('key4', TEST_VALUE_2, TEST_VALUE_2, 10);

// Test cache value that hasn't expired (data will expire in 10 seconds, get will happen in 5 seconds)
testCacheValueWithExpirationAndWait('key6', TEST_VALUE_2, TEST_VALUE_2, 10, 5);

// Test cache value that is expired  (data will expire in 5 seconds, get will happen in 10 seconds)
testCacheValueWithExpirationAndWait('key5', TEST_VALUE_1, TEST_VALUE_EMPTY, 5, 10);

// ------------------------
// LRU Manager tests
// ------------------------


// Example usages and tests
const STAGE_KEY_1 = 'stage1';
const STAGE_KEY_2 = 'stage2';
const STAGE_KEY_3 = 'stage3';

testStagedDefaultCacheValue('key1', TEST_VALUE_1, TEST_VALUE_1);
testStagedDefaultCacheValue('key2', TEST_VALUE_2, TEST_VALUE_2);
testStagedDefaultCacheValue('key3', TEST_VALUE_3, TEST_VALUE_3);


testStagedSpecificStageCacheValue('key1', TEST_VALUE_1, TEST_VALUE_1, STAGE_KEY_1);
testStagedSpecificStageCacheValue('key2', TEST_VALUE_2, TEST_VALUE_2, STAGE_KEY_1);
testStagedSpecificStageCacheValue('key3', TEST_VALUE_3, TEST_VALUE_3, STAGE_KEY_1);

testStagedSpecificStageCacheValue('key1', TEST_VALUE_1, TEST_VALUE_1, STAGE_KEY_2);
testStagedSpecificStageCacheValue('key2', TEST_VALUE_2, TEST_VALUE_2, STAGE_KEY_2);
testStagedSpecificStageCacheValue('key3', TEST_VALUE_3, TEST_VALUE_3, STAGE_KEY_2);

testStagedSpecificStageCacheValue('key1', TEST_VALUE_1, TEST_VALUE_1, STAGE_KEY_3);
testStagedSpecificStageCacheValue('key2', TEST_VALUE_2, TEST_VALUE_2, STAGE_KEY_3);
testStagedSpecificStageCacheValue('key3', TEST_VALUE_3, TEST_VALUE_3, STAGE_KEY_3);




