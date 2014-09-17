<?php

function errorHandler($errno, $errstr, $errfile, $errline) {

}

set_error_handler("errorHandler");

function getServer() {
	//return 'http://127.0.0.1:5984';
	return 'https://uxpatterns:artefact@uxpatterns.cloudant.com';
}

function wrap_string($str) {
	if (is_string($str)) {
		return '"'.urlencode($str).'"';
	}
	return $str;
}

function getDBNames() {
	return callHttp('GET ' . getServer() . '/_all_dbs');
}

function getView($db, $app, $view, $keys = null, $descending = false, $limit = -1) {
	$params = '';
	$join = '?';
	if (isset($keys)) {
		if (is_array($keys)) {
			$params = $join . 'startkey=' . wrap_string($keys[0]) . '&endkey=' . wrap_string($keys[1]);
		} else {
			$params = $join . 'key=' . wrap_string($keys);
		}
		$join = '&';
	}
	if ($descending) {
		$params .= $join . 'descending=true';
		$join = '&';
	}
	if ($limit >= 0) {
		$params .= $join . 'limit=' . $limit;
	}

	return callHttp('GET ' . getServer() . '/' . $db . '/_design/' . $app . '/_view/' . $view . $params);
}

function deleteDatabase($db) {
	return callHttp('DELETE ' . getServer() . '/' . $db);
}

function createDatabase($db) {
	$data = callHttp('PUT ' . getServer() . '/' . $db);

	return $data && !isset($data->error);
}

function callHttp($url,$query='',$reqhdrs=array(),$follow=TRUE,$forward=FALSE,$contentType='application/x-www-form-urlencoded') {
	try {
		return json_decode(Web::http($url, $query, $reqhdrs, $follow, $forward, $contentType));
	} catch (Exception $e) {
		return null;
	}
}
function getRev($db, $id) {
	// Attemp to get the revision from the http header, which works on cloudant couch servers but not on
	// a local couchdb server running on apache.
	callHttp('HEAD ' . getServer() . '/' . $db . '/' . $id);
	$headers = F3::get('HEADERS');
	foreach ($headers as $field) {
		if (strpos($field, 'Etag') === 0) {
			$parts = explode('"', $field);
			return $parts[1];
		}
	}
	// If the server didn't return an e-tag, attempt to get the full document and take its _rev directly
	$doc = callHttp('GET ' . getServer() . '/' . $db . '/' . $id);
	if ($doc && isset($doc->_rev)) {
		return $doc->_rev;
	}
	return null;
}

function getDocument($db, $id) {
	return callHttp('GET ' . getServer() . '/' . $db . '/' . $id);
}

function deleteDocument($db, $id, $rev) {
	return callHttp('DELETE ' . getServer() . '/' . $db . '/' . $id . '?rev=' . $rev, null, null, TRUE, FALSE, 'application/json');
}

function saveDocument($db, $doc, $overwrite = false) {

	if ($overwrite && isset($doc->_id) && !isset($doc->_rev)) {
		$rev = getRev($db, $doc->_id);
		if ($rev) {
			$doc->_rev = $rev;
		}
	}

	if (isset($doc->_id)) {
		$response = callHttp('PUT ' . getServer() . '/' . $db . '/' . $doc->_id, json_encode($doc), null, TRUE, FALSE, 'application/json');
	} else {
		$response = callHttp('POST ' . getServer() . '/' . $db, json_encode($doc), null, TRUE, FALSE, 'application/json');
	}

	return $response;
}

function updateViews($db, $app, $views) {
    $obj = new stdClass();
    $obj->_id = "_design/" . urlencode($app);
    $obj->views = new stdClass();

 	foreach ($views as $key => $value) {
 		$viewName = urlencode($key);
 		$obj->views->$viewName = new StdClass();
 		if (is_array($value)) {
 			$obj->views->$viewName->map = $value[map];
 			$obj->views->$viewName->reduce = $value[reduce];
 		} else {
 			$obj->views->$viewName->map = $value;
 		}
 	}
 	$a = saveDocument($db, $obj, true);
}
