# Random Helpers

This is a repository that has various information and examples. It started out focused on GraphQL. I needed some helpers for one of my GraphQL and Node.JS projects. But I quickly realized there is little GraphQL specifics I need to deal with and actually need more generic code. 

The helpers are generic and are suppose to be helpful in multiple projects. They can be easily extended for your purpose. 

I implemented them based on my specific requirements, but without going into the real business requirements which fall under NDA. 

I made certain compromises or design decisions in order to integrate easily into my own projects. There are always tradeoffs when designing functions, classes and large applications. Obivously I can't share any details, but I enjoy creating general purpose (loosely coupled) utilities. And those always work best and can be used and easily modifed to fit into many projects. I won't share any propriateru business logic. However, if properly designed a good portion of a project is need to be integrated and glued by fairly generic constructs and patterns. 

With JavaScript one can easily abstract away the specific types. I believe in type safety, but for example the LRU In-Memory cache can take any object any type. I started to create a set of helper functions that can be quickly transformed and made type-safe, yet containing a generic foundational implementation.


