# Goal
I'm trying to set up PingID OpenID auth in my Node.js app (express).

# Notes
I followed this tutorial: https://codeburst.io/how-to-implement-openid-authentication-with-openid-client-and-passport-in-node-js-43d020121e87

# Technologies (and libraries) I used
- JavaScript 
- Node.js
- express
- passport
- openid-client

# Project structure
- file `app.js` contains the app itself.
- there are also 2 files hidden by `.gitignore`: `google.cfg.json` and `ping.cfg.json`. Both have the same structure:

**google.cfg.json**:
```json
{
    "discover_url": "https://accounts.google.com/.well-known/openid-configuration",
    "client_id": "*****",
    "client_secret": "*****"
}
```

**ping.cfg.json**:
```json
{
    "discover_url": "https://auth.pingone.eu/<ping-env-id>/as/.well-known/openid-configuration",
    "client_id": "*****",
    "client_secret": "*****"
}
```

# How it behaves

By changing only one enviromental variable I can drastically change the behaviour of the app. This variable affects only 3 parameters: `discover_url`, `client_id` and `client_secret`.
It works for Google auth, but does not for PingID. I want to fix this.

|                                        | Google                                                                                                                                                                                                                                                   | PingID                                                                                                                                                                              |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| How to start the app:                  | `AUTH=google node ./app.js`                                                                                                                                                                                                                              | `AUTH=ping node ./app.js`                                                                                                                                                           |
| initially                              | the user is logged out                                                                                                                                                                                                                                   | the user is logged out                                                                                                                                                              |
| when clicking `login` app redirects to | https://accounts.google.com/o/oauth2/v2/auth                                                                                                                                                                                                             | https://auth.pingone.eu/{env-id}/as/authorize                                                                                                                                       |
| then                                   | google auth page loads and suggest choosing an account to use                                                                                                                                                                                            | it redirects to http://localhost:3000/users?environmentId=XXX&flowId=XXX (http://localhost:3000/users is `SIGNON URL` from ping app configuration) I can not see any error messages |
|                                        | after I selected an acount Google redirect me back to http://localhost:3000/auth/callback?state=XXX&code=XXX&scope=openid&authuser=0&prompt=consent . Then it redirects to http://localhost:3000/users `openid-client` successfuly gets the user object. | `openid-client` can not recognize any user data from this URL and works as if I did not log in                                                                                      |
|                                        | I can see user data on `/users` page                                                                                                                                                                                                                     | -                                                                                                                                                                                   |

# PingID configuration

## Profile
| Setting       | Value                                |
|---------------|--------------------------------------|
| APP TYPE      | Single Page App (OpenID Connect)     |
| DESCRIPTION   | Not Set                              |
| CLIENT ID     | XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX |
| HOME PAGE URL | http://localhost:3000/               |
| SIGNON URL    | http://localhost:3000/users          |

## Configuration    
| Setting                     | Value                                            |
|-----------------------------|--------------------------------------------------|
| RESPONSE TYPE               | Code                                             |
| GRANT TYPE                  | Refresh Token, Authorization Code                |
| REFRESH TOKEN DURATION      | 30 Days, 180 Days Refresh Token Rolling Duration |
| PKCE ENFORCEMENT            | OPTIONAL                                         |
| REDIRECT URIS               | http://localhost:3000/auth/callback              |
| SIGNOFF URLS                | None Specified                                   |
| TOKEN AUTH METHOD           | Client Secret Post                               |
| ALLOW UNSIGNED JWT REQUESTS | False                                            |

## Access tab
| RESOURCE | SCOPE                          |
|----------|--------------------------------|
| openid   | phone, address, profile, email |

## Applied policies
Both `SINGLE_FACTOR` and `MULTI_FACTOR`

## Attribute mappings

| PINGONE USER ATTRIBUTE | APPLICATION ATTRIBUTE |
|------------------------|-----------------------|
| User ID                | sub                   |



# Questions

1) Is something wrong with PingID app configuration?
2) What is the meaning of `environmentId=XXX&flowId=XXX` in the redirect URL?
3) I guess it might be due to the some kind of auth error. Is there any place to see such errors? (e.g. server log)
4) Should I fix the app code to comply with PingID?