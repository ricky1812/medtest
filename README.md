# MEDINERY BACKEND 1


To start the server execute the command `node -r dotenv/config index` or just use `npm start`

Before starting the server you must create a `.env` file with entries for:
- SERVER_PORT
- DATABASE_URL
- ACCESS_SECRET_KEY
- REFRESH_SECRET_KEY
- ACCESS_VALID_SECONDS
- REFRESH_VALID_SECONDS
- AWS_ACCESS_KEY_ID
- AWS_SECRET_KEY
- REGION 
- BUCKET

The URLs supported at the moment are:
- /user/signup
- /user/login
- /user/updateProfile
- /user/profilePicture
- /user/updateProfilePicture
- /user/myProfile
- /home
- /tokenexchange

Authentication is done through refresh token and access token pair using [Refresh Token Rotation](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/#Refresh-Token-Rotation)
