# Deployment

![Deployment Diagram](https://rawgithub.com/CopenhagenCityArchives/kbh-billeder/master/docs/deployment-diagram.svg)

This Collections Online customization is deployed on Google Container Engine,
which runs [Kubenetes](https://kubernetes.io/). The following description of the
deployment borrows its vocabulary from Kubenetes:

- [Pod](https://kubernetes.io/docs/api-reference/v1.5/#pod-v1)
  is a collection of (docker) containers that can run on a host.
- [ReplicationController](https://kubernetes.io/docs/api-reference/v1.5/#replicationcontroller-v1)
  represents the configuration of a replication controller, which monitor and
  orchestrate to ensure that a configured number of pods of a specific image are
  running and responding.
- [Service](https://kubernetes.io/docs/api-reference/v1.5/#service-v1)
  is a named abstraction of software service (for example, mysql) consisting of
  local port (for example 3306) that the proxy listens on, and the selector that
  determines which pods will answer requests sent through the proxy.
- [Deployment](https://kubernetes.io/docs/api-reference/v1.5/#deployment-v1beta1)
  enables declarative updates for Pods and ReplicaSets.
- [Namespace](https://kubernetes.io/docs/api-reference/v1.5/#namespace-v1)
  provides a scope for Names, used to identify the entities above.

For a more general description of dependencies, see
[collections-online's documentation](https://github.com/collections-online/collections-online/blob/master/docs/DEPENDENCIES.md).

The system is deployed in two exact copies within two separate namespaces:

- **production**: Used to serve the average user visiting http://kbhbilleder.dk.
- **beta**: Where features are pushed as developed and tested by the product
  owner. Accessed, with a password on http://beta.kbhbilleder.dk.

When a user requests the system she points her browser to http://kbhbilleder.dk,
the DNS resolves the public IP address registered with the Google Cloud that
routes it's traffic to the frontend-service ([spec](../deployment/frontend-service.yaml)).

The frontend-service acts as a load-balancer in front of a number of frontend
pods (currently two). The pods are started and stopped by a frontend replication
controller per software revision ... more on this below.

The frontend pods runs the same image build from the code in this repository:
1. A supervisor deamon ([configured here](../configurations/supervisord.conf)):
   A client/server system that allows its users to monitor and control a number
   of processes on UNIX-like operating systems.
   It runs two processes in parallel:
   - An nginx web server ([configured here](../configurations/nginx.conf)):
     Serves static files with correct cache headers and forwards requests onto
     the main node.js process.
   - The main node.js process: Running [server.js](../server.js)

# Specifications and configurations

Configurations of Kubenetes entities (pods, services, deployments, etc.) is
accessable in the [deployment](../deployment) directory of the project.

Configurations of the frontend pods is accessable in the
[deployment](../configurations) directory of the project and the main node.js
process (which instantiates collections-online) is configured from the
[config](../config) directory.

## How the frontend docker image is changed, pushed, build and deployed

When new code is committed and pushed to
[GitHub](https://github.com/CopenhagenCityArchives/kbh-billeder), the continuous
integration platform
[CircleCI](https://circleci.com/gh/CopenhagenCityArchives/kbh-billeder) builds
the docker image as configured in the projects [circle.yml](../circle.yml) file.

A process which involves:
1. Injecting secrets into a [`.env`](https://www.npmjs.com/package/dotenv) file.
2. Building the docker image from the [Dockerfile](../Dockerfile).
3. Pushing the image to Googles servers and patching the frontend deployment,
   running [deployment/patch-deployment.sh](../deployment/patch-deployment.sh).
