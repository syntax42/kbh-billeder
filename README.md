# Kbh-billeder

This is the configuration/setup for the kbhbilleder.dk webapp built on top of
the Canto Cumulus webservice, Canto Integration Platform.

This project was originally based on the Collections Online project found at http://github.com/collections-online/collections-online but has since been fully seperated into its own project containing a seperated fork of the project.

---

## Deploying the app

See [deployment/README.md](deployment/README.md)

## Developing the app

Use the docker-based setup found at https://github.com/CopenhagenCityArchives/kbhbilleder-docker

Before starting the app you need to create an .env file.

### Create a .env file with environment variables
Copy  `/.env-example` in the root of the project to `/.env` and customize. The following keys are currently required and can be acquired from a running environment or a fellow developer.

    CIP_USERNAME="..."
    CIP_PASSWORD="..."
    CLOUDINARY_URL=cloudinary://..:..@kbh-billeder
    GOOGLE_API_KEY="..."
    GOOGLE_UNRESTRICTED_API_KEY="..."

    AUTH0_DOMAIN="..."
    AUTH0_CLIENT_ID="..."
    AUTH0_CLIENT_SECRET="..."
    AUTH0_CALLBACK_URL="http://.../auth/callback"

    MAILGUN_API_KEY="..."

    FALLBACK_EMAIL_TO=nobody@example.invalid
    FALLBACK_EMAIL_FROM=nobody@example.invalid

    # Using docker-compose these are the correct addresses.
    ES_HOST="http://localhost:9200/"
    MONGO_CONNECTION=mongodb://localhost:27017/kbh-billeder
