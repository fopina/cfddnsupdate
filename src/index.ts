/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Buffer } from 'node:buffer';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

const ZONE_ID = "x"

const RECORD_TYPE = "A"
const RECORD_NAME = "a12.x"
const RECORD_CONTENT = "2.1.1.2"

export default {
	parseAuthorization(request: Request): [boolean, string, string] {
		// taken from https://developers.cloudflare.com/workers/examples/basic-auth/
		const authorization = request.headers.get("Authorization");
        if (!authorization) return [false, "", ""]

		const [scheme, encoded] = authorization.split(" ");

        // The Authorization header must start with Basic, followed by a space.
        if (!encoded || scheme !== "Basic") {
			/*
			return new Response("Malformed authorization header.", {
				status: 400,
			});
			*/
			return [false, "", ""]
        }

        const credentials = Buffer.from(encoded, "base64").toString();

        // The username & password are split by the first colon.
        //=> example: "username:password"
        const index = credentials.indexOf(":");
        const user = credentials.substring(0, index);
        const pass = credentials.substring(index + 1);
		return [true, user, pass]
	},

	async update(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		/**
		 * Handle /nic/update?system=custom&hostname=whatever.ddns.net&myip=1.2.3.4&wildcard=OFF&offline=NO
		 */
		const url = new URL(request.url);
		const hostname = url.searchParams.get("hostname");
		const myip = url.searchParams.get("myip");
		const [authParsed, user, pass] = this.parseAuthorization(request);
		return new Response(user);
		/*
		const apiUrl = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;
		const headers = {
		  // 'X-Auth-Email': '',
		  // 'X-Auth-Key': 'GLOBAL KEY',
		  // 'Authorization': 'Bearer ',
		  'X-Auth-Key': '',
		  'Content-Type': 'application/json',
		};
	  
		const body = JSON.stringify({
		  type: RECORD_TYPE,
		  name: RECORD_NAME,
		  content: RECORD_CONTENT,
		  ttl: 120, // Time to live for DNS record, in seconds
		});
	  
		const response = await fetch(url, {
		  method: 'PUT',
		  headers: headers,
		  body: body
		});
	  
		// Handle response
		if (response.ok) {
		  console.log(`Successfully updated DNS record: ${RECORD_NAME}`);
		} else {
		  console.error("A:" + await response.text())
		  console.error(`Failed to update DNS record: ${RECORD_NAME}, Status: ${response.status}`);
		}
		return new Response('Hello World!');
		*/
	},

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
    	if (url.pathname.startsWith("/nic/update"))
      		return this.update(request, env, ctx);
		return new Response('Hello World!');
	},
};
