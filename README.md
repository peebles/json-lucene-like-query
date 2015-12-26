# Lucene-like query to filter JSON objects

## Quick Start

    require( 'json-lucene-like-query' );
    var filteredArray = JSON.query(
        inputArray,
        'foo.bar:(baz OR foop) AND foo.hostname:local'
    );

## Detail

Adds a JSON.query() function that given an object or an array of objects
and a "lucene-like" expression, returns an array of the objects that match
the expression.

### Supported features:

* conjunction operators (AND, OR, ||, &&, NOT)
* prefix operators (+, -) (on the field, like Kibana)
* quoted values ("foo bar")
* named fields (foo:bar)
* range expressions (foo:[bar TO baz], foo:{bar TO baz})
* parentheses grouping ( (foo OR bar) AND baz ) 
* field groups ( foo:(bar OR baz) )
* fields that refer to arrays ( foo.bar[0]:baz )
* test for missing and existing fields (foo.x:_missing_ AND foo.y:_exists)

