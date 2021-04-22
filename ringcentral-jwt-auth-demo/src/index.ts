import hyperid from 'hyperid';
import crypto from 'crypto';
import {SignJWT} from 'jose/jwt/sign';
import {fromKeyLike} from 'jose/jwk/from_key_like';
import express from 'express';
import axios from 'axios';
import qs from 'qs';
import Utils from '@rc-ex/core/lib/Utils';

import {JWTData} from './types';

const uuid = hyperid();

// generate RSA keys
let r = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const publicKey1 = r.publicKey;
const privateKey1 = r.privateKey;
r = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});
const publicKey2 = r.publicKey;
const privateKey2 = r.privateKey;

// JWT Data
const jwtData1: JWTData = {
  header: {
    alg: 'RS256',
    kid: 'jwt-kid-1',
    jku: process.env.JWK_SET_URL!,
  },
  body: {
    iss: process.env.RINGCENTRAL_CLIENT_ID!,
    aud: process.env.RINGCENTRAL_SERVER_URL! + '/restapi/oauth/token',
    sub: process.env.RINGCENTRAL_EXTENSION_ID!,
    exp: Math.round(new Date().getTime() / 1000 + 3600 * 24 * 365 * 10), // 10 years later
    iat: Math.round(new Date().getTime() / 1000 - 3600 * 24 * 7), // 7 days ago
    jti: uuid(),
  },
};
const jwtData2: JWTData = {
  header: {...jwtData1.header, kid: 'jwt-kid-2'},
  body: {...jwtData1.body, sub: process.env.RINGCENTRAL_CLIENT_ID!},
};

(async () => {
  const assertion1 = await new SignJWT(jwtData1.body)
    .setProtectedHeader(jwtData1.header)
    .sign(privateKey1);
  const assertion2 = await new SignJWT(jwtData2.body)
    .setProtectedHeader(jwtData2.header)
    .sign(privateKey2);

  const jwk1 = await fromKeyLike(publicKey1);
  const jwk2 = await fromKeyLike(publicKey2);

  const app = express();
  app.get('/auth/jwks', (req, res) => {
    res.json({
      keys: [
        {
          alg: 'RS256',
          use: 'sig',
          kid: 'jwt-kid-1',
          ...jwk1,
        },
        {
          alg: 'RS256',
          use: 'sig',
          kid: 'jwt-kid-2',
          ...jwk2,
        },
      ],
    });
  });
  const port = 3000;
  app.listen(port, async () => {
    const httpClient = axios.create({
      validateStatus: () => true,
    });
    const r = await httpClient.post(
      process.env.RINGCENTRAL_SERVER_URL + '/restapi/oauth/token',
      qs.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: assertion1,
        client_assertion_type:
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: assertion2,
      })
    );
    console.log(Utils.formatTraffic(r));
  });
})();
