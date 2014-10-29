# NoNodeBots





# SSL 

To stop chrome asking for camera permissions on every reload you will need to use https. 
```
mkdir server/ssl
cd server/ssl
openssl genrsa -out localhost-key.pem 1024 
openssl req -new -key localhost-key.pem -out certrequest.csr
openssl x509 -req -in certrequest.csr -signkey localhost-key.pem -out localhost-cert.pem
```
