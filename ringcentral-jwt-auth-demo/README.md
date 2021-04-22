# RingCentral JWT Auth Demo


## How to issue a JWT?

Ref: https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9

```
ssh-keygen -t rsa -P "" -b 2048 -m PEM -f jwtRS256.key
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

Or:

```
ssh-keygen -t rsa -P "" -b 2048 -m PEM -f jwtRS256.key
ssh-keygen -e -m PEM -f jwtRS256.key > jwtRS256.key.pub
```

Or:

```
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```


## Setup

```
yarn install
```

Rename `.env.sample` to `.env` and specify your credentials.
