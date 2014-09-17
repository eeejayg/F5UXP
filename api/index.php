<?php

require __DIR__.'/fatfree/base.php';
require __DIR__.'/couchutil.php';

//$dbName = 'store';

F3::set('DEBUG',1);

date_default_timezone_set('UTC');

function getparam($name) {
	if (isset($_GET[$name])) {
		return $_GET[$name];
	}
	return '';
}

// The views into the DB. These can be updated in the DB (overwrite) using the
// /update-views API call.
$views = array(
	"id_list" => "function(doc) { emit([doc._id, doc._rev], null); }"
);

// if (createDatabase($dbName)) {
//     updateViews($dbName, $dbName, $views);
// }

F3::route('GET /db-names',
	function() {
		$names = getDBNames();

		wrapResponse(null, $names);
	}
);

F3::route('GET /@db/create',
	function() {
		global $views;

		$dbName = F3::get('PARAMS["db"]');
		if (createDatabase($dbName)) {
			updateViews($dbName, $dbName, $views);
			echo "Database created and initialized";
		} else {
			echo "Database already exists";
		}

	}
);

F3::route('GET /@db/update-views',
	function() {
		global $views;

		$dbName = F3::get('PARAMS["db"]');
		updateViews($dbName, $dbName, $views);

		echo "Views updated";
	}
);

F3::route('GET /@db/show-all',
	function() {
		$dbName = F3::get('PARAMS["db"]');
		$view = getView($dbName, $dbName, 'id_list');
		//var_dump($view);
		$ids = array();
		if ($view) {
			foreach ($view->rows as $row) {
				if ($row->key != "_design") {
					$ids[] = $row->key[0];
				}
			}
		}
		wrapResponse(null, $ids);
	}
);

F3::route('GET /@db/delete-all',
	function() {
		global $views;

		$dbName = F3::get('PARAMS["db"]');
		deleteDatabase($dbName);
		createDatabase($dbName);
		updateViews($dbName, $dbName, $views);

		wrapResponse(array("success" => true), null);
	}
);

function wrapResponse($response, $doc) {
	if (isset($response)) {
		if (isset($response->error)) {
			$data = '{"error":"' . $response->error . '"}';
		} else {
			$data = '{"success":true, "obj":' . json_encode($doc) . '}';
		}
	} else {
		$data = json_encode($doc);
	}
	$cb = getparam('callback');
	if ($cb) {
		echo $cb . '(' . $data . ')';
	} else {
		echo $data;
	}
}

F3::route('POST /@db/objects/@model',
    function() {
		$dbName = F3::get('PARAMS["db"]');
    	$model = F3::get('PARAMS["model"]');

        $doc = json_decode(file_get_contents('php://input'));
        if (!isset($doc->_id)) {
        	$doc->_id = $model;
        }
    	$response = saveDocument($dbName, $doc, true);
    	if (isset($response->rev)) {
    		$doc->_rev = $response->rev;
    	}
    	wrapResponse($response, $doc);
    }
);

F3::route('GET /@db/objects/@model',
    function() {
		$dbName = F3::get('PARAMS["db"]');

    	$model = F3::get('PARAMS["model"]');
    	$response = getDocument($dbName, $model);
    	wrapResponse($response, $response);
	}
);

F3::run();

?>