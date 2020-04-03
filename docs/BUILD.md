# Build and deploy
The project is build and deployed via git. 

## Development
The development environment uses a pre-built image to avoid `npm install` during startup, this image is build 
 It uses a pre-built version of this project as base that is automatically build during merge, see /cloudbuild.yaml.

 ## Beta and prod
 Merges to specific branches triggers deployments. Deployment is implemented as CircleCI runs, see .circleci/config.yml. The run constructs an environment specific .env file using secrets configured in the circle project, builds a sha-tagged docker image, and patches the corresponding kubernetes Deployment.

To be specific
  * merges to the **master** branch builds and deploys to the **beta* environemtn beta.kbhbilleder.dk environment. 
  * merges to the **production** branch builds and deploys to the **production** kbhbilleder.dk environment. 
  