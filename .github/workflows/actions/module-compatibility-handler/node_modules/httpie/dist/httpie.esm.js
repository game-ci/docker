export function send(method, uri, opts) {
	return new Promise((res, rej) => {
		opts = opts || {};
		var k, str, tmp, arr;
		var headers = opts.headers || {};
		var req = new XMLHttpRequest;

		req.open(method, uri, req.withCredentials=1);

		req.onerror = rej;
		req.onload = function () {
			arr = req.getAllResponseHeaders().trim().split(/[\r\n]+/);
			req.statusMessage = req.statusText;
			req.statusCode = req.status;
			req.data = req.response;
			req.headers = {};

			while (tmp = arr.shift()) {
				tmp = tmp.split(': ');
				req.headers[tmp.shift().toLowerCase()] = tmp.join(': ');
			}

			tmp = req.headers['content-type'];
			if (tmp && !!~tmp.indexOf('application/json')) {
				req.data = JSON.parse(req.data, opts.reviver);
			}

			(req.status >= 400 ? rej : res)(req);
		};

		if (str = opts.body) {
			if (/Array|Object/.test(str.constructor.name)) {
				headers['content-type'] = 'application/json';
				str = JSON.stringify(str);
			}
			headers['content-length'] = str.length;
		}

		for (k in headers) {
			req.setRequestHeader(k, headers[k]);
		}

		req.send(str);
	});
}

export var get = send.bind(null, 'GET');
export var post = send.bind(null, 'POST');
export var patch = send.bind(null, 'PATCH');
export var del = send.bind(null, 'DELETE');
export var put = send.bind(null, 'PUT');
