/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

dyndns service modify name=custom server=cba2-82-155-137-190.ngrok-free.app port=443 updateinterval=10800

dyndns service modify name=custom server=6a77-82-155-137-190.ngrok-free.app port=80 updateinterval=10800

dyndns service modify name=custom server=cfddnsupdate.fopina.workers.dev port=80 updateinterval=3600



/nic/update?system=custom&hostname=xxx.ddns.net&myip=1.2.3.4&wildcard=OFF&offline=NO


copy table from https://help.dyn.com/remote-access-api/perform-update/ `Raw HTTP GET Request`
