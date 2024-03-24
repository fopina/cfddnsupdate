import { Buffer } from 'node:buffer';

export interface Env {
}

const RECORD_TYPE = "A"

export default {
	parseAuthorization(request: Request): [Response | null, string, string] {
		// taken from https://developers.cloudflare.com/workers/examples/basic-auth/
		const authorization = request.headers.get("Authorization");
		if (!authorization) return [new Response("Missing authorization header", { status: 401 }), "", ""]

		const [scheme, encoded] = authorization.split(" ");

		// The Authorization header must start with Basic, followed by a space.
		if (!encoded || scheme !== "Basic") {
			return [new Response("Malformed authorization header.", {
				status: 400,
			}), "", ""]
		}

		const credentials = Buffer.from(encoded, "base64").toString();

		// The username & password are split by the first colon.
		//=> example: "username:password"
		const index = credentials.indexOf(":");
		const user = credentials.substring(0, index);
		const pass = credentials.substring(index + 1);
		return [null, user, pass]
	},

	async update(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		/**
		 * Handle /nic/update?system=custom&hostname=whatever.ddns.net&myip=1.2.3.4&wildcard=OFF&offline=NO
		 * ZONEID in basic auth username
		 * API_TOKEN (not global key) in basic auth password
		 * RECORD_NAME in `hostname` parameter
		 * RECORD_CONTANT in `myip` parameter
		 */
		const url = new URL(request.url);
		const recordName = url.searchParams.get("hostname");
		const recordContent = url.searchParams.get("myip");
		const [authParsed, zoneId, apiToken] = this.parseAuthorization(request);
		if (authParsed !== null) return authParsed;
		if (!recordName) return new Response("Missing hostname", { status: 400 })

		const apiUrl = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
		const headers = {
			// TODO: add global key option - email to be set somewhere?!
			// 'X-Auth-Email': '',
			// 'X-Auth-Key': 'GLOBAL KEY',
			'Authorization': `Bearer ${apiToken}`,
			'Content-Type': 'application/json',
		};

		const body = JSON.stringify({
			type: RECORD_TYPE,
			name: recordName,
			content: recordContent,
		});

		const listResponse = await fetch(
			apiUrl + '?' + new URLSearchParams({
				name: recordName,
				type: RECORD_TYPE,
			}),
			{
				method: 'GET',
				headers: headers,
			}
		);

		if (!listResponse.ok) {
			console.error(`Failed to list DNS records: ${recordName}, Status: ${listResponse.status}`);
			console.error(`Message: ${await listResponse.text()}`);
			return new Response('Failed to list DNS records', { status: 500 });
		}

		const existingRecords: any = await listResponse.json();
		let updateUrl = apiUrl;
		const updateInit = {
			method: 'POST',
			headers: headers,
			body: body
		}
		if (existingRecords['result']) {
			const recordId = existingRecords['result'][0];
			if (recordId['content'] == recordContent) return new Response('Already up to date');
			updateUrl = `${apiUrl}/${recordId['id']}`;
			updateInit.method = 'PATCH';
		}

		const response = await fetch(updateUrl, updateInit);

		// Handle response
		if (response.ok) {
			console.log(`Successfully updated DNS record: ${recordName}`);
		} else {
			const error = await response.text();
			console.error(`Failed to update DNS record: ${recordName}, Status: ${response.status}`);
			console.error(`Message: ${error}`);
			return new Response(`Failed to update: ${error}`, {status: response.status});
		}
		return new Response('Done');
	},

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname.startsWith("/nic/update"))
			return this.update(request, env, ctx);
		return new Response('Hello World!');
	},
};
