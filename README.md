# cfddnsupdate

A Cloudflare worker to expose a `/nic/update`-compatible endpoint to update your DNS records in Cloudflare.

## Why

[noip](https://noip.com/) has been the king of free DynDNS for decades, directly supported in most router stock firmware. But their free plan requires a to [push a button](https://lostpedia.fandom.com/wiki/Pushing_the_button) once a month, solving a captcha, to keep the hostname active.

I already use [homeassistant cloudflare](https://www.home-assistant.io/integrations/cloudflare/) integration to keep a DNS record up to date. But, in another network, I don't have any device other than the router, a [Thompson TG789](https://openwrt.org/inbox/toh/technicolor/tg789vac_v2), restricted to stock firmware.  
This firmware allows us to set a `custom` server for DynDNS but it will call it always with the payload `/nic/update?system=custom&hostname=UI_SETTING&myip=CURRENT_IP_ADDRESS&...`

[DNSOMatic](https://www.dnsomatic.com/) seems to be a great service that does expose such endpoint and then integrates with Cloudflare API (and many others) though 2 negative points:
* HTTP endpoint was deprecated and only HTTPS supported now - this router only supports HTTP
* Requires Cloudflare Global API key instead of a more granular API token - no thank you...

## Usage

dyndns service modify name=custom server=cfddnsupdate.fopina.workers.dev port=80 updateinterval=3600




/nic/update?system=custom&hostname=xxx.ddns.net&myip=1.2.3.4&wildcard=OFF&offline=NO


copy table from https://help.dyn.com/remote-access-api/perform-update/ `Raw HTTP GET Request`


## Development

This project uses wrangler, included as a dependency

```
npm install
npm run dev
```

That's all that's needed to have a local instance up and running. Then `npm run deploy` (and follow the steps) if you want to deploy your own copy.
