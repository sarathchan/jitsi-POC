var jsonwebtoken = require('jsonwebtoken');
var uuid = require('uuid-random');

/**
 * Function generates a JaaS JWT.
 */
const generate = (privateKey, { id, name, email, avatar, appId, kid }) => {
  const now = new Date()
  const jwt = jsonwebtoken.sign({
    aud: 'jitsi',
    context: {
      user: {
        id,
        name,
        avatar,
        email: email,
        moderator: 'true'
      },
      features: {
        livestreaming: 'true',
        recording: 'true',
        transcription: 'true',
        "outbound-call": 'true'
      }
    },
    iss: 'chat',
    room: '*',
    sub: appId,
    exp: Math.round(now.setHours(now.getHours() + 3) / 1000),
    nbf: (Math.round((new Date).getTime() / 1000) - 10)
  }, privateKey, { algorithm: 'RS256', header: { kid } })
  return jwt;
}

/**
 * Generate a new JWT.
 */
const token = generate(`-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCro7UuSgBXlLhp
mtpYuR6MCJpCgtXVbWXYe9v25qENfldJXipngx/O1rPMvdFn0BBXT9Whk05Jr2aW
fKsgRSsi1kBUVvJgTOeT4/3G5tTRneeO4G+3lQhJ4YH0+2EsxEs54KlzFlaWxKlL
jDrPZFFDDVSTA3viMIYUyPFzYHhD+VQdIXLFjgDNF9KK3tml24niQnmNSlchcqMh
+MD0sJF3lntvvNfhNPBHUvJOgegU9yQXVgV4wPN6YewKqPmVnHQFX5b38W5RhiHH
4Ec+vf5fOlApU5lX6B2GXcAXzuBw5musiFuWCCEv3y2AC5FSZaBSUTBRg37qOZk2
0TDNohr7AgMBAAECggEAPS6IyexE/PMdXT9+r3ulYOM8IZNDp+VsFWPpP7RsGkQ7
1wJC+UzrTK6JvuS2vVuUR5tEmmjI0kk8t03PLhyZyLw4iBfKI/ul3Li7YGgt2l6A
CRUFnZn5L2S8D1iABhYefo4PuN9wlCOb+TsOR5kJwm4BBLqMMU98q/II50iu9gNV
WB1uza9bU3Z6m4kc0WZ7Usl7RG9KtLwZ8LaDtVuOxc+tO6zyxHiXvBi+gkSYTs39
Srj/alq0HStaHiKSuTPpaFYuORmPF5ffdfYVMNgrpHCvEyFLPJMoxQLlCdsGtkDH
vLaPVzrtAK6vcBWJftypb82gWqH2wtuRNmthuXtaSQKBgQD6xfNdLH+Vp8errzUt
NWOyXHktZtzH843VPa/aYVSatCYRnRCYx7iI0m1KG4HMTwbJFdbhWJGbZQRsnmOA
dpFMaOlyLwhvogMttMIw+C0flXfSuWacDAkYh/tkTkzBkbC8RSRuvKQxGg/UCRG6
4IhwnP+QvsnLEKGjhTk4R45pZwKBgQCvN4YG1eghMHLxrTaKV45rVoZUclHo3OFS
svSz0UsbwUwbiwCv9LSbkUCVX1vpdWm9s17r+1dkW7lnKqULDqSOH+bHgOeXD5s/
Z59+VnZu5VPb49cL8DMT8Gp3nQQuFxIGyr9I+qKmgOvOpVST/9nJNXzt6YNBuEa+
+ni/pqUBTQKBgQCZNuJGtg5JeFYFLioWMf10lw0uUR9pRwQMGgFcMoVHc/OiZU0j
mzrC1ZYSZhX6pvnlV+OOkNd9ks2OM4NllIuXnK2sptHHqru4bC0NUEP5fQ/VfpMT
mkLgawyML060IXhSvwfQZI8ItPygtt3PSKnz6+g1HmwaFlI7nwTjvsxi1wKBgFeF
hI0ljC4H5WKTAwtXcOxs6+yCrieDLYoBmfm4MaxLgZjAdjduJEkQ5RG38FFNNORt
FJ0LjzuyFYpS4t4DEm9rv/sniIcMZJ/nQuP4jHAYXSsZQ/HSqbDsBkJ5S/05yOdb
nvD1QQmqnB88tmK3CjJXZW/xlH7fbXc35djVhNaBAoGBAISNpbAdbMZRwkBlYZfl
JGOxfYG+Au6Oih260l/QOH2512nzuCpjPDYF4xkgftL8E3KWqjGlBiVCVdy5wof4
cZBuGkxu2TOYS7guJKlC6qBCc3yoO2rTydd4Oxdz0+9KQ16vdKHCJczq8F5+pkBe
YbNDN9urWNjl4uVfxFceiA+j
-----END PRIVATE KEY-----
`, {
    "aud": "jitsi",
    "iss": "chat",
    "iat": 1726927843,
    "exp": 1726935043,
    "nbf": 1726927838,
    "sub": "vpaas-magic-cookie-b03fcc221553405c8ba6f97372ff2878",
    "context": {
      "features": {
        "livestreaming": true,
        "outbound-call": true,
        "sip-outbound-call": false,
        "transcription": true,
        "recording": true
      },
      "user": {
        "hidden-from-recorder": false,
        "moderator": true,
        "name": "sarathchan20",
        "id": "google-oauth2|113820686678920509960",
        "avatar": "",
        "email": "sarathchan20@gmail.com"
      }
    },
    "room": "*"
  });

console.log(token);