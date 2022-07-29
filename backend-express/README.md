This is an basic SPA application + API where the authentication uses JWT tokens.

This is just to try out the concepts from *Chapter 6 Self contained tokens and JWTs* from the book *API Security in Action* by Neil Madden 

This is **not** an OAuth 2.0 /OpenID Connect OIDC flow at all, it's just an API with it's own authentication (no IdP). 

Flow: 
* First the SPA client (browser side) will send user credentials username/password (should be over HTTPS) to the /api/login endpoint
* The login endpoint will return the JWT token in JSON respone
* The SPA receives the JSON response reads the JWT token and stores it using the Web Storage API (localStorage/sessionStorage)
* The SPA uses the stored JWT in all further API calls , like /api/increaseCounter


# What is the advantage of using JWT vs the regular random token 

The implementation at https://github.com/ecerulm/vue-express-token uses a random generated token id + HMAC signature. What is the advantage of using JWTs instead?

* The other implementation requires a database lookup to get the attributes mapped to that random generated token id. 
* A JWTs has the attributes/claims contained in the JWT itself so you don't need to do a database lookup and therefore is more scalable
* On the other hand, token revocation becomes a problem



# Links to the other projects 

Other projects related to other chapters of *API Security in Action* book: 

* https://github.com/ecerulm/vue-express-session-cookie
* https://github.com/ecerulm/vue-express-token

