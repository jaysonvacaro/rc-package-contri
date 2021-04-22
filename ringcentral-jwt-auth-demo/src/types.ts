type JWTHeader = {
  alg: 'RS256';
  kid: string;
  jku?: string;
};

type JWTBody = {
  iss: string;
  aud: string;
  sub: string;
  exp: number;
  iat: number;
  jti: string;
};

export type JWTData = {
  header: JWTHeader;
  body: JWTBody;
};
