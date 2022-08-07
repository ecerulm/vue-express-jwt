

This project is just a test project trying to put in practice the concepts from
Chapter 6. Self contained tokens and JWTs from API Security in Action by 
Neil Madden 


The main concepts
* API generates a JWT when the user present credentials username/password at the `/api/login` endpoint
* On every subsequent request the JWT must be in the header `Authentication: Bearer <JWTTokengoeshere>
* The API will validate the JWT
  * It does not need to contact a database because the JWT is self contained, it contains the username,etc in the jwt claims
  * 
* This has nothing to do with OpenID / OAuth 2.0 , none of the OAuth flows / grants are implemented, this is like 
[vue-express-token](https://github.com/ecerulm/vue-express-token) but instead
using a random id + hmac tag as token (that is not self contained and requires a database to store the mappings between the token id and attributes associated to it ) it uses a 
JWT (which is self contained)
