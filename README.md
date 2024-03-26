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

This worker is live at https://cfddnsupdate.fopina.workers.dev/

It follows the same interface as mentioned in [dynu.com](https://www.dynu.com/DynamicDNS/IP-Update-Protocol) or [dyn.com](https://help.dyn.com/remote-access-api/perform-update/).

Your router/device should be configured as
* **Hostname**: cfddnsupdate.fopina.workers.dev
* **HTTP port**: 80
* **HTTPS port**: 443
* **Path** (anything works actually): /nic/update
* **Username**: your cloudflare zone ID
* **Password**: your API token (**NOT** the Global API key)

**Zone ID** is visible in the main page of your zone, on the right side bar under `API`.  
**API token** is **NOT** the Global API key (avoid using that in 3rd party services). Click `Get your API token` and then create one with `Zone DNS Edit` permissions, that's all it takes. You can also restrict it to the zone you'll be using.

Sample HTTP request (cURL syntax) to update IP
```
curl https://cfddnsupdate.fopina.workers.dev/nic/update?hostname=subdomain.example.com&myip=1.1.1.1 \
     -u <zone ID>:<API token>
```

### Update parameters

| Field | Description |
| ----- | ----------- |
| hostname | Hostname that you wish to update. **This is a required field.**|
| myip | IP address to set for the update. |
| wildcard | *currently ignored* |
| offline | *currently ignored* |


### Router setup

In order to use this in a Thompson TG789 router, you have to `telnet` into it and execute

```
dyndns service modify name=custom server=cfddnsupdate.fopina.workers.dev port=80 updateinterval=3600
```

`updateinterval` in the example is set to update IP every hour.

Then, via UI under Dynamic DNS, you add username (zone ID), password (API token) and choose the hostname to update.

> PRs with instructions to other routers are very welcome

## Development

This project uses wrangler, included as a dependency

```
npm install
npm run dev
```

That's all that's needed to have a local instance up and running. Then `npm run deploy` (and follow the steps) if you want to deploy your own copy.


openssl genrsa -out a.txt 2048
openssl rsa -pubout -in a.txt