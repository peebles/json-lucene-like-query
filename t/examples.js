require( '../index' );

var testArr = JSON.parse( '[{"meta":{"report":{"Interval":"60","ZoneId":"Zone 0"},"device":{"MacAddress":["00:B0:9D:EB:E8:34"],"Firmware":["3.16.3.00"],"HostName":["people_tracker"],"SerialNumber":["15460404"],"Hardware":["0x04e2ffff"],"Timezone":["PST"],"Model":["Censys C3DE-PGE-00001"],"IpAddress":["192.168.254.106"],"ActivationTime":["2015-12-21T17:33:26-08:00"]}}},{"meta":{"report":{"Interval":"300","ZoneId":"Zone 0"},"device":{"MacAddress":["00:B0:9D:EB:E8:35"],"Firmware":["3.16.3.00"],"HostName":["people_tracker"],"SerialNumber":["15460405"],"Hardware":["0x04e2ffff"],"Timezone":["UTC"],"Model":["Censys C3DE-PGE-00001"],"IpAddress":["192.168.254.143"],"ActivationTime":["2015-12-23T23:05:57+00:00"]}}}]' );

function test( q, expect ) {
    try {
	var f = JSON.query( testArr, q );
	if ( f.length != expect ) {
	    console.log( 'failed:', q );
	}
	return f;
    } catch( err ) {
	console.log( 'failed:', q, err.message );
	return [];
    }
}

test( 'meta.report.Interval:60', 1 );
test( '-meta.report.Interval:60', 1 );
test( 'meta.report.Interval:>=60', 2 );
test( 'meta.report.Interval:60 AND meta.report.ZoneId:0', 1 );
test( '"Censys C3DE-PGE-00001"', 2 );
test( 'meta.device.HostName:people_tracker', 2 );
test( 'meta.device.HostName[0]:people_tracker AND UTC', 1 );
test( 'meta.report.Interval:(60 OR 120)', 2 );
test( 'meta.report.xxx:_missing_', 2 );
test( 'meta.report.Interval:_exists_', 2 );
