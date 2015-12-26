/*
  Added a JSON.query() function that given an object or an array of objects
  and a "lucene-like" expression, returns an array of the objects that match
  the expression.

  * Supported features:
  * - conjunction operators (AND, OR, ||, &&, NOT)
  * - prefix operators (+, -) (on the field, like Kibana)
  * - quoted values ("foo bar")
  * - named fields (foo:bar)
  * - range expressions (foo:[bar TO baz], foo:{bar TO baz})
  * - parentheses grouping ( (foo OR bar) AND baz ) 
  * - field groups ( foo:(bar OR baz) )
  * - fields that refer to arrays ( foo.bar[0]:baz )
  * - test for missing and existing fields:
  *     foo.bar:_missing_
  *     foo.bar:_exists_

*/
var _ = require( 'lodash' );
var parser = require('./parser');

JSON.query = function( arr, expression ) {

    function handleTerm( o, term ) {
	if ( term.field && term.field != '<implicit>' )
	    var compare = _.get( o, term.field );
	else
	    var compare = JSON.stringify( o );
	
	if ( term.field && term.term == '_missing_' ) return ( compare == undefined );
	if ( term.field && term.term == '_exists_' ) return ( compare != undefined );

	if ( ! compare ) return false;

	if ( term.field && term.term_min && term.term_max ) {
	    // range check
	    if ( compare.toString().match(/^\d+$/) ) {
		if ( Number( compare ) >= Number( term.term_min ) &&
		     Number( compare ) <= Number( term.term_max ) ) return true;
		else return false;
	    }
	    else {
		if ( compare >= term.term_min && compare <= term.term_max ) return true;
		else return false;
	    }
	}

	if ( term.field && term.term.match( /^([\>\<]{1}[=]*)(\d+)$/ ) ) {
	    var m = term.term.match( /^([\>\<]{1}[=]*)(\d+)$/ );
	    var T = Number( compare );
	    var M = Number( m[2] );
	    switch( m[1] ) {
	    case '<':  return ( T < M ); break;
	    case '<=': return ( T <= M ); break;
	    case '>':  return ( T > M ); break;
	    case '>=': return ( T >= M ); break;
	    }
	}

	var regex = new RegExp( term.term );
	var match = ( compare.toString().match( regex ) ? true : false );
	if ( term.prefix && term.prefix == '-' )
	    match = ! match;
	return match;
    }

    function handleExpr( o, exp ) {
	if ( _.has( exp, 'left.operator' ) )
	    var left = handleExpr( o, exp.left );
	else if ( _.has( exp, 'left.term' ) || _.has( exp, 'left.term_min' ) )
	    var left = handleTerm( o, exp.left );
	else
	    var left = false;

	if ( _.has( exp, 'right.operator' ) )
	    var right = handleExpr( o, exp.right );
	else if ( _.has( exp, 'right.term' ) || _.has( exp, 'right.term_min' ) )
	    var right = handleTerm( o, exp.right );
	else
	    var right = true;
	if ( exp.operator == 'AND' ) return ( left && right );
	else if ( exp.operator == 'OR' ) return ( left || right );
	else return left;
    }
    
    var exp = parser.parse( expression );

    if ( ! ( arr instanceof Array ) ) {
	var a = [];
	a.push( arr );
	arr = a;
    }

    var matches = _.filter( arr, function( o ) {
	return handleExpr( o, exp );
    });
    return matches;
}

